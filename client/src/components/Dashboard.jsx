// Dashboard.jsx (Updated with delete functionality)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

const API_BASE = process.env.REACT_APP_API_BASE;

const Dashboard = () => {
  const { token } = useAuth();
  const [artworks, setArtworks] = useState([]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/delete-artwork/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted artwork from the state
      setArtworks(artworks.filter((artwork) => artwork._id !== id));
    } catch (err) {
      console.error('Error deleting artwork:', err);
    }
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/artworks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtworks(res.data.artworks);
      } catch (err) {
        console.error('Error fetching artworks:', err);
      }
    };

    fetchArtworks();
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artworks.length === 0 ? (
          <p>No artworks uploaded yet.</p>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork._id} className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src={`/${artwork.imageUrl}`} // Image path for uploaded artwork
                alt={artwork.title}
                className="w-full h-40 object-cover mb-4 rounded-lg"
              />
              <h3 className="text-xl font-semibold">{artwork.title}</h3>
              <p>{artwork.description}</p>
              <button
                onClick={() => handleDelete(artwork._id)}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete Artwork
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;