import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { debugAuthState } from '../utils/authDebug';

export default function AuthDebug() {
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only run debug checks, don't auto-restore session
    debugAuthState();
    
    // Don't automatically restore user session here
    // Let PrivateRoute handle session restoration when needed
  }, [user, token]);

  return null; // This component doesn't render anything
}
