import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">🎨 Welcome to ArtConnect</h1>
      <p className="mb-6">You’re securely logged in.</p>

      <div className="flex gap-4 justify-center">
        <Link
          to="/settings"
          className="bg-gray-200 text-blue-700 px-4 py-2 rounded hover:underline"
        >
          Settings
        </Link>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;