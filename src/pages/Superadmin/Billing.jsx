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

const SuperadminBilling = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredData, setFilteredData] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);

  // ✅ REAL DATA: Fetch billing data
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
  
      
      const response = await fetch('/api/billing/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        setBillingData(data.billingRequests || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        toast.error(`Failed to fetch billing data: ${errorData.message || 'Unknown error'}`);
        setBillingData([]);
      }
    } catch (error) {
      console.error('Error fetching real billing data:', error);
      toast.error('Error fetching billing data');
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL DATA: Fetch centers for filtering
  const fetchCenters = async () => {
    try {
  
      
      const response = await fetch('/api/centers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        setCenters(data.centers || []);
      } else {
        console.error('Failed to fetch centers data');
        setCenters([]);
      }
    } catch (error) {
      console.error('Error fetching real centers data:', error);
      setCenters([]);
    }
  };

  useEffect(() => {
    fetchBillingData();
    fetchCenters();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = billingData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.centerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.billing?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.billing?.status === statusFilter);
    }

    // Center filter
    if (centerFilter !== 'all') {
      filtered = filtered.filter(item => item.centerId === centerFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.billing?.generatedAt || item.createdAt);
            return itemDate >= filterDate;
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.billing?.generatedAt || item.createdAt);
            return itemDate >= filterDate;
          });
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.billing?.generatedAt || item.createdAt);
            return itemDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }

    setFilteredData(filtered);
  }, [billingData, searchTerm, statusFilter, centerFilter, dateFilter]);

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
    setSelectedBilling(billing);
    setShowBillingModal(true);
  };

  // Download invoice (placeholder)
  const downloadInvoice = (billingId) => {
    toast.info('Invoice download functionality will be implemented');
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = filteredData.reduce((acc, item) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Management</h1>
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
            >
              <option value="all">All Centers</option>
              {centers.map(center => (
                <option key={center._id} value={center._id}>{center.name}</option>
              ))}
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
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {loading ? 'Loading billing data...' : 'No billing records found'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.patientName}</div>
                          <div className="text-sm text-gray-500">{item.testType}</div>
                          {item.urgency && (
                            <div className="mt-1">
                              {getUrgencyBadge(item.urgency)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.centerName}</div>
                          <div className="text-sm text-gray-500">Dr. {item.doctorName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {item.billing ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                ₹{item.billing.amount?.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.billing.invoiceNumber}
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
                          {new Date(item.billing?.generatedAt || item.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
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
                              onClick={() => downloadInvoice(item._id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
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

                {/* Center & Doctor Info */}
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Center & Doctor Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
    </div>
  );
};

export default SuperadminBilling;
