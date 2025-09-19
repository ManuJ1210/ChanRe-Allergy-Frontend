import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { API_CONFIG, SERVER_CONFIG } from '../../config/environment';
import { 
  ArrowLeft,
  Download,
  Printer,
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Receipt,
  Building,
  Phone,
  Mail
} from 'lucide-react';

const CenterAdminBillingDetails = () => {
  const { billingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [billingDetails, setBillingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [localUser, setLocalUser] = useState(null);
  const [billingData, setBillingData] = useState([]);
  
  // Refs to track toast messages
  const errorToastShown = useRef(false);
  const successToastShown = useRef(false);

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

  // Fetch billing data for the center (same as main billing page)
  const fetchBillingData = async () => {
    try {
      setLoadingDetails(true);
      
      if (!user || !localUser) {
        setBillingData([]);
        setLoadingDetails(false);
        return;
      }
      
      const response = await API.get(`/billing/center`);
      
      // Ensure we have an array of billing requests
      if (response.data && Array.isArray(response.data.billingRequests)) {
        setBillingData(response.data.billingRequests);
      } else if (response.data && Array.isArray(response.data)) {
        setBillingData(response.data);
      } else {
        setBillingData([]);
      }
    } catch (error) {
      if (!errorToastShown.current) {
        toast.error('Failed to load billing data');
        errorToastShown.current = true;
      }
      
      setBillingData([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (billingId) {
      // Initialize localUser with the Redux user
      if (user && !localUser) {
        const safeUser = { ...user };
        setLocalUser(safeUser);
      }
      
      fetchBillingData();
      
      const timeout = setTimeout(() => {
        if (loadingDetails) {
          setLoadingDetails(false);
          if (!errorToastShown.current) {
            toast.error('Failed to load billing details - timeout');
            errorToastShown.current = true;
          }
          navigate('/dashboard/centeradmin/billing');
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [billingId, user, localUser, loadingDetails, navigate]);

  // Find the specific billing record from the fetched data
  useEffect(() => {
    if (billingData && billingData.length > 0 && billingId) {
      const billing = billingData.find(item => item._id === billingId);
      
      if (billing) {
        setBillingDetails(billing);
        setLoadingDetails(false);
      } else {
        if (!errorToastShown.current) {
          toast.error('Billing record not found');
          errorToastShown.current = true;
        }
        navigate('/dashboard/centeradmin/billing');
      }
    }
  }, [billingData, billingId, navigate]);

  // Get status badge
  const getStatusBadge = (status, billing, requestId) => {
    const statusConfig = {
      'not_generated': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Generated' },
      'generated': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Generated' },
      'payment_received': { color: 'bg-yellow-100 text-yellow-800', icon: DollarSign, label: 'Payment Received' },
      'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      'verified': { color: 'bg-purple-100 text-purple-800', icon: Shield, label: 'Verified' }
    };

    // Get partial payment data to check for multiple payments
    const partialData = getPartialPaymentData(requestId);
    const hasMultiplePayments = partialData.paymentCount > 1;
    
    // Check if bill is fully paid
    const totalAmount = billing?.amount || 0;
    const backendPaidAmount = billing?.paidAmount || 0;
    const totalPaidFromStorage = partialData.totalPaid;
    
    // Check if bill is fully paid by status
    const isFullyPaidByStatus = status === 'paid' || status === 'verified';
    
    // Calculate actual paid amount
    let actualPaidAmount;
    if (isFullyPaidByStatus && backendPaidAmount === 0) {
      actualPaidAmount = totalAmount;
    } else {
      actualPaidAmount = Math.max(backendPaidAmount, totalPaidFromStorage);
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

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download invoice
  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/billing/test-requests/${billingId}/invoice`, {
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
        `invoice-${billingId}.pdf`;
      
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
      if (!errorToastShown.current) {
        toast.error('Failed to download invoice');
        errorToastShown.current = true;
      }
    }
  };

  if (loadingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading billing details...</h2>
          <p className="text-slate-600">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (!billingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Billing Record Not Found</h2>
          <p className="text-slate-600 mb-4">The billing record you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/dashboard/centeradmin/billing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Billing List
          </button>
        </div>
      </div>
    );
  }

  const partialData = getPartialPaymentData(billingDetails._id);
  const totalPaidFromStorage = partialData.totalPaid;
  const backendPaidAmount = billingDetails.billing?.paidAmount || 0;
  const totalAmount = billingDetails.billing?.amount || 0;
  
  // Check if bill is fully paid by status
  const isFullyPaidByStatus = billingDetails.billing?.status === 'paid' || 
                            billingDetails.billing?.status === 'verified';
  
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
  const isFullyPaid = actualPaidAmount >= totalAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/centeradmin/billing')}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors duration-200"
                title="Back to Billing List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Billing Details</h1>
                <p className="text-slate-600 text-sm">Complete billing information and payment history</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              {billingDetails.billing?.invoiceNumber && (
                <button
                  onClick={handleDownloadInvoice}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {/* Patient & Test Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Patient & Test Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-600">Patient Name</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {typeof billingDetails.patientName === 'object' 
                    ? billingDetails.patientName?.name || billingDetails.patientName?.fullName || 'Unknown Patient'
                    : billingDetails.patientName || 'Unknown Patient'
                  }
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Test Type</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {typeof billingDetails.testType === 'object' 
                    ? billingDetails.testType?.name || billingDetails.testType?.type || 'Unknown Test'
                    : billingDetails.testType || 'Unknown Test'
                  }
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Urgency</label>
                <div className="mt-1">
                  {getUrgencyBadge(
                    typeof billingDetails.urgency === 'object' 
                      ? billingDetails.urgency?.level || billingDetails.urgency?.name || 'Normal'
                      : billingDetails.urgency || 'Normal'
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Status</label>
                <div className="mt-1">{getStatusBadge(billingDetails.billing?.status || 'not_generated', billingDetails.billing, billingDetails._id)}</div>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Doctor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-600">Doctor Name</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  Dr. {typeof billingDetails.doctorName === 'object' 
                    ? billingDetails.doctorName?.name || billingDetails.doctorName?.fullName || 'Unknown Doctor'
                    : billingDetails.doctorName || 'Unknown Doctor'
                  }
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Doctor ID</label>
                <p className="text-sm text-slate-800 mt-1">
                  {typeof billingDetails.doctorId === 'object' 
                    ? billingDetails.doctorId?._id || billingDetails.doctorId?.id || 'N/A'
                    : billingDetails.doctorId || 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Specialization</label>
                <p className="text-sm text-slate-800 mt-1">
                  {typeof billingDetails.doctorSpecialization === 'object' 
                    ? billingDetails.doctorSpecialization?.name || billingDetails.doctorSpecialization?.specialization || 'N/A'
                    : billingDetails.doctorSpecialization || 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-blue-600">Total Amount</label>
                    <p className="text-lg font-bold text-blue-800">₹{totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-green-600">Paid Amount</label>
                    <p className="text-lg font-bold text-green-800">₹{actualPaidAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg p-4 ${isFullyPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isFullyPaid ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {isFullyPaid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                      {isFullyPaid ? 'Status' : 'Remaining'}
                    </label>
                    <p className={`text-lg font-bold ${isFullyPaid ? 'text-green-800' : 'text-orange-800'}`}>
                      {isFullyPaid ? 'Fully Paid' : `₹${remainingAmount.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Items */}
          {billingDetails.billing?.items && billingDetails.billing.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Billing Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {billingDetails.billing.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">₹{item.price?.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{item.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-slate-500">Subtotal</td>
                      <td className="px-6 py-3 text-sm font-medium text-slate-900">₹{(totalAmount - (billingDetails.billing.taxes || 0) + (billingDetails.billing.discounts || 0)).toLocaleString()}</td>
                    </tr>
                    {billingDetails.billing.taxes > 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-slate-500">Taxes</td>
                        <td className="px-6 py-3 text-sm font-medium text-slate-900">₹{billingDetails.billing.taxes.toLocaleString()}</td>
                      </tr>
                    )}
                    {billingDetails.billing.discounts > 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-slate-500">Discounts</td>
                        <td className="px-6 py-3 text-sm font-medium text-slate-900">-₹{billingDetails.billing.discounts.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-md font-bold text-slate-700">Total</td>
                      <td className="px-6 py-3 text-lg font-bold text-slate-900">₹{totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {partialData.paymentCount > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Payment History</h2>
              <div className="space-y-4">
                {partialData.payments.map((payment, index) => (
                  <div key={payment.id || index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800">Payment #{index + 1}</h3>
                            <p className="text-xs text-slate-600">{payment.method} - {payment.transactionId}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <label className="text-slate-500">Date</label>
                            <p className="font-medium text-slate-800">{new Date(payment.timestamp).toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-slate-500">Amount</label>
                            <p className="font-medium text-green-600">₹{payment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-slate-500">Recorded By</label>
                            <p className="font-medium text-slate-800">{payment.recordedBy || 'Receptionist'}</p>
                          </div>
                        </div>
                        {payment.notes && (
                          <div className="mt-2">
                            <label className="text-xs text-slate-500">Notes</label>
                            <p className="text-xs text-slate-700 italic">"{payment.notes}"</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'recorded' ? 'bg-blue-100 text-blue-800' :
                          payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status || 'recorded'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Dates */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Important Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-600">Created</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">{new Date(billingDetails.createdAt).toLocaleString()}</p>
              </div>
              {billingDetails.billing?.generatedAt && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Bill Generated</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{new Date(billingDetails.billing.generatedAt).toLocaleString()}</p>
                </div>
              )}
              {billingDetails.billing?.paidAt && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Payment Date</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{new Date(billingDetails.billing.paidAt).toLocaleString()}</p>
                </div>
              )}
              {billingDetails.billing?.verifiedAt && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Verified Date</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{new Date(billingDetails.billing.verifiedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Information */}
          {billingDetails.billing?.invoiceNumber && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Invoice Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-600">Invoice Number</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{billingDetails.billing.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Currency</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{billingDetails.billing.currency || 'INR'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Generated By</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{billingDetails.billing.generatedBy || 'System'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterAdminBillingDetails;
