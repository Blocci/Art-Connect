// Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/AuthProvider";
import UploadArtwork from "./UploadArtwork"; // Import the UploadArtwork component

const API_BASE = process.env.REACT_APP_API_BASE;

const Dashboard = () => {
  const { token } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [status, setStatus] = useState(""); // Status message for delete/upload

  // Fetch artworks when the component mounts
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/artworks`, {
          headers: { Authorization: `Bearer ${token}` }, // Include token in the headers
        });
        setArtworks(res.data.artworks); // Assuming the API returns an array of artworks
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setStatus("❌ Failed to load artworks.");
      }
    };

    fetchArtworks();
  }, [token]);

  // Handle deleting an artwork
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/delete-artwork/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove deleted artwork from the state
      setArtworks(artworks.filter((artwork) => artwork._id !== id));
      setStatus("✅ Artwork deleted successfully!");
    } catch (err) {
      console.error("Error deleting artwork:", err);
      setStatus("❌ Failed to delete artwork.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Dashboard</h1>

      {/* Display status messages */}
      {status && (
        <p className={`text-sm ${status.includes("❌") ? "text-red-500" : "text-green-600"}`}>
          {status}
        </p>
      )}

      {/* Flexbox layout for two sections: form and artwork gallery */}
      <div className="flex gap-8">
        {/* Left side: Upload Artwork Form */}
        <div className="w-1/3">
          <UploadArtwork /> {/* Render the upload form here */}
        </div>

        {/* Right side: Display Artworks */}
        <div className="w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {artworks.length === 0 ? (
              <p>No artworks uploaded yet.</p>
            ) : (
              artworks.map((artwork) => (
                <div key={artwork._id} className="bg-white p-4 rounded-lg shadow-lg">
                  <img
                    src={`/${artwork.imageUrl}`} // Display the artwork image
                    alt={artwork.title}
                    className="w-full h-40 object-cover mb-4 rounded-lg"
                  />
                  <h3 className="text-xl font-semibold">{artwork.title}</h3>
                  <p>{artwork.description}</p>
                  <button
                    onClick={() => handleDelete(artwork._id)} // Delete button
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete Artwork
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;