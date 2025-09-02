import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  fetchDoctorNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../../features/doctor/doctorThunks';

// Helper function to extract patient name from message
const extractPatientNameFromMessage = (message) => {
  if (!message) return null;
  
  // Look for patterns like "patient [Name]" or "for patient [Name]"
  const patterns = [
    /for patient\s+([A-Za-z0-9]+)/i,
    /patient\s+([A-Za-z0-9]+)/i,
    /patient:\s*([A-Za-z0-9]+)/i,
    /patient\s+([A-Za-z0-9]+)/gi
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      
      return match[1];
    }
  }
  
  // If no pattern matches, try to find any word that looks like a patient name
  // Look for words that start with capital letters and contain numbers (like TestPatient002)
  const words = message.split(/\s+/);
  for (const word of words) {
    if (/^[A-Z][a-z]*[A-Za-z0-9]*\d+$/.test(word)) {
      
      return word;
    }
  }
  
  
  return null;
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { 
    notifications, 
    unreadNotificationsCount, 
    notificationsLoading, 
    notificationsError 
  } = useSelector((state) => state.doctor);

  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctorNotifications());
  }, [dispatch]);

  // Debug: Log notifications count
  useEffect(() => {

  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await dispatch(deleteNotification(notificationId));
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      await dispatch(deleteAllNotifications());
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lab_report_feedback':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'test_request':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'patient_update':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'lab_report_feedback':
        return 'border-l-blue-500 bg-blue-50';
      case 'test_request':
        return 'border-l-orange-500 bg-orange-50';
      case 'patient_update':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (notificationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadNotificationsCount > 0 
                ? `${unreadNotificationsCount} unread notification${unreadNotificationsCount > 1 ? 's' : ''}`
                : 'All notifications read'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(fetchDoctorNotifications())}
              disabled={notificationsLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${notificationsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAllNotifications}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </button>
            )}
          </div>
        </div>
      </div>

      {notificationsError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{notificationsError}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">All Notifications</h2>
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotifications}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
              title="Delete all notifications"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete All
            </button>
          )}
        </div>
        <div className="p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                    notification.read ? 'opacity-75' : ''
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                                                 <p className="text-gray-600 mt-1">{notification.message}</p>
                         {notification.data && (
                           <div className="mt-2 text-xs text-gray-500">
                             <p><strong>From:</strong> {notification.sender?.name || 'System'}</p>
                             {notification.data.patientId && (
                               <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                 <p><strong>Patient:</strong> {typeof notification.data.patientId === 'object' ? notification.data.patientId.name : extractPatientNameFromMessage(notification.message) || 'Unknown'}</p>
                                 {notification.data.testId && (
                                   <p><strong>Test ID:</strong> {notification.data.testId}</p>
                                 )}
                               </div>
                             )}
                             {/* Fallback for when patientId is not nested */}
                             {!notification.data.patientId && (notification.data.patientName || notification.data.testId) && (
                               <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                 <p><strong>Patient:</strong> {notification.data.patientName || extractPatientNameFromMessage(notification.message) || 'Unknown'}</p>
                                 {notification.data.testId && (
                                   <p><strong>Test ID:</strong> {notification.data.testId}</p>
                                 )}
                               </div>
                             )}
                             {notification.data.additionalTests && (
                               <p><strong>Additional Tests:</strong> {notification.data.additionalTests}</p>
                             )}
                             {notification.data.patientInstructions && (
                               <p><strong>Instructions:</strong> {notification.data.patientInstructions}</p>
                             )}
                             {notification.data.notes && (
                               <p><strong>Notes:</strong> {notification.data.notes}</p>
                             )}
                           </div>
                         )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewNotification(notification)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors duration-200"
                        title="Delete notification"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-800">
                  Notification Details
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">Title</h4>
                  <p className="text-gray-600">{selectedNotification.title}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Message</h4>
                  <p className="text-gray-600">{selectedNotification.message}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Type</h4>
                  <p className="text-gray-600 capitalize">{selectedNotification.type.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Date</h4>
                  <p className="text-gray-600">{formatDate(selectedNotification.createdAt)}</p>
                </div>
                
                                 {selectedNotification.data && (
                   <div>
                     <h4 className="font-semibold text-gray-800">Patient Information</h4>
                     <div className="bg-blue-50 p-4 rounded-lg space-y-3 mb-4">
                       {selectedNotification.data.patientId && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <p className="text-xs font-medium text-blue-700">Patient Name</p>
                             <p className="text-blue-600 font-semibold">
                               {typeof selectedNotification.data.patientId === 'object' 
                                 ? selectedNotification.data.patientId.name 
                                 : extractPatientNameFromMessage(selectedNotification.message) || 'Unknown'}
                             </p>
                           </div>
                           {selectedNotification.data.testId && (
                             <div>
                               <p className="text-xs font-medium text-blue-700">Test ID</p>
                               <p className="text-blue-600 font-mono text-xs">{selectedNotification.data.testId}</p>
                             </div>
                           )}
                         </div>
                       )}
                       {/* Fallback for when patientId is not nested - try to extract from message */}
                       {!selectedNotification.data.patientId && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <p className="text-xs font-medium text-blue-700">Patient Name</p>
                             <p className="text-blue-600 font-semibold">
                               {selectedNotification.data.patientName || 
                                extractPatientNameFromMessage(selectedNotification.message) || 
                                'Unknown'}
                             </p>
                           </div>
                           {selectedNotification.data.testId && (
                             <div>
                               <p className="text-xs font-medium text-blue-700">Test ID</p>
                               <p className="text-blue-600 font-mono text-xs">{selectedNotification.data.testId}</p>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                     
                     <h4 className="font-semibold text-gray-800">Feedback Details</h4>
                     <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                       {selectedNotification.data.additionalTests && (
                         <div>
                           <p className="text-xs font-medium text-gray-700">Additional Tests Recommended</p>
                           <p className="text-gray-600">{selectedNotification.data.additionalTests}</p>
                         </div>
                       )}
                       {selectedNotification.data.patientInstructions && (
                         <div>
                           <p className="text-xs font-medium text-gray-700">Patient Instructions</p>
                           <p className="text-gray-600">{selectedNotification.data.patientInstructions}</p>
                         </div>
                       )}
                       {selectedNotification.data.notes && (
                         <div>
                           <p className="text-xs font-medium text-gray-700">Additional Notes</p>
                           <p className="text-gray-600">{selectedNotification.data.notes}</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  if (selectedNotification) {
                    handleDeleteNotification(selectedNotification._id);
                  }
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors duration-200 shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
