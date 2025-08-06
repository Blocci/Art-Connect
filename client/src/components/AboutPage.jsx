import React, { useEffect } from 'react';

const AboutPage = () => {
  useEffect(() => {
    document.title = "ArtConnect – About";
  }, []);

  return (
    <div className="about">
      <div className="about-inner">
        <h1 className="text-center mb-4">About ArtConnect</h1>
        <p className="text-center mb-6">
          ArtConnect is a digital platform built for artists and art lovers alike.
          Our mission is to make it easy for creatives to showcase their work, connect
          with others, and explore inspiring creations.
        </p>

        <h2 className="text-center mb-2">What You Can Do</h2>
        <ul className="about-list">
          <li>Create a secure artist profile</li>
          <li>Upload and display your artwork</li>
          <li>Login with face + voice 2FA for enhanced privacy</li>
          <li>Access your dashboard to manage uploads</li>
        </ul>

        <div className="mt-6 text-center">
          <p>ArtConnect is a student-built, open-source project.</p>
          <p>We’re always improving — thank you for supporting us!</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;