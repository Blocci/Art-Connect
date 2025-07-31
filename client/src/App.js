import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login2FA from './components/Login2FA';
import Register2FA from './components/Register2FA';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';
import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthProvider';

function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider should be inside Router */}
        <Routes>
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
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;