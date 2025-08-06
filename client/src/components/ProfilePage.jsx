import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const ProfilePage = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "ArtConnect – Profile";

    if (!token) return;

    axios
      .get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        setError("Failed to load profile.");
        console.error(err);
      });
  }, [token]);

  if (error) {
  return (
    <div className="profile">
      <div className="profile-inner text-center">
        <p>{error}</p>
      </div>
    </div>
  );
}

if (!profile) {
  return (
    <div className="profile">
      <div className="profile-inner text-center">
        <p>Loading profile...</p>
      </div>
    </div>
  );
}

return (
  <div className="profile">
    <div className="profile-inner">
      <h1 className="text-center mb-4">Your Profile</h1>

      <div className="profile-info">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="text-center mt-6">
        <Link to="/settings" className="profile-settings-link">
          Edit Profile Settings
        </Link>
      </div>
    </div>
  </div>
);
};

export default ProfilePage;