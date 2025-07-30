import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login2FA from "./components/Login2FA";
import Register2FA from "./components/Register2FA";
import Dashboard from "./components/Dashboard";
import SettingsPanel from "./components/SettingsPanel"; // ✅ NEW

const App = () => {
  return (
    <AuthProvider>
      <Router>
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
          <Route path="*" element={<Login2FA />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;