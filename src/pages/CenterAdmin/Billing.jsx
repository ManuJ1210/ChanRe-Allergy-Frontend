import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { API_CONFIG, SERVER_CONFIG } from '../../config/environment';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  DollarSign, 
  Calendar,
  Building,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  TrendingUp,
  Receipt
} from 'lucide-react';

const CenterAdminBilling = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [selectedBillingForVerification, setSelectedBillingForVerification] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  // Helper function to safely get user information for debugging
  const getSafeUserInfo = (user) => {
    if (!user) return 'No user data';
    
    try {
      // Create a safe copy of the user object with only primitive values
      const safeUser = {};
      const processedKeys = new Set(); // Track processed keys to avoid circular references
      
      const processValue = (value, depth = 0) => {
        if (depth > 3) return '[Max depth reached]'; // Prevent infinite recursion
        
        if (value === null || value === undefined) {
          return value;
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return value;
        } else if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return `[Array with ${value.length} items]`;
          } else if (value instanceof Date) {
            return value.toISOString();
          } else if (value._bsontype) {
            return `[MongoDB Object: ${value._bsontype}]`;
          } else {
            // For objects, try to get a string representation
            try {
              const keys = Object.keys(value);
              if (keys.length === 0) return '{}';
              if (keys.length > 5) return `{${keys.slice(0, 5).join(', ')}... and ${keys.length - 5} more}`;
              return `{${keys.join(', ')}}`;
            } catch {
              return `[Object: ${typeof value}]`;
            }
          }
        } else {
          return `[${typeof value}]`;
        }
      };
      
      Object.keys(user).forEach(key => {
        if (processedKeys.has(key)) return; // Skip already processed keys
        processedKeys.add(key);
        
        try {
          safeUser[key] = processValue(user[key], 0);
        } catch (error) {
          safeUser[key] = `[Error: ${error.message}]`;
        }
      });
      
      return JSON.stringify(safeUser, null, 2);
    } catch (error) {
      return `Error processing user object: ${error.message}`;
    }
  };

  // ✅ REAL DATA: Fetch billing data for the center
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Safety check: ensure user is authenticated
      if (!user || !localUser) {
        console.log('User not authenticated, skipping billing data fetch');
        setBillingData([]);
        setLoading(false);
        return;
      }
      
      // Safety check: ensure localUser exists
      if (!localUser) {
        console.error('localUser is not available');
        toast.error('User data not available. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      // Try different possible properties for center ID
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      // If centerId is an object, extract the _id property
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      if (!centerId) {
        toast.error('Center ID not found. Please check your user profile.');
        setLoading(false);
        return;
      }
      
             const response = await API.get(`/billing/center`);
      
      // Ensure we have an array of billing requests
      if (response.data && Array.isArray(response.data.billingRequests)) {
        setBillingData(response.data.billingRequests);
      } else if (response.data && Array.isArray(response.data)) {
        // If the response is directly an array
        setBillingData(response.data);
      } else {
        console.warn('Unexpected billing data format:', response.data);
        setBillingData([]);
      }
    } catch (error) {
      console.error('Error fetching real billing data:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        console.error('API Error Response:', { status, data: errorData });
        
        if (status === 404) {
          toast.error('Billing endpoint not found. Please check server configuration.');
        } else if (status === 401) {
          // More specific 401 error handling
          const hasToken = !!localStorage.getItem('token');
          const hasUser = !!localStorage.getItem('user');
          
          if (!hasToken && !hasUser) {
            toast.error('You are not logged in. Please login to access billing data.');
          } else if (!hasToken) {
            toast.error('Authentication token missing. Please login again.');
          } else {
            toast.error('Authentication failed. Your session may have expired. Please login again.');
          }
          
          // Optionally redirect to login after a delay
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 3000);
        } else if (status === 403) {
          toast.error('Access denied. You do not have permission to view billing data.');
        } else {
          toast.error(`Failed to fetch billing data: ${errorData?.message || `Server error (${status})`}`);
        }
      } else if (error.request) {
        // Network error or no response from server
        console.error('Network Error:', error.request);
        toast.error('Unable to connect to server. Please check your internet connection.');
      } else {
        // Other error (like parsing error)
        console.error('Other Error:', error.message);
        toast.error(`Error fetching billing data: ${error.message}`);
      }
      
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('User effect triggered:', user);
    
    // Clear local user state when user is null (logout)
    if (!user) {
      setLocalUser(null);
      setBillingData([]);
      return;
    }
    
    try {
      // Initialize localUser with the Redux user
      if (user && !localUser) {
        // Create a safe copy of the user object
        const safeUser = { ...user };
        setLocalUser(safeUser);
      }
      
      // Try different possible properties for center ID
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      // If centerId is an object, extract the _id property
      if (centerId && typeof centerId === 'object' && centerId._id) {
        console.log('CenterId is an object, extracting _id:', centerId);
        centerId = centerId._id;
      }
      
      if (centerId) {
        console.log('Found center ID:', centerId);
        fetchBillingData();
      } else {
        console.log('User or centerId not available:', localUser);
        console.log('Available user properties:', Object.keys(localUser || {}));
        
        // If user exists but no centerId, show helpful message
        if (localUser && Object.keys(localUser).length > 0) {
          // Try to get centerId from user's role or other properties
          if (localUser.role === 'centeradmin') {
            // For center admin, we might need to fetch center info separately
            console.log('User is center admin but no centerId found. Attempting to fetch center info...');
            fetchCenterInfo();
          } else {
            toast.warning('Center ID not found in user profile. Please contact support.');
          }
        }
      }
    } catch (error) {
      console.error('Error in user effect:', error);
      toast.error('Error processing user data');
    }

    // Cleanup function to handle component unmounting
    return () => {
      // This will run when the component unmounts or when dependencies change
      console.log('Cleaning up user effect');
    };
  }, [user, localUser, localUser?.centerId, localUser?.center?.id]);

  // Fetch center information if centerId is not available
  const fetchCenterInfo = async () => {
    try {
      // Safety check: ensure user is authenticated
      if (!user) {
        console.log('User not authenticated, skipping center info fetch');
        return;
      }
      
      // Safety check: ensure user has an _id
      if (!user?._id) {
        console.error('User missing _id:', user);
        toast.error('User ID not found');
        return;
      }
      
      // Use the correct endpoint to get center by admin ID
      const response = await API.get(`/centers/by-admin/${user._id}`);
      
      console.log('Center info fetched:', response.data);
      if (response.data._id) {
        // Update the user object with centerId
        const updatedUser = { ...user, centerId: response.data._id };
        console.log('Updated user with centerId:', updatedUser);
        
        // Update the local state temporarily
        // In a real app, you'd dispatch an action to update the Redux store
        setLocalUser(updatedUser);
        
        // Now fetch billing data with the centerId
        // We need to wait for the state update to take effect
        setTimeout(() => {
          fetchBillingData();
        }, 100);
      } else {
        console.error('Center data missing _id:', response.data);
        toast.error('Invalid center data received');
      }
    } catch (error) {
      console.error('Error fetching center info:', error);
      toast.error('Error fetching center information');
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = billingData;

    // Safety check: ensure billingData is an array
    if (!Array.isArray(filtered)) {
      console.warn('billingData is not an array:', filtered);
      filtered = [];
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        // Safety check: ensure item is valid
        if (!item || typeof item !== 'object') return false;
        
        return (
          (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.testType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.billing?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        // Safety check: ensure item is valid
        if (!item || typeof item !== 'object') return false;
        return item.billing?.status === statusFilter;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => {
            // Safety check: ensure item is valid
            if (!item || typeof item !== 'object') return false;
            
            try {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt || Date.now());
              return itemDate >= filterDate;
            } catch (error) {
              console.warn('Invalid date for item:', item);
              return false;
            }
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(item => {
            // Safety check: ensure item is valid
            if (!item || typeof item !== 'object') return false;
            
            try {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt || Date.now());
              return itemDate >= filterDate;
            } catch (error) {
              console.warn('Invalid date for item:', item);
              return false;
            }
          });
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(item => {
            // Safety check: ensure item is valid
            if (!item || typeof item !== 'object') return false;
            
            try {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt || Date.now());
              return itemDate >= filterDate;
            } catch (error) {
              console.warn('Invalid date for item:', item);
              return false;
            }
          });
          break;
        default:
          break;
      }
    }

    setFilteredData(filtered);
  }, [billingData, searchTerm, statusFilter, dateFilter]);

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'not_generated': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Generated' },
      'generated': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Generated' },
      'payment_received': { color: 'bg-yellow-100 text-yellow-800', icon: DollarSign, label: 'Payment Received' },
      'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      'verified': { color: 'bg-purple-100 text-purple-800', icon: Shield, label: 'Verified' }
    };

    const config = statusConfig[status] || statusConfig['not_generated'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      'Low': 'bg-green-100 text-green-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'High': 'bg-yellow-100 text-yellow-800',
      'Urgent': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyConfig[urgency] || urgencyConfig['Normal']}`}>
        {urgency}
      </span>
    );
  };

  // View billing details
  const viewBillingDetails = (billing) => {
    setSelectedBilling(billing);
    setShowBillingModal(true);
  };

  // Open verification modal
  const openVerificationModal = (billing) => {
    setSelectedBillingForVerification(billing);
    setVerificationNotes('');
    setShowVerificationModal(true);
  };

  // View receipt
  const viewReceipt = (receiptFileName) => {
    setSelectedReceipt(receiptFileName);
    setShowReceiptModal(true);
  };

  // ✅ NEW: Download invoice PDF
  const handleDownloadInvoice = async (testRequestId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/billing/test-requests/${testRequestId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }
      
      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition ? 
        contentDisposition.split('filename=')[1]?.replace(/"/g, '') : 
        `invoice-${testRequestId}.pdf`;
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedReceipt(null);
  };

  // Verify payment
  const verifyPayment = async () => {
    if (!selectedBillingForVerification) return;

    try {
              const response = await API.put(`/billing/test-requests/${selectedBillingForVerification._id}/mark-paid`, {
        verificationNotes: verificationNotes
      });

      toast.success('Payment verified successfully');
      setShowVerificationModal(false);
      fetchBillingData(); // Refresh data
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error verifying payment');
      }
    }
  };

  // Download invoice (placeholder)
  const downloadInvoice = (billingId) => {
    toast.info('Invoice download functionality will be implemented');
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = filteredData.reduce((acc, item) => {
      // Safety check: ensure item is valid
      if (!item || typeof item !== 'object') {
        return acc;
      }
      
      const amount = item.billing?.amount || 0;
      acc.totalAmount += amount;
      acc.totalCount += 1;
      
      if (item.billing?.status === 'paid' || item.billing?.status === 'verified') {
        acc.paidAmount += amount;
        acc.paidCount += 1;
      } else if (item.billing?.status === 'generated') {
        acc.pendingAmount += amount;
        acc.pendingCount += 1;
      } else if (item.billing?.status === 'payment_received') {
        acc.paymentReceivedAmount += amount;
        acc.paymentReceivedCount += 1;
      }
      
      return acc;
    }, { 
      totalAmount: 0, 
      totalCount: 0, 
      paidAmount: 0, 
      paidCount: 0, 
      pendingAmount: 0, 
      pendingCount: 0,
      paymentReceivedAmount: 0,
      paymentReceivedCount: 0
    });

    return totals;
  };

  const totals = calculateTotals();

  // Safety check: if user is not authenticated, show loading or redirect
  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Authentication Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Please log in to access the billing management system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: if there's a critical error, show a simple error message
  if (!localUser && user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error Loading User Data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>There was an error processing your user data. Please refresh the page or contact support.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Center Billing Management</h1>
            <p className="text-gray-600">Monitor and manage billing for your center</p>
          </div>

          {/* Error State - No Center ID */}
          {localUser && !localUser.centerId && !localUser.center?.id && !localUser.center_id && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Center ID Not Found
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Your user profile is missing the center ID. This is required to access billing data.</p>
                    <p className="mt-1">Please contact your administrator or support team to resolve this issue.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.totalCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.paidCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Bills</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totals.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Payment Received (Awaiting Verification)</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.paymentReceivedCount}</p>
                  <p className="text-sm text-gray-500">₹{totals.paymentReceivedAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready for Lab</p>
                  <p className="text-2xl font-bold text-gray-900">{totals.paidCount}</p>
                  <p className="text-sm text-gray-500">₹{totals.paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_generated">Not Generated</option>
                <option value="generated">Generated</option>
                <option value="payment_received">Payment Received</option>
                <option value="paid">Paid</option>
                <option value="verified">Verified</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchBillingData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Billing Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient & Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Billing Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {loading ? 'Loading billing data...' : 'No billing records found'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      // Safety check: ensure item is an object with required properties
                      if (!item || typeof item !== 'object') {
                        console.warn('Invalid item in filteredData:', item);
                        return null;
                      }
                      
                      return (
                        <tr key={item._id || Math.random()} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.patientName || 'Unknown Patient'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.testType || 'Unknown Test'}
                              </div>
                              {item.urgency && (
                                <div className="mt-1">
                                  {getUrgencyBadge(item.urgency)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {item.doctorName || 'Unknown Doctor'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {item.billing ? (
                                <>
                                  <div className="text-sm font-medium text-gray-900">
                                    ₹{(item.billing.amount || 0).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.billing.invoiceNumber || 'No Invoice'}
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">No bill generated</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(item.billing?.status || 'not_generated')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(item.billing?.generatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(item.billing?.generatedAt || item.createdAt || Date.now()).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewBillingDetails(item)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {/* Verify Payment Button - Only show for payment_received status */}
                              {item.billing?.status === 'payment_received' && (
                                <>
                                  <button
                                    onClick={() => openVerificationModal(item)}
                                    className="text-green-600 hover:text-green-900 p-1"
                                    title="Verify Payment"
                                  >
                                    <Shield className="w-4 h-4" />
                                  </button>
                                  
                                  {/* Receipt Indicator - Show if receipt is uploaded */}
                                  {item.billing?.receiptUpload && (
                                    <button
                                      onClick={() => viewReceipt(item.billing.receiptUpload)}
                                      className="text-blue-600 hover:text-blue-900 p-1"
                                      title="View Receipt"
                                    >
                                      <Receipt className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                              
                              {item.billing?.invoiceNumber && (
                                <button
                                  onClick={() => handleDownloadInvoice(item._id)}
                                  className="text-purple-600 hover:text-purple-900 p-1"
                                  title="Download Invoice"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }).filter(Boolean) // Remove any null items
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Billing Details Modal */}
        {showBillingModal && selectedBilling && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Billing Details</h3>
                  <button
                    onClick={() => setShowBillingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Patient & Test Info */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Patient & Test Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Patient:</span>
                        <span className="ml-2 font-medium">{selectedBilling.patientName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Test Type:</span>
                        <span className="ml-2 font-medium">{selectedBilling.testType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Urgency:</span>
                        <span className="ml-2">{getUrgencyBadge(selectedBilling.urgency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2">{getStatusBadge(selectedBilling.billing?.status || 'not_generated')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Doctor Information</h4>
                    <div className="text-sm">
                      <span className="text-gray-500">Doctor:</span>
                      <span className="ml-2 font-medium">Dr. {selectedBilling.doctorName}</span>
                    </div>
                  </div>

                  {/* Billing Details */}
                  {selectedBilling.billing && (
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Billing Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Invoice Number:</span>
                          <span className="ml-2 font-medium">{selectedBilling.billing.invoiceNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-2 font-medium">₹{selectedBilling.billing.amount?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Currency:</span>
                          <span className="ml-2 font-medium">{selectedBilling.billing.currency}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Generated By:</span>
                          <span className="ml-2 font-medium">{selectedBilling.billing.generatedBy}</span>
                        </div>
                        {selectedBilling.billing.paymentMethod && (
                          <div>
                            <span className="text-gray-500">Payment Method:</span>
                            <span className="ml-2 font-medium">{selectedBilling.billing.paymentMethod}</span>
                          </div>
                        )}
                        {selectedBilling.billing.transactionId && (
                          <div>
                            <span className="text-gray-500">Transaction ID:</span>
                            <span className="ml-2 font-medium">{selectedBilling.billing.transactionId}</span>
                          </div>
                        )}
                      </div>

                      {/* Billing Items */}
                      {selectedBilling.billing.items && selectedBilling.billing.items.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-2">Billing Items</h5>
                          <div className="bg-gray-50 rounded-lg p-3">
                            {selectedBilling.billing.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm py-1">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₹{item.total}</span>
                              </div>
                            ))}
                            {selectedBilling.billing.taxes > 0 && (
                              <div className="flex justify-between text-sm py-1 border-t pt-1">
                                <span>Taxes</span>
                                <span>₹{selectedBilling.billing.taxes}</span>
                              </div>
                            )}
                            {selectedBilling.billing.discounts > 0 && (
                              <div className="flex justify-between text-sm py-1">
                                <span>Discounts</span>
                                <span>-₹{selectedBilling.billing.discounts}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm py-1 border-t pt-1 font-medium">
                              <span>Total</span>
                              <span>₹{selectedBilling.billing.amount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dates */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Important Dates</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2">{new Date(selectedBilling.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedBilling.billing?.generatedAt && (
                        <div>
                          <span className="text-gray-500">Bill Generated:</span>
                          <span className="ml-2">{new Date(selectedBilling.billing.generatedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedBilling.billing?.paidAt && (
                        <div>
                          <span className="text-gray-500">Payment Date:</span>
                          <span className="ml-2">{new Date(selectedBilling.billing.paidAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedBilling.billing?.verifiedAt && (
                        <div>
                          <span className="text-gray-500">Verified Date:</span>
                          <span className="ml-2">{new Date(selectedBilling.billing.verifiedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBillingModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                  {selectedBilling.billing?.invoiceNumber && (
                    <button
                      onClick={() => downloadInvoice(selectedBilling._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Verification Modal */}
        {showVerificationModal && selectedBillingForVerification && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Verify Payment</h3>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Payment Verification Required
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Patient: <strong>{selectedBillingForVerification.patientName}</strong></p>
                          <p>Test Type: <strong>{selectedBillingForVerification.testType}</strong></p>
                          <p>Amount: <strong>₹{selectedBillingForVerification.billing?.amount?.toLocaleString()}</strong></p>
                          <p>Payment Method: <strong>{selectedBillingForVerification.billing?.paymentMethod || 'Not specified'}</strong></p>
                          <p>Transaction ID: <strong>{selectedBillingForVerification.billing?.transactionId}</strong></p>
                          <p>Payment Date: <strong>{selectedBillingForVerification.billing?.paidAt ? new Date(selectedBillingForVerification.billing.paidAt).toLocaleDateString() : 'Not specified'}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Upload Section */}
                  {selectedBillingForVerification.billing?.receiptUpload && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Receipt className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Receipt Uploaded by Receptionist
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Receipt File: <strong>{selectedBillingForVerification.billing.receiptUpload}</strong></p>
                            <div className="mt-2">
                              <button
                                onClick={() => viewReceipt(selectedBillingForVerification.billing.receiptUpload)}
                                className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-xs font-medium hover:bg-green-200 transition-colors duration-200"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Receipt
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Notes Section */}
                  {selectedBillingForVerification.billing?.notes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-800">
                            Payment Notes from Receptionist
                          </h3>
                          <div className="mt-2 text-sm text-gray-700">
                            <p className="whitespace-pre-wrap">{selectedBillingForVerification.billing.notes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Notes (Optional)
                    </label>
                    <textarea
                      id="verificationNotes"
                      rows={3}
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any verification notes or comments..."
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Important
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>By verifying this payment, you confirm that:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>The payment has been received and verified</li>
                            <li>The test request can proceed to lab processing</li>
                            <li>All payment details are accurate</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyPayment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Viewing Modal */}
        {showReceiptModal && selectedReceipt && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Receipt Details</h3>
                  <button
                    onClick={closeReceiptModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Receipt className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Receipt Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>File Name: <strong>{selectedReceipt}</strong></p>
                          <p>Uploaded by: <strong>Receptionist</strong></p>
                          <p>Upload Date: <strong>{selectedBillingForVerification?.billing?.paidAt ? new Date(selectedBillingForVerification.billing.paidAt).toLocaleDateString() : 'Not specified'}</strong></p>
                          <p>File Type: <strong>{selectedReceipt?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'Image' : 'PDF'}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-800 mb-4">Receipt Preview</h4>
                      
                      {/* Receipt Display */}
                      <div className="mb-4">
                        {selectedReceipt && (
                          <div className="max-w-md mx-auto">
                            {/* Check if it's an image file */}
                            {selectedReceipt.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                              <div className="border border-gray-300 rounded-lg overflow-hidden">
                                                <img 
                  src={`${SERVER_CONFIG.BACKEND_URL}/uploads/receipts/${selectedReceipt}`}
                  alt="Receipt"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                                <div className="hidden p-4 text-center text-gray-500">
                                  <Receipt className="h-12 w-12 mx-auto mb-2" />
                                  <p>Image could not be loaded</p>
                                </div>
                              </div>
                            ) : (
                              /* For PDF files, show a PDF icon with download option */
                              <div className="border border-gray-300 rounded-lg p-6 bg-white">
                                <Receipt className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-sm text-gray-600 mb-4">
                                  PDF Receipt: <strong>{selectedReceipt}</strong>
                                </p>
                                <button
                                  onClick={() => {
                                    const url = `${SERVER_CONFIG.BACKEND_URL}/uploads/receipts/${selectedReceipt}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  View PDF
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Download Button */}
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const url = `${SERVER_CONFIG.BACKEND_URL}/uploads/receipts/${selectedReceipt}`;
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = selectedReceipt;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Receipt Verification
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Please verify that:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>The receipt matches the payment amount</li>
                            <li>The receipt is from the correct date</li>
                            <li>The receipt shows the correct payment method</li>
                            <li>The receipt is clear and legible</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={closeReceiptModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering Billing component:', error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error Rendering Component
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>There was an error rendering the billing component. Please refresh the page or contact support.</p>
                  <p className="mt-1 text-xs">Error: {error.message}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default CenterAdminBilling;
