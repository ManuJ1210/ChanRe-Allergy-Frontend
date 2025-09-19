import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/environment';
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
  Receipt,
  Users,
  CreditCard,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import API from '../../services/api';

const CenterAdminBillingTracker = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [localUser, setLocalUser] = useState(null);
  
  // Pagination state for each section
  const [currentPage, setCurrentPage] = useState({
    fullyPaid: 1,
    multiplePayments: 1,
    pendingBills: 1
  });
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Enhanced function to get partial payment data from localStorage
  const getPartialPaymentData = (requestId) => {
    const paymentKey = `partial_payment_${requestId}`;
    const payments = JSON.parse(localStorage.getItem(paymentKey) || '[]');
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Sort payments by timestamp (newest first)
    const sortedPayments = payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { 
      payments: sortedPayments, 
      totalPaid,
      paymentCount: payments.length,
      lastPayment: payments.length > 0 ? payments[payments.length - 1] : null
    };
  };

  // Fetch billing data for the center
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      if (!user || !localUser) {
        console.log('User not authenticated, skipping billing data fetch');
        setBillingData([]);
        setLoading(false);
        return;
      }
      
      if (!localUser) {
        console.error('localUser is not available');
        toast.error('User data not available. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      if (!centerId) {
        toast.error('Center ID not found. Please check your user profile.');
        setLoading(false);
        return;
      }
      
      const response = await API.get(`/billing/center`);
      
      if (response.data && Array.isArray(response.data.billingRequests)) {
        setBillingData(response.data.billingRequests);
      } else if (response.data && Array.isArray(response.data)) {
        setBillingData(response.data);
      } else {
        setBillingData([]);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (status === 403) {
          toast.error('Access denied. You do not have permission to view billing data.');
        } else {
          toast.error(`Failed to fetch billing data: ${error.response.data?.message || `Server error (${status})`}`);
        }
      } else if (error.request) {
        toast.error('Unable to connect to server. Please check your internet connection.');
      } else {
        toast.error(`Error fetching billing data: ${error.message}`);
      }
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLocalUser(null);
      setBillingData([]);
      return;
    }
    
    try {
      if (user && !localUser) {
        const safeUser = { ...user };
        setLocalUser(safeUser);
      }
      
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      if (centerId) {
        fetchBillingData();
      } else {
        if (localUser && Object.keys(localUser).length > 0) {
          if (localUser.role === 'centeradmin') {
            fetchCenterInfo();
          } else {
            toast.warning('Center ID not found in user profile. Please contact support.');
          }
        }
      }
    } catch (error) {
      toast.error('Error processing user data');
    }
  }, [user, localUser, localUser?.centerId, localUser?.center?.id]);

  // Fetch center information if centerId is not available
  const fetchCenterInfo = async () => {
    try {
      if (!user) {
        console.log('User not authenticated, skipping center info fetch');
        return;
      }
      
      if (!user?._id) {
        console.error('User missing _id:', user);
        toast.error('User ID not found');
        return;
      }
      
      const response = await API.get(`/centers/by-admin/${user._id}`);
      
      console.log('Center info fetched:', response.data);
      if (response.data._id) {
        const updatedUser = { ...user, centerId: response.data._id };
        console.log('Updated user with centerId:', updatedUser);
        setLocalUser(updatedUser);
        
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

  // Categorize bills based on payment status
  const categorizeBills = () => {
    const fullyPaidBills = [];
    const multiplePaymentBills = [];
    const pendingBills = [];

    billingData.forEach(item => {
      if (!item || typeof item !== 'object' || !item.billing) return;

      const partialData = getPartialPaymentData(item._id);
      const totalPaidFromStorage = partialData.totalPaid;
      const backendPaidAmount = item.billing?.paidAmount || 0;
      const totalAmount = item.billing?.amount || 0;
      const status = item.billing?.status;
      
      // Check if bill is fully paid by status
      const isFullyPaidByStatus = status === 'paid' || status === 'verified';
      
      // Calculate actual paid amount - prioritize localStorage data over backend status
      let actualPaidAmount;
      if (totalPaidFromStorage > 0) {
        actualPaidAmount = totalPaidFromStorage;
      } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
        actualPaidAmount = totalAmount;
      } else {
        actualPaidAmount = backendPaidAmount;
      }
      
      const hasMultiplePayments = partialData.paymentCount > 1;
      const isFullyPaid = actualPaidAmount >= totalAmount && totalAmount > 0;
      const hasPartialPayment = actualPaidAmount > 0 && actualPaidAmount < totalAmount;
      
      // Categorize bills
      if (isFullyPaid) {
        if (hasMultiplePayments) {
          multiplePaymentBills.push({
            ...item,
            billing: {
              ...item.billing,
              paidAmount: actualPaidAmount,
              partialPayments: partialData.payments,
              remainingAmount: 0,
              paymentType: 'multiple'
            }
          });
        } else {
          fullyPaidBills.push({
            ...item,
            billing: {
              ...item.billing,
              paidAmount: actualPaidAmount,
              partialPayments: partialData.payments,
              remainingAmount: 0,
              paymentType: 'single'
            }
          });
        }
      } else if (hasPartialPayment) {
        pendingBills.push({
          ...item,
          billing: {
            ...item.billing,
            paidAmount: actualPaidAmount,
            partialPayments: partialData.payments,
            remainingAmount: totalAmount - actualPaidAmount,
            paymentType: 'partial'
          }
        });
      } else if (status === 'generated' || status === 'not_generated') {
        pendingBills.push({
          ...item,
          billing: {
            ...item.billing,
            paidAmount: 0,
            partialPayments: [],
            remainingAmount: totalAmount,
            paymentType: 'unpaid'
          }
        });
      }
    });

    return { fullyPaidBills, multiplePaymentBills, pendingBills };
  };

  // Apply filters to categorized bills
  const applyFilters = (bills) => {
    let filtered = bills;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        return (
          (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.testType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.billing?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
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

    return filtered;
  };

  const { fullyPaidBills, multiplePaymentBills, pendingBills } = categorizeBills();
  const filteredFullyPaid = applyFilters(fullyPaidBills);
  const filteredMultiplePayments = applyFilters(multiplePaymentBills);
  const filteredPendingBills = applyFilters(pendingBills);

  // Pagination logic for each section
  const getPaginatedData = (data, section) => {
    const startIndex = (currentPage[section] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage({
      fullyPaid: 1,
      multiplePayments: 1,
      pendingBills: 1
    });
  }, [searchTerm, dateFilter]);

  // Pagination controls component
  const PaginationControls = ({ data, section, totalPages }) => {
    if (!data || data.length === 0) return null;

    const startIndex = (currentPage[section] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return (
      <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> results
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage[section]}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => ({ ...prev, [section]: Math.max(prev[section] - 1, 1) }))}
              disabled={currentPage[section] === 1 || totalPages <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => ({ ...prev, [section]: Math.min(prev[section] + 1, totalPages) }))}
              disabled={currentPage[section] === totalPages || totalPages <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // View invoice PDF
  const handleViewInvoice = async (testRequestId) => {
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
      
      // Create blob and open in new tab
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast.success('Invoice opened successfully!');
    } catch (error) {
      console.error('Error viewing invoice:', error);
      toast.error('Failed to view invoice');
    }
  };

  // View patient profile
  const handleViewProfile = (patientId) => {
    console.log('🔍 handleViewProfile called with:', patientId);
    console.log('🔍 Type:', typeof patientId);
    console.log('🔍 Is null/undefined:', patientId === null || patientId === undefined);
    console.log('🔍 String value:', String(patientId));
    
    // Ensure we have a valid string ID
    let validPatientId = null;
    
    if (patientId === null || patientId === undefined) {
      console.log('❌ Patient ID is null or undefined');
      toast.error('Patient ID is missing');
      return;
    }
    
    if (typeof patientId === 'string' && patientId.trim() !== '') {
      validPatientId = patientId.trim();
      console.log('✅ Using string patient ID:', validPatientId);
    } else if (typeof patientId === 'object' && patientId !== null) {
      // If it's an object, try to extract the _id
      validPatientId = patientId._id || patientId.id;
      console.log('✅ Extracted from object:', validPatientId);
    } else {
      // Try to convert to string
      validPatientId = String(patientId);
      console.log('✅ Converted to string:', validPatientId);
    }
    
    console.log('🎯 Final valid patient ID:', validPatientId);
    console.log('🎯 Final type:', typeof validPatientId);
    
    if (validPatientId && validPatientId !== 'null' && validPatientId !== 'undefined') {
      // Navigate to patient profile page
      console.log('🚀 Navigating to:', `/dashboard/centeradmin/patients/viewprofile/${validPatientId}`);
      navigate(`/dashboard/centeradmin/patients/viewprofile/${validPatientId}`);
    } else {
      console.log('❌ Invalid patient ID:', validPatientId);
      toast.error('Patient ID not found or invalid');
    }
  };

  // Safety check: if user is not authenticated
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
                  <p>Please log in to access the billing tracker.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Billing Payment Tracker</h1>
              <p className="text-slate-600 text-lg">Track and manage all payment statuses for easy follow-up</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Bills</div>
                <div className="text-2xl font-bold text-slate-800">{billingData.length}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Fully Paid (Single)</p>
                <p className="text-2xl font-bold text-green-600">{filteredFullyPaid.length}</p>
                <p className="text-xs text-slate-500 mt-1">One-time payments</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Multiple Payments</p>
                <p className="text-2xl font-bold text-blue-600">{filteredMultiplePayments.length}</p>
                <p className="text-xs text-slate-500 mt-1">Paid in installments</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending Bills</p>
                <p className="text-2xl font-bold text-orange-600">{filteredPendingBills.length}</p>
                <p className="text-xs text-slate-500 mt-1">Need follow-up</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{billingData.reduce((sum, item) => sum + (item.billing?.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">All billing amounts</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filters & Search</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={fetchBillingData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 text-lg">Loading billing data...</p>
              <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the latest data</p>
            </div>
          </div>
        )}

        {/* Fully Paid Bills Section */}
        {!loading && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Fully Paid Bills (Single Payment)</h3>
                      <p className="text-gray-600 font-medium">Patients who paid the full amount in one payment</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 mb-1">{filteredFullyPaid.length}</div>
                    <div className="text-xs font-semibold text-gray-600">Total Records</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                {filteredFullyPaid.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No fully paid bills found</p>
                    <p className="text-gray-500 text-sm mt-2">All bills are either partially paid or unpaid</p>
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(filteredFullyPaid, 'fullyPaid').map((item) => {
                        const partialPayments = item.billing?.partialPayments || [];
                        const totalAmount = item.billing?.amount || 0;
                        const paidAmount = item.billing?.paidAmount || 0;
                        const remainingAmount = item.billing?.remainingAmount || 0;
                        const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                  <FileText className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.billing?.invoiceNumber || `Bill #${item._id?.slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">Invoice</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.patientId?.name || item.patient?.name || item.patientName || 'Patient'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.patientId?.phone || item.patientId?.mobile || item.patient?.phone || item.patient?.mobile || item.patientPhone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.doctorId?.name || item.doctor?.name || item.doctorName || 'Doctor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.doctorId?.email || item.doctor?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.testType || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{totalAmount.toLocaleString()}</div>
                              <div className="text-sm text-green-600">₹{paidAmount.toLocaleString()} paid</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                100% Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 === BUTTON CLICK DEBUG ===');
                                    console.log('🔍 Full item:', item);
                                    console.log('🔍 item.patient:', item.patient);
                                    console.log('🔍 item.patientId:', item.patientId);
                                    console.log('🔍 item.patient?._id:', item.patient?._id);
                                    console.log('🔍 item.patient?.id:', item.patient?.id);
                                    console.log('🔍 item.patient type:', typeof item.patient);
                                    console.log('🔍 item.patientId type:', typeof item.patientId);
                                    
                                    // Extract patient ID properly
                                    let patientId = null;
                                    
                                    // Try different ways to get the patient ID
                                    if (item.patientId && typeof item.patientId === 'string' && item.patientId.trim() !== '') {
                                      patientId = item.patientId.trim();
                                      console.log('✅ Using item.patientId as string:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId._id) {
                                      patientId = item.patientId._id;
                                      console.log('✅ Using item.patientId._id:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId.id) {
                                      patientId = item.patientId.id;
                                      console.log('✅ Using item.patientId.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient._id) {
                                      patientId = item.patient._id;
                                      console.log('✅ Using item.patient._id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient.id) {
                                      patientId = item.patient.id;
                                      console.log('✅ Using item.patient.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'string' && item.patient.trim() !== '') {
                                      patientId = item.patient.trim();
                                      console.log('✅ Using item.patient as string:', patientId);
                                    } else {
                                      console.log('❌ No valid patient ID found');
                                      console.log('❌ Available keys in item:', Object.keys(item));
                                      if (item.patient) {
                                        console.log('❌ Available keys in item.patient:', Object.keys(item.patient));
                                      }
                                      if (item.patientId) {
                                        console.log('❌ Available keys in item.patientId:', Object.keys(item.patientId));
                                      }
                                    }
                                    
                                    console.log('🎯 Final extracted patient ID:', patientId);
                                    console.log('🎯 Final type:', typeof patientId);
                                    handleViewProfile(patientId);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Patient Profile"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(item._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <PaginationControls 
                data={filteredFullyPaid} 
                section="fullyPaid" 
                totalPages={getTotalPages(filteredFullyPaid)} 
              />
            </div>

            {/* Multiple Payments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Multiple Payment Bills</h3>
                      <p className="text-gray-600 font-medium">Patients who paid in multiple installments</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 mb-1">{filteredMultiplePayments.length}</div>
                    <div className="text-xs font-semibold text-gray-600">Total Records</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                {filteredMultiplePayments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No multiple payment bills found</p>
                    <p className="text-gray-500 text-sm mt-2">All payments were made in single transactions</p>
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(filteredMultiplePayments, 'multiplePayments').map((item) => {
                        const partialPayments = item.billing?.partialPayments || [];
                        const totalAmount = item.billing?.amount || 0;
                        const paidAmount = item.billing?.paidAmount || 0;
                        const remainingAmount = item.billing?.remainingAmount || 0;
                        const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.billing?.invoiceNumber || `Bill #${item._id?.slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">Invoice</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.patientId?.name || item.patient?.name || item.patientName || 'Patient'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.patientId?.phone || item.patientId?.mobile || item.patient?.phone || item.patient?.mobile || item.patientPhone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.doctorId?.name || item.doctor?.name || item.doctorName || 'Doctor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.doctorId?.email || item.doctor?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.testType || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{totalAmount.toLocaleString()}</div>
                              <div className="text-sm text-blue-600">₹{paidAmount.toLocaleString()} paid</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  {partialPayments.length} Payments
                                </span>
                                <div className="text-xs text-gray-500">
                                  Last: {partialPayments.length > 0 && partialPayments[0].timestamp ? 
                                    new Date(partialPayments[0].timestamp).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 === BUTTON CLICK DEBUG ===');
                                    console.log('🔍 Full item:', item);
                                    console.log('🔍 item.patient:', item.patient);
                                    console.log('🔍 item.patientId:', item.patientId);
                                    console.log('🔍 item.patient?._id:', item.patient?._id);
                                    console.log('🔍 item.patient?.id:', item.patient?.id);
                                    console.log('🔍 item.patient type:', typeof item.patient);
                                    console.log('🔍 item.patientId type:', typeof item.patientId);
                                    
                                    // Extract patient ID properly
                                    let patientId = null;
                                    
                                    // Try different ways to get the patient ID
                                    if (item.patientId && typeof item.patientId === 'string' && item.patientId.trim() !== '') {
                                      patientId = item.patientId.trim();
                                      console.log('✅ Using item.patientId as string:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId._id) {
                                      patientId = item.patientId._id;
                                      console.log('✅ Using item.patientId._id:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId.id) {
                                      patientId = item.patientId.id;
                                      console.log('✅ Using item.patientId.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient._id) {
                                      patientId = item.patient._id;
                                      console.log('✅ Using item.patient._id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient.id) {
                                      patientId = item.patient.id;
                                      console.log('✅ Using item.patient.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'string' && item.patient.trim() !== '') {
                                      patientId = item.patient.trim();
                                      console.log('✅ Using item.patient as string:', patientId);
                                    } else {
                                      console.log('❌ No valid patient ID found');
                                      console.log('❌ Available keys in item:', Object.keys(item));
                                      if (item.patient) {
                                        console.log('❌ Available keys in item.patient:', Object.keys(item.patient));
                                      }
                                      if (item.patientId) {
                                        console.log('❌ Available keys in item.patientId:', Object.keys(item.patientId));
                                      }
                                    }
                                    
                                    console.log('🎯 Final extracted patient ID:', patientId);
                                    console.log('🎯 Final type:', typeof patientId);
                                    handleViewProfile(patientId);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Patient Profile"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(item._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <PaginationControls 
                data={filteredMultiplePayments} 
                section="multiplePayments" 
                totalPages={getTotalPages(filteredMultiplePayments)} 
              />
            </div>

            {/* Pending Bills Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Pending Bills (Follow-up Required)</h3>
                      <p className="text-gray-600 font-medium">Bills that need payment or have outstanding amounts</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600 mb-1">{filteredPendingBills.length}</div>
                    <div className="text-xs font-semibold text-gray-600">Total Records</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                {filteredPendingBills.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No pending bills found</p>
                    <p className="text-gray-500 text-sm mt-2">All bills have been fully paid</p>
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(filteredPendingBills, 'pendingBills').map((item) => {
                        const partialPayments = item.billing?.partialPayments || [];
                        const totalAmount = item.billing?.amount || 0;
                        const paidAmount = item.billing?.paidAmount || 0;
                        const remainingAmount = item.billing?.remainingAmount || 0;
                        const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                  <FileText className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.billing?.invoiceNumber || `Bill #${item._id?.slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">Invoice</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.patientId?.name || item.patient?.name || item.patientName || 'Patient'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.patientId?.phone || item.patientId?.mobile || item.patient?.phone || item.patient?.mobile || item.patientPhone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.doctorId?.name || item.doctor?.name || item.doctorName || 'Doctor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.doctorId?.email || item.doctor?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.testType || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <div className="text-sm text-gray-900">Total: ₹{totalAmount.toLocaleString()}</div>
                                <div className="text-sm text-green-600">Paid: ₹{paidAmount.toLocaleString()}</div>
                                <div className="text-sm text-orange-600">Remaining: ₹{remainingAmount.toLocaleString()}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {paymentPercentage}% Paid
                                </span>
                                <div className="text-xs text-gray-500">
                                  {partialPayments.length > 0 ? `${partialPayments.length} payments` : 'No payments'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 === BUTTON CLICK DEBUG ===');
                                    console.log('🔍 Full item:', item);
                                    console.log('🔍 item.patient:', item.patient);
                                    console.log('🔍 item.patientId:', item.patientId);
                                    console.log('🔍 item.patient?._id:', item.patient?._id);
                                    console.log('🔍 item.patient?.id:', item.patient?.id);
                                    console.log('🔍 item.patient type:', typeof item.patient);
                                    console.log('🔍 item.patientId type:', typeof item.patientId);
                                    
                                    // Extract patient ID properly
                                    let patientId = null;
                                    
                                    // Try different ways to get the patient ID
                                    if (item.patientId && typeof item.patientId === 'string' && item.patientId.trim() !== '') {
                                      patientId = item.patientId.trim();
                                      console.log('✅ Using item.patientId as string:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId._id) {
                                      patientId = item.patientId._id;
                                      console.log('✅ Using item.patientId._id:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId.id) {
                                      patientId = item.patientId.id;
                                      console.log('✅ Using item.patientId.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient._id) {
                                      patientId = item.patient._id;
                                      console.log('✅ Using item.patient._id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient.id) {
                                      patientId = item.patient.id;
                                      console.log('✅ Using item.patient.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'string' && item.patient.trim() !== '') {
                                      patientId = item.patient.trim();
                                      console.log('✅ Using item.patient as string:', patientId);
                                    } else {
                                      console.log('❌ No valid patient ID found');
                                      console.log('❌ Available keys in item:', Object.keys(item));
                                      if (item.patient) {
                                        console.log('❌ Available keys in item.patient:', Object.keys(item.patient));
                                      }
                                      if (item.patientId) {
                                        console.log('❌ Available keys in item.patientId:', Object.keys(item.patientId));
                                      }
                                    }
                                    
                                    console.log('🎯 Final extracted patient ID:', patientId);
                                    console.log('🎯 Final type:', typeof patientId);
                                    handleViewProfile(patientId);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Patient Profile"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(item._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <PaginationControls 
                data={filteredPendingBills} 
                section="pendingBills" 
                totalPages={getTotalPages(filteredPendingBills)} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CenterAdminBillingTracker;
