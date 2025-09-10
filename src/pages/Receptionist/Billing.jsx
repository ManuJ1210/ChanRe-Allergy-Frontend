import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ReceptionistLayout from './ReceptionistLayout';
import { fetchReceptionistBillingRequests, generateReceptionistBill, markReceptionistBillPaid } from '../../features/receptionist/receptionistThunks';
import { Search, Filter, Plus, CheckCircle, FileText, IndianRupee, Hash, X, CreditCard, Receipt, Upload, Clock, Download, DollarSign } from 'lucide-react';
import { API_CONFIG } from '../../config/environment';

const currencySymbol = '₹';

// Utility function to safely render object fields
const safeRender = (value, fallback = 'N/A') => {
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'object' && value !== null) {
    // If it's an object with a name property, return the name
    if (value.name && typeof value.name === 'string') return value.name;
    // If it's an object with other common properties, return the first string one
    const keys = Object.keys(value);
    for (const key of keys) {
      if (typeof value[key] === 'string') return value[key];
      if (typeof value[key] === 'number') return value[key].toString();
    }
    // If no string/number found, return fallback
    return fallback;
  }
  return fallback;
};

// Helper function to safely get nested object properties
const safeGet = (obj, path, fallback = 'N/A') => {
  if (!obj || typeof obj !== 'object') return fallback;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }
  return safeRender(current, fallback);
};

// Enhanced safe render for table cells
const safeRenderCell = (value, fallback = 'N/A') => {
  try {
    const result = safeRender(value, fallback);
    // Ensure we always return a string
    return typeof result === 'string' ? result : fallback;
  } catch (error) {
    console.error('Error in safeRenderCell:', error, 'Value:', value);
    return fallback;
  }
};

// Ultra-safe render function for any value
const ultraSafeRender = (value, fallback = 'N/A') => {
  try {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value || fallback;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return value.length > 0 ? value[0].toString() : fallback;
    if (typeof value === 'object') {
      // Try to find a string property
      for (const [key, val] of Object.entries(value)) {
        if (typeof val === 'string' && val) return val;
        if (typeof val === 'number') return val.toString();
      }
      return fallback;
    }
    return fallback;
  } catch (error) {
    console.error('Error in ultraSafeRender:', error, 'Value:', value);
    return fallback;
  }
};

