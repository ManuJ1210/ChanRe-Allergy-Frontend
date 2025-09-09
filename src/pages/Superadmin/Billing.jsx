import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllBillingData());
    dispatch(fetchBillingStats());
    dispatch(fetchCenters());
  }, [dispatch]);

  // Handle filter changes
  useEffect(() => {
    dispatch(updateFilters({
      searchTerm,
      statusFilter,
      centerFilter,
      dateFilter
    }));
    // Apply filters after updating them
    dispatch(applyFilters());
  }, [dispatch, searchTerm, statusFilter, centerFilter, dateFilter]);

  // Handle success messages
  useEffect(() => {
    if (success) {
      toast.success('Billing data loaded successfully');
      dispatch(resetBillingState());
    }
    if (actionSuccess) {
      toast.success('Action completed successfully');
      dispatch(resetBillingState());
    }
  }, [success, actionSuccess, dispatch]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBillingError());
    }
    if (actionError) {
      toast.error(actionError);
      dispatch(clearBillingError());
    }
  }, [error, actionError, dispatch]);

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'not_generated': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Generated' },
      'generated': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Generated' },
      'payment_received': { color: 'bg-yellow-100 text-yellow-800', icon: DollarSign, label: 'Payment Received' },
      'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      'verified': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Verified' }
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
    dispatch(setSelectedBilling(billing));
    dispatch(toggleBillingModal(true));
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
    const totals = filteredBillingData.reduce((acc, item) => {
      const amount = item.billing?.amount || 0;
      acc.totalAmount += amount;
      acc.totalCount += 1;
      
      if (item.billing?.status === 'paid') {
        acc.paidAmount += amount;
        acc.paidCount += 1;
      } else if (item.billing?.status === 'generated') {
        acc.pendingAmount += amount;
        acc.pendingCount += 1;
      }
      
      return acc;
    }, { totalAmount: 0, totalCount: 0, paidAmount: 0, paidCount: 0, pendingAmount: 0, pendingCount: 0 });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-md font-bold text-gray-900 mb-2">Billing Management</h1>
          <p className="text-gray-600">Monitor and manage billing across all centers</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Total Bills</p>
                <p className="text-md font-bold text-gray-900">{totals.totalCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Paid Bills</p>
                <p className="text-md font-bold text-gray-900">{totals.paidCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Pending Bills</p>
                <p className="text-md font-bold text-gray-900">{totals.pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-gray-600">Total Amount</p>
                <p className="text-md font-bold text-gray-900">₹{totals.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            {/* Center Filter */}
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCenterFilter('all');
                  setDateFilter('all');
                  dispatch(resetFilters());
                  dispatch(applyFilters());
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs"
                title="Reset all filters"
              >
                Reset
              </button>
              <button
                onClick={() => dispatch(fetchAllBillingData())}
                disabled={loading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Status and Export */}
        <div className="mb-6 flex justify-between items-center">
          {/* Filter Status */}
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredBillingData?.length || 0}</span> of{' '}
              <span className="font-semibold text-gray-900">{billingData?.length || 0}</span> records
            </div>
            {centerFilter !== 'all' && (
              <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <Building className="w-4 h-4 mr-1" />
                Center: {centers.find(c => c._id === centerFilter)?.centername || centers.find(c => c._id === centerFilter)?.name || 'Unknown'}
              </div>
            )}
            {statusFilter !== 'all' && (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <CheckCircle className="w-4 h-4 mr-1" />
                Status: {statusFilter}
              </div>
            )}
            {searchTerm && (
              <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                <Search className="w-4 h-4 mr-1" />
                Search: "{searchTerm}"
              </div>
            )}
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => handleExportData('csv')}
            disabled={!filteredBillingData || filteredBillingData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data ({filteredBillingData?.length || 0} records)
          </button>
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
                    Center & Doctor
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
                {filteredBillingData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {loading ? 'Loading billing data...' : 'No billing records found'}
                    </td>
                  </tr>
                ) : (
                  filteredBillingData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-medium text-gray-900">{item.patientName}</div>
                          <div className="text-xs text-gray-500">{item.testType}</div>
                          {item.urgency && (
                            <div className="mt-1">
                              {getUrgencyBadge(item.urgency)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-medium text-gray-900">{item.centerName}</div>
                          <div className="text-xs text-gray-500">Dr. {item.doctorName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {item.billing ? (
                            <>
                              <div className="text-xs font-medium text-gray-900">
                                ₹{item.billing.amount?.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.billing.invoiceNumber}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-gray-500">No bill generated</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.billing?.status || 'not_generated')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900">
                          {new Date(item.billing?.generatedAt || item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.billing?.generatedAt || item.createdAt).toLocaleTimeString()}
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
                          {item.billing?.invoiceNumber && (
                            <button
                              onClick={() => handleDownloadInvoice(item._id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Download Invoice"
                              disabled={actionLoading}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {!item.billing?.invoiceNumber && (
                            <button
                              onClick={() => handleGenerateInvoice(item._id)}
                              className="text-purple-600 hover:text-purple-900 p-1"
                              title="Generate Invoice"
                              disabled={actionLoading}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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
                <h3 className="text-xs font-medium text-gray-900">Billing Details</h3>
                <button
                  onClick={() => dispatch(toggleBillingModal(false))}
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
                  <div className="grid grid-cols-2 gap-4 text-xs">
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

                {/* Center & Doctor Info */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Center & Doctor Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Center:</span>
                      <span className="ml-2 font-medium">{selectedBilling.centerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Doctor:</span>
                      <span className="ml-2 font-medium">Dr. {selectedBilling.doctorName}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                {selectedBilling.billing && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Billing Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
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
                            <div key={index} className="flex justify-between text-xs py-1">
                              <span>{item.name} (x{item.quantity})</span>
                              <span>₹{item.total}</span>
                            </div>
                          ))}
                          {selectedBilling.billing.taxes > 0 && (
                            <div className="flex justify-between text-xs py-1 border-t pt-1">
                              <span>Taxes</span>
                              <span>₹{selectedBilling.billing.taxes}</span>
                            </div>
                          )}
                          {selectedBilling.billing.discounts > 0 && (
                            <div className="flex justify-between text-xs py-1">
                              <span>Discounts</span>
                              <span>-₹{selectedBilling.billing.discounts}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs py-1 border-t pt-1 font-medium">
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
                  <div className="grid grid-cols-2 gap-4 text-xs">
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
                  onClick={() => dispatch(toggleBillingModal(false))}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
                {selectedBilling.billing?.invoiceNumber && (
                  <button
                    onClick={() => handleDownloadInvoice(selectedBilling._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    disabled={actionLoading}
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
    </div>
  );
};

export default SuperadminBilling;
