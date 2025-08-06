import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const SettingsPanel = () => {
  const { token } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(""); // if you want one later
  const [status, setStatus] = useState("");

  useEffect(() => {
    document.title = "ArtConnect – Settings";

    axios
      .get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username);
        setEmail(res.data.email || "");
        setBio(res.data.bio || ""); // if your model includes it
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setStatus("Failed to load profile info.");
      });
  }, [token]);

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API_BASE}/me`, { username, email }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus(res.data.message || "Profile updated.");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      setStatus("Failed to update profile.");
    }
  };

  return (
    <div className="settings">
      <div className="settings-inner">
        <h1 className="text-center mb-6">Profile Settings</h1>
        <div className="panel">
          <label className="block mb-2 font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full rounded-lg mb-4"
          />

          <label className="block mb-2 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded-lg mb-4"
          />

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Save Changes
          </button>

          {status && (
            <p className="mt-4 text-sm text-center text-green-600">{status}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;