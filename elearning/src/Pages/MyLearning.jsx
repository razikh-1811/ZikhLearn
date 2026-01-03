import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import "./MyLearning.css";

const MyLearning = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await getToken();

        // 1. Fetch user progress
        const userRes = await axios.get(
          "http://localhost:5000/api/users/profile-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDbUser(userRes.data);

        // 2. Fetch enrolled courses
        const courseRes = await axios.get(
          "http://localhost:5000/api/courses/enrolled",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      } catch (error) {
        console.error("Failed to load your learning dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    if (userLoaded) {
      loadStudentData();
    }
  }, [user, userLoaded, getToken]);

  /**
   * ✅ SAFE PROGRESS CALCULATION (FIXED)
   */
  const calculateProgress = (course) => {
    if (
      !course ||
      !Array.isArray(course.curriculum) ||
      !Array.isArray(dbUser?.completedLessons)
    ) {
      return 0;
    }

    const allLessons = course.curriculum.flatMap((chapter) =>
      Array.isArray(chapter?.lessons) ? chapter.lessons : []
    );

    const totalCount = allLessons.length;
    if (totalCount === 0) return 0;

    const completedCount = allLessons.filter(
      (lesson) =>
        lesson?._id && dbUser.completedLessons.includes(lesson._id)
    ).length;

    return Math.round((completedCount / totalCount) * 100);
  };

  if (loading || !userLoaded) {
    return (
      <div className="learning-loader">
        <div className="spinner"></div>
        <p>Syncing your progress...</p>
      </div>
    );
  }

  return (
    <div className="my-learning-container fade-in">
      <header className="learning-header">
        <h1>My Learning</h1>
        <p className="subtitle">
          Welcome back, <b>{user?.firstName || "Student"}</b>! Continue where you left
          off.
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>Your library is empty</h2>
          <p>Find your next skill in our course catalog.</p>
          <button
            onClick={() => navigate("/courses")}
            className="browse-btn"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="learning-grid">
          {courses
            .filter((course) => course && course.curriculum)
            .map((course) => {
              const progress = calculateProgress(course);

              return (
                <div
                  key={course._id}
                  className="learning-card"
                  onClick={() => navigate(`/player/${course._id}`)}
                >
                  <div className="card-image">
                    <img
                      src={`http://localhost:5000${course.thumbnail}`}
                      alt={course.title}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x150?text=Course";
                      }}
                    />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <span className="category-badge">
                      {course.category || "General"}
                    </span>

                    <h3>{course.title}</h3>

                

                    <button className="continue-btn">
                    
                        "Continue Learning"
                        
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
