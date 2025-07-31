import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login"); // Use navigate to redirect to login
  }, [navigate]); // Memoize the logout function and include navigate as a dependency

  useEffect(() => {
    if (!token) return;

    try {
      const { exp } = jwtDecode(token);
      const timeout = setTimeout(() => logout(), (exp * 1000) - Date.now());
      return () => clearTimeout(timeout);
    } catch {
      logout();
    }
  }, [token, logout]);  // Add logout as a dependency

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);