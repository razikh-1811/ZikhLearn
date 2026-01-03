import React from "react";
import "./CourseSidebar.css";

const CourseSidebar = ({ curriculum, onSelectLesson, activeLessonId }) => {
  return (
    <aside className="course-sidebar-modern">
      <div className="sidebar-header-compact">
        <h3>Course Content</h3>
      </div>
      <div className="sidebar-scroll-area">
        {curriculum?.map((chapter, cIdx) => (
          <div key={cIdx} className="chapter-block">
            <div className="chapter-toggle">
              <span className="chapter-meta">Section {cIdx + 1}</span>
              <h4>{chapter.chapterTitle}</h4>
            </div>
            <ul className="lesson-stack">
              {chapter.lessons.map((lesson, lIdx) => (
                <li
                  key={lIdx}
                  className={`lesson-row ${activeLessonId === lesson._id ? "active-playing" : ""}`}
                  onClick={() => onSelectLesson(lesson)}
                >
                  <div className="lesson-indicator">
                    {activeLessonId === lesson._id ? (
                      <span className="playing-bar-icon">📊</span>
                    ) : (
                      <span className="circle-check">○</span>
                    )}
                  </div>
                  <div className="lesson-content-info">
                    <span className="l-title">{lesson.title}</span>
                    <div className="l-meta">
                      <span className="l-icon-type">
                        {lesson.contentType === "pdf" ? "📄 Document" : "▶ Video"}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CourseSidebar;