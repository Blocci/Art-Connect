// Dashboard.jsx
import React from 'react';
import { useAuth } from "../auth/AuthProvider";

const Dashboard = () => {
  const { token } = useAuth();  // Example useAuth hook for user context

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Display the user's uploaded artworks */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Your Artwork</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* List of uploaded artworks */}
            <div className="bg-gray-200 p-4 rounded-md">
              <img src="path_to_artwork_image" alt="Uploaded Artwork" className="w-full h-40 object-cover"/>
              <p className="mt-2">Artwork Title</p>
            </div>
            {/* More uploaded artwork */}
          </div>
        </div>

        {/* User's Profile Settings */}
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Profile Settings</h2>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;