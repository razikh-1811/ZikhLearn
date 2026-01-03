import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import CourseSidebar from "../components/CourseSidebar/CourseSidebar";
import "./Player.css";

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(res.data);
        const allLessons = res.data?.curriculum?.flatMap(c => c.lessons || []) || [];
        setLessons(allLessons);
      } catch (err) {
        console.error("Fetch error:", err);
        navigate("/my-learning");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, getToken, navigate]);

  if (loading) return (
    <div className="modern-p-loader">
       <div className="spinner"></div>
       <p>Opening your classroom...</p>
    </div>
  );

  const current = lessons[currentLessonIndex];
  const fileUrl = current?.contentUrl ? `http://localhost:5000${current.contentUrl}` : "";
  
  // ✅ IMPROVED DETECTION: Corrects the issue where PDFs load in video players
  const isPDF = current?.contentType?.toLowerCase() === "pdf" || 
                current?.contentType?.toLowerCase() === "document" || 
                fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="premium-player-root">
      {/* 1. PROFESSIONAL HEADER */}
      <header className="player-cinema-nav">
        <div className="cinema-left">
          <button className="cinema-exit-btn" onClick={() => navigate("/my-learning")} title="Close Player">✕</button>
          <div className="cinema-v-divider"></div>
          <div className="cinema-header-text">
            <span className="header-course-label">{course?.title}</span>
            <h1 className="header-lesson-title">{current?.title}</h1>
          </div>
        </div>
        <div className="cinema-right">
          <div className="header-stats">
            <div className="stat-pill">
              <span>Lesson {currentLessonIndex + 1} of {lessons.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="player-viewport-layout">
        <div className="player-cinema-stage">
          {/* 2. THEATER STAGE (Properly handles PDF/Video) */}
          <div className="theater-container">
            {isPDF ? (
              <div className="pdf-viewer-wrapper">
                <iframe 
                  src={`${fileUrl}#view=FitH&toolbar=1`} 
                  title="PDF Document"
                  className="theater-frame-pdf"
                />
              </div>
            ) : (
              <video key={fileUrl} controls autoPlay className="theater-frame-video">
                <source src={fileUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* 3. INFO AREA & ACTION BUTTONS */}
          <div className="cinema-info-block">
            <div className="p-action-bar">
               <div className="title-group">
                  <div className="badge-row">
                    <span className="lesson-type-badge">{current?.contentType || "Video"}</span>
                    {/* ✅ DOWNLOAD OPTION FOR DOCUMENTS */}
                    {isPDF && (
                      <a href={fileUrl} download className="download-resource-link">
                         📥 Download Document
                      </a>
                    )}
                  </div>
                  <h2>{current?.title}</h2>
               </div>
               <div className="p-nav-group">
                  <button 
                    className="p-btn p-btn-outline"
                    disabled={currentLessonIndex === 0} 
                    onClick={() => setCurrentLessonIndex(i => i - 1)}
                  >
                    ← Previous
                  </button>
                  <button 
                    className="p-btn p-btn-dark"
                    disabled={currentLessonIndex === lessons.length - 1} 
                    onClick={() => setCurrentLessonIndex(i => i + 1)}
                  >
                    Next→
                  </button>
               </div>
            </div>
            
            <div className="cinema-tabs">
               <nav className="tab-nav">
                  <button className="p-tab-item active">Overview</button>
                  <button className="p-tab-item">Q&A</button>
               </nav>
               <div className="tab-content">
                  <div className="description-section">
                    <h3>About this Lesson</h3>
                    <p className="lesson-description-text">
                      {current?.description || "Master this module to progress in your learning journey."}
                    </p>
                    <hr />
                    <h3>About this Course</h3>
                    <p className="course-description-text">{course?.description}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* 4. INTEGRATED SIDEBAR */}
        <aside className="cinema-sidebar">
          <div className="sidebar-label-header">
             <span>Course Content</span>
             <span className="curriculum-stats">{lessons.length} lessons</span>
          </div>
          <div className="sidebar-scroll-box">
            <CourseSidebar 
              curriculum={course?.curriculum} 
              activeLessonId={current?._id} 
              onSelectLesson={(l) => setCurrentLessonIndex(lessons.findIndex(x => x._id === l._id))} 
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Player;