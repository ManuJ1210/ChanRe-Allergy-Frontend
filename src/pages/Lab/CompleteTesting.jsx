import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { 
  ArrowLeft, 
  Activity,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  UserCheck,
  MapPin,
  Phone,
  Stethoscope,
  TestTube,
  Save,
  StopCircle,
  Clock
} from 'lucide-react';

const CompleteTesting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [testRequest, setTestRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    labTestingNotes: ''
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTestRequestDetails();
    }
  }, [id]);

  const fetchTestRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/test-requests/${id}`);
      setTestRequest(response.data);
      
      // Pre-fill form with existing data if available
      if (response.data.labTestingNotes) {
        setFormData(prev => ({
          ...prev,
          labTestingNotes: response.data.labTestingNotes || '',
          testResults: response.data.testResults || '',
          conclusion: response.data.conclusion || '',
          recommendations: response.data.recommendations || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching test request details:', error);
      setError('Failed to load test request details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setFileError('Please select a PDF file only');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // PDF upload is mandatory
    if (!selectedFile) {
      setError('Please upload a PDF lab report. This field is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add notes field
      formDataToSend.append('labTestingNotes', formData.labTestingNotes);
      
      // Add file (mandatory)
      formDataToSend.append('labReportFile', selectedFile);


      const response = await API.put(`/test-requests/${id}/complete-testing`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/dashboard/lab/test-request/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error completing testing:', error);
      setError(error.response?.data?.message || 'Failed to complete testing');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Assigned':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Sample_Collection_Scheduled':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Sample_Collected':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'In_Lab_Testing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Testing_Completed':
        return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'Report_Generated':
        return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'Report_Sent':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !testRequest) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Test Request</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate('/dashboard/lab/test-requests')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Test Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!testRequest) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">No Test Request Found</h2>
              <p className="text-gray-600 mb-4">The requested test request could not be found.</p>
              <button
                onClick={() => navigate('/dashboard/lab/test-requests')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Test Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/dashboard/lab/test-request/${id}`)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800">Complete Lab Testing</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Record Header */}
          <div className="text-center mb-8">
                          <h1 className="text-xl font-bold text-gray-800 mb-2">UPLOAD LAB REPORT</h1>
              <p className="text-gray-600">Upload PDF Lab Report and Complete Testing</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-800">
                  Lab report uploaded and testing completed successfully! Redirecting to test request details...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {/* PDF Upload Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  PDF Lab Report Upload Required
                </h3>
                <p className="text-sm text-blue-700">
                  Please upload the completed lab report PDF. This is required to complete the testing process. 
                  You can also add additional notes if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Test Request Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Test Request Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Request ID</label>
                <p className="text-gray-900 font-medium">{testRequest._id || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium">{testRequest.patientName || testRequest.patientId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Test Type</label>
                <p className="text-gray-900 font-medium">{testRequest.testType || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Status and Urgency */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Current Status & Priority
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Current Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(testRequest.status)}`}>
                  {testRequest.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Urgency Level</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  testRequest.urgency === 'Emergency' ? 'text-red-600 bg-red-50 border-red-200' :
                  testRequest.urgency === 'Urgent' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                  'text-green-600 bg-green-50 border-green-200'
                }`}>
                  {testRequest.urgency}
                </span>
              </div>
            </div>
          </div>

          {/* Complete Testing Form */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Upload Lab Report & Add Notes
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">








              {/* Lab Report PDF Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Lab Report PDF <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {!selectedFile ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="lab-report-upload"
                      />
                      <label 
                        htmlFor="lab-report-upload"
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        Choose PDF File
                      </label>
                      <span className="text-xs text-gray-500">
                        Max size: 10MB, PDF only
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-blue-600">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  {fileError && (
                    <p className="text-xs text-red-600">{fileError}</p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Upload the completed lab report PDF. This will be sent to the doctor along with your notes.
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Notes <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="labTestingNotes"
                  value={formData.labTestingNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter any additional notes or comments..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/lab/test-request/${id}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteTesting; 