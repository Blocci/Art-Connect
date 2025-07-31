// Header.jsx
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-semibold">ArtConnect</h1>
        <nav className="space-x-6"> {/* Space out links evenly */}
          <Link to="/" className="text-white hover:text-gray-400">Home</Link>
          <Link to="/dashboard" className="text-white hover:text-gray-400">Dashboard</Link>
          <Link to="/profile" className="text-white hover:text-gray-400">Profile</Link>
          <Link to="/about" className="text-white hover:text-gray-400">About</Link>
          <Link to="/login" className="text-white hover:text-gray-400">Login</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;