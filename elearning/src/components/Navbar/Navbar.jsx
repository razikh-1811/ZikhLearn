import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

// ✅ Import your logo image here
import logo from "../../assets/logo.png"; 

const Navbar = ({ searchQuery = "", setSearchQuery = () => {} }) => {
  const { user } = useUser();
  const location = useLocation();

  // Role from Clerk metadata
  const userRole = user?.publicMetadata?.role;

  const isHomePage = location.pathname === "/";
  const isFacultyPage = location.pathname.startsWith("/faculty");
  const isAdmin = userRole === "admin";
  const roleNotSelected = !userRole;

  // ✅ SHOW SEARCH ONLY ON THESE PAGES
  const isBrowseCourses = location.pathname === "/courses";
  const isMyLearning = location.pathname === "/my-learning";

  const showSearch =
    (isBrowseCourses || isMyLearning) &&
    userRole === "student" &&
    !isAdmin &&
    !isFacultyPage;

  return (
    <nav className="navbar-container">
      {/* ===== LEFT (UPDATED WITH IMAGE LOGO) ===== */}
      <div className="nav-left">
        <Link to="/" className="nav-logo-link">
          <img 
            src={logo} 
            alt="ZikhLearn Logo" 
            className="nav-brand-image" 
          />
        </Link>
      </div>

      {/* ===== CENTER (SEARCH) ===== */}
      <div className="nav-center">
        {showSearch && (
          <div className="search-box-container">
            <input
              type="text"
              placeholder={
                isBrowseCourses
                  ? "Search courses..."
                  : "Search my learning..."
              }
              className="search-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
        )}
      </div>

      {/* ===== RIGHT ===== */}
      <div className="nav-right">
        {/* ================= SIGNED OUT ================= */}
        <SignedOut>
          <Link to="/courses" className="nav-link">
            Browse Courses
          </Link>

          <Link to="/login" className="nav-auth-link">
            Log In
          </Link>

          <Link to="/signup" className="signup-button">
            Sign Up
          </Link>
        </SignedOut>

        {/* ================= SIGNED IN ================= */}
        <SignedIn>
          <div className="user-nav-section">
            {/* ROLE NOT SELECTED */}
            {roleNotSelected && (
              <Link to="/select-role" className="nav-link select-role-btn">
                ⚡ GetStarted As
              </Link>
            )}

            {/* ADMIN */}
            {isAdmin && (
              <Link to="/admin" className="nav-link">
                🛡️ Admin Dashboard
              </Link>
            )}

            {/* FACULTY */}
            {userRole === "faculty" && (
              <Link to="/faculty" className="nav-link">
                Instructor Dashboard
              </Link>
            )}

            {/* STUDENT */}
            {userRole === "student" && (
              <>
                <Link to="/courses" className="nav-link">
                  Browse Courses
                </Link>
                <Link to="/my-learning" className="nav-link">
                  My Learning
                </Link>
              </>
            )}

            {/* USER PROFILE */}
            <div className="user-profile-display">
              <div className="user-text-info">
                <span className="nav-user-name">
                  {user?.fullName}
                </span>
                {userRole && (
                  <span className={`nav-role-badge badge-${userRole}`}>
                    {userRole}
                  </span>
                )}
              </div>

              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;