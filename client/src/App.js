import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login2FA from './components/Login2FA';  // Login Page
import Register2FA from './components/Register2FA'; // Register Page
import Dashboard from './components/Dashboard';  // Dashboard after login
import SettingsPanel from './components/SettingsPanel'; // Profile Settings
import ProtectedRoute from './auth/ProtectedRoute';  // Protected Route for authenticated users
import Header from './components/Header';  // Header component
import Footer from './components/Footer';  // Footer component
import { AuthProvider } from './auth/AuthProvider';  // AuthProvider for handling token

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          {/* Define the login route */}
          <Route path="/login" element={<Login2FA />} />
          
          {/* Register page route */}
          <Route path="/register" element={<Register2FA />} />
          
          {/* Protect Dashboard route, only accessible for logged-in users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Profile settings page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPanel />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect any unmatched routes to the login page */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;