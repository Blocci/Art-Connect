// HomePage.jsx (Responsive layout for artworks)
import React from 'react';

const HomePage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to ArtConnect</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {/* Featured Artwork */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img
            src="path_to_artwork_image"
            alt="Artwork"
            className="w-full h-60 object-cover mb-4 rounded-lg"
          />
          <h2 className="text-xl font-semibold">Artwork Title</h2>
          <p>By Artist Name</p>
        </div>

        {/* Additional Featured Artworks */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img
            src="path_to_artwork_image"
            alt="Artwork"
            className="w-full h-60 object-cover mb-4 rounded-lg"
          />
          <h2 className="text-xl font-semibold">Artwork Title</h2>
          <p>By Artist Name</p>
        </div>

        {/* Add more artworks here */}
      </div>
    </div>
  );
};

export default HomePage;