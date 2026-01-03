import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ instructorData }) => {
  const [profile, setProfile] = useState({
    fullName: instructorData?.fullName || '',
    bio: instructorData?.bio || ''
  });

  const handleUpdate = () => {
    // Your update logic here
    alert("Profile Updated!");
  };

  return (
    <div className="settings-container fade-in">
      <header className="settings-header">
        <h1>Instructor Settings</h1>
        <p>Update your public profile and bio information.</p>
      </header>

      <main className="settings-card">
        <div className="input-group">
          <label>Full Name</label>
          <input 
            type="text" 
            value={profile.fullName} 
            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
            placeholder="Enter your full name"
          />
        </div>

        <div className="input-group">
          <label>Instructor Bio</label>
          <textarea 
            rows="6"
            value={profile.bio} 
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            placeholder="Tell your students about your expertise..."
          />
        </div>

        <div className="settings-footer">
          <button className="update-profile-btn" onClick={handleUpdate}>
            Update Profile
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;