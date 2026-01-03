import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import "./AdminDashboard.css";

/* OPTIONAL: analytics component (if created earlier) */
import AdminAnalytics from "./AdminAnalytics";

const AdminDashboard = () => {
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState("users");
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = await getToken();

        const [coursesRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/courses`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourses(coursesRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Admin load error", err);
        alert("Admin access failed");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [getToken]);

  if (loading) {
    return <div className="admin-loading">Loading admin panel…</div>;
  }

  return (
    <div className="admin-page">
      <h1>🛡️ Admin Dashboard</h1>

      {/* ================= TABS ================= */}
      <div className="admin-tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>

        <button
          className={activeTab === "courses" ? "active" : ""}
          onClick={() => setActiveTab("courses")}
        >
          📚 Courses
        </button>

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      {/* ================= USERS ================= */}
      {activeTab === "users" && (
        <section className="admin-section">
          <h2>All Users</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  <td>
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        const token = await getToken();
                        await axios.put(
                          `${import.meta.env.VITE_API_URL}/api/users/admin/change-role/${u._id}`,
                          { role: e.target.value },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        window.location.reload();
                      }}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td>
                    <button
                      className={u.isBlocked ? "btn-unblock" : "btn-block"}
                      onClick={async () => {
                        const token = await getToken();
                        await axios.put(
                          `${import.meta.env.VITE_API_URL}/api/users/admin/block/${u._id}`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        window.location.reload();
                      }}
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= COURSES ================= */}
      {activeTab === "courses" && (
        <section className="admin-section">
          <h2>All Courses</h2>

          <ul className="admin-course-list">
            {courses.map((c) => (
              <li key={c._id} className="admin-course-row">
                <span>
                  <strong>{c.title}</strong>
                  <small> — {c.instructorName}</small>
                </span>

                <button
                  className="btn-delete"
                  onClick={async () => {
                    if (!window.confirm("Delete this course permanently?"))
                      return;

                    const token = await getToken();
                    await axios.delete(
                      `${import.meta.env.VITE_API_URL}/api/courses/admin/${c._id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    window.location.reload();
                  }}
                >
                  ❌ Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= ANALYTICS ================= */}
      {activeTab === "analytics" && <AdminAnalytics />}
    </div>
  );
};

export default AdminDashboard;
