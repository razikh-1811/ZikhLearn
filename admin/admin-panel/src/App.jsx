import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import Courses from "./pages/Courses";
import Analytics from "./pages/Analytics";
import ProtectedAdmin from "./components/ProtectedAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminDashboard />
          </ProtectedAdmin>
        }
      >
        <Route index element={<Navigate to="users" />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Courses />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin-login" />} />
    </Routes>
  );
}
