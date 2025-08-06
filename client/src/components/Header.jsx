import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="header-inner">
        <h1>ArtConnect</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;