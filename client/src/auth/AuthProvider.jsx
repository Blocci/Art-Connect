import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Could simulate loading check or refresh token
  }, []);

  useEffect(() => {
    if (!token) return;

    let timeoutId;

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000; // exp is in seconds, convert to ms
      const now = Date.now();

      if (now >= exp) {
        logout();
      } else {
        timeoutId = setTimeout(() => {
          logout();
        }, exp - now);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      logout();
    }

    return () => clearTimeout(timeoutId);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login'; // Optional: auto redirect on logout
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);