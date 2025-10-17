import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';
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
  RefreshCw,
  Settings,
  UserPlus,
  X,
  FileSpreadsheet,
  FileDown,
  CreditCard,
  Receipt,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const CenterAdminConsultationFeeBilling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // Get reassignment info from navigation state
  const reassignmentInfo = location.state?.reassignmentInfo;
  
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [allTransactions, searchTerm, statusFilter, typeFilter]);

  // Clear reassignment info only when user manually dismisses the notification
  const clearReassignmentInfo = () => {
    console.log('🧹 Manually clearing reassignment info');
    navigate('/dashboard/centeradmin/consultation-fee-billing', { replace: true });
  };

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching all transactions...');
      
      // Fetch patients based on user role
      let response;
      if (user?.role === 'superadmin') {
        response = await API.get('/patients/all');
      } else {
        // For center admin, try multiple approaches to get patients
        try {
          // Try with includeReassigned parameter first
          response = await API.get('/patients?limit=10000&page=1&includeReassigned=true');
        } catch (error) {
          console.log('First attempt failed, trying without includeReassigned...');
          // Fallback to regular patients endpoint
          response = await API.get('/patients?limit=10000&page=1');
        }
      }
      
      if (response.data.patients || (response.data.success && response.data.patients)) {
        const patients = response.data.patients;
        console.log('📊 Fetched patients:', patients.length);
        
        // Process all patients to create transaction records
        const transactions = [];
        
        patients.forEach(patient => {
          // 1. Add regular billing transactions
          if (patient.billing && patient.billing.length > 0) {
            patient.billing.forEach((bill, index) => {
              transactions.push({
                id: `${patient._id}_billing_${index}`,
                patientId: patient._id,
                patientName: patient.name,
                patientEmail: patient.email,
                patientPhone: patient.phone,
                patientUhId: patient.uhId,
                patientAge: patient.age,
                patientGender: patient.gender,
                assignedDoctor: patient.assignedDoctor,
                centerId: patient.centerId,
                transactionType: 'consultation_billing',
                billData: bill,
                createdAt: bill.createdAt,
                updatedAt: bill.updatedAt || bill.createdAt,
                status: bill.status,
                amount: bill.amount,
                paymentMethod: bill.paymentMethod,
                invoiceNumber: bill.invoiceNumber,
                description: bill.description,
                type: bill.type,
                isReassigned: false,
                reassignmentCount: 0
              });
            });
          }
          
          // 2. Add reassignment billing transactions
          if (patient.reassignedBilling && patient.reassignedBilling.length > 0) {
            patient.reassignedBilling.forEach((bill, index) => {
              transactions.push({
                id: `${patient._id}_reassigned_${index}`,
                patientId: patient._id,
                patientName: patient.name,
                patientEmail: patient.email,
                patientPhone: patient.phone,
                patientUhId: patient.uhId,
                patientAge: patient.age,
                patientGender: patient.gender,
                assignedDoctor: patient.assignedDoctor,
                centerId: patient.centerId,
                transactionType: 'reassignment_billing',
                billData: bill,
                createdAt: bill.createdAt,
                updatedAt: bill.updatedAt || bill.createdAt,
                status: bill.status,
                amount: bill.amount,
                paymentMethod: bill.paymentMethod,
                invoiceNumber: bill.invoiceNumber,
                description: bill.description,
                consultationType: bill.consultationType,
                isReassigned: true,
                reassignmentCount: index + 1,
                originalPatientId: patient._id
              });
            });
          }
        });
        
        // Sort transactions by creation date (newest first)
        transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log('📈 Total transactions processed:', transactions.length);
        setAllTransactions(transactions);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('No patients found or invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = allTransactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.patientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.patientUhId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.transactionType === typeFilter);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const getTransactionStatus = (transaction) => {
    switch (transaction.status) {
      case 'paid':
      case 'completed':
        return { text: 'Paid', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-4 w-4" /> };
      case 'pending':
        return { text: 'Pending', color: 'text-orange-600 bg-orange-100', icon: <Clock className="h-4 w-4" /> };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600 bg-red-100', icon: <X className="h-4 w-4" /> };
      case 'refunded':
        return { text: 'Fully Refunded', color: 'text-purple-600 bg-purple-100', icon: <RotateCcw className="h-4 w-4" /> };
      case 'partially_refunded':
        return { text: 'Partially Refunded', color: 'text-yellow-600 bg-yellow-100', icon: <AlertCircle className="h-4 w-4" /> };
      default:
        return { text: 'Unknown', color: 'text-gray-600 bg-gray-100', icon: <AlertCircle className="h-4 w-4" /> };
    }
  };

  const getTransactionType = (transaction) => {
    if (transaction.isReassigned) {
      return {
        text: `Reassignment #${transaction.reassignmentCount}`,
        color: 'text-orange-600 bg-orange-100',
        icon: <ArrowRight className="h-4 w-4" />
      };
    } else {
      return {
        text: 'Regular Billing',
        color: 'text-blue-600 bg-blue-100',
        icon: <Receipt className="h-4 w-4" />
      };
    }
  };

  const handleGenerateInvoice = async (transaction) => {
    try {
      console.log('🧾 Generating invoice for transaction:', transaction.id);
      
      let response;
      
      if (transaction.isReassigned) {
        // For reassigned patients, generate invoice from reassignment billing
        response = await API.post('/reassignment-billing/generate-invoice', {
          patientId: transaction.originalPatientId,
          billingId: transaction.billData._id
        });
      } else {
        // For regular patients, use standard billing
        response = await API.post('/billing/generate-invoice', {
          patientId: transaction.patientId
        });
      }
      
      if (response.data.success) {
        setInvoiceData(response.data.invoice);
        setShowInvoiceModal(true);
      } else {
        toast.error('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  const getStats = () => {
    const totalTransactions = allTransactions.length;
    const paidTransactions = allTransactions.filter(t => t.status === 'paid' || t.status === 'completed').length;
    const pendingTransactions = allTransactions.filter(t => t.status === 'pending').length;
    const refundedTransactions = allTransactions.filter(t => t.status === 'refunded' || t.status === 'partially_refunded').length;
    const cancelledTransactions = allTransactions.filter(t => t.status === 'cancelled').length;
    const reassignedTransactions = allTransactions.filter(t => t.isReassigned).length;
    
    const totalRevenue = allTransactions
      .filter(t => t.status === 'paid' || t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    return {
      totalTransactions,
      paidTransactions,
      pendingTransactions,
      refundedTransactions,
      cancelledTransactions,
      reassignedTransactions,
      totalRevenue
    };
  };

  const stats = getStats();

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Complete Transaction History - Center Admin
              </h1>
              <p className="text-slate-600 text-sm">
                View all billing transactions from consultation billing and patient reassignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={filteredTransactions.length === 0}
              >
                <FileDown className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={fetchAllTransactions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Reassignment Notification Banner */}
        {reassignmentInfo?.reassigned && (
          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Patient Reassigned Successfully
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>
                        <strong>{reassignmentInfo.patientName}</strong> has been reassigned to{' '}
                        <strong>{reassignmentInfo.newDoctorName}</strong>
                      </p>
                      <p className="mt-2 font-medium text-orange-800">
                        ⚠️ New transaction record created for this reassignment.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearReassignmentInfo}
                  className="flex-shrink-0 text-orange-600 hover:text-orange-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Transactions</p>
                <p className="text-lg font-bold text-slate-800">{stats.totalTransactions}</p>
              </div>
              <Receipt className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Paid</p>
                <p className="text-lg font-bold text-slate-800">{stats.paidTransactions}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Pending</p>
                <p className="text-lg font-bold text-slate-800">{stats.pendingTransactions}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Refunded</p>
                <p className="text-lg font-bold text-slate-800">{stats.refundedTransactions}</p>
              </div>
              <RotateCcw className="h-6 w-6 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Cancelled</p>
                <p className="text-lg font-bold text-slate-800">{stats.cancelledTransactions}</p>
              </div>
              <X className="h-6 w-6 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Reassigned</p>
                <p className="text-lg font-bold text-slate-800">{stats.reassignedTransactions}</p>
              </div>
              <ArrowRight className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Revenue</p>
                <p className="text-lg font-bold text-slate-800">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name, email, phone, UH ID, doctor, or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Fully Refunded</option>
                    <option value="partially_refunded">Partially Refunded</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-500" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="consultation_billing">Regular Billing</option>
                    <option value="reassignment_billing">Reassignment Billing</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions found</h3>
              <p className="text-slate-600 text-sm mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No transactions found in your center'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount & Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentTransactions.map((transaction) => {
                  const statusInfo = getTransactionStatus(transaction);
                  const typeInfo = getTransactionType(transaction);
                  
                  return (
                    <tr key={transaction.id} className={`hover:bg-slate-50 ${transaction.isReassigned ? 'bg-orange-50 border-l-4 border-orange-400' : ''}`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              transaction.isReassigned ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                              <User className={`h-5 w-5 ${transaction.isReassigned ? 'text-orange-600' : 'text-blue-600'}`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-900">{transaction.patientName}</div>
                              {transaction.isReassigned && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Reassignment #{transaction.reassignmentCount}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">{transaction.patientUhId || 'N/A'}</div>
                            <div className="text-xs text-slate-400">
                              {transaction.patientAge && `${transaction.patientAge}Y`} {transaction.patientGender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.icon}
                            <span className="ml-1">{typeInfo.text}</span>
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {transaction.assignedDoctor?.name || 'Not Assigned'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">₹{transaction.amount?.toLocaleString('en-IN') || '0'}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.text}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="font-medium text-slate-900 capitalize">{transaction.paymentMethod || 'N/A'}</div>
                          {transaction.invoiceNumber && (
                            <div className="text-slate-500 font-mono text-xs">INV: {transaction.invoiceNumber}</div>
                          )}
                          {transaction.consultationType && (
                            <div className="text-slate-500 text-xs">{transaction.consultationType} Consultation</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => navigate(`/dashboard/centeradmin/patients/viewprofile/${transaction.patientId}`)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                            title="View Patient Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleGenerateInvoice(transaction)}
                            className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
                            title="Generate Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="bg-white px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 sm:px-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> of{' '}
                <span className="font-medium">{filteredTransactions.length}</span> results
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Show:</label>
                <select
                  value={transactionsPerPage}
                  onChange={(e) => {
                    setTransactionsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-slate-600">per page</span>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm bg-blue-50 border border-blue-200 rounded font-medium text-blue-700">
                  {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Export Transaction Data
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                  disabled={isExporting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-600 text-sm">
                  Choose the format to export {filteredTransactions.length} transaction records:
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsExporting(true);
                      // PDF export logic here
                      toast.success('PDF export functionality coming soon');
                      setIsExporting(false);
                      setShowExportModal(false);
                    }}
                    disabled={isExporting}
                    className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900">Export as PDF</div>
                      <div className="text-sm text-slate-500">Print-ready report with formatting</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsExporting(true);
                      // Excel export logic here
                      toast.success('Excel export functionality coming soon');
                      setIsExporting(false);
                      setShowExportModal(false);
                    }}
                    disabled={isExporting}
                    className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileSpreadsheet className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-slate-900">Export as Excel (CSV)</div>
                      <div className="text-sm text-slate-500">Spreadsheet format for data analysis</div>
                    </div>
                  </button>
                </div>
                
                {isExporting && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Generating report...</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    <strong>Note:</strong> The export will include all currently filtered results. 
                    Use search and filters to customize the data before exporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Invoice Modal */}
        {showInvoiceModal && invoiceData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-xl" id="invoice-print">
              {/* Modal Header with Actions */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Transaction Invoice</h2>
                    <p className="text-sm opacity-90">{invoiceData.invoiceNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        // Generate optimized PDF invoice for A4 printing
                        const printWindow = window.open('', '_blank');
                        const invoiceContent = document.getElementById('invoice-print').innerHTML;
                        
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>Invoice - ${invoiceData.patient.name}</title>
                              <style>
                                * {
                                  box-sizing: border-box;
                                  margin: 0;
                                  padding: 0;
                                }
                                
                                body { 
                                  font-family: Arial, sans-serif; 
                                  margin: 0;
                                  padding: 5mm;
                                  color: #000;
                                  background: white;
                                  font-size: 12px;
                                  line-height: 1.3;
                                }
                                
                                .invoice-container {
                                  max-width: 190mm;
                                  margin: 0 auto;
                                  background: white;
                                  position: relative;
                                  height: 277mm; /* A4 height */
                                  overflow: hidden;
                                }
                                
                                /* A4 Optimized Styles with Medium Fonts */
                                .text-center { text-align: center; }
                                .font-bold { font-weight: bold; }
                                .text-base { font-size: 16px; }
                                .text-sm { font-size: 14px; }
                                .text-xs { font-size: 11px; }
                                .leading-tight { line-height: 1.2; }
                                .mb-6 { margin-bottom: 12px; }
                                .mb-4 { margin-bottom: 8px; }
                                .mb-3 { margin-bottom: 6px; }
                                .mb-2 { margin-bottom: 4px; }
                                .mb-1 { margin-bottom: 2px; }
                                .mt-1 { margin-top: 2px; }
                                .mt-10 { margin-top: 15px; }
                                .pt-4 { padding-top: 8px; }
                                .pb-4 { padding-bottom: 8px; }
                                .p-6 { padding: 12px; }
                                .p-3 { padding: 6px; }
                                .p-2 { padding: 4px; }
                                .border-b { border-bottom: 1px solid #000; }
                                .border-t { border-top: 1px solid #000; }
                                .border-slate-300 { border-color: #000; }
                                .border-slate-400 { border-color: #000; }
                                .border-slate-200 { border-color: #000; }
                                .text-slate-900 { color: #000; }
                                .text-slate-700 { color: #000; }
                                .text-slate-600 { color: #000; }
                                .text-slate-500 { color: #333; }
                                .text-blue-600 { color: #000; }
                                .text-green-600 { color: #000; }
                                .text-orange-600 { color: #000; }
                                .text-red-600 { color: #000; }
                                .underline { text-decoration: underline; }
                                .uppercase { text-transform: uppercase; }
                                .grid { display: grid; }
                                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                                .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
                                .gap-6 { gap: 8px; }
                                .gap-4 { gap: 6px; }
                                .gap-x-8 { column-gap: 8px; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .justify-end { justify-content: flex-end; }
                                .items-end { align-items: flex-end; }
                                .w-80 { width: 200px; }
                                .w-20 { width: 40px; }
                                .w-28 { width: 60px; }
                                .w-32 { width: 70px; }
                                .w-12 { width: 30px; }
                                .w-24 { width: 50px; }
                                .flex-1 { flex: 1; }
                                .font-medium { font-weight: 500; }
                                .font-semibold { font-weight: 600; }
                                .min-w-full { min-width: 100%; }
                                .border-collapse { border-collapse: collapse; }
                                .border { border: 1px solid #000; }
                                .px-3 { padding-left: 6px; padding-right: 6px; }
                                .py-2 { padding-top: 3px; padding-bottom: 3px; }
                                .text-left { text-align: left; }
                                .text-right { text-align: right; }
                                .bg-slate-100 { background-color: #f5f5f5; }
                                .bg-slate-50 { background-color: #f9f9f9; }
                                .max-w-xs { max-width: 200px; }
                                .border-b-2 { border-bottom-width: 2px; }
                                .border-t-2 { border-top-width: 2px; }
                                .pt-2 { padding-top: 4px; }
                                .py-1 { padding-top: 2px; padding-bottom: 2px; }
                                .pt-1 { padding-top: 2px; }
                                .space-y-1 > * + * { margin-top: 2px; }
                                .space-y-3 > * + * { margin-top: 6px; }
                                
                                /* A4 Optimized Table styles with Medium Fonts */
                                table { 
                                  width: 100%; 
                                  border-collapse: collapse; 
                                  margin: 8px 0;
                                  font-size: 11px;
                                }
                                
                                th, td { 
                                  border: 1px solid #000; 
                                  padding: 4px 6px; 
                                  text-align: left; 
                                  font-size: 11px;
                                  vertical-align: top;
                                }
                                
                                th { 
                                  background-color: #f5f5f5; 
                                  font-weight: bold; 
                                  text-align: center;
                                }
                                
                                /* Hide elements that shouldn't print */
                                .no-print,
                                button,
                                .action-buttons {
                                  display: none !important;
                                }
                                
                                @media print {
                                  body {
                                    margin: 0;
                                    padding: 5mm;
                                    font-size: 11px;
                                  }
                                  
                                  .invoice-container {
                                    max-width: none;
                                    margin: 0;
                                    height: auto;
                                    overflow: visible;
                                  }
                                  
                                  table {
                                    page-break-inside: avoid;
                                  }
                                  
                                  .no-page-break {
                                    page-break-inside: avoid;
                                  }
                                  
                                  @page {
                                    size: A4;
                                    margin: 5mm;
                                  }
                                }
                              </style>
                            </head>
                            <body>
                              <div class="invoice-container">
                                <div class="invoice-content">
                                  ${invoiceContent}
                                </div>
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        
                        // Wait for content to load then print
                        setTimeout(() => {
                          printWindow.print();
                        }, 500);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                    
                    <button
                      onClick={() => setShowInvoiceModal(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Professional Invoice Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6">
                <div className="bg-white p-6 max-w-4xl mx-auto relative">
                  {/* Header - Compact for A4 */}
                  <div className="text-center mb-3">
                    <h1 className="text-sm font-bold text-slate-900 mb-1">
                      CHANRE ALLERGY CENTER
                    </h1>
                    <p className="text-xs text-slate-600 leading-tight">
                      No.414/65, 20th Main, West of Chord Road, 1st Block, Rajajinagara, Bangalore-560010
                    </p>
                    <p className="text-xs text-slate-600">
                      PH: 080-42516699 | Fax: 080-42516600
                    </p>
                    <p className="text-xs text-slate-600">
                      Website: www.chanreallergy.com
                    </p>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-3">
                    <h2 className="text-base font-bold text-slate-900 uppercase">
                      IN PATIENT BILL
                    </h2>
                  </div>

                  {/* Patient and Bill Details */}
                  <div className="grid grid-cols-2 gap-x-6 mb-4">
                    <div>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">Name:</span> {invoiceData.patient.name}</div>
                        <div><span className="font-medium">Date:</span> {new Date(invoiceData.generatedAt).toLocaleDateString('en-GB')} {new Date(invoiceData.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        <div><span className="font-medium">Bill No:</span> {invoiceData.invoiceNumber}</div>
                        <div><span className="font-medium">File No:</span> {invoiceData.patient.uhId}</div>
                        <div><span className="font-medium">Sex:</span> {invoiceData.patient.gender}</div>
                        <div><span className="font-medium">Age:</span> {invoiceData.patient.age}Y</div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">Consultant Name:</span> {invoiceData.doctor}</div>
                        <div><span className="font-medium">Department:</span> MD (Physiology)Immunology</div>
                        <div><span className="font-medium">User Name / Lab ID:</span> {invoiceData.patient.uhId}</div>
                        <div><span className="font-medium">Password:</span> {invoiceData.patient.uhId}m</div>
                        <div><span className="font-medium">Ref. Doctor:</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Services Table */}
                  <div className="mb-4 no-page-break">
                    <table className="min-w-full border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-3 py-2 text-left text-xs font-medium text-slate-700 uppercase">S.No</th>
                          <th className="border border-slate-300 px-3 py-2 text-left text-xs font-medium text-slate-700 uppercase">Service Name</th>
                          <th className="border border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-700 uppercase">Quantity</th>
                          <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Charges</th>
                          <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Paid</th>
                          <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Balance</th>
                          <th className="border border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.billingRecords.map((bill, index) => {
                          const paidAmount = bill.paidAmount || 0;
                          const refundAmount = bill.refundAmount || 0;
                          const balance = bill.amount - paidAmount;
                          let status, statusColor;
                          
                          if (bill.status === 'cancelled') {
                            status = 'Cancelled';
                            statusColor = 'text-red-600';
                          } else if (bill.status === 'refunded') {
                            status = 'Refunded';
                            statusColor = 'text-orange-600';
                          } else if (bill.status === 'partially_refunded') {
                            status = 'Partially Refunded';
                            statusColor = 'text-yellow-600';
                          } else {
                            status = paidAmount >= bill.amount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';
                            statusColor = status === 'Paid' ? 'text-green-600' : status === 'Partial' ? 'text-orange-600' : 'text-red-600';
                          }
                          
                          return (
                            <tr key={index}>
                              <td className="border border-slate-300 px-3 py-2 text-xs">{index + 1}</td>
                              <td className="border border-slate-300 px-3 py-2 text-xs">
                                {bill.type === 'consultation' ? 'IP Consultation Fee' : 
                                 bill.type === 'registration' ? 'Registration Fee' :
                                 bill.description || 'Service'}
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-center text-xs">1</td>
                              <td className="border border-slate-300 px-3 py-2 text-right text-xs">{bill.amount.toFixed(2)}</td>
                              <td className="border border-slate-300 px-3 py-2 text-right text-xs">{paidAmount.toFixed(2)}</td>
                              <td className="border border-slate-300 px-3 py-2 text-right text-xs">{balance.toFixed(2)}</td>
                              <td className="border border-slate-300 px-3 py-2 text-center text-xs">
                                <span className={`font-medium ${statusColor}`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-xs">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span>₹{invoiceData.totals.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount(-):</span>
                        <span>₹{invoiceData.totals.discount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Amount:</span>
                        <span>₹{invoiceData.totals.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
                        <span>Grand Total:</span>
                        <span>₹{invoiceData.totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <span>₹{(invoiceData.totals.paid || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outstanding:</span>
                        <span>₹{(invoiceData.totals.outstanding || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium">
                          {(() => {
                            const status = invoiceData.billingRecords[0]?.status;
                            if (status === 'paid') return 'PAID';
                            if (status === 'cancelled') return 'CANCELLED';
                            if (status === 'refunded') return 'FULLY REFUNDED';
                            if (status === 'partially_refunded') return 'PARTIALLY REFUNDED';
                            return 'PENDING';
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <div className="flex justify-between">
                        <span>Paid Amount: (Rs.)</span>
                        <span>{(invoiceData.totals.paid || 0).toFixed(2)} Only</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className="font-medium">
                          {(() => {
                            const status = invoiceData.billingRecords[0]?.status;
                            if (status === 'paid') return 'Paid';
                            if (status === 'cancelled') return 'Cancelled';
                            if (status === 'refunded') return 'Fully Refunded';
                            if (status === 'partially_refunded') return 'Partially Refunded';
                            return 'Pending';
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-slate-600 border-t border-slate-300 pt-4">
                    <div className="space-y-1">
                      <div className="font-medium">Invoice Terms</div>
                      <div>• Original invoice document</div>
                      <div>• Payment due upon receipt</div>
                      <div>• Keep for your records</div>
                      <div>• No refunds after 7 days</div>
                      <div className="mt-3">
                        <div>Signature: For CHANRE ALLERGY CENTER</div>
                        <div className="mt-2">
                          <div>"For Home Sample Collection"</div>
                          <div>Miss Call: 080-42516666|Mobile: 9686197153</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterAdminConsultationFeeBilling;