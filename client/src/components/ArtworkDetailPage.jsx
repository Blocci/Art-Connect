// ArtworkDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const ArtworkDetailPage = () => {
  const { id } = useParams(); // Get the artwork ID from the URL
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Artwork Details</h1>
      <p>Displaying details for artwork ID: {id}</p>
      {/* Show artwork details (e.g., image, description, comments, etc.) */}
    </div>
  );
};

export default ArtworkDetailPage;