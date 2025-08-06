// Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthProvider";
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    document.title = "ArtConnect – Dashboard";
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/artworks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtworks(res.data.artworks);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setStatus("Failed to load artworks.");
      }
    };

    fetchArtworks();
  }, [token]);

  const handleDelete = async (artworkId) => {
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;

    try {
      await axios.delete(`${API_BASE}/delete-artwork/${artworkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtworks(prev => prev.filter(art => art._id !== artworkId));
      setStatus("Artwork deleted.");
    } catch (err) {
      console.error("Error deleting artwork:", err);
      setStatus("Failed to delete artwork.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-inner">
        <h1 className="text-center mb-6">Your Dashboard</h1>

        {status && <p className="text-center text-sm my-2">{status}</p>}

        <div className="grid mb-6">
          {artworks.length === 0 ? (
            <p>No artworks uploaded yet.</p>
          ) : (
            artworks.map((artwork) => {
              console.log("artwork.imageUrl:", artwork.imageUrl);

              return (
                <div key={artwork._id} className="card">
                  <img
                    src={`/static/artworks/${artwork.imageUrl}`}
                    alt={artwork.title}
                    onError={(e) => {
                      console.log("Failed to load image:", e.target.src);
                      e.target.style.border = "3px solid red";
                      e.target.src = "/static/placeholder.jpg";
                    }}
                    style={{
                      width: "100%",
                      height: "480px",
                      objectFit: "cover",
                      border: "3px solid green",
                      display: "block",
                    }}
                  />
                  <h3 className="text-lg font-semibold mt-2">{artwork.title}</h3>
                  <p className="text-sm text-gray-700">{artwork.description}</p>

                  <button
                    onClick={() => handleDelete(artwork._id)}
                    className="bg-red-500 text-white px-4 py-2 mt-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="text-center mb-4">
          <Link to="/upload" className="upload-artwork-button">
            Upload New Artwork
          </Link>
        </div>

        <div className="text-center">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;