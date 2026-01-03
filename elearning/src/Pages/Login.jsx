import { useEffect } from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) return;

    const role = user?.publicMetadata?.role;
    navigate(role ? "/" : "/signup");
  }, [isSignedIn, user, navigate]);

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in </p>
        </div>

        <SignInButton mode="modal">
          <button type="button" className="google-login-btn">
            🔐 Continue 
          </button>
        </SignInButton>
      </div>
    </div>
  );
};

export default Login;
