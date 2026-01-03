import React from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import './SelectRole.css';


const SelectRole = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const handleRoleSelection = async (selectedRole) => {
    try {
      const token = await getToken();

      // 1. Tell our backend to update the role
      await axios.post(
        "http://localhost:5000/api/courses/sync-role",
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. IMPORTANT: Reload the user session so the frontend knows about the new role
      await user.reload();

      // 3. Redirect
      window.location.href = selectedRole === "faculty" ? "/faculty" : "/courses";
    } catch (error) {
      console.error("Failed to sync role:", error);
      alert("Error setting role. Please try again.");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="role-container">
      <div className="role-card">
        <h2>Welcome! One last step...</h2>
        <p>Choose your account type to continue.</p>
        <div className="role-options">
          <button onClick={() => handleRoleSelection('student')} className="role-btn student">
            🎓 I am a Student
          </button>
          <button onClick={() => handleRoleSelection('faculty')} className="role-btn faculty">
            👨‍🏫 I am an Instructor
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;