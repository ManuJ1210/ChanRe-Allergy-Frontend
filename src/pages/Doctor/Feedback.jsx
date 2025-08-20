import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MessageSquare, 
  User, 
  Calendar, 
  FileText, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { fetchTestRequestsWithFeedback } from '../../features/doctor/doctorThunks';

const Feedback = () => {
  const dispatch = useDispatch();
  const { 
    testRequestsWithFeedback, 
    feedbackLoading, 
    feedbackError 
  } = useSelector((state) => state.doctor);

  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    dispatch(fetchTestRequestsWithFeedback());
  }, [dispatch]);

  const handleViewFeedback = (testRequest) => {
    setSelectedFeedback(testRequest);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (feedbackLoading) {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Superadmin Feedback</h1>
            <p className="text-gray-600">
              Review feedback from superadmin doctors on your test requests
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchTestRequestsWithFeedback())}
            disabled={feedbackLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${feedbackLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {feedbackError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{feedbackError}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Test Requests with Feedback ({testRequestsWithFeedback.length})
          </h2>
        </div>
        <div className="p-6">
          {testRequestsWithFeedback.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No test requests with feedback available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testRequestsWithFeedback.map((testRequest) => (
                <div
                  key={testRequest._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                                                     <div>
                             <h3 className="font-semibold text-gray-800">
                               {testRequest.testType}
                             </h3>
                             <p className="text-sm text-gray-600">
                               Patient: {testRequest.patientName}
                             </p>
                             {testRequest.patient && (
                               <div className="mt-1 text-xs text-gray-500">
                                 <span>Age: {testRequest.patient.age || 'N/A'}</span>
                                 <span className="mx-2">|</span>
                                 <span>Gender: {testRequest.patient.gender || 'N/A'}</span>
                                 {testRequest.patient.phoneNumber && (
                                   <>
                                     <span className="mx-2">|</span>
                                     <span>Phone: {testRequest.patient.phoneNumber}</span>
                                   </>
                                 )}
                               </div>
                             )}
                           </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testRequest.status)}`}>
                              {testRequest.status}
                            </span>
                            <button
                              onClick={() => handleViewFeedback(testRequest)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Feedback
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(testRequest.createdAt)}
                          </div>
                          {testRequest.completedAt && (
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completed: {formatDate(testRequest.completedAt)}
                            </div>
                          )}
                        </div>
                        {testRequest.feedback && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700">
                                Superadmin Review
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {testRequest.feedback.notes || 'No additional notes provided'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                  Feedback Details - {selectedFeedback.testType}
                </h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Test Request Details */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Test Request Details</h4>
                                     <div className="space-y-3">
                     <div>
                       <p className="text-sm text-gray-600">Patient</p>
                       <p className="font-medium">{selectedFeedback.patientName}</p>
                       {selectedFeedback.patient && (
                         <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                           <p><strong>Age:</strong> {selectedFeedback.patient.age || 'N/A'} | <strong>Gender:</strong> {selectedFeedback.patient.gender || 'N/A'}</p>
                           {selectedFeedback.patient.phoneNumber && (
                             <p><strong>Phone:</strong> {selectedFeedback.patient.phoneNumber}</p>
                           )}
                           {selectedFeedback.patient.email && (
                             <p><strong>Email:</strong> {selectedFeedback.patient.email}</p>
                           )}
                           {selectedFeedback.patient.address && (
                             <p><strong>Address:</strong> {selectedFeedback.patient.address}</p>
                           )}
                         </div>
                       )}
                     </div>
                    <div>
                      <p className="text-sm text-gray-600">Test Type</p>
                      <p className="font-medium">{selectedFeedback.testType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium">{selectedFeedback.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{formatDate(selectedFeedback.createdAt)}</p>
                    </div>
                    {selectedFeedback.completedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="font-medium">{formatDate(selectedFeedback.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Details */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Superadmin Feedback</h4>
                  {selectedFeedback.feedback ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Review Status</p>
                        <p className="font-medium capitalize">{selectedFeedback.feedback.status}</p>
                      </div>
                      {selectedFeedback.feedback.reviewedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Reviewed On</p>
                          <p className="font-medium">{formatDate(selectedFeedback.feedback.reviewedAt)}</p>
                        </div>
                      )}
                      {selectedFeedback.feedback.additionalTests && (
                        <div>
                          <p className="text-sm text-gray-600">Additional Tests Recommended</p>
                          <p className="font-medium">{selectedFeedback.feedback.additionalTests}</p>
                        </div>
                      )}
                      {selectedFeedback.feedback.patientInstructions && (
                        <div>
                          <p className="text-sm text-gray-600">Patient Instructions</p>
                          <p className="font-medium">{selectedFeedback.feedback.patientInstructions}</p>
                        </div>
                      )}
                      {selectedFeedback.feedback.notes && (
                        <div>
                          <p className="text-sm text-gray-600">Additional Notes</p>
                          <p className="font-medium">{selectedFeedback.feedback.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No feedback available</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedFeedback(null)}
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

export default Feedback;
