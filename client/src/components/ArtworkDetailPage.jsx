import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ArtworkDetailPage = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);

  useEffect(() => {
    document.title = "ArtConnect – Artwork Details";

    // Simulated fetch — replace with actual API call
    const fakeArtwork = {
      id,
      title: "Sunset Over Water",
      description: "A calming view of a sunset reflecting over the lake.",
      imageUrl: "/placeholder-art.jpg",
      artist: "Jane Doe",
      createdAt: "2024-10-05",
    };

    setArtwork(fakeArtwork);
  }, [id]);

  if (!artwork) {
    return (
      <div className="artwork-detail">
        <div className="artwork-detail-inner">
          <p>Loading artwork...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="artwork-detail">
      <div className="artwork-detail-inner">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="artwork-image"
        />
        <h2 className="artwork-title">{artwork.title}</h2>
        <p className="artwork-meta">by {artwork.artist} — {artwork.createdAt}</p>
        <p className="artwork-description">{artwork.description}</p>
      </div>
    </div>
  );
};

export default ArtworkDetailPage;