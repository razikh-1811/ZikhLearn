import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import "./AdminAnalytics.css";

const AdminAnalytics = () => {
  const { getToken } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(res.data);
      } catch (err) {
        console.error("Admin analytics error:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [getToken]);

  /* ================= STATES ================= */

  if (loading) {
    return <div className="admin-loading">📊 Loading analytics…</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  if (!data) return null;

  /* ================= UI ================= */

  return (
    <div className="admin-analytics-page">
      <h1>📊 Platform Analytics</h1>

      {/* ================= STATS ================= */}
      <div className="stats-grid">
        <StatCard title="Total Users" value={data.users.total} />
        <StatCard title="Students" value={data.users.students} />
        <StatCard title="Faculty" value={data.users.faculty} />
        <StatCard title="Courses" value={data.courses} />
        <StatCard title="Enrollments" value={data.enrollments} />
        <StatCard
          title="Total Revenue"
          value={`₹${data.revenue.toLocaleString("en-IN")}`}
          highlight
        />
      </div>

      {/* ================= COURSE REVENUE ================= */}
      <div className="top-courses">
        <h2>💰 Course-wise Revenue</h2>

        {data.courseRevenue?.length === 0 ? (
          <p className="no-data">No payment data yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Enrollments</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.courseRevenue.map((c) => (
                <tr key={c.courseId}>
                  <td>{c.title}</td>
                  <td>{c.instructor}</td>
                  <td>{c.enrollments}</td>
                  <td>₹{c.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ================= REUSABLE CARD ================= */

const StatCard = ({ title, value, highlight }) => (
  <div className={`stat-card ${highlight ? "revenue" : ""}`}>
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default AdminAnalytics;
