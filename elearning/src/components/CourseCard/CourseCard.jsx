import React from "react";
import { useNavigate } from "react-router-dom";
import "./CourseCard.css";

const CourseCard = ({ course, enrollInCourse, enrolledCourses = [] }) => {
  const navigate = useNavigate();

  const isEnrolled = enrolledCourses.includes(course._id);

  return (
    <div
      className="course-card"
      onClick={() => navigate(`/course/${course._id}`)}
    >
      <div className="course-card-top">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="course-img"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x180?text=Engineering";
          }}
        />

        {isEnrolled && (
          <span className="enrolled-badge">ENROLLED</span>
        )}
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-instructor">
          {course.instructorName}
        </p>

        <div className="course-card-rating">
          <span className="rating-num">{course.rating || 4.5}</span>
          <span className="stars">★</span>
          <span className="reviews">
            ({course.reviews || 120})
          </span>
        </div>

        <div className="course-card-footer">
          <span className="course-card-price">
            ₹{course.price}
          </span>

          <button
            className={`enroll-btn-primary ${
              isEnrolled ? "enrolled-btn" : ""
            }`}
            disabled={isEnrolled}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEnrolled) enrollInCourse(course._id);
            }}
          >
            {isEnrolled ? "Enrolled" : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
