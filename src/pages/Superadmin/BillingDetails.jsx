import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  ArrowLeft,
  Download,
  DollarSign,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  Building,
  CreditCard,
  Receipt,
  Eye,
  Printer
} from 'lucide-react';

// Import Redux actions
import {
  fetchAllBillingData,
  downloadInvoice
} from '../../features/superadmin/superadminBillingThunks';

const BillingDetails = () => {
  const { billingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { billingData, loading, actionLoading } = useSelector(state => state.superadminBilling);
  const [billingDetails, setBillingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

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

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      'Low': 'bg-green-100 text-green-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'High': 'bg-yellow-100 text-yellow-800',
      'Urgent': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${urgencyConfig[urgency] || urgencyConfig['Normal']}`}>
        {urgency}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (status, billing) => {
    const statusConfig = {
      'not_generated': { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Not Generated' },
      'generated': { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Generated' },
      'payment_received': { color: 'bg-yellow-100 text-yellow-800', icon: DollarSign, label: 'Payment Received' },
      'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      'verified': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Verified' }
    };

    // Check for partial payment
    if (billing && billing.paidAmount && billing.paidAmount > 0 && billing.paidAmount < billing.amount) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <DollarSign className="w-4 h-4 mr-2" />
          Partially Paid
        </span>
      );
    }

    const config = statusConfig[status] || statusConfig['not_generated'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    );
  };

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    if (!billingDetails?.billing?.invoiceNumber) {
      toast.error('No invoice available for download');
      return;
    }

    try {
      console.log('🚀 Attempting to download invoice for billingId:', billingDetails._id);
      
      const result = await dispatch(downloadInvoice(billingDetails._id)).unwrap();
      
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
      link.download = `invoice-${billingDetails.billing.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('❌ Download invoice error:', error);
      toast.error(`Failed to download invoice: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Fetch billing data on component mount
  useEffect(() => {
    if (billingId) {
      console.log('🔄 Fetching billing data for details page...');
      dispatch(fetchAllBillingData());
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (loadingDetails) {
          console.log('⏰ Timeout reached, stopping loading');
          setLoadingDetails(false);
          toast.error('Failed to load billing details - timeout');
          navigate('/dashboard/superadmin/billing');
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [billingId, dispatch, loadingDetails, navigate]);

  // Watch for billing data changes and find the specific record
  useEffect(() => {
    if (billingData && billingData.length > 0 && billingId) {
      console.log('📊 Billing data received:', billingData);
      console.log('🔍 Looking for billing ID:', billingId);
      
      const billing = billingData.find(item => item._id === billingId);
      console.log('📋 Found billing record:', billing);
      
      if (billing) {
        setBillingDetails(billing);
        setLoadingDetails(false);
      } else {
        console.log('❌ Billing record not found');
        toast.error('Billing record not found');
        navigate('/dashboard/superadmin/billing');
      }
    }
  }, [billingData, billingId, navigate]);

  if (loadingDetails || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading billing details...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (!billingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Billing record not found</p>
          <p className="text-slate-500 text-sm mt-2">The requested billing record could not be found</p>
          <button
            onClick={() => navigate('/dashboard/superadmin/billing')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  const partialData = getPartialPaymentData(billingDetails._id);
  const totalAmount = billingDetails.billing?.amount || 0;
  const backendPaidAmount = billingDetails.billing?.paidAmount || 0;
  
  // Check if bill is fully paid by status
  const isFullyPaidByStatus = billingDetails.billing?.status === 'paid' || 
                            billingDetails.billing?.status === 'verified';
  
  // If status indicates paid but paidAmount is 0, assume full amount was paid
  let actualPaidAmount;
  if (isFullyPaidByStatus && backendPaidAmount === 0) {
    actualPaidAmount = totalAmount;
  } else {
    actualPaidAmount = Math.max(backendPaidAmount, partialData.totalPaid);
  }
  
  const remainingAmount = totalAmount - actualPaidAmount;
  const isFullyPaid = isFullyPaidByStatus || actualPaidAmount >= totalAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/superadmin/billing')}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors duration-200"
                title="Back to Billing"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Billing Details</h1>
                <p className="text-slate-600 text-sm mt-1">Complete billing information and payment history</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 flex items-center"
                title="Print Details"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              {billingDetails.billing?.invoiceNumber && (
                <button
                  onClick={handleDownloadInvoice}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 flex items-center"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Downloading...' : 'Download Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Page Layout */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {/* Patient & Test Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Patient & Test Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-600">Patient Name</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">{billingDetails.patientName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Test Type</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">{billingDetails.testType}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Urgency</label>
                <div className="mt-1">
                  {getUrgencyBadge(billingDetails.urgency)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  {getStatusBadge(billingDetails.billing?.status || 'not_generated', billingDetails.billing)}
                </div>
              </div>
            </div>
          </div>

          {/* Center & Doctor Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Center & Doctor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-600">Center</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">{billingDetails.centerName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Doctor</label>
                <p className="text-sm font-semibold text-slate-800 mt-1">Dr. {billingDetails.doctorName}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <label className="text-xs font-medium text-slate-600">Total Amount</label>
                <p className="text-lg font-bold text-slate-800 mt-1">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <label className="text-xs font-medium text-green-700">Amount Paid</label>
                <p className="text-lg font-bold text-green-600 mt-1">₹{actualPaidAmount.toLocaleString()}</p>
              </div>
              {!isFullyPaid && remainingAmount > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="text-xs font-medium text-orange-700">Remaining Amount</label>
                  <p className="text-lg font-bold text-orange-600 mt-1">₹{remainingAmount.toLocaleString()}</p>
                </div>
              )}
              {isFullyPaid && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <label className="text-xs font-medium text-green-700">Payment Status</label>
                  <p className="text-lg font-bold text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Fully Paid
                  </p>
                </div>
              )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">₹{item.unitPrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{item.total}</td>
                      </tr>
                    ))}
                    {billingDetails.billing.taxes > 0 && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Taxes</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{billingDetails.billing.taxes}</td>
                      </tr>
                    )}
                    {billingDetails.billing.discounts > 0 && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Discounts</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">-₹{billingDetails.billing.discounts}</td>
                      </tr>
                    )}
                    <tr className="bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-md font-bold text-slate-900">Total Amount</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-blue-600">₹{billingDetails.billing.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment History */}
          {partialData.paymentCount > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {partialData.payments.map((payment, index) => (
                      <tr key={payment.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          <div>
                            <div className="font-medium">{new Date(payment.timestamp).toLocaleDateString()}</div>
                            <div className="text-slate-500">{new Date(payment.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{payment.method}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{payment.transactionId || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'recorded' ? 'bg-blue-100 text-blue-800' :
                            payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status || 'recorded'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Important Dates */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Important Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-medium text-slate-600">Created</label>
                <p className="text-sm text-slate-800 mt-1">
                  {new Date(billingDetails.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(billingDetails.createdAt).toLocaleTimeString()}
                </p>
              </div>
              
              {billingDetails.billing?.generatedAt && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Bill Generated</label>
                  <p className="text-sm text-slate-800 mt-1">
                    {new Date(billingDetails.billing.generatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(billingDetails.billing.generatedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              {billingDetails.billing?.paidAt && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Payment Date</label>
                  <p className="text-sm text-slate-800 mt-1">
                    {new Date(billingDetails.billing.paidAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(billingDetails.billing.paidAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              {billingDetails.billing?.verifiedAt && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Verified Date</label>
                  <p className="text-sm text-slate-800 mt-1">
                    {new Date(billingDetails.billing.verifiedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(billingDetails.billing.verifiedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Information */}
          {billingDetails.billing?.invoiceNumber && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Invoice Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-600">Invoice Number</label>
                  <p className="text-sm font-mono text-slate-800 mt-1">{billingDetails.billing.invoiceNumber}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-600">Currency</label>
                  <p className="text-sm text-slate-800 mt-1">{billingDetails.billing.currency || 'INR'}</p>
                </div>
                
                {billingDetails.billing.generatedBy && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">Generated By</label>
                    <p className="text-sm text-slate-800 mt-1">{billingDetails.billing.generatedBy}</p>
                  </div>
                )}
                
                {billingDetails.billing.paymentMethod && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">Payment Method</label>
                    <p className="text-sm text-slate-800 mt-1">{billingDetails.billing.paymentMethod}</p>
                  </div>
                )}
                
                {billingDetails.billing.transactionId && (
                  <div>
                    <label className="text-xs font-medium text-slate-600">Transaction ID</label>
                    <p className="text-sm font-mono text-slate-800 mt-1">{billingDetails.billing.transactionId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;
