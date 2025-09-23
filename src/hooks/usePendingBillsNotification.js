import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const usePendingBillsNotification = () => {
  const { user } = useSelector((state) => state.auth);
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  useEffect(() => {
    // Only show for receptionists and center admins
    if (user && (user.role === 'receptionist' || user.role === 'centeradmin')) {
      // Check if we've already shown the notification in this session
      const notificationShown = sessionStorage.getItem('pendingBillsNotificationShown');
      
      if (!notificationShown) {
        // Show notification after a short delay to allow the page to load
        const timer = setTimeout(() => {
          console.log('Showing pending bills notification for user:', user.role);
          setShowNotification(true);
          setHasShownNotification(true);
          sessionStorage.setItem('pendingBillsNotificationShown', 'true');
        }, 3000); // 3 second delay to ensure data is loaded

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const closeNotification = () => {
    setShowNotification(false);
  };

  const resetNotification = () => {
    setHasShownNotification(false);
    sessionStorage.removeItem('pendingBillsNotificationShown');
    console.log('Pending bills notification reset');
  };

  return {
    showNotification,
    closeNotification,
    resetNotification,
    hasShownNotification
  };
};
