// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login2FA from './components/Login2FA';
import Register2FA from './components/Register2FA';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import AboutPage from './components/AboutPage';
import ProtectedRoute from './auth/ProtectedRoute';  // Protect routes like Dashboard and Profile
import Header from './components/Header';  // Import Header component
import Footer from './components/Footer';  // Import Footer component
import { AuthProvider } from './auth/AuthProvider';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header /> {/* This is where the navigation links will be */}
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Home page route */}
          <Route path="/login" element={<Login2FA />} />
          <Route path="/register" element={<Register2FA />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" />} /> {/* Redirect invalid routes to Home */}
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;