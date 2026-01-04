import { SignUp } from "@clerk/clerk-react";
import './Auth.css';

const Signup = () => {
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1>Start Learning</h1>
        <p>Create an account to join our community of experts.</p>
        <SignUp 
          routing="path" 
          path="/signup" 
          signInUrl="/login"
          afterSignUpUrl="/courses"
        />
      </div>
    </div>
  );
};

export default Signup;