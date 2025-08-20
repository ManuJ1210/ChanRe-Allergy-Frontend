import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function LabRouteProtection({ children }) {
  const { user } = useSelector((state) => state.auth);
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is any type of lab staff
  const labRoles = ['Lab Staff', 'Lab Technician', 'Lab Assistant', 'Lab Manager'];
  if (user.role && labRoles.includes(user.role)) {
    return children; // Allow access for all lab roles
  }
  
  // Check if user is lab staff by userType (from JWT token)
  if (user.userType === 'LabStaff') {
    return children; // Allow access for lab staff
  }
  
  // Redirect non-lab users away from lab dashboard
  return <Navigate to="/login" replace />;
} 