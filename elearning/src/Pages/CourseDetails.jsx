import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import axios from "axios";
import "./CourseDetails.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCourseAndEnrollment = async () => {
      try {
        setIsEnrolled(false);

        const courseRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/courses/${id}`
        );
        setCourse(courseRes.data);

        if (user) {
          const token = await getToken();
          const userRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/profile-status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const enrolled = userRes.data.enrolledCourses?.some(
            (courseId) => courseId.toString() === id
          );

          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userLoaded) fetchCourseAndEnrollment();
  }, [id, user, userLoaded, getToken]);

  /* ======================
     RAZORPAY ENROLL (FIXED)
  ====================== */
  const handleEnroll = async () => {
    if (!user) {
      return openSignIn({ afterSignInUrl: window.location.href });
    }

    try {
      setActionLoading(true);

      // token for create-order
      const token = await getToken();

      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "EduPlatform",
        description: course.title,
        order_id: orderRes.data.orderId,

        handler: async (response) => {
          try {
            // ✅ FIX: get FRESH token here
            const freshToken = await getToken();

            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/payments/verify`,
              {
                ...response,
                courseId: course._id,
              },
              {
                headers: {
                  Authorization: `Bearer ${freshToken}`,
                },
              }
            );

            setIsEnrolled(true);
            navigate("/my-learning");
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
        },

        theme: { color: "#a435f0" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !userLoaded)
    return <div className="course-loading">Loading Course Details...</div>;

  if (!course)
    return <div className="course-not-found">Course not found</div>;

  return (
    <div className="course-page">
      {/* ===== HERO ===== */}
      <div className="course-hero">
        <div className="course-hero-inner">
          <div className="course-hero-left">
            <span className="category-tag">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="description">{course.description}</p>

            <div className="instructor-info">
              <span className="inst-icon">👨‍🏫</span>
              <span>
                Created by{" "}
                <strong>{course.instructorName || "Expert Instructor"}</strong>
              </span>
            </div>
          </div>

          <div className="course-hero-right">
            <div className="preview-card">
              {course.curriculum?.[0]?.lessons?.[0]?.contentUrl ? (
                <video
                  controls
                  className="preview-video"
                  poster={`${import.meta.env.VITE_API_URL}${course.thumbnail}`}
                >
                  <source
                    src={`${import.meta.env.VITE_API_URL}${course.curriculum[0].lessons[0].contentUrl}`}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <div className="preview-placeholder">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${course.thumbnail}`}
                    alt="Course Preview"
                  />
                  <div className="overlay">📘 Curriculum Preview Only</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="course-content">
        <div className="course-main">
          <h2>Course Curriculum</h2>

          <div className="curriculum-list">
            {course.curriculum?.map((chap, i) => (
              <div key={i} className="chapter-summary">
                <div className="chapter-title">
                  <span className="chap-num">Chapter {i + 1}:</span>{" "}
                  {chap.chapterTitle}
                </div>

                <ul className="lesson-previews">
                  {chap.lessons?.map((lesson, j) => (
                    <li key={j}>🔓 {lesson.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
        <div className="course-sidebar">
          <div className="price-card">
            <div className="price-label">Course Price:</div>
            <div className="price">₹{course.price}</div>

            {isEnrolled ? (
              <button
                className="enroll-btn enrolled"
                onClick={() => navigate(`/player/${course._id}`)}
              >
                Go to Learning
              </button>
            ) : (
              <button
                className="enroll-btn"
                onClick={handleEnroll}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Buy This Course"}
              </button>
            )}

            <ul className="course-perks">
              <li>✔️ Full lifetime access</li>
              <li>✔️ Access on mobile and TV</li>
              <li>✔️ Certificate of completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
