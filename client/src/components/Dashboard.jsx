// Dashboard.jsx (Updated with better spacing)
import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Dashboard</h1>
      
      {/* Grid Layout for User's Artwork and Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* User's Artwork */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4">Your Artwork</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-200 p-4 rounded-md">
              <img
                src="path_to_artwork_image"
                alt="Uploaded Artwork"
                className="w-full h-40 object-cover mb-4 rounded-lg"
              />
              <p className="text-center">Artwork Title</p>
            </div>
            {/* Add more artworks as needed */}
          </div>
        </div>

        {/* User's Profile Settings */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;