import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRoutePermission } from '../../config/permissions';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check route permission based on user role
  if (!hasRoutePermission(user.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedLayout;