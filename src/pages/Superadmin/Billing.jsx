import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  AlertCircle
} from 'lucide-react';

// Import Redux actions and selectors
import {
  fetchAllBillingData,
  fetchBillingStats,
  updateBillingStatus,
  generateInvoice,
  downloadInvoice,
  verifyPayment,
  exportBillingData
} from '../../features/superadmin/superadminBillingThunks';

import {
  updateFilters,
  resetFilters,
  setSelectedBilling,
  toggleBillingModal,
  clearBillingError,
  resetBillingState,
  applyFilters
} from '../../features/superadmin/superadminBillingSlice';

// Import existing superadmin actions for centers
import { fetchCenters } from '../../features/superadmin/superadminThunks';

const SuperadminBilling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux selectors
  const { user } = useSelector(state => state.auth);
  const {
    billingData,
    filteredBillingData,
    billingStats,
    loading,
    statsLoading,
    actionLoading,
    error,
    statsError,
    actionError,
    success,
    actionSuccess,
    filters,
    selectedBilling,
    showBillingModal,
    pagination
  } = useSelector(state => state.superadminBilling);
  
  // Get centers from superadmin slice
  const { centers, loading: centersLoading, error: centersError } = useSelector(state => state.superadmin);

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Refs to track toast messages
  const successToastShown = useRef(false);
  const actionSuccessToastShown = useRef(false);
  const errorToastShown = useRef(false);
  const actionErrorToastShown = useRef(false);

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

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllBillingData());
    dispatch(fetchBillingStats());
    dispatch(fetchCenters());
  }, [dispatch]);

  // Auto-refresh billing data every 30 seconds to catch status updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing billing data...');
      dispatch(fetchAllBillingData());
      dispatch(fetchBillingStats());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // Refresh data when user returns to the tab (handles status changes from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Tab became visible, refreshing billing data...');
        dispatch(fetchAllBillingData());
        dispatch(fetchBillingStats());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);


  // Handle filter changes
  useEffect(() => {
    dispatch(updateFilters({
      searchTerm,
      statusFilter,
      centerFilter,
      dateFilter,
      paymentStatusFilter
    }));
    // Apply filters after updating them
    dispatch(applyFilters());
  }, [dispatch, searchTerm, statusFilter, centerFilter, dateFilter, paymentStatusFilter]);

  // Handle success messages
  useEffect(() => {
    if (success && !successToastShown.current) {
      toast.success('Billing data loaded successfully');
      successToastShown.current = true;
      dispatch(resetBillingState());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (actionSuccess && !actionSuccessToastShown.current) {
      toast.success('Action completed successfully');
      actionSuccessToastShown.current = true;
      dispatch(resetBillingState());
    }
  }, [actionSuccess, dispatch]);

  // Handle error messages
  useEffect(() => {
    if (error && !errorToastShown.current) {
      toast.error(error);
      errorToastShown.current = true;
      dispatch(clearBillingError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (actionError && !actionErrorToastShown.current) {
      toast.error(actionError);
      actionErrorToastShown.current = true;
      dispatch(clearBillingError());
    }
  }, [actionError, dispatch]);

  // Get status badge with partial payment support
  const getStatusBadge = (status, billing, requestId) => {
    const statusConfig = {
      'not_generated': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Generated' },
      'generated': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Generated' },
      'payment_received': { color: 'bg-yellow-100 text-yellow-800', icon: DollarSign, label: 'Payment Received' },
      'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      'verified': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Verified' },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Bill Cancelled' },
      'refunded': { color: 'bg-pink-100 text-pink-800', icon: DollarSign, label: 'Bill Refunded' }
    };

    // Check for cancelled or refunded status first - these take priority
    if (status === 'cancelled' || status === 'refunded') {
      const config = statusConfig[status];
      const Icon = config.icon;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </span>
      );
    }

    // Get partial payment data to check for multiple payments
    const partialData = getPartialPaymentData(requestId);
    const hasMultiplePayments = partialData.paymentCount > 1;
    
    // Check if bill is fully paid
    const totalAmount = billing?.amount || 0;
    const backendPaidAmount = billing?.paidAmount || 0;
    const totalPaidFromStorage = partialData.totalPaid;
    
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
    
    const isFullyPaid = isFullyPaidByStatus || actualPaidAmount >= totalAmount;
    
    // Check for partial payment (outstanding balance)
    if (billing && actualPaidAmount > 0 && actualPaidAmount < totalAmount) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <DollarSign className="w-3 h-3 mr-1" />
          Partially Paid
        </span>
      );
    }
    
    // Check for fully paid with multiple payments
    if (isFullyPaid && hasMultiplePayments) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Partially Fully Paid
        </span>
      );
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
    navigate(`/dashboard/superadmin/billing/${billing._id}`);
  };

  // Handle invoice download
  const handleDownloadInvoice = async (billingId) => {
    try {
      console.log('🚀 Attempting to download invoice for billingId:', billingId);
      
      const result = await dispatch(downloadInvoice(billingId)).unwrap();
      
      console.log('✅ Download result received:', {
        type: typeof result,
        isBlob: result instanceof Blob,
        size: result.size,
        result: result
      });
      
      // Create blob and download
      const blob = new Blob([result], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${billingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('❌ Download invoice error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.status
      });
      toast.error(`Failed to download invoice: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (billingId, newStatus, notes = '') => {
    try {
      await dispatch(updateBillingStatus({ billingId, status: newStatus, notes })).unwrap();
      toast.success('Billing status updated successfully');
    } catch (error) {
      toast.error('Failed to update billing status');
    }
  };

  // Handle invoice generation
  const handleGenerateInvoice = async (billingId) => {
    try {
      await dispatch(generateInvoice(billingId)).unwrap();
      toast.success('Invoice generated successfully');
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  // Handle payment verification
  const handleVerifyPayment = async (billingId, verificationData) => {
    try {
      await dispatch(verifyPayment({ billingId, verificationData })).unwrap();
      toast.success('Payment verified successfully');
    } catch (error) {
      toast.error('Failed to verify payment');
    }
  };

  // Handle data export (client-side CSV generation)
  const handleExportData = (format = 'csv') => {
    try {
      if (!filteredBillingData || filteredBillingData.length === 0) {
        toast.error('No data to export');
        return;
      }

      // Prepare CSV data
      const csvData = filteredBillingData.map(item => ({
        'Patient Name': item.patientName || '',
        'Test Type': item.testType || '',
        'Center': item.centerName || '',
        'Doctor': item.doctorName || '',
        'Urgency': item.urgency || '',
        'Invoice Number': item.billing?.invoiceNumber || 'N/A',
        'Amount': item.billing?.amount || 0,
        'Status': item.billing?.status || 'not_generated',
        'Currency': item.billing?.currency || 'INR',
        'Generated By': item.billing?.generatedBy || '',
        'Payment Method': item.billing?.paymentMethod || '',
        'Transaction ID': item.billing?.transactionId || '',
        'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
        'Generated Date': item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : '',
        'Paid Date': item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleDateString() : '',
        'Verified Date': item.billing?.verifiedAt ? new Date(item.billing.verifiedAt).toLocaleDateString() : ''
      }));

      // Convert to CSV format
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current filters
      const filterInfo = [];
      if (statusFilter !== 'all') filterInfo.push(`status-${statusFilter}`);
      if (centerFilter !== 'all') {
        const centerName = centers.find(c => c._id === centerFilter)?.centername || centers.find(c => c._id === centerFilter)?.name || 'center';
        filterInfo.push(`center-${centerName.replace(/\s+/g, '-')}`);
      }
      if (dateFilter !== 'all') filterInfo.push(`date-${dateFilter}`);
      if (searchTerm) filterInfo.push(`search-${searchTerm.replace(/\s+/g, '-')}`);
      
      const filterSuffix = filterInfo.length > 0 ? `-${filterInfo.join('-')}` : '';
      link.download = `billing-data${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredBillingData.length} billing records successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Calculate totals from filtered data
  const calculateTotals = () => {
    // Enhance filtered data with partial payment information
    const enhancedData = (filteredBillingData || []).map(item => {
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

    // Filter to only include items that have billing information
    const billingItems = enhancedData.filter(item => item.billing && item.billing.status);

    // Use Set to track unique bills to avoid double counting
    const uniqueBills = new Set();
    
    const totals = billingItems.reduce((acc, item) => {
      const amount = item.billing?.amount || 0;
      
      // Only count each bill once (by _id)
      if (!uniqueBills.has(item._id)) {
        uniqueBills.add(item._id);
        acc.totalCount += 1;
        acc.totalAmount += amount;
        
        // Determine the effective status for counting
        const effectiveStatus = item.billing?.status;
        
        if (effectiveStatus === 'paid' || effectiveStatus === 'verified') {
          acc.paidAmount += amount;
          acc.paidCount += 1;
        } else if (effectiveStatus === 'generated' || effectiveStatus === 'partially_paid') {
          acc.pendingAmount += amount;
          acc.pendingCount += 1;
        }
      }
      
      return acc;
    }, { totalAmount: 0, totalCount: 0, paidAmount: 0, paidCount: 0, pendingAmount: 0, pendingCount: 0 });

    return totals;
  };

  const totals = calculateTotals();

  // Pagination logic
  const totalPages = Math.ceil((filteredBillingData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredBillingData?.slice(startIndex, endIndex) || [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, centerFilter, dateFilter, paymentStatusFilter]);

  // Pagination controls component
  const PaginationControls = () => {
    if (!filteredBillingData || filteredBillingData.length === 0) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 7;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
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
            <span className="font-medium">{Math.min(endIndex, filteredBillingData?.length || 0)}</span> of{' '}
            <span className="font-medium">{filteredBillingData?.length || 0}</span> results
          </div>
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
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
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
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
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Billing Management</h1>
              <p className="text-slate-600 text-lg">Monitor and manage billing across all centers</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Records</div>
                <div className="text-2xl font-bold text-slate-800">{filteredBillingData?.length || 0}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

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

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filters & Search</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCenterFilter('all');
                  setDateFilter('all');
                  setPaymentStatusFilter('all');
                  dispatch(resetFilters());
                  dispatch(applyFilters());
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => dispatch(fetchAllBillingData())}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              <option value="payment_received">Payment Received</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
              <option value="cancelled">Cancelled Bills</option>
              <option value="refunded">Refunded Bills</option>
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

            {/* Enhanced Center Filter */}
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              disabled={centersLoading}
            >
              <option value="all">
                {centersLoading ? 'Loading Centers...' : `All Centers (${centers?.length || 0})`}
              </option>
              {centersError ? (
                <option value="error" disabled>Error loading centers</option>
              ) : (
                centers?.map(center => (
                  <option key={center._id} value={center._id}>
                    {center.centername || center.name} {center.centerCode && `(${center.centerCode})`}
                  </option>
                ))
              )}
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
              onClick={() => handleExportData('csv')}
              disabled={!filteredBillingData || filteredBillingData.length === 0}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export ({filteredBillingData?.length || 0})
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-blue-600">{filteredBillingData?.length || 0}</span> of{' '}
              <span className="font-semibold text-slate-800">{billingData?.length || 0}</span> records
            </div>
            {centerFilter !== 'all' && (
              <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <Building className="w-4 h-4 mr-1" />
                Center: {centers.find(c => c._id === centerFilter)?.centername || centers.find(c => c._id === centerFilter)?.name || 'Unknown'}
              </div>
            )}
            {statusFilter !== 'all' && (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <CheckCircle className="w-4 h-4 mr-1" />
                Status: {statusFilter}
              </div>
            )}
            {paymentStatusFilter !== 'all' && (
              <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                <DollarSign className="w-4 h-4 mr-1" />
                Payment: {paymentStatusFilter}
              </div>
            )}
            {searchTerm && (
              <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                <Search className="w-4 h-4 mr-1" />
                Search: "{searchTerm}"
              </div>
            )}
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
                    Center & Doctor
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
                    // Enhance item with partial payment data
                    const partialData = getPartialPaymentData(item._id);
                    const enhancedItem = {
                      ...item,
                      billing: item.billing ? {
                        ...item.billing,
                        paidAmount: item.billing.paidAmount || partialData.totalPaid,
                        partialPayments: partialData.payments
                      } : null
                    };

                    return (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{item.patientName}</div>
                            <div className="text-sm text-slate-600 mt-1">{item.testType}</div>
                            {item.urgency && (
                              <div className="mt-2">
                                {getUrgencyBadge(item.urgency)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{item.centerName}</div>
                            <div className="text-sm text-slate-600 mt-1">Dr. {item.doctorName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {enhancedItem.billing ? (
                              <>
                                <div className="text-sm font-bold text-slate-800">
                                  Total: ₹{enhancedItem.billing.amount?.toLocaleString()}
                                </div>
                                
                                {/* Enhanced payment display */}
                                {(() => {
                                  const partialData = getPartialPaymentData(item._id);
                                  const totalPaidFromStorage = partialData.totalPaid;
                                  const backendPaidAmount = item.billing?.paidAmount || 0;
                                  const totalAmount = item.billing?.amount || 0;
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
                                  {enhancedItem.billing.invoiceNumber}
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-500">No bill generated</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(enhancedItem.billing?.status || 'not_generated', enhancedItem.billing, item._id)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-800">
                            {new Date(item.billing?.generatedAt || item.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(item.billing?.generatedAt || item.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewBillingDetails(enhancedItem)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!item.billing?.invoiceNumber && (
                              <button
                                onClick={() => handleGenerateInvoice(item._id)}
                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                title="Generate Invoice"
                                disabled={actionLoading}
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <PaginationControls />
        </div>
      </div>

    </div>
  );
};

export default SuperadminBilling;
