import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, useUser } from "@clerk/clerk-react";
import React, { useState } from "react"; // ✅ Added useState here

import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer/Footer.jsx";

import Home from "./pages/Home.jsx";
import CourseCatalog from "./pages/CourseCatalog.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import MyLearning from "./pages/MyLearning.jsx";
import Player from "./pages/Player.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import CourseEditor from "./pages/CourseEditor.jsx";
import SelectRole from "./pages/SelectRole.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; 

import "./App.css";

// --- REUSABLE GLOBAL LOADER COMPONENT ---
const GlobalLoader = ({ message = "Loading ZikhLearn..." }) => (
  <div className="global-loader-overlay">
    <div className="spinner-rotater"></div>
    <p className="loader-message">{message}</p>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <GlobalLoader message="Verifying session..." />;

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.publicMetadata?.role;

  if (!role) {
    return <Navigate to="/select-role" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const { isLoaded } = useUser();

  // ✅ ADDED: State to manage search globally
  const [searchQuery, setSearchQuery] = useState("");

  if (!isLoaded) {
    return <GlobalLoader />;
  }

  return (
    <div className="app-main-wrapper">
      {/* ✅ UPDATED: Pass search state to Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="content-area">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          
          {/* ✅ UPDATED: Pass searchQuery to CourseCatalog */}
          <Route 
            path="/courses" 
            element={<CourseCatalog searchQuery={searchQuery} />} 
          />
          
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/login/*" element={<Login />} />
          <Route path="/signup/*" element={<Signup />} />

          {/* ROLE SELECT */}
          <Route
            path="/select-role"
            element={
              <SignedIn>
                <SelectRole />
              </SignedIn>
            }
          />

          {/* STUDENT */}
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute requiredRole="student">
                {/* ✅ UPDATED: Pass searchQuery to MyLearning */}
                <MyLearning searchQuery={searchQuery} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/:id"
            element={
              <ProtectedRoute requiredRole="student">
                <Player />
              </ProtectedRoute>
            }
          />

          {/* FACULTY */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/course/:courseId"
            element={
              <ProtectedRoute requiredRole="faculty">
                <CourseEditor />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}