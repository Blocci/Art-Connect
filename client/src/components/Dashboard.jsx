// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import UploadArtwork from './UploadArtwork';  // Make sure this is imported

const API_BASE = process.env.REACT_APP_API_BASE;

const Dashboard = () => {
  const { token } = useAuth();
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/artworks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setArtworks(res.data.artworks); // Assuming the API returns an array of artworks
      } catch (err) {
        console.error('Error fetching artworks:', err);
      }
    };

    fetchArtworks();
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      {/* Add Upload Artwork Form */}
      <UploadArtwork /> {/* Ensure this is added to render the form */}

      {/* Display uploaded artworks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artworks.length === 0 ? (
          <p>No artworks uploaded yet.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork._id} className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src={`/${artwork.imageUrl}`}
                alt={artwork.title}
                className="w-full h-40 object-cover mb-4 rounded-lg"
              />
              <h3 className="text-xl font-semibold">{artwork.title}</h3>
              <p>{artwork.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;