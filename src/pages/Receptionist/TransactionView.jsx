import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  CreditCard,
  User,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import API from '../../services/api';
import { format } from 'date-fns';

const TransactionView = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { center } = useSelector((state) => state.center);

  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await API.get(`/payment-logs/center?${params}`);
      
      if (response.data.success) {
        setTransactions(response.data.paymentLogs);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions(1);
  };

  // Export transactions
  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      );

      const response = await API.get(`/payment-logs/center/export?${params}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Error exporting transactions');
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      initiated: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      credit_card: '💳',
      debit_card: '💳',
      upi: '📱',
      net_banking: '🏦',
      cheque: '📄',
      other: '💰'
    };
    return icons[method] || '💰';
  };

  // Get payment type display name
  const getPaymentTypeDisplay = (type) => {
    const types = {
      consultation: 'Consultation Fee',
      registration: 'Registration Fee',
      service: 'Service Charge',
      test: 'Test Fee',
      medication: 'Medication',
      lab_test: 'Lab Test',
      other: 'Other'
    };
    return types[type] || type;
  };

  // Toggle transaction details
  const toggleTransactionDetails = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                Transaction History
              </h1>
              <p className="text-gray-600 mt-1">
                View all transactions for {center?.name || 'your center'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchTransactions(pagination.page)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportTransactions}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Patient name, transaction ID..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Filter Actions */}
          {showFilters && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions ({pagination.total})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-600 mt-2">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
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
                  {transactions.map((transaction) => (
                    <React.Fragment key={transaction._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.transactionId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getPaymentTypeDisplay(transaction.paymentType)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.patientName}
                            </div>
                            {transaction.patientId?.uhId && (
                              <div className="text-sm text-gray-500">
                                UH ID: {transaction.patientId.uhId}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatAmount(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                            </span>
                            <span className="text-sm text-gray-900 capitalize">
                              {transaction.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(transaction.createdAt), 'dd MMM yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(transaction.createdAt), 'HH:mm')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleTransactionDetails(transaction._id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            {expandedTransaction === transaction._id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      {expandedTransaction === transaction._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID:</span>
                                    <span className="font-mono">{transaction.transactionId}</span>
                                  </div>
                                  {transaction.invoiceNumber && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Invoice:</span>
                                      <span>{transaction.invoiceNumber}</span>
                                    </div>
                                  )}
                                  {transaction.receiptNumber && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Receipt:</span>
                                      <span>{transaction.receiptNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Payment Info</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-medium">{formatAmount(transaction.amount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span>{getPaymentTypeDisplay(transaction.paymentType)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Processing Info</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Processed By:</span>
                                    <span>{transaction.processedBy?.name || 'Unknown'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span>{format(new Date(transaction.createdAt), 'dd MMM yyyy HH:mm')}</span>
                                  </div>
                                  {transaction.notes && (
                                    <div className="mt-2">
                                      <span className="text-gray-600 text-xs">Notes:</span>
                                      <p className="text-sm text-gray-900 mt-1">{transaction.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchTransactions(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => fetchTransactions(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionView;
