import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  useEffect(() => {
    document.title = "ArtConnect – Page Not Found";
  }, []);

  return (
    <div className="not-found">
      <div className="not-found-inner">
        <h1>404</h1>
        <p>This page doesn't exist.</p>
        <Link to="/" className="not-found-link">Go back home</Link>
      </div>
    </div>
  );
};

export default NotFound;