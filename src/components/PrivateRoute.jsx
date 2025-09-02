import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setUserFromLocal } from '../features/auth/authSlice';

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  
  // Check both auth states for better compatibility
  const { user: authUser } = useSelector((state) => state.auth);
  const { userInfo } = useSelector((state) => state.user);
  
  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken && !authUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(setUserFromLocal());
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [dispatch, authUser]);
  
  // Use whichever user is available
  const user = authUser || userInfo;
  const token = user?.token || localStorage.getItem('token');

  // If no token, redirect directly to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render children
  return children;
}
