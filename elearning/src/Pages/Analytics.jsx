import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import "./Analytics.css";

const Analytics = () => {
  const { getToken, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const [stats, setStats] = useState({
    revenue: 0,
    students: 0,
    courses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!isLoaded || !userLoaded) return;

        const role = user?.publicMetadata?.role;
        if (role !== "faculty") {
          setError("Access denied");
          setLoading(false);
          return;
        }

        const token = await getToken();

        const res = await axios.get(
          "http://localhost:5000/api/courses/instructor/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats({
          revenue: res.data.revenue || 0,
          students: res.data.students || 0,
          courses: res.data.courses || [],
        });
      } catch (err) {
        console.error("Faculty analytics error:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getToken, isLoaded, user, userLoaded]);

  if (loading) {
    return (
      <div className="analytics-loading">
        Calculating your performance…
      </div>
    );
  }

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  return (
    <div className="analytics-container fade-in">
      <header className="page-header">
        <h1>Performance Overview</h1>
        <p>Your earnings and enrollments across courses</p>
      </header>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-icon revenue-bg">💰</span>
          <div className="stat-info">
            <h3>₹{stats.revenue.toLocaleString("en-IN")}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-box">
          <span className="stat-icon students-bg">👥</span>
          <div className="stat-info">
            <h3>{stats.students}</h3>
            <p>Total Enrollments</p>
          </div>
        </div>
      </div>

      {/* ===== COURSE WISE REVENUE ===== */}
      <div className="course-revenue-section">
        <h2>📚 Course-wise Revenue</h2>

        {stats.courses.length === 0 ? (
          <p className="no-data">No enrollments yet</p>
        ) : (
          <table className="course-revenue-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Price</th>
                <th>Students</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.courses.map((c) => (
                <tr key={c.courseId}>
                  <td>{c.title}</td>
                  <td>₹{c.price}</td>
                  <td>{c.students}</td>
                  <td className="revenue">
                    ₹{c.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Analytics;
