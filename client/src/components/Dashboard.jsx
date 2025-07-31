// Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthProvider"; // For managing auth context
import UploadArtwork from "./UploadArtwork"; // Import UploadArtwork component

const API_BASE = process.env.REACT_APP_API_BASE;

const Dashboard = () => {
  const { token, logout } = useAuth(); // Get token and logout function from AuthContext
  const [artworks, setArtworks] = useState([]); // State to store artworks
  const [status, setStatus] = useState(""); // Status message for delete/upload

  // Fetch artworks when the component mounts
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/artworks`, {
          headers: { Authorization: `Bearer ${token}` }, // Include token in the headers
        });
        setArtworks(res.data.artworks); // Save artworks in the state
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setStatus("❌ Failed to load artworks.");
      }
    };

    fetchArtworks();
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to ArtConnect</h1>

      {/* Artworks Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
        {artworks.length === 0 ? (
          <p>No artworks uploaded yet.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork._id} className="bg-white p-4 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-semibold">{artwork.title}</h3>
              <p>By {artwork.userId}</p>
              <p>{artwork.description}</p>
            </div>
          ))
        )}
      </div>

      {/* Logout Button */}
      <div className="text-center">
        <button
          onClick={logout}  // Calls the logout function to log the user out
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;