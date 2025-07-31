// Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-semibold">ArtConnect</h1>
        <nav>
          <Link to="/" className="text-white mx-4">Home</Link>
          <Link to="/dashboard" className="text-white mx-4">Dashboard</Link>
          <Link to="/settings" className="text-white mx-4">Settings</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;