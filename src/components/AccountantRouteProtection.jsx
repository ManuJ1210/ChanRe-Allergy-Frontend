import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AccountantRouteProtection({ children }) {
  const { user } = useSelector((state) => state.auth);
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is an accountant
  if (user.role && user.role.toLowerCase() === 'accountant') {
    return children; // Allow access for accountants
  }
  
  // Redirect non-accountant users away from accountant dashboard
  return <Navigate to="/login" replace />;
}
