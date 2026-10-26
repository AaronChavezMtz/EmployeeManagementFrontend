import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathFor } from '../utils/labels';

// role: 'Admin' (RH) o 'Employee' (portal). Quien entra con el rol equivocado va a su propia página de inicio.
export default function ProtectedRoute({ role }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;

  return <Outlet />;
}
