import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Refs to track toast messages
  const successToastShown = useRef(false);
  const errorToastShown = useRef(false);
  const actionSuccessToastShown = useRef(false);
  const actionErrorToastShown = useRef(false);
  
  // Function to reset toast tracking
  const resetToastTracking = () => {
    successToastShown.current = false;
    errorToastShown.current = false;
    actionSuccessToastShown.current = false;
    actionErrorToastShown.current = false;
  };

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

  // Function to get all partial payments across all bills
  const getAllPartialPayments = () => {
    const allPayments = [];
    const keys = Object.keys(localStorage).filter(key => key.startsWith('partial_payment_'));
    
    keys.forEach(key => {
      const requestId = key.replace('partial_payment_', '');
      const payments = JSON.parse(localStorage.getItem(key) || '[]');
      payments.forEach(payment => {
        allPayments.push({
          ...payment,
          requestId,
          billKey: key
        });
      });
    });
    
    return allPayments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

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
      
      // Extract center ID with proper validation
      let centerId = null;
      
      // Try different possible properties for center ID
      if (localUser?.centerId) {
        centerId = localUser.centerId;
      } else if (localUser?.center?.id) {
        centerId = localUser.center.id;
      } else if (localUser?.center_id) {
        centerId = localUser.center_id;
      }
      
      // If centerId is an object, extract the _id property
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      // Ensure centerId is a string
      if (centerId) {
        centerId = String(centerId);
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
        setBillingData([]);
      }
    } catch (error) {
      
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
              navigate('/login', { replace: true });
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
    resetToastTracking(); // Reset toast tracking on component mount/user change
    
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
      
      // Extract center ID with proper validation
      let centerId = null;
      
      // Try different possible properties for center ID
      if (localUser?.centerId) {
        centerId = localUser.centerId;
      } else if (localUser?.center?.id) {
        centerId = localUser.center.id;
      } else if (localUser?.center_id) {
        centerId = localUser.center_id;
      }
      
      // If centerId is an object, extract the _id property
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      // Ensure centerId is a string
      if (centerId) {
        centerId = String(centerId);
      }
      
      if (centerId) {
        fetchBillingData();
      } else {
        
        // If user exists but no centerId, show helpful message
        if (localUser && Object.keys(localUser).length > 0) {
          // Try to get centerId from user's role or other properties
          if (localUser.role === 'centeradmin') {
            // For center admin, we might need to fetch center info separately
            fetchCenterInfo();
          } else {
            toast.warning('Center ID not found in user profile. Please contact support.');
          }
        }
      }
    } catch (error) {
      toast.error('Error processing user data');
    }

    // Cleanup function to handle component unmounting
    return () => {
      // This will run when the component unmounts or when dependencies change
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

    // Enhance billing data with partial payment information
    filtered = filtered.map(item => {
      const partialData = getPartialPaymentData(item._id);
      if (item.billing && partialData.totalPaid > 0) {
        return {
          ...item,
          billing: {
            ...item.billing,
            paidAmount: item.billing.paidAmount || partialData.totalPaid,
            partialPayments: partialData.payments
          }
        };
      }
      return item;
    });

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

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(item => {
        // Safety check: ensure item is valid
        if (!item || typeof item !== 'object') return false;
        
        const totalAmount = item.billing?.amount || 0;
        const paidAmount = item.billing?.paidAmount || 0;
        
        if (paymentStatusFilter === 'unpaid') {
          return totalAmount > 0 && paidAmount === 0;
        }
        if (paymentStatusFilter === 'partial') {
          return totalAmount > 0 && paidAmount > 0 && paidAmount < totalAmount;
        }
        if (paymentStatusFilter === 'full') {
          return totalAmount > 0 && paidAmount >= totalAmount;
        }
        
        return true;
      });
    }

    setFilteredData(filtered);
  }, [billingData, searchTerm, statusFilter, dateFilter, paymentStatusFilter]);

  // Get status badge with payment amount logic
  const getStatusBadge = (status, billing, itemId) => {
    const statusConfig = {
      'not_generated': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Generated' },
      'generated': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Generated' },
      'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' }
    };

    // Calculate actual payment status based on amounts
    if (billing && billing.amount > 0) {
      const partialData = getPartialPaymentData(itemId);
      const totalPaidFromStorage = partialData.totalPaid;
      const backendPaidAmount = billing.paidAmount || 0;
      const totalAmount = billing.amount;
      const hasMultiplePayments = partialData.paymentCount > 1;
      
      // Check if bill is fully paid by status
      const isFullyPaidByStatus = status === 'paid' || status === 'verified';
      
      // Calculate actual paid amount - prioritize localStorage data over backend status
      let actualPaidAmount;
      if (totalPaidFromStorage > 0) {
        // If there are partial payments in localStorage, use that amount
        actualPaidAmount = totalPaidFromStorage;
      } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
        // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
        actualPaidAmount = totalAmount;
      } else {
        // Use backend amount as fallback
        actualPaidAmount = backendPaidAmount;
      }
      
      // Determine payment status
      if (actualPaidAmount >= totalAmount) {
        if (hasMultiplePayments) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Partially Fully Paid
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Fully Paid
            </span>
          );
        }
      } else if (actualPaidAmount > 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <DollarSign className="w-3 h-3 mr-1" />
            Partially Paid
          </span>
        );
      }
    }

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
    navigate(`/dashboard/centeradmin/billing/${billing._id}`);
  };


  // View receipt
  const viewReceipt = (receiptFileName) => {
    setSelectedReceipt(receiptFileName);
    setShowReceiptModal(true);
  };

  // ✅ NEW: Download invoice PDF
  const handleDownloadInvoice = async (testRequestId) => {
    resetToastTracking(); // Reset toast tracking for new action
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
      
      if (!successToastShown.current) {
        toast.success('Invoice downloaded successfully!');
        successToastShown.current = true;
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      if (!errorToastShown.current) {
        toast.error('Failed to download invoice');
        errorToastShown.current = true;
      }
    }
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedReceipt(null);
  };

  // Mark payment as received (direct status update without verification)
  const markPaymentReceived = async (billing) => {
    resetToastTracking(); // Reset toast tracking for new action
    try {
      const response = await API.put(`/billing/test-requests/${billing._id}/mark-paid`);

      if (!actionSuccessToastShown.current) {
        toast.success('Payment marked as received');
        actionSuccessToastShown.current = true;
      }
      fetchBillingData(); // Refresh data
    } catch (error) {
      console.error('Error marking payment as received:', error);
      
      if (!actionErrorToastShown.current) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Error updating payment status');
        }
        actionErrorToastShown.current = true;
      }
    }
  };

  // Download invoice (placeholder)
  const downloadInvoice = (billingId) => {
    toast.info('Invoice download functionality will be implemented');
  };

  // Calculate totals with payment amount logic
  const calculateTotals = () => {
    // Filter to only include items that have billing information
    const billingItems = filteredData.filter(item => 
      item && typeof item === 'object' && item.billing && item.billing.status
    );

    // Use Set to track unique bills to avoid double counting
    const uniqueBills = new Set();

    const totals = billingItems.reduce((acc, item) => {
      const amount = item.billing?.amount || 0;
      
      // Only count each bill once (by _id)
      if (!uniqueBills.has(item._id)) {
        uniqueBills.add(item._id);
        acc.totalCount += 1;
        acc.totalAmount += amount;
        
        if (amount > 0) {
          const partialData = getPartialPaymentData(item._id);
          const totalPaidFromStorage = partialData.totalPaid;
          const backendPaidAmount = item.billing?.paidAmount || 0;
          
          // Check if bill is fully paid by status
          const isFullyPaidByStatus = item.billing?.status === 'paid' || item.billing?.status === 'verified';
          
          // Calculate actual paid amount - prioritize localStorage data over backend status
          let actualPaidAmount;
          if (totalPaidFromStorage > 0) {
            // If there are partial payments in localStorage, use that amount
            actualPaidAmount = totalPaidFromStorage;
          } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
            // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
            actualPaidAmount = amount;
          } else {
            // Use backend amount as fallback
            actualPaidAmount = backendPaidAmount;
          }
          
          // Categorize based on payment status
          if (actualPaidAmount >= amount) {
            acc.paidAmount += amount;
            acc.paidCount += 1;
          } else if (actualPaidAmount > 0) {
            acc.pendingAmount += amount;
            acc.pendingCount += 1;
          } else {
            acc.pendingAmount += amount;
            acc.pendingCount += 1;
          }
        }
      }
      
      return acc;
    }, { 
      totalAmount: 0, 
      totalCount: 0, 
      paidAmount: 0, 
      paidCount: 0, 
      pendingAmount: 0, 
      pendingCount: 0 
    });

    return totals;
  };

  const totals = calculateTotals();

  // Pagination logic
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData?.slice(startIndex, endIndex) || [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, paymentStatusFilter]);

  // Pagination controls component
  const PaginationControls = () => {
    if (!filteredData || filteredData.length === 0) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, filteredData?.length || 0)}</span> of{' '}
            <span className="font-medium">{filteredData?.length || 0}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    page === currentPage
                      ? 'bg-blue-600 text-white shadow-md'
                      : page === '...'
                      ? 'text-gray-500 cursor-default'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                <h3 className="text-xs font-medium text-blue-800">
                  Authentication Required
                </h3>
                <div className="mt-2 text-xs text-blue-700">
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
                <h3 className="text-xs font-medium text-red-800">
                  Error Loading User Data
                </h3>
                <div className="mt-2 text-xs text-red-700">
                  <p>There was an error processing your user data. Please refresh the page or contact support.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Professional Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Center Billing Management</h1>
                <p className="text-slate-600 text-lg">Monitor and manage billing for your center</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total Records</div>
                  <div className="text-2xl font-bold text-slate-800">{filteredData?.length || 0}</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Error State - No Center ID */}
          {localUser && !localUser.centerId && !localUser.center?.id && !localUser.center_id && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-red-800">
                    Center ID Not Found
                  </h3>
                  <div className="mt-2 text-xs text-red-700">
                    <p>Your user profile is missing the center ID. This is required to access billing data.</p>
                    <p className="mt-1">Please contact your administrator or support team to resolve this issue.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Bills</p>
                  <p className="text-2xl font-bold text-slate-800">{totals.totalCount}</p>
                  <p className="text-xs text-slate-500 mt-1">All billing records</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Paid Bills</p>
                  <p className="text-2xl font-bold text-green-600">{totals.paidCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Successfully paid</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Pending Bills</p>
                  <p className="text-2xl font-bold text-yellow-600">{totals.pendingCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting payment</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{totals.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">All billing amounts</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600">Ready for Lab</p>
                  <p className="text-md font-bold text-gray-900">{totals.paidCount}</p>
                  <p className="text-xs text-gray-500">₹{totals.paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-medium text-gray-600">Pending/Partial Payment</p>
                  <p className="text-md font-bold text-gray-900">{totals.pendingCount}</p>
                  <p className="text-xs text-gray-500">₹{totals.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Filters & Search</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setPaymentStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={fetchBillingData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Enhanced Search */}
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

              {/* Enhanced Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="all">All Status</option>
                <option value="not_generated">Not Generated</option>
                <option value="generated">Generated</option>
                <option value="paid">Paid</option>
              </select>

              {/* Enhanced Payment Status Filter */}
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="all">All Payment Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partially Paid</option>
                <option value="full">Fully Paid</option>
              </select>

              {/* Enhanced Date Filter */}
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

              {/* Export Button */}
              <button
                onClick={() => {
                  resetToastTracking(); // Reset toast tracking for new action
                  // Simple CSV export functionality
                  const csvData = filteredData.map(item => ({
                    'Patient Name': item.patientName || '',
                    'Test Type': item.testType || '',
                    'Doctor': item.doctorName || '',
                    'Amount': item.billing?.amount || 0,
                    'Status': item.billing?.status || 'not_generated',
                    'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
                  }));
                  
                  const headers = Object.keys(csvData[0]);
                  const csvContent = [
                    headers.join(','),
                    ...csvData.map(row => headers.map(header => row[header]).join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `center-billing-${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                  
                  if (!successToastShown.current) {
                    toast.success(`Exported ${filteredData.length} billing records successfully`);
                    successToastShown.current = true;
                  }
                }}
                disabled={!filteredData || filteredData.length === 0}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export ({filteredData?.length || 0})
              </button>
            </div>
          </div>

          {/* Enhanced Billing Table */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Patient & Test
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Billing Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-slate-600 text-lg">Loading billing data...</p>
                          <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the latest data</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-lg font-medium">No billing records found</p>
                          <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => {
                      // Safety check: ensure item is an object with required properties
                      if (!item || typeof item !== 'object') {
                        console.warn('Invalid item in filteredData:', item);
                        return null;
                      }
                      
                      return (
                        <tr key={item._id || Math.random()} className="hover:bg-slate-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">
                                {item.patientName || 'Unknown Patient'}
                              </div>
                              <div className="text-sm text-slate-600 mt-1">
                                {item.testType || 'Unknown Test'}
                              </div>
                              {item.urgency && (
                                <div className="mt-2">
                                  {getUrgencyBadge(item.urgency)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-800">
                              Dr. {item.doctorName || 'Unknown Doctor'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {item.billing ? (
                                <>
                                  <div className="text-sm font-bold text-slate-800">
                                    Total: ₹{(item.billing.amount || 0).toLocaleString()}
                                  </div>
                                  
                                  {/* Enhanced payment display */}
                                  {(() => {
                                    const partialData = getPartialPaymentData(item._id);
                                    const totalPaidFromStorage = partialData.totalPaid;
                                    const backendPaidAmount = item.billing.paidAmount || 0;
                                    const totalAmount = item.billing.amount || 0;
                                    const hasMultiplePayments = partialData.paymentCount > 1;
                                    
                                    // Check if bill is fully paid by status
                                    const isFullyPaidByStatus = item.billing?.status === 'paid' || 
                                                              item.billing?.status === 'verified';
                                    
                                    // Calculate actual paid amount - prioritize localStorage data over backend status
                                    let actualPaidAmount;
                                    if (totalPaidFromStorage > 0) {
                                      // If there are partial payments in localStorage, use that amount
                                      actualPaidAmount = totalPaidFromStorage;
                                    } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                                      // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
                                      actualPaidAmount = totalAmount;
                                    } else {
                                      // Use backend amount as fallback
                                      actualPaidAmount = backendPaidAmount;
                                    }
                                    
                                    const remainingAmount = totalAmount - actualPaidAmount;
                                    const isFullyPaid = isFullyPaidByStatus || actualPaidAmount >= totalAmount;
                                    
                                    return (
                                      <div className="text-xs space-y-1">
                                        {actualPaidAmount > 0 && (
                                          <div className="text-green-600 font-medium">
                                            Paid: ₹{actualPaidAmount.toLocaleString()}
                                          </div>
                                        )}
                                        {!isFullyPaid && remainingAmount > 0 && (
                                          <div className="text-orange-600 font-medium">
                                            Remaining: ₹{remainingAmount.toLocaleString()}
                                          </div>
                                        )}
                                        {hasMultiplePayments && (
                                          <div className="text-blue-600 font-medium">
                                            {partialData.paymentCount} payments
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  
                                  <div className="text-xs text-gray-500 mt-1">
                                    {item.billing.invoiceNumber || 'No Invoice'}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-500">No bill generated</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(item.billing?.status || 'not_generated', item.billing, item._id)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-800">
                              {new Date(item.billing?.generatedAt || item.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-500">
                              {new Date(item.billing?.generatedAt || item.createdAt || Date.now()).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewBillingDetails(item)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {/* Mark Payment Received Button - Show for bills that are not fully paid */}
                              {(() => {
                                const partialData = getPartialPaymentData(item._id);
                                const totalPaidFromStorage = partialData.totalPaid;
                                const backendPaidAmount = item.billing?.paidAmount || 0;
                                const totalAmount = item.billing?.amount || 0;
                                
                                // Check if bill is fully paid by status
                                const isFullyPaidByStatus = item.billing?.status === 'paid' || item.billing?.status === 'verified';
                                
                                // Calculate actual paid amount - prioritize localStorage data over backend status
                                let actualPaidAmount;
                                if (totalPaidFromStorage > 0) {
                                  // If there are partial payments in localStorage, use that amount
                                  actualPaidAmount = totalPaidFromStorage;
                                } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                                  // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
                                  actualPaidAmount = totalAmount;
                                } else {
                                  // Use backend amount as fallback
                                  actualPaidAmount = backendPaidAmount;
                                }
                                
                                // Show button if not fully paid (regardless of status)
                                const isNotFullyPaid = actualPaidAmount < totalAmount;
                                const hasBillGenerated = item.billing && item.billing.amount > 0;
                                
                                return (hasBillGenerated && isNotFullyPaid) ? (
                                  <button
                                    onClick={() => markPaymentReceived(item)}
                                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                    title="Add Payment"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </button>
                                ) : null;
                              })()}
                              
                              {/* Receipt Indicator - Show if receipt is uploaded */}
                              {item.billing?.receiptUpload && (
                                <button
                                  onClick={() => viewReceipt(item.billing.receiptUpload)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="View Receipt"
                                >
                                  <Receipt className="w-4 h-4" />
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
            
            {/* Pagination Controls */}
            <PaginationControls />
          </div>
        </div>



        {/* Receipt Viewing Modal */}
        {showReceiptModal && selectedReceipt && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Receipt Details</h3>
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
                        <h3 className="text-xs font-medium text-blue-800">
                          Receipt Information
                        </h3>
                        <div className="mt-2 text-xs text-blue-700">
                          <p>File Name: <strong>{selectedReceipt}</strong></p>
                          <p>Uploaded by: <strong>Receptionist</strong></p>
                          <p>Upload Date: <strong>Not specified</strong></p>
                          <p>File Type: <strong>{selectedReceipt?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'Image' : 'PDF'}</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <h4 className="text-xs font-medium text-gray-800 mb-4">Receipt Preview</h4>
                      
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
                                <p className="text-xs text-gray-600 mb-4">
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
                        <h3 className="text-xs font-medium text-yellow-800">
                          Receipt Verification
                        </h3>
                        <div className="mt-2 text-xs text-yellow-700">
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
                <h3 className="text-xs font-medium text-red-800">
                  Error Rendering Component
                </h3>
                <div className="mt-2 text-xs text-red-700">
                  <p>There was an error rendering the billing component. Please refresh the page or contact support.</p>
                  <p className="mt-1 text-xs">Error: {error.message}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
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