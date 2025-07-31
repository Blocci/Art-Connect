// Header.jsx
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-semibold">ArtConnect</h1>
        <nav className="space-x-8"> {/* Space out links with margin */}
          <Link to="/" className="text-white">Home</Link>
          <Link to="/dashboard" className="text-white">Dashboard</Link>
          <Link to="/profile" className="text-white">Profile</Link>
          <Link to="/about" className="text-white">About</Link>
          <Link to="/login" className="text-white">Login</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;