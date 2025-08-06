import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const HomePage = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    document.title = "ArtConnect – Home";

    axios.get(`${API_BASE}/artworks/public`) // uses the same route as dashboard
      .then(res => setFeatured(res.data.artworks))
      .catch(err => {
        console.error("Error fetching featured artwork:", err);
        setFeatured([]);
      });
  }, []);

  return (
    <div className="home">
      <div className="home-inner">
        <h1 className="text-center mb-4">Welcome to ArtConnect</h1>
        <p className="text-center mb-8">
          A platform built to elevate and showcase digital artists through modern,
          secure tools.
        </p>

        <h2 className="text-center mb-6">Featured Artwork</h2>
        <div className="home-grid">
          {featured.length === 0 ? (
            <p className="text-center">No artworks available yet.</p>
          ) : (
            featured.map((artwork, idx) => (
              <div key={idx} className="panel">
                <img
                  src={`/static/artworks/${artwork.imageUrl}`} //this assumes imageUrl is like 'artworks/filename.jpg'
                  alt={artwork.title}
                  onError={(e) => {
                    console.log("Failed to load homepage image:", e.target.src);
                    e.target.style.border = "3px solid red";
                    e.target.src = "/static/placeholder.jpg";
                  }}
                  style={{
                    width: "100%",
                    height: "480px",
                    objectFit: "cover",
                    border: "3px solid green",
                    borderRadius: "8px",
                    display: "block",
                  }}
                />
                <h3 className="text-lg font-semibold mt-2">{artwork.title}</h3>
                <p className="text-sm text-gray-700">By {artwork.userId?.username || "Unknown"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;