export default function ReceptionistBilling() {
  const dispatch = useDispatch();
  const { billingRequests, loading, error } = useSelector((s) => s.receptionist);
  const { user, token } = useSelector((s) => s.auth); // Add auth state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [items, setItems] = useState([{ name: '', code: '', quantity: 1, unitPrice: 0 }]);
  const [taxes, setTaxes] = useState(0);
  const [discounts, setDiscounts] = useState(0);
  const [notes, setNotes] = useState('');
  
  // ✅ NEW: Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    transactionId: '',
    receiptUpload: '',
    paymentNotes: '',
    paymentAmount: 0,
    isPartialPayment: false
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState(null);

  useEffect(() => {
    if (user && token) {
      console.log('🔄 Fetching billing requests...');
      dispatch(fetchReceptionistBillingRequests());
    }
  }, [dispatch, user, token]);

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

  // Function to store partial payment separately
  const storePartialPayment = (requestId, paymentData) => {
    const paymentKey = `partial_payment_${requestId}`;
    const existingPayments = JSON.parse(localStorage.getItem(paymentKey) || '[]');
    
    // Create unique payment record
    const newPayment = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentData.amount,
      method: paymentData.method,
      transactionId: paymentData.transactionId,
      timestamp: new Date().toISOString(),
      notes: paymentData.notes,
      receiptUpload: paymentData.receiptUpload,
      status: 'recorded', // recorded, verified, completed
      recordedBy: user?.name || 'Receptionist',
      recordedAt: new Date().toISOString()
    };
    
    // Add to existing payments
    const updatedPayments = [...existingPayments, newPayment];
    localStorage.setItem(paymentKey, JSON.stringify(updatedPayments));
    
    console.log('💾 Stored partial payment separately:', {
      requestId,
      paymentId: newPayment.id,
      amount: newPayment.amount,
      method: newPayment.method,
      totalPayments: updatedPayments.length
    });
    
    return newPayment;
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

  // Debug billing data when it changes
  useEffect(() => {
    if (billingRequests && billingRequests.length > 0) {
      console.log('📊 Billing requests received:', billingRequests.map(req => {
        const partialData = getPartialPaymentData(req._id);
        return {
          id: req._id,
          patientName: req.patientName,
          testType: req.testType,
          billing: req.billing ? {
            amount: req.billing.amount,
            paidAmount: req.billing.paidAmount || partialData.totalPaid,
            status: req.billing.status,
            invoiceNumber: req.billing.invoiceNumber
          } : null,
          partialPayments: partialData.payments
        };
      }));
    }
  }, [billingRequests]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (billingRequests || [])
      .map(r => {
        // Enhance billing data with partial payment information
        const partialData = getPartialPaymentData(r._id);
        if (r.billing && partialData.totalPaid > 0) {
          return {
            ...r,
            billing: {
              ...r.billing,
              paidAmount: r.billing.paidAmount || partialData.totalPaid,
              partialPayments: partialData.payments
            }
          };
        }
        return r;
      })
      .filter(r => {
        if (status === 'all') return true;
        if (status === 'payment_received') {
          return r.status === 'Billing_Generated' && r.billing?.status === 'payment_received';
        }
        if (status === 'Billing_Paid') {
          // Include Billing_Paid, Report_Sent, and Completed in Bill Paid & Verified filter
          return ['Billing_Paid', 'Report_Sent', 'Completed'].includes(r.status);
        }
        return r.status === status;
      })
      .filter(r => {
        if (paymentStatus === 'all') return true;
        
        const totalAmount = r.billing?.amount || 0;
        const paidAmount = r.billing?.paidAmount || 0;
        
        if (paymentStatus === 'unpaid') {
          return totalAmount > 0 && paidAmount === 0;
        }
        if (paymentStatus === 'partial') {
          return totalAmount > 0 && paidAmount > 0 && paidAmount < totalAmount;
        }
        if (paymentStatus === 'full') {
          return totalAmount > 0 && paidAmount >= totalAmount;
        }
        
        return true;
      })
      .filter(r => !term || 
        `${r.patientName || ''} ${r.doctorName || ''} ${r.testType || ''}`.toLowerCase().includes(term));
  }, [billingRequests, search, status, paymentStatus]);

  // Pagination logic
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered?.slice(startIndex, endIndex) || [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, paymentStatus]);

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

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
            <span className="font-medium">{Math.min(endIndex, filtered?.length || 0)}</span> of{' '}
            <span className="font-medium">{filtered?.length || 0}</span> results
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
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'text-gray-500 cursor-default'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const subTotal = items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  const grandTotal = Math.max(0, subTotal + Number(taxes || 0) - Number(discounts || 0));

  // Calculate billing workflow statistics (including completed and Report_Sent)
  const workflowStats = useMemo(() => {
    const stats = {
      total: billingRequests?.length || 0,
      pending: billingRequests?.filter(r => r.status === 'Pending').length || 0,
      billingPending: billingRequests?.filter(r => r.status === 'Billing_Pending').length || 0,
      billingGenerated: billingRequests?.filter(r => r.status === 'Billing_Generated').length || 0,
      paymentReceived: billingRequests?.filter(r => r.status === 'Billing_Generated' && r.billing?.status === 'payment_received').length || 0,
      billingPaid: billingRequests?.filter(r => r.status === 'Billing_Paid' || r.status === 'Report_Sent').length || 0,
      completed: billingRequests?.filter(r => r.status === 'Completed').length || 0
    };
    return stats;
  }, [billingRequests]);

  const openBillModal = (req) => {
    setSelected(req);
    if (req.billing?.items?.length) {
      setItems(req.billing.items.map(it => ({ name: it.name, code: it.code, quantity: it.quantity, unitPrice: it.unitPrice })));
      setTaxes(req.billing.taxes || 0);
      setDiscounts(req.billing.discounts || 0);
      setNotes(req.billing.notes || '');
    } else {
      setItems([{ name: req.testType || '', code: '', quantity: 1, unitPrice: '' }]);
      setTaxes(0);
      setDiscounts(0);
      setNotes('');
    }
  };

  const closeBillModal = () => {
    setSelected(null);
  };

  // ✅ NEW: Open payment modal
  const openPaymentModal = (req) => {
    setSelectedForPayment(req);
    const totalAmount = req.billing?.amount || 0;
    const paidAmount = req.billing?.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    // Get partial payment history
    const partialData = getPartialPaymentData(req._id);
    const totalPaidFromStorage = partialData.totalPaid;
    const actualRemainingAmount = totalAmount - Math.max(paidAmount, totalPaidFromStorage);
    
    console.log('💰 Opening payment modal:', {
      totalAmount,
      paidAmount,
      totalPaidFromStorage,
      actualRemainingAmount,
      paymentHistory: partialData.payments,
      billing: req.billing
    });
    
    setPaymentDetails({
      paymentMethod: '',
      transactionId: '',
      receiptUpload: '',
      paymentNotes: '',
      paymentAmount: actualRemainingAmount, // Default to actual remaining amount
      isPartialPayment: actualRemainingAmount < totalAmount
    });
    setShowPaymentModal(true);
  };

  // ✅ NEW: Close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedForPayment(null);
    setPaymentDetails({
      paymentMethod: '',
      transactionId: '',
      receiptUpload: '',
      paymentNotes: '',
      paymentAmount: 0,
      isPartialPayment: false
    });
  };

  const updateItem = (idx, patch) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const addItem = () => setItems(prev => [...prev, { name: '', code: '', quantity: 1, unitPrice: '' }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleGenerate = async () => {
    if (!selected) return;
    
    // Validate and clean items data
    const validItems = items.filter(item => item.name && item.name.trim() && Number(item.unitPrice) > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one item with a name and valid price greater than 0');
      return;
    }
    
    // Convert items to proper format for backend
    const cleanedItems = validItems.map(item => ({
      name: item.name.trim(),
      code: item.code || '',
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice)
    }));
    
    const payload = { 
      items: cleanedItems, 
      taxes: Number(taxes || 0), 
      discounts: Number(discounts || 0), 
      currency: 'INR', 
      notes 
    };
    

    
    try {
      await dispatch(generateReceptionistBill({ requestId: selected._id, payload })).unwrap();
      toast.success('Bill generated successfully');
      closeBillModal();
      dispatch(fetchReceptionistBillingRequests());
    } catch (e) {
      toast.error(e || 'Failed to generate bill');
    }
  };

  // ✅ NEW: Enhanced mark paid with partial payment support
  const handleMarkPaid = async () => {
    if (!selectedForPayment) return;
    
    // Validate payment details
    if (!paymentDetails.paymentMethod || !paymentDetails.transactionId) {
      toast.error('Payment method and transaction ID are required');
      return;
    }
    
    if (!paymentDetails.paymentAmount || paymentDetails.paymentAmount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }
    
    const totalAmount = selectedForPayment.billing?.amount || 0;
    const paidAmount = selectedForPayment.billing?.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    if (paymentDetails.paymentAmount > remainingAmount) {
      toast.error(`Payment amount cannot exceed remaining balance of ${currencySymbol}${remainingAmount.toFixed(2)}`);
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('paymentMethod', paymentDetails.paymentMethod);
      formData.append('transactionId', paymentDetails.transactionId);
      formData.append('paymentNotes', paymentDetails.paymentNotes || '');
      formData.append('paymentAmount', paymentDetails.paymentAmount.toString());
      formData.append('isPartialPayment', paymentDetails.isPartialPayment.toString());
      
      // Add current paid amount and total amount for backend calculation
      formData.append('currentPaidAmount', paidAmount.toString());
      formData.append('totalAmount', totalAmount.toString());
      
      // Add receipt file if uploaded
      if (paymentDetails.receiptUpload && paymentDetails.receiptUpload instanceof File) {
        formData.append('receiptFile', paymentDetails.receiptUpload);
      }
      
      console.log('🚀 Sending payment data:', {
        paymentAmount: paymentDetails.paymentAmount,
        currentPaidAmount: paidAmount,
        totalAmount: totalAmount,
        isPartialPayment: paymentDetails.isPartialPayment,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId
      });
      
      // Try alternative API structure if the current one doesn't work
      let response;
      try {
        // First try: FormData approach
        response = await fetch(`${API_CONFIG.BASE_URL}/billing/test-requests/${selectedForPayment._id}/mark-paid`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      } catch (error) {
        console.log('🔄 FormData approach failed, trying JSON approach...');
        // Second try: JSON approach
        const jsonPayload = {
          paymentMethod: paymentDetails.paymentMethod,
          transactionId: paymentDetails.transactionId,
          paymentNotes: paymentDetails.paymentNotes || '',
          paymentAmount: paymentDetails.paymentAmount,
          isPartialPayment: paymentDetails.isPartialPayment,
          currentPaidAmount: paidAmount,
          totalAmount: totalAmount
        };
        
        response = await fetch(`${API_CONFIG.BASE_URL}/billing/test-requests/${selectedForPayment._id}/mark-paid`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(jsonPayload)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || 'Failed to record payment');
      }
      
      const responseData = await response.json();
      console.log('✅ Payment response:', responseData);
      
      // Always store payment separately for better tracking
      const paymentData = {
        amount: paymentDetails.paymentAmount,
        method: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
        notes: paymentDetails.paymentNotes,
        receiptUpload: paymentDetails.receiptUpload
      };
      
      const storedPayment = storePartialPayment(selectedForPayment._id, paymentData);
      
      // Check if the backend properly updated paidAmount
      if (responseData.billing && responseData.billing.paidAmount !== undefined) {
        console.log('✅ Backend returned paidAmount:', responseData.billing.paidAmount);
        console.log('✅ Payment also stored separately with ID:', storedPayment.id);
      } else {
        console.log('⚠️ Backend did not return paidAmount, using frontend calculation');
        console.log('✅ Payment stored separately with ID:', storedPayment.id);
      }
      
      const newPaidAmount = paidAmount + paymentDetails.paymentAmount;
      const isFullyPaid = newPaidAmount >= totalAmount;
      
      // Get updated payment history
      const updatedPartialData = getPartialPaymentData(selectedForPayment._id);
      
      if (isFullyPaid) {
        toast.success(`Full payment completed! Total paid: ${currencySymbol}${newPaidAmount.toFixed(2)}. Awaiting center admin verification.`);
      } else {
        toast.success(`Payment recorded: ${currencySymbol}${paymentDetails.paymentAmount.toFixed(2)}. Total paid: ${currencySymbol}${newPaidAmount.toFixed(2)}. Remaining: ${currencySymbol}${(totalAmount - newPaidAmount).toFixed(2)}`);
      }
      
      closePaymentModal();
      dispatch(fetchReceptionistBillingRequests());
    } catch (e) {
      console.error('❌ Payment error:', e);
      toast.error(e.message || 'Failed to record payment');
    }
  };

  // ✅ NEW: Handle file upload for receipt
  const handleReceiptUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file type (PDF, JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPaymentDetails(prev => ({ ...prev, receiptUpload: file }));
    }
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

  // Error boundary for rendering
  const renderContent = () => {
    try {
      
      return (
        <ReceptionistLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                             {/* Professional Header */}
               <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                   <div>
                     <h1 className="text-2xl font-bold text-slate-800 mb-2">Billing Management</h1>
                     <p className="text-slate-600 text-sm">Generate bills, track payments, and manage test request workflow</p>
                   </div>
                                     <div className="flex items-center space-x-3">
                     <button 
                       onClick={() => dispatch(fetchReceptionistBillingRequests())}
                       disabled={loading}
                       className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                     >
                       <Search className="h-4 w-4 mr-2" />
                       Refresh
                     </button>
                     
                     {/* Debug button to test payment functionality */}
                     <button 
                       onClick={() => {
                         console.log('🔍 Current billing data:', billingRequests);
                         console.log('🔍 Filtered data:', filtered);
                         const billingGeneratedBills = billingRequests?.filter(req => req.status === 'Billing_Generated') || [];
                         console.log('🔍 Billing Generated bills:', billingGeneratedBills);
                         if (billingGeneratedBills.length > 0) {
                           const firstBill = billingGeneratedBills[0];
                           console.log('🔍 First billing generated bill:', firstBill);
                           console.log('🔍 Should show payment button:', {
                             status: firstBill.status,
                             billing: firstBill.billing,
                             totalAmount: firstBill.billing?.amount || 0,
                             paidAmount: firstBill.billing?.paidAmount || 0,
                             remainingAmount: (firstBill.billing?.amount || 0) - (firstBill.billing?.paidAmount || 0)
                           });
                         }
                         
                         // Show all partial payments
                         const allPayments = getAllPartialPayments();
                         console.log('💳 All partial payments across all bills:', allPayments);
                       }}
                       className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm"
                     >
                       <CheckCircle className="h-4 w-4 mr-2" />
                       Debug Payments
                     </button>
                     
                     {/* Partial Payments Summary */}
                     {(() => {
                       const allPayments = getAllPartialPayments();
                       const totalPartialPayments = allPayments.length;
                       const totalAmount = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
                       
                       if (totalPartialPayments > 0) {
                         return (
                           <div className="inline-flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                             <div className="text-xs text-green-700">
                               <div className="font-medium">{totalPartialPayments} Partial Payments</div>
                               <div>Total: {currencySymbol}{totalAmount.toFixed(2)}</div>
                             </div>
                           </div>
                         );
                       }
                       return null;
                     })()}
                   </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-red-700 text-sm font-medium">{ultraSafeRender(error)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

                     {/* Billing Workflow Statistics */}
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
             <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-3xl font-bold text-slate-800">{workflowStats.total}</div>
                   <div className="text-sm text-slate-600 mt-1">Total Requests</div>
                 </div>
                 <div className="bg-blue-100 rounded-lg p-2">
                   <FileText className="h-6 w-6 text-blue-600" />
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-3xl font-bold text-yellow-700">{workflowStats.pending + workflowStats.billingPending}</div>
                   <div className="text-sm text-slate-600 mt-1">Bill Pending</div>
                 </div>
                 <div className="bg-yellow-100 rounded-lg p-2">
                   <Clock className="h-6 w-6 text-yellow-600" />
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-3xl font-bold text-blue-700">{workflowStats.billingGenerated}</div>
                   <div className="text-sm text-slate-600 mt-1">Bill Generated</div>
                 </div>
                 <div className="bg-blue-100 rounded-lg p-2">
                   <Receipt className="h-6 w-6 text-blue-600" />
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-3xl font-bold text-green-700">{workflowStats.billingPaid}</div>
                   <div className="text-sm text-slate-600 mt-1">Bill Paid & Verified</div>
                 </div>
                 <div className="bg-green-100 rounded-lg p-2">
                   <CheckCircle className="h-6 w-6 text-green-600" />
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow duration-200">
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-3xl font-bold text-emerald-700">{workflowStats.completed}</div>
                   <div className="text-sm text-slate-600 mt-1">Completed</div>
                 </div>
                 <div className="bg-emerald-100 rounded-lg p-2">
                   <CheckCircle className="h-6 w-6 text-emerald-600" />
                 </div>
               </div>
             </div>
           </div>

          {/* Enhanced Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Search by patient name, doctor name, or test type..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
              <div className="relative">
                                 <select 
                   className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white" 
                   value={status} 
                   onChange={(e) => setStatus(e.target.value)}
                 >
                   <option value="all">All Billing Requests</option>
                   <option value="Pending">Bill Pending</option>
                   <option value="Billing_Pending">Billing Pending</option>
                   <option value="Billing_Generated">Bill Generated</option>
                   <option value="Billing_Paid">Bill Paid & Verified</option>
                 </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white" 
                  value={paymentStatus} 
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="all">All Payment Status</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partially Paid</option>
                  <option value="full">Fully Paid</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              <button 
                onClick={() => dispatch(fetchReceptionistBillingRequests())}
                disabled={loading}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm font-medium"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Main Table */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 text-lg">Loading billing requests...</p>
                <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the latest data</p>
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Test</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((req, index) => (
                      <tr key={req._id} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-slate-800">
                            {ultraSafeRender(req.patientName) || ultraSafeRender(req.patientId?.name)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-slate-700">
                            {ultraSafeRender(req.patientPhone) || ultraSafeRender(req.patientId?.phone)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-slate-700 max-w-xs truncate" title={ultraSafeRender(req.patientAddress) || ultraSafeRender(req.patientId?.address)}>
                            {ultraSafeRender(req.patientAddress) || ultraSafeRender(req.patientId?.address)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-slate-800">
                            {ultraSafeRender(req.doctorName) || ultraSafeRender(req.doctorId?.name)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-slate-700">
                            {ultraSafeRender(req.testType)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
                            ultraSafeRender(req.status) === 'Pending' ? 'bg-gray-50 text-gray-700 border-gray-300' :
                            ultraSafeRender(req.status) === 'Billing_Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                            ultraSafeRender(req.status) === 'Billing_Generated' && ultraSafeRender(req.billing?.status) === 'payment_received' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                            ultraSafeRender(req.status) === 'Billing_Generated' && req.billing?.paidAmount && req.billing.paidAmount > 0 && req.billing.paidAmount < req.billing.amount ? 'bg-purple-50 text-purple-700 border-purple-300' :
                            ultraSafeRender(req.status) === 'Billing_Generated' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                            ultraSafeRender(req.status) === 'Billing_Paid' ? 'bg-green-50 text-green-700 border-green-300' :
                            ultraSafeRender(req.status) === 'Report_Sent' ? 'bg-green-50 text-green-700 border-green-300' :
                            ultraSafeRender(req.status) === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            'bg-slate-50 text-slate-700 border-slate-300'
                          }`}>
                            {ultraSafeRender(req.status) === 'Billing_Generated' && ultraSafeRender(req.billing?.status) === 'payment_received' 
                              ? 'Payment Received' 
                              : ultraSafeRender(req.status) === 'Billing_Generated' && req.billing?.paidAmount && req.billing.paidAmount > 0 && req.billing.paidAmount < req.billing.amount
                              ? 'Partially Paid'
                              : ultraSafeRender(req.status) === 'Report_Sent'
                              ? 'Bill Paid'
                              : ultraSafeRender(req.status)?.replace(/_/g, ' ') || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {req.billing && typeof req.billing.amount === 'number' ? (
                            <div className="space-y-1">
                              <div className="font-bold text-slate-800 text-lg">
                                Total: {currencySymbol}{req.billing.amount.toFixed(2)}
                              </div>
                              {(() => {
                                const partialData = getPartialPaymentData(req._id);
                                const totalPaidFromStorage = partialData.totalPaid;
                                const backendPaidAmount = req.billing.paidAmount || 0;
                                const totalAmount = req.billing.amount;
                                
                                // Check if bill is fully paid by status
                                const isFullyPaidByStatus = req.billing?.status === 'paid' || 
                                                          req.billing?.status === 'verified' ||
                                                          req.status === 'Report_Sent';
                                
                                // If status indicates paid but paidAmount is 0, assume full amount was paid
                                let actualPaidAmount;
                                if (isFullyPaidByStatus && backendPaidAmount === 0) {
                                  actualPaidAmount = totalAmount;
                                } else {
                                  actualPaidAmount = Math.max(backendPaidAmount, totalPaidFromStorage);
                                }
                                
                                const remainingAmount = totalAmount - actualPaidAmount;
                                const isFullyPaid = isFullyPaidByStatus || actualPaidAmount >= totalAmount;
                                
                                return (
                                  <div className="text-xs space-y-1">
                                    <div className="text-green-600 font-medium">
                                      Paid: {currencySymbol}{actualPaidAmount.toFixed(2)}
                                    </div>
                                    {isFullyPaid ? (
                                      <div className="text-green-600 font-medium">
                                        ✅ Fully Paid
                                      </div>
                                    ) : remainingAmount > 0 && (
                                      <div className="text-orange-600 font-medium">
                                        Remaining: {currencySymbol}{remainingAmount.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-2">
                            {ultraSafeRender(req.status) === 'Pending' && (
                              <span className="inline-flex items-center text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-md">
                                <FileText className="h-3 w-3 mr-1" /> Awaiting Billing
                              </span>
                            )}
                            {ultraSafeRender(req.status) === 'Billing_Pending' && (
                              <button 
                                onClick={() => openBillModal(req)} 
                                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Generate Bill
                              </button>
                            )}
                            {ultraSafeRender(req.status) === 'Billing_Generated' && (
                              <>
                                <button 
                                  onClick={() => openBillModal(req)} 
                                  className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors duration-200"
                                >
                                  <FileText className="h-3 w-3 mr-1" /> View/Edit Bill
                                </button>
                                
                                {/* Show payment button for all billing generated bills */}
                                {(() => {
                                  const totalAmount = req.billing?.amount || 0;
                                  const paidAmount = req.billing?.paidAmount || 0;
                                  const remainingAmount = totalAmount - paidAmount;
                                  
                                  console.log('🔍 Payment button check for bill:', {
                                    requestId: req._id,
                                    patientName: req.patientName,
                                    status: req.status,
                                    billing: req.billing,
                                    totalAmount,
                                    paidAmount,
                                    remainingAmount,
                                    billingStatus: req.billing?.status,
                                    shouldShowButton: remainingAmount > 0,
                                    billingGenerated: req.status === 'Billing_Generated',
                                    hasRemainingAmount: remainingAmount > 0
                                  });
                                  
                                  // Always show payment button for billing generated bills
                                  // This allows you to record payments even if amounts seem wrong
                                  return (
                                    <button 
                                      onClick={() => openPaymentModal(req)} 
                                      className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 shadow-sm ${
                                        remainingAmount > 0
                                          ? (paidAmount > 0 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-emerald-600 text-white hover:bg-emerald-700')
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" /> 
                                      {remainingAmount > 0 
                                        ? (paidAmount > 0 ? 'Add Payment' : 'Record Payment')
                                        : 'View Payment'
                                      }
                                    </button>
                                  );
                                })()}
                                
                                <button 
                                  onClick={() => handleDownloadInvoice(req._id)} 
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                  <Download className="h-3 w-3 mr-1" /> Download Invoice
                                </button>
                              </>
                            )}
                                                                                     {ultraSafeRender(req.status) === 'Billing_Paid' && (
                              <>
                                <button 
                                  onClick={() => openBillModal(req)} 
                                  className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors duration-200"
                                >
                                  <FileText className="h-3 w-3 mr-1" /> View Invoice
                                </button>
                                <button 
                                  onClick={() => handleDownloadInvoice(req._id)} 
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                  <Download className="h-3 w-3 mr-1" /> Download Invoice
                                </button>
                              </>
                            )}
                            {ultraSafeRender(req.status) === 'Report_Sent' && (
                              <>
                                <button 
                                  onClick={() => openBillModal(req)} 
                                  className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors duration-200"
                                >
                                  <FileText className="h-3 w-3 mr-1" /> View Invoice
                                </button>
                                <button 
                                  onClick={() => handleDownloadInvoice(req._id)} 
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                  <Download className="h-3 w-3 mr-1" /> Download Invoice
                                </button>
                              </>
                            )}
                            {ultraSafeRender(req.status) === 'Completed' && (
                              <>
                                <button 
                                  onClick={() => openBillModal(req)} 
                                  className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors duration-200"
                                >
                                  <FileText className="h-3 w-3 mr-1" /> View Invoice
                                </button>
                                <button 
                                  onClick={() => handleDownloadInvoice(req._id)} 
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                >
                                  <Download className="h-3 w-3 mr-1" /> Download Invoice
                                </button>
                              </>
                            )}

                                                     </div>
                         </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-slate-400 mb-6">
                  <FileText className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">No billing requests found</h3>
                <p className="text-slate-600 mb-4 max-w-md mx-auto">
                  Billing requests will appear here when doctors create test requests. As a receptionist, you can handle the billing workflow for test requests.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Billing Workflow:</h4>
                  <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-blue-700">
                    <span className="bg-blue-100 px-2 py-1 rounded">Pending</span>
                    <span>→</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">Bill Pending</span>
                    <span>→</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">Bill Generated</span>
                    <span>→</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">Bill Paid & Verified</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Bill Generation Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Generate Invoice</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                      {ultraSafeRender(selected.patientName) || ultraSafeRender(selected.patientId?.name)} - {ultraSafeRender(selected.testType)}
                    </div>
                    <div className="text-sm text-slate-600 mt-2">
                      <span className="font-medium">Doctor:</span> {ultraSafeRender(selected.doctorName) || ultraSafeRender(selected.doctorId?.name)} | 
                      <span className="font-medium ml-2">Center:</span> {ultraSafeRender(selected.centerName)}
                    </div>
                  </div>
                  <button onClick={closeBillModal} className="p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
                    <X className="h-6 w-6 text-slate-600" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="text-left text-sm font-semibold text-slate-600 border-b border-slate-200">
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Qty</th>
                          <th className="py-3 px-4">Unit Price</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((it, idx) => (
                          <tr key={idx} className="text-sm hover:bg-slate-50 transition-colors duration-150">
                            <td className="py-3 px-4">
                              <input 
                                className={`w-full border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${!it.name ? 'border-red-300 focus:ring-red-500' : ''}`} 
                                value={it.name} 
                                onChange={(e) => updateItem(idx, { name: e.target.value })} 
                                placeholder="Item name *" 
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input 
                                className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                value={it.code} 
                                onChange={(e) => updateItem(idx, { code: e.target.value })} 
                                placeholder="Code (optional)" 
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input 
                                type="number" 
                                className="w-24 border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                value={it.quantity} 
                                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} 
                                min={1} 
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input 
                                type="number" 
                                className={`w-32 border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${!it.unitPrice || it.unitPrice <= 0 ? 'border-red-300 focus:ring-red-500' : ''}`} 
                                value={it.unitPrice} 
                                onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} 
                                min={0} 
                                step="0.01" 
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{currencySymbol}{(Number(it.quantity || 0) * Number(it.unitPrice || 0)).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => removeItem(idx)} 
                                className="text-red-600 text-sm hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors duration-200"
                                disabled={items.length === 1}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={addItem} className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors duration-200">
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Taxes</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        value={taxes} 
                        onChange={(e) => setTaxes(Number(e.target.value))} 
                        min={0} 
                        step="0.01" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Discounts</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        value={discounts} 
                        onChange={(e) => setDiscounts(Number(e.target.value))} 
                        min={0} 
                        step="0.01" 
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3">
                        <div className="text-sm text-slate-600">Grand Total</div>
                        <div className="text-2xl font-bold text-slate-800">{currencySymbol}{grandTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                    <textarea 
                      className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      rows={3} 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Optional notes for the invoice..." 
                    />
                                         <p className="text-sm text-slate-500 mt-2">
                       After generating the bill, the test request will be ready for payment recording. Once payment is recorded, it will be marked as "Payment Received" and await center admin verification before proceeding to lab processing.
                     </p>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="text-sm text-slate-600">
                    <p className="flex items-center mb-1">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Bill will be generated with a unique invoice number
                    </p>
                    <p className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Test request status will change to "Billing Generated"
                    </p>
                  </div>
                                     <div className="flex items-center gap-3">
                     <button 
                       onClick={closeBillModal} 
                       className="px-4 py-2 text-sm rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors duration-200 font-medium"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleGenerate} 
                       disabled={loading} 
                       className="px-6 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 font-medium shadow-sm"
                     >
                       {loading ? 'Generating...' : 'Save Bill'}
                     </button>
                     {selected?.billing?.invoiceNumber && (
                       <button 
                         onClick={() => handleDownloadInvoice(selected._id)} 
                         className="px-6 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm"
                       >
                         <Download className="h-4 w-4 mr-2 inline" />
                         Download Invoice
                       </button>
                     )}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Payment Recording Modal */}
          {showPaymentModal && selectedForPayment && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-lg flex flex-col">
                <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                  <div>
                    <div className="text-sm text-slate-500">Record Payment</div>
                    <div className="font-semibold text-slate-800">
                      {ultraSafeRender(selectedForPayment.patientName) || ultraSafeRender(selectedForPayment.patientId?.name)} - {ultraSafeRender(selectedForPayment.testType)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Amount: {currencySymbol}{selectedForPayment.billing?.amount?.toFixed(2) || '0.00'} | Center: {ultraSafeRender(selectedForPayment.centerName)}
                    </div>
                  </div>
                  <button onClick={closePaymentModal} className="p-1 rounded hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {/* Payment Amount Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3">Payment Amount</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Total Bill Amount</label>
                        <div className="text-lg font-bold text-slate-800">
                          {currencySymbol}{selectedForPayment.billing?.amount?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Already Paid</label>
                        <div className="text-lg font-bold text-green-600">
                          {currencySymbol}{(selectedForPayment.billing?.paidAmount || 0).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Remaining Balance</label>
                        <div className="text-lg font-bold text-orange-600">
                          {currencySymbol}{((selectedForPayment.billing?.amount || 0) - (selectedForPayment.billing?.paidAmount || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={paymentDetails.paymentMethod}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        required
                      >
                        <option value="">Select payment method</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card (Credit/Debit)</option>
                        <option value="UPI">UPI</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Transaction ID <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter transaction ID or reference number"
                        value={paymentDetails.transactionId}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Payment History */}
                  {(() => {
                    const partialData = getPartialPaymentData(selectedForPayment._id);
                    const totalPaidFromStorage = partialData.totalPaid;
                    const actualRemainingAmount = (selectedForPayment.billing?.amount || 0) - Math.max((selectedForPayment.billing?.paidAmount || 0), totalPaidFromStorage);
                    
                    return (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Payment Summary
                        </label>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Total Amount:</span>
                            <span className="font-medium">{currencySymbol}{(selectedForPayment.billing?.amount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Already Paid:</span>
                            <span className="font-medium text-green-600">{currencySymbol}{Math.max((selectedForPayment.billing?.paidAmount || 0), totalPaidFromStorage).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span className="text-slate-600">Remaining:</span>
                            <span className="font-medium text-orange-600">{currencySymbol}{actualRemainingAmount.toFixed(2)}</span>
                          </div>
                          
                          {/* Enhanced Payment History */}
                          {partialData.payments.length > 0 && (
                            <div className="mt-3 pt-2 border-t">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-slate-700">Payment History ({partialData.paymentCount} payments):</p>
                                <span className="text-xs text-slate-500">Total: {currencySymbol}{partialData.totalPaid.toFixed(2)}</span>
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                {partialData.payments.map((payment, index) => (
                                  <div key={payment.id || index} className="bg-white rounded-lg border border-slate-200 p-2">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs font-medium text-slate-700">
                                            Payment #{index + 1}
                                          </span>
                                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                            payment.status === 'recorded' ? 'bg-blue-100 text-blue-800' :
                                            payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {payment.status || 'recorded'}
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">
                                          {new Date(payment.timestamp).toLocaleString()} - {payment.method}
                                        </div>
                                        {payment.transactionId && (
                                          <div className="text-xs text-slate-500 mt-1">
                                            ID: {payment.transactionId}
                                          </div>
                                        )}
                                        {payment.notes && (
                                          <div className="text-xs text-slate-500 mt-1 italic">
                                            "{payment.notes}"
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-bold text-green-600">
                                          {currencySymbol}{payment.amount.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                          by {payment.recordedBy || 'Receptionist'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter payment amount"
                        value={paymentDetails.paymentAmount}
                        onChange={(e) => {
                          const partialData = getPartialPaymentData(selectedForPayment._id);
                          const totalPaidFromStorage = partialData.totalPaid;
                          const actualRemainingAmount = (selectedForPayment.billing?.amount || 0) - Math.max((selectedForPayment.billing?.paidAmount || 0), totalPaidFromStorage);
                          
                          setPaymentDetails(prev => ({ 
                            ...prev, 
                            paymentAmount: parseFloat(e.target.value) || 0,
                            isPartialPayment: parseFloat(e.target.value) < actualRemainingAmount
                          }));
                        }}
                        min="0.01"
                        max={(() => {
                          const partialData = getPartialPaymentData(selectedForPayment._id);
                          const totalPaidFromStorage = partialData.totalPaid;
                          return (selectedForPayment.billing?.amount || 0) - Math.max((selectedForPayment.billing?.paidAmount || 0), totalPaidFromStorage);
                        })()}
                        step="0.01"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const partialData = getPartialPaymentData(selectedForPayment._id);
                          const totalPaidFromStorage = partialData.totalPaid;
                          const actualRemainingAmount = (selectedForPayment.billing?.amount || 0) - Math.max((selectedForPayment.billing?.paidAmount || 0), totalPaidFromStorage);
                          
                          setPaymentDetails(prev => ({ 
                            ...prev, 
                            paymentAmount: actualRemainingAmount,
                            isPartialPayment: false
                          }));
                        }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                      >
                        Pay Full
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Maximum: {currencySymbol}{(() => {
                        const partialData = getPartialPaymentData(selectedForPayment._id);
                        const totalPaidFromStorage = partialData.totalPaid;
                        return ((selectedForPayment.billing?.amount || 0) - Math.max((selectedForPayment.billing?.paidAmount || 0), totalPaidFromStorage)).toFixed(2);
                      })()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Receipt Upload (Optional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="receipt-upload"
                        onChange={handleReceiptUpload}
                      />
                      <label 
                        htmlFor="receipt-upload"
                        className="flex items-center px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                      {paymentDetails.receiptUpload && (
                        <span className="text-sm text-slate-600 flex items-center">
                          <Receipt className="h-4 w-4 mr-1" />
                          {paymentDetails.receiptUpload instanceof File ? paymentDetails.receiptUpload.name : paymentDetails.receiptUpload}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Supported formats: PDF, JPG, JPEG, PNG
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Notes (Optional)
                    </label>
                    <textarea 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes about the payment..."
                      value={paymentDetails.paymentNotes}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentNotes: e.target.value }))}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Payment Workflow</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>1. Record payment details (you are here)</p>
                          <p>2. Payment will be marked as "Payment Received" or "Partially Paid"</p>
                          <p>3. Center admin must verify the payment</p>
                          <p>4. Once verified, test request proceeds to lab</p>
                          <p className="mt-2 font-medium text-blue-800">
                            {paymentDetails.paymentAmount > 0 && paymentDetails.paymentAmount < ((selectedForPayment.billing?.amount || 0) - (selectedForPayment.billing?.paidAmount || 0)) 
                              ? 'Partial Payment: Patient can pay remaining amount later'
                              : 'Full Payment: Complete payment for this bill'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scroll indicator */}
                  <div className="text-center py-2">
                    <div className="text-xs text-slate-400 flex items-center justify-center">
                      <div className="w-6 h-0.5 bg-slate-300 rounded-full mr-2"></div>
                      Scroll to see all fields
                      <div className="w-6 h-0.5 bg-slate-300 rounded-full ml-2"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t flex items-center justify-between flex-shrink-0 bg-white">
                  <div className="text-xs text-slate-500">
                    <p>• Payment will be recorded and status updated accordingly</p>
                    <p>• Center admin must verify the payment before proceeding to lab</p>
                    <p>• Test request cannot proceed to lab without center admin verification</p>
                    {paymentDetails.paymentAmount > 0 && paymentDetails.paymentAmount < ((selectedForPayment.billing?.amount || 0) - (selectedForPayment.billing?.paidAmount || 0)) && (
                      <p className="text-purple-600 font-medium">• Partial payment: Patient can pay remaining amount later</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={closePaymentModal} className="px-3 py-2 text-sm rounded bg-slate-100 hover:bg-slate-200">Cancel</button>
                    <button 
                      onClick={handleMarkPaid} 
                      disabled={!paymentDetails.paymentMethod || !paymentDetails.transactionId || !paymentDetails.paymentAmount || paymentDetails.paymentAmount <= 0}
                      className={`px-3 py-2 text-sm rounded text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                        paymentDetails.paymentAmount > 0 && paymentDetails.paymentAmount < ((selectedForPayment.billing?.amount || 0) - (selectedForPayment.billing?.paidAmount || 0))
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {paymentDetails.paymentAmount > 0 && paymentDetails.paymentAmount < ((selectedForPayment.billing?.amount || 0) - (selectedForPayment.billing?.paidAmount || 0))
                        ? 'Record Partial Payment'
                        : 'Record Payment'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReceptionistLayout>
      );
    } catch (error) {
      console.error('Error rendering billing component:', error);
      return (
        <ReceptionistLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Rendering Error</h2>
                <p className="text-red-700 mb-4">An error occurred while rendering the billing page.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </ReceptionistLayout>
      );
    }
  };

  return renderContent();
}



