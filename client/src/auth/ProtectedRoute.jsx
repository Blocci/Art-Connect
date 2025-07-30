import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div>Checking session...</div>;

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;