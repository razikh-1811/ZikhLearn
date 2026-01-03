import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react'; // ✅ Import Clerk Auth hook
import axios from 'axios';
import './MyContent.css';


const MyContent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth(); // ✅ Function to get fresh Clerk JWT
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // ✅ Retrieve the secure session token from Clerk
        const token = await getToken(); 
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/instructor`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getToken]); // Dependency on getToken ensures stable fetch logic

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        const token = await getToken(); // ✅ Fresh token for delete action
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(courses.filter(course => course._id !== courseId));
        alert("Course deleted successfully");
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Failed to delete the course.");
      }
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div> {/* Added spinner for better UI consistency */}
      <p>Loading your content...</p>
    </div>
  );

  return (
    <div className="my-content-container fade-in">
      <header className="page-header">
        <h1>My Published Courses</h1>
        <p>Manage your existing courses, curriculum, and pricing.</p>
      </header>

      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map(course => (
            <div key={course._id} className="course-card-horizontal">
              <div className="course-card-img">
                {/* Use course.thumbnail directly from your backend storage path */}
                <img src={`${import.meta.env.VITE_API_URL}${course.thumbnail}`} alt={course.title} />
              </div>
              <div className="course-card-body">
                <div className="card-header-flex">
                  <h4 className="course-title">{course.title}</h4>
                  <span className="price-badge">₹{course.price}</span>
                </div>
                <p className="chapter-count">
                  📚 {course.curriculum ? course.curriculum.length : 0} Chapters
                </p>
                
                <div className="card-actions">
                  <button 
                    className="manage-btn" 
                    onClick={() => navigate(`/faculty/course/${course._id}`)}
                  >
                    Edit Curriculum
                  </button>
                  <button 
                    className="del-btn-text" 
                    onClick={() => handleDelete(course._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>You haven't published any courses yet.</p>
            {/* Actionable button instead of just refresh */}
            <button className="create-now-btn" onClick={() => window.location.reload()}>
               Refresh Dashboard
            </button>
          </div>
        )}
      
      </div>
    </div>
  );
};

export default MyContent;