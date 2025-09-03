// Debug utility for authentication issues
export const debugAuthState = () => {
  // Check localStorage
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  }
  
  // Check if token is expired
  if (storedToken) {
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const isExpired = now > exp;
      
      if (isExpired) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }
};

// Function to clear auth data and redirect to login
export const clearAuthAndRedirect = (navigate) => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  if (navigate) {
    navigate('/login', { replace: true });
  } else {
    // Fallback to window.location if navigate is not available
    window.location.href = '/login';
  }
};

// Make debug functions available globally for console access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuthState;
  window.clearAuth = clearAuthAndRedirect;
  window.checkAuth = () => {
    // Quick auth check function (no logging)
  };
}
