import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchReceptionistPatients } from '../../features/receptionist/receptionistThunks';
import { updatePatient } from '../../features/receptionist/receptionistSlice';
import ReceptionistLayout from './ReceptionistLayout';
import PendingBillsNotification from '../../components/PendingBillsNotification';
// InvoiceDisplay component removed - now integrated inline
import { 
  Users, 
  Search, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  Plus,
  Receipt,
  UserCheck,
  X,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Calendar,
  CreditCard,
  Settings,
  UserPlus,
  Bell,
  Edit3,
  Trash2,
  Ban,
  RotateCcw,
  Calculator,
  FileCheck,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../services/api';

export default function ConsultationBilling() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { patients, loading } = useSelector((state) => state.receptionist);
  const { user } = useSelector((state) => state.auth);

  // Center information state
  const [centerInfo, setCenterInfo] = useState({
    name: 'Chanre Hospital',
    address: 'Rajajinagar, Bengaluru',
    phone: '08040810611',
    fax: '080-42516600',
    website: 'www.chanreallergy.com',
    labWebsite: 'www.chanrelabresults.com',
    missCallNumber: '080-42516666',
    mobileNumber: '9686197153'
  });
  
  // Invoice creation time state
  const [invoiceCreationTime, setInvoiceCreationTime] = useState(null);

  // Function to get center ID
  const getCenterId = () => {
    if (!user) return null;
    
    if (user.centerId) {
      if (typeof user.centerId === 'object' && user.centerId._id) {
        return user.centerId._id;
      }
      return user.centerId;
    }
    
    // Try to get from localStorage
    const storedCenterId = localStorage.getItem('centerId');
    if (storedCenterId) {
      return storedCenterId;
    }
    
    return null;
  };

  // Fetch center information
  const fetchCenterInfo = async () => {
    const centerId = getCenterId();
    if (centerId) {
      try {
        const response = await API.get(`/centers/${centerId}`);
        const center = response.data;
        
        setCenterInfo({
          name: center.name || 'Chanre Hospital',
          address: center.address || 'Rajajinagar, Bengaluru',
          phone: center.phone || '08040810611',
          fax: center.fax || '080-42516600',
          website: center.website || 'www.chanreallergy.com',
          labWebsite: center.labWebsite || 'www.chanrelabresults.com',
          missCallNumber: center.missCallNumber || '080-42516666',
          mobileNumber: center.mobileNumber || '9686197153'
        });
      } catch (error) {
        console.error('Error fetching center info:', error);
        // Keep default values if API fails
      }
    }
  };

  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [finalFilteredPatients, setFinalFilteredPatients] = useState([]);
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [searchField, setSearchField] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);

  // Patient selection and workflow states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPendingBillsNotification, setShowPendingBillsNotification] = useState(false);

  // NEW WORKFLOW STATES
  // Step 1: Create Invoice
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    registrationFee: 150,
    consultationFee: 850,
    serviceCharges: [{ name: '', amount: '', description: '' }],
    notes: '',
    taxPercentage: 0,
    discountPercentage: 0
  });

  // Step 2: Invoice Preview & Payment
  const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentType: 'full', // full or partial
    notes: '',
    appointmentTime: '',
    consultationType: 'OP' // OP, IP, or followup
  });

  // Step 3: Bill Management
  const [showCancelBillModal, setShowCancelBillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundData, setRefundData] = useState({
    amount: '',
    refundMethod: 'cash',
    reason: '',
    notes: ''
  });

  // Invoice editing states
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editedInvoiceData, setEditedInvoiceData] = useState(null);

  // Invoice data for InvoiceDisplay component
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
    fetchCenterInfo(); // Fetch center information when component mounts
  }, [dispatch]);

  // Removed auto-selection logic for reassigned patients

  // Primary search filter - show both regular and reassigned patients separately
  useEffect(() => {
    let filtered = [];
    
    // Add regular patients (including original patients who have been reassigned)
    const regularPatients = patients.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.uhId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Include all patients (both regular and reassigned) as regular entries
      return matchesSearch;
    });
    
    // Only show regular patients (no reassigned patients on this page)
    filtered = regularPatients;
    setFilteredPatients(filtered);
    setShowSubSearch(filtered.length > 0 && searchTerm.trim() !== '');
    setCurrentPage(1); // Reset to first page when search changes
  }, [patients, searchTerm]);

  // Sub-search filter - simplified without reassignment logic
  useEffect(() => {
    let subFiltered = filteredPatients.filter(patient => {
      if (!subSearchTerm) return true;
      
      const searchLower = subSearchTerm.toLowerCase();
      
      switch (searchField) {
        case 'name':
          return patient.name?.toLowerCase().includes(searchLower);
        case 'email':
          return patient.email?.toLowerCase().includes(searchLower);
        case 'phone':
          return patient.phone?.toLowerCase().includes(searchLower);
        case 'uhId':
          return patient.uhId?.toLowerCase().includes(searchLower);
        case 'assignedDoctor':
          return patient.assignedDoctor?.name?.toLowerCase().includes(searchLower);
        case 'status':
          const status = getPatientStatus(patient);
          return status.toLowerCase().includes(searchLower);
        case 'all':
        default:
          return patient.name?.toLowerCase().includes(searchLower) ||
                 patient.email?.toLowerCase().includes(searchLower) ||
                 patient.phone?.toLowerCase().includes(searchLower) ||
                 patient.uhId?.toLowerCase().includes(searchLower) ||
                 patient.assignedDoctor?.name?.toLowerCase().includes(searchLower) ||
                 getPatientStatus(patient).toLowerCase().includes(searchLower);
      }
    });
    
    setFinalFilteredPatients(subFiltered);
    setCurrentPage(1); // Reset to first page when sub-search changes
  }, [filteredPatients, subSearchTerm, searchField]);

  // Removed reassignment-related helper functions

  // NEW WORKFLOW STATUS LOGIC
  const getPatientStatus = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return { status: 'No Invoice', color: 'text-red-600 bg-red-100', icon: <FileText className="h-4 w-4" /> };
    }

    // Check if any bills are cancelled
    const hasCancelledBills = patient.billing.some(bill => bill.status === 'cancelled');
    if (hasCancelledBills) {
      return { status: 'Bill Cancelled', color: 'text-red-600 bg-red-100', icon: <Ban className="h-4 w-4" /> };
    }

    // Check if any bills have refunds
    const hasRefundedBills = patient.billing.some(bill => bill.status === 'refunded');
    if (hasRefundedBills) {
      return { status: 'Refunded', color: 'text-orange-600 bg-orange-100', icon: <RotateCcw className="h-4 w-4" /> };
    }

    // Check payment statuses
    const consultationFee = patient.billing.find(bill => 
      bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
    );
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    const serviceCharges = patient.billing.filter(bill => bill.type === 'service');

    const getPaymentStatus = (bill) => {
      if (!bill) return { paidAmount: 0, status: 'unpaid', totalAmount: 0 };
      const paidAmount = bill.paidAmount || 0;
      const totalAmount = bill.amount || 0;
      
      // Check if the bill was originally marked as partial in the database
      if (bill.status === 'partial' || (paidAmount > 0 && paidAmount < totalAmount)) {
        return { paidAmount, status: 'partial', totalAmount };
      }
      if (paidAmount >= totalAmount && totalAmount > 0) return { paidAmount, status: 'paid', totalAmount };
      if (paidAmount > 0) return { paidAmount, status: 'partial', totalAmount };
      return { paidAmount, status: 'unpaid', totalAmount };
    };

    const consultationPayment = getPaymentStatus(consultationFee);
    const registrationPayment = getPaymentStatus(registrationFee);
    const servicePayments = serviceCharges.map(s => getPaymentStatus(s));

    // Check if all services are paid
    const allServiceChargesPaid = servicePayments.length === 0 || servicePayments.every(p => p.status === 'paid');
    const hasPartialServiceCharges = servicePayments.some(p => p.status === 'partial');
    const hasUnpaidServiceCharges = servicePayments.some(p => p.status === 'unpaid');
    const hasServiceCharges = serviceCharges.length > 0;

    // Determine if patient is new (within 24 hours)
    const isNewPatient = isPatientNew(patient);

    // Check if registration fee is required (new patients only)
    if (isNewPatient && !registrationFee) {
      return { status: 'Registration Required', color: 'text-purple-600 bg-purple-100', icon: <UserPlus className="h-4 w-4" /> };
    }
    
    // Check if consultation fee is required
    if (!consultationFee) {
      return { status: 'Consultation Required', color: 'text-blue-600 bg-blue-100', icon: <DollarSign className="h-4 w-4" /> };
    }

    // Check payment statuses
    const needsConsultationPayment = consultationPayment.status === 'unpaid';
    const needsPartialConsultationPayment = consultationPayment.status === 'partial';
    const needsRegistrationPayment = registrationFee && registrationPayment.status === 'unpaid';
    const needsPartialRegistrationPayment = registrationFee && registrationPayment.status === 'partial';

    if (needsConsultationPayment || needsRegistrationPayment) {
      return { status: 'Pending Payment', color: 'text-orange-600 bg-orange-100', icon: <Clock className="h-4 w-4" /> };
    }

    if (needsPartialConsultationPayment || needsPartialRegistrationPayment || hasPartialServiceCharges) {
      return { status: 'Partial Payment', color: 'text-yellow-600 bg-yellow-100', icon: <CreditCard className="h-4 w-4" /> };
    }

    if (hasServiceCharges && hasUnpaidServiceCharges) {
      return { status: 'Service Charges Pending', color: 'text-green-600 bg-green-100', icon: <Settings className="h-4 w-4" /> };
    }
    
    // Check if there are any partial payments
    const hasPartialPayments = consultationPayment.status === 'partial' || 
                              (registrationFee && registrationPayment.status === 'partial') ||
                              hasPartialServiceCharges;
    
    // All payments completed (fully paid, not partial)
    const allPaid = consultationPayment.status === 'paid' && 
                  (registrationFee ? registrationPayment.status === 'paid' : true) &&
                  allServiceChargesPaid &&
                  !hasPartialPayments;
    
    if (allPaid) {
      return { status: 'Fully Paid', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-4 w-4" /> };
    }

    return { status: 'Processing', color: 'text-gray-600 bg-gray-100', icon: <Clock className="h-4 w-4" /> };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'All Paid': return 'text-green-600 bg-green-100';
      case 'Consultation Pending Payment': return 'text-blue-600 bg-blue-100';
      case 'Registration Pending Payment': return 'text-blue-600 bg-blue-100';
      case 'Service Charges Pending': return 'text-orange-600 bg-orange-100';
      case 'Service Charges Partial': return 'text-orange-600 bg-orange-100';
      case 'Consultation Partial Payment': return 'text-yellow-600 bg-yellow-100';
      case 'Registration Partial Payment': return 'text-yellow-600 bg-yellow-100';
      case 'Partial Payment Received': return 'text-yellow-600 bg-yellow-100';
      case 'Consultation Fee Required': return 'text-red-600 bg-red-100';
      case 'Registration Fee Required': return 'text-red-600 bg-red-100';
      case 'Invoice Required': return 'text-red-600 bg-red-100';
      case 'Pending Payment': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'All Paid': return <CheckCircle className="h-4 w-4" />;
      case 'Consultation Pending Payment': return <DollarSign className="h-4 w-4" />;
      case 'Registration Pending Payment': return <UserPlus className="h-4 w-4" />;
      case 'Service Charges Pending': return <Clock className="h-4 w-4" />;
      case 'Service Charges Partial': return <Clock className="h-4 w-4" />;
      case 'Consultation Partial Payment': return <CreditCard className="h-4 w-4" />;
      case 'Registration Partial Payment': return <CreditCard className="h-4 w-4" />;
      case 'Partial Payment Received': return <CreditCard className="h-4 w-4" />;
      case 'Consultation Fee Required': return <AlertCircle className="h-4 w-4" />;
      case 'Registration Fee Required': return <UserPlus className="h-4 w-4" />;
      case 'Invoice Required': return <FileText className="h-4 w-4" />;
      case 'Pending Payment': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Helper function to check if patient is new (within 24 hours)
  const isPatientNew = (patient) => {
    const registrationDate = new Date(patient.createdAt);
    const now = new Date();
    const hoursDifference = (now - registrationDate) / (1000 * 60 * 60);
    return hoursDifference <= 24;
  };

  // NEW WORKFLOW FUNCTIONS

  // Step 1: Create Invoice
  const handleCreateInvoice = (patient) => {
    setSelectedPatient(patient);
    const isNew = isPatientNew(patient);
    
    // Set invoice creation time
    setInvoiceCreationTime(new Date());
    
    // Pre-populate form based on patient status
    setInvoiceFormData({
      registrationFee: isNew ? 150 : 0,
      consultationFee: 850,
      serviceCharges: [{ name: '', amount: '', description: '' }],
      notes: `Invoice for ${patient.name}`,
      taxPercentage: 0,
      discountPercentage: 0
    });
    
    setShowCreateInvoiceModal(true);
  };

  const handleInvoiceFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const invoiceData = {
        patientId: selectedPatient._id,
        doctorId: selectedPatient.assignedDoctor?._id || selectedPatient.assignedDoctor,
        registrationFee: invoiceFormData.registrationFee,
        consultationFee: invoiceFormData.consultationFee,
        serviceCharges: invoiceFormData.serviceCharges.filter(s => s.name && s.amount),
        notes: invoiceFormData.notes,
        taxPercentage: invoiceFormData.taxPercentage,
        discountPercentage: invoiceFormData.discountPercentage
      };

      console.log('Creating invoice:', invoiceData);

      const response = await API.post('/billing/create-invoice', invoiceData);
      
      if (response.data.success) {
        toast.success('Invoice created successfully!');
        setGeneratedInvoice(response.data.invoice);
        setShowCreateInvoiceModal(false);
        setShowInvoicePreviewModal(true);
        
        // Refresh patient data
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  // Step 2: Payment Processing
  const handleProcessPayment = (invoice) => {
    setGeneratedInvoice(invoice);
    
    // Calculate total amount for payment
    const totalAmount = invoice.totals?.total || 0;
    
    setPaymentData({
      amount: totalAmount.toString(),
      paymentMethod: 'cash',
      paymentType: 'full',
      notes: ''
    });
    
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('No patient selected');
      return;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      // Get invoice number from generatedInvoice or from patient's billing
      const invoiceNumber = generatedInvoice?.invoiceNumber || selectedPatient.billing?.[0]?.invoiceNumber || `INV-${selectedPatient._id.toString().slice(-6)}`;
      
      const paymentPayload = {
        patientId: selectedPatient._id,
        invoiceId: invoiceNumber,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        notes: paymentData.notes,
        appointmentTime: paymentData.appointmentTime,
        consultationType: paymentData.consultationType
      };

      console.log('Processing payment:', paymentPayload);
      console.log('Selected patient before payment:', selectedPatient);

      const response = await API.post('/billing/process-payment', paymentPayload);
      
      console.log('Payment response:', response.data);
      
      if (response.data.success) {
        toast.success('Payment processed successfully!');
        setShowPaymentModal(false);
        setShowInvoicePreviewModal(false);
        
        // Clear payment data
        setPaymentData({
          amount: '',
          paymentMethod: 'cash',
          paymentType: 'partial',
          notes: '',
          appointmentTime: '',
          consultationType: 'OP'
        });
        
        // Update the specific patient in Redux store with the returned data
        if (response.data.patient) {
          console.log('Updating patient in Redux store:', response.data.patient);
          dispatch(updatePatient(response.data.patient));
        }
        
        // Also refresh the entire patient list to ensure consistency
        console.log('Refreshing patient list...');
        await dispatch(fetchReceptionistPatients());
        console.log('Patient list refreshed');
      } else {
        toast.error(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

  // Step 3: Bill Management
  const handleCancelBill = (patient) => {
    setSelectedPatient(patient);
    setCancelReason('');
    setShowCancelBillModal(true);
  };

  const handleCancelBillSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const cancelPayload = {
        patientId: selectedPatient._id,
        reason: cancelReason.trim(),
        initiateRefund: true // Auto-initiate refund if payment was made
      };

      console.log('Cancelling bill:', cancelPayload);

      const response = await API.post('/billing/cancel-bill', cancelPayload);
      
      if (response.data.success) {
        toast.success('Bill cancelled successfully!');
        
        if (response.data.refundInitiated) {
          toast.info('Refund process has been initiated');
        }
        
        setShowCancelBillModal(false);
        
        // Refresh patient data
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to cancel bill');
      }
    } catch (error) {
      console.error('Error cancelling bill:', error);
      toast.error('Failed to cancel bill');
    }
  };

  const handleProcessRefund = (patient) => {
    setSelectedPatient(patient);
    
    // Get total paid amount for refund
    const totalPaid = patient.billing.reduce((sum, bill) => {
      return sum + (bill.paidAmount || 0);
    }, 0);
    
    setRefundData({
      amount: totalPaid.toString(),
      refundMethod: 'cash',
      reason: '',
      notes: ''
    });
    
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !refundData.reason.trim()) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      const refundPayload = {
        patientId: selectedPatient._id,
        amount: parseFloat(refundData.amount),
        refundMethod: refundData.refundMethod,
        reason: refundData.reason.trim(),
        notes: refundData.notes
      };

      console.log('Processing refund:', refundPayload);

      const response = await API.post('/billing/process-refund', refundPayload);
      
      if (response.data.success) {
        toast.success('Refund processed successfully!');
        setShowRefundModal(false);
        
        // Refresh patient data
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const getConsultationFeeDetails = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return null;
    }

    // Find any consultation fee
    const consultationFee = patient.billing.find(bill => {
      const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      return isConsultationFee;
    });

    if (!consultationFee) {
      return null;
    }

    return {
      amount: consultationFee.amount,
      status: consultationFee.status,
      paidBy: consultationFee.paidBy,
      paidAt: consultationFee.paidAt || consultationFee.createdAt,
      paymentMethod: consultationFee.paymentMethod,
      description: consultationFee.description,
      invoiceNumber: consultationFee.invoiceNumber
    };
  };

  const getRegistrationFeeDetails = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return null;
    }

    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    return registrationFee ? {
      amount: registrationFee.amount,
      status: registrationFee.status,
      paidBy: registrationFee.paidBy,
      paidAt: registrationFee.paidAt || registrationFee.createdAt,
      paymentMethod: registrationFee.paymentMethod,
      description: registrationFee.description,
      invoiceNumber: registrationFee.invoiceNumber
    } : null;
  };

  const getServiceChargesDetails = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return [];
    }
    
    const serviceBills = patient.billing.filter(bill => bill.type === 'service');

    return serviceBills.map(bill => ({
      amount: bill.amount,
      status: bill.status,
      paidBy: bill.paidBy,
      paidAt: bill.paidAt || bill.createdAt,
      paymentMethod: bill.paymentMethod,
      description: bill.description,
      serviceDetails: bill.serviceDetails,
      invoiceNumber: bill.invoiceNumber
    }));
  };

  // New helper function to get outstanding payments for a patient
  const getOutstandingPayments = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return { totalOutstanding: 0, breakdown: {} };
    }

    let totalOutstanding = 0;
    const breakdown = {
      consultation: 0,
      registration: 0,
      services: 0
    };

    // Check consultancy fee
    const consultationFee = patient.billing.find(bill => {
      const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      return isConsultationFee;
    });
    
    if (consultationFee) {
      const consultationAmount = parseFloat(consultationFee.amount) || 0;
      const consultationPaid = parseFloat(consultationFee.paidAmount) || 0;
      const outstanding = consultationAmount - consultationPaid;
      if (outstanding > 0) {
        breakdown.consultation = outstanding;
        totalOutstanding += outstanding;
      }
    }

    // Check registration fee
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    if (registrationFee) {
      const registrationAmount = parseFloat(registrationFee.amount) || 0;
      const registrationPaid = parseFloat(registrationFee.paidAmount) || 0;
      const outstanding = registrationAmount - registrationPaid;
      if (outstanding > 0) {
        breakdown.registration = outstanding;
        totalOutstanding += outstanding;
      }
    }

    // Check service charges
    const serviceBills = patient.billing.filter(bill => bill.type === 'service');
    let serviceOutstanding = 0;
    serviceBills.forEach(service => {
      const serviceAmount = parseFloat(service.amount) || 0;
      const servicePaid = parseFloat(service.paidAmount) || 0;
      const outstanding = serviceAmount - servicePaid;
      if (outstanding > 0) {
        serviceOutstanding += outstanding;
      }
    });
    
    if (serviceOutstanding > 0) {
      breakdown.services = serviceOutstanding;
      totalOutstanding += serviceOutstanding;
    }

    return { totalOutstanding, breakdown };
  };

  // Pagination logic
  const totalPages = Math.ceil(finalFilteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = finalFilteredPatients.slice(startIndex, endIndex);

  // Helper functions
  const clearAllSearches = () => {
    setSearchTerm('');
    setSubSearchTerm('');
    setSearchField('all');
    setShowSubSearch(false);
    setCurrentPage(1);
  };

  const clearSubSearch = () => {
    setSubSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePatientsPerPageChange = (newPerPage) => {
    setPatientsPerPage(parseInt(newPerPage));
    setCurrentPage(1); // Reset to first page when changing per page
  };

  const handleCreateConsultationBill = (patient) => {
    setSelectedPatient(patient);
    setPaymentData({
      amount: '850', // Default consultation fee (OP rate)
      notes: `Doctor consultation fee for ${patient.name}`
    });
    setShowConsultationModal(true);
  };

  const handleRecordPayment = (patient) => {
    setSelectedPatient(patient);
    
    // Get outstanding payments to pre-populate amount
    const outstanding = getOutstandingPayments(patient);
    const suggestedAmount = outstanding.totalOutstanding > 0 ? outstanding.totalOutstanding : '';
    
    // Create a mock invoice object for payment processing
    const mockInvoice = {
      invoiceNumber: patient.billing?.[0]?.invoiceNumber || `INV-${patient._id.toString().slice(-6)}`,
      patientId: patient._id,
      total: outstanding.totalAmount,
      paid: outstanding.totalPaid,
      outstanding: outstanding.totalOutstanding
    };
    
    // Set the generated invoice for payment processing
    setGeneratedInvoice(mockInvoice);
    
    setPaymentData({
      amount: suggestedAmount.toString(),
      paymentMethod: 'cash',
      paymentType: outstanding.totalOutstanding > 0 ? 'full' : 'partial',
      notes: '',
      appointmentTime: '',
      consultationType: 'OP'
    });
    setShowPaymentModal(true);
  };

  const handleRecordPartialPayment = (patient) => {
    setSelectedPatient(patient);
    
    // Get current payment details
    const consultationFee = getConsultationFeeDetails(patient);
    const registrationFee = getRegistrationFeeDetails(patient);
    const serviceCharges = getServiceChargesDetails(patient);
    
    setPartialPaymentData({
      consultationPaid: consultationFee?.status === 'paid' ? consultationFee.amount : '',
      registrationPaid: registrationFee?.status === 'paid' ? registrationFee.amount : '',
      servicePaid: serviceCharges.reduce((sum, s) => sum + (s.amount || 0), 0).toString(),
      totalPaid: '',
      paymentMethod: 'cash',
      notes: ''
    });
    setShowPartialPaymentModal(true);
  };

  const handleCreateRegistrationBill = (patient) => {
    setSelectedPatient(patient);
    setRegistrationData({
      registrationFee: '150',
      serviceCharges: '150',
      amount: '300',
      notes: `Registration fee and Service charges for new patient ${patient.name}`
    });
    setShowRegistrationModal(true);
  };

  const handleCreateServiceCharges = (patient) => {
    setSelectedPatient(patient);
    setServiceData({
      services: [{ name: '', amount: '', description: '', details: '' }],
      notes: ''
    });
    setShowServiceModal(true);
  };

  const handleGenerateInvoice = async (patient) => {
    try {
      // Always refresh invoice data to get the latest billing information
      console.log('🔄 Generating/Refreshing invoice for patient:', patient.name);
      
      const invoicePayload = {
        patientId: patient._id
      };
      
      // Use regular invoice endpoint for normal patients
      const response = await API.post('/billing/generate-invoice', invoicePayload);
      
      if (response.data.success) {
        console.log('✅ Invoice data loaded successfully');
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

  // Function to prepare invoice data for InvoiceDisplay component
  const prepareInvoiceData = (patient) => {
    if (!patient || !patient.billing || patient.billing.length === 0) {
      return null;
    }

    // Debug: Log doctor data to check specializations
    console.log('Patient assignedDoctor:', patient.assignedDoctor);
    console.log('Doctor specializations:', patient.assignedDoctor?.specializations);
    console.log('Doctor specializations type:', typeof patient.assignedDoctor?.specializations);
    console.log('Doctor specializations isArray:', Array.isArray(patient.assignedDoctor?.specializations));
    console.log('Doctor specialization (singular):', patient.assignedDoctor?.specialization);

    // Calculate totals
    const totalAmount = patient.billing.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const totalPaid = patient.billing.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    
    // Prepare service charges
    const serviceCharges = patient.billing
      .filter(bill => bill.type === 'service')
      .map(bill => ({
        name: bill.description || 'Service Charge',
        amount: bill.amount || 0,
        description: bill.description || 'Medical service provided'
      }));

    // Get registration and consultation fees
    const registrationFee = patient.billing.find(bill => bill.type === 'registration')?.amount || 0;
    const consultationFee = patient.billing.find(bill => 
      bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
    )?.amount || 0;

    return {
      patient: {
        name: patient.name,
        gender: patient.gender,
        age: patient.age,
        uhId: patient.uhId,
        fileNo: patient.uhId,
        phone: patient.phone,
        email: patient.email,
        address: patient.address
      },
      doctor: {
        name: patient.assignedDoctor?.name || 'Not Assigned',
        specializations: (() => {
          const doctor = patient.assignedDoctor;
          console.log('🔍 Processing specializations for doctor:', doctor?.name);
          console.log('🔍 Specializations value:', doctor?.specializations);
          console.log('🔍 Specializations type:', typeof doctor?.specializations);
          console.log('🔍 Is array:', Array.isArray(doctor?.specializations));
          
          // Handle array format
          if (doctor?.specializations && Array.isArray(doctor.specializations) && doctor.specializations.length > 0) {
            const result = doctor.specializations.join(', ');
            console.log('🔍 Using array format, result:', result);
            return result;
          }
          // Handle string format (comma-separated)
          if (doctor?.specializations && typeof doctor.specializations === 'string' && doctor.specializations.trim()) {
            console.log('🔍 Using string format, result:', doctor.specializations);
            return doctor.specializations;
          }
          // Handle singular specialization field
          if (doctor?.specialization) {
            console.log('🔍 Using singular specialization, result:', doctor.specialization);
            return doctor.specialization;
          }
          // Default fallback
          console.log('🔍 Using default fallback: General');
          return 'General';
        })()
      },
      registrationFee,
      consultationFee,
      serviceCharges,
      totals: {
        subtotal: totalAmount,
        discount: 0,
        tax: 0,
        total: totalAmount
      },
      invoiceNumber: patient.billing[0]?.invoiceNumber || `INV-${patient._id.slice(-6)}`,
      date: new Date(),
      generatedBy: user?.name || 'Receptionist',
      password: patient.uhId ? `${patient.uhId}${patient.gender?.charAt(0) || 'P'}` : 'N/A'
    };
  };

  // Refresh invoice data from API
  const refreshInvoiceData = async (patient) => {
    try {
      console.log('🔄 Refreshing invoice data for patient:', patient.name);
      
      const invoicePayload = {
        patientId: patient._id
      };
      
      // Use regular invoice endpoint for normal patients
      const response = await API.post('/billing/generate-invoice', invoicePayload);
      
      if (response.data.success) {
        console.log('✅ Invoice data refreshed successfully');
        setInvoiceData(response.data.invoice);
        return response.data.invoice;
      } else {
        console.error('❌ Failed to refresh invoice data');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refreshing invoice data:', error);
      return null;
    }
  };

  const handleEditInvoice = () => {
    setIsEditingInvoice(true);
    setEditedInvoiceData({
      ...invoiceData,
      tax: invoiceData.tax || 0,
      discount: invoiceData.discount || 0,
      taxPercentage: invoiceData.taxPercentage || 0,
      discountPercentage: invoiceData.discountPercentage || 0,
      notes: invoiceData.notes || ''
    });
  };

  const handleSaveInvoice = () => {
    // Calculate new totals with tax and discount
    const subtotal = editedInvoiceData.totals.total;
    const taxAmount = editedInvoiceData.taxPercentage > 0 
      ? (subtotal * editedInvoiceData.taxPercentage / 100)
      : editedInvoiceData.tax;
    const discountAmount = editedInvoiceData.discountPercentage > 0
      ? (subtotal * editedInvoiceData.discountPercentage / 100)
      : editedInvoiceData.discount;
    
    const finalTotal = subtotal + taxAmount - discountAmount;

    const updatedInvoice = {
      ...editedInvoiceData,
      tax: taxAmount,
      discount: discountAmount,
      subtotal: subtotal,
      finalTotal: finalTotal,
      totals: {
        ...editedInvoiceData.totals,
        subtotal: subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total: finalTotal
      }
    };

    setInvoiceData(updatedInvoice);
    setIsEditingInvoice(false);
    toast.success('Invoice updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditingInvoice(false);
    setEditedInvoiceData(null);
  };

  const handleUpdateMissingInvoiceNumbers = async () => {
    try {
      const response = await API.post('/billing/update-missing-invoice-numbers');
      
      if (response.data.success) {
        toast.success(`Updated ${response.data.updatedRecords} billing records with invoice numbers`);
        // Refresh the patient list to show updated invoice numbers
        fetchPatients();
      } else {
        toast.error('Failed to update invoice numbers');
      }
    } catch (error) {
      console.error('Error updating invoice numbers:', error);
      toast.error('Failed to update invoice numbers');
    }
  };

  const addServiceField = () => {
    setServiceData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', amount: '', description: '', details: '' }]
    }));
  };

  const removeServiceField = (index) => {
    setServiceData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateServiceField = (index, field, value) => {
    setServiceData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const handleConsultationFeeSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      // For regular patients, use assignedDoctor
      const currentDoctor = selectedPatient.assignedDoctor;
      
      const billData = {
        patientId: selectedPatient._id,
        doctorId: currentDoctor?._id || currentDoctor,
        amount: parseFloat(paymentData.amount),
        notes: paymentData.notes,
        // Create billing entry without marking as paid
        markAsPaid: false
      };

      console.log('🔍 Consultation fee bill data:', {
        patientId: billData.patientId,
        patientIdType: typeof billData.patientId,
        doctorId: billData.doctorId
      });

      // Creating consultation fee billing entry
      const response = await API.post('/billing/consultation-fee', billData);
      
      if (response.status === 201) {
        toast.success('Consultation fee billing entry created! Patient invoice is now available.');
        
        // Close modal immediately
        setShowConsultationModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated billing status
        console.log('🔄 Refreshing patient data after consultation fee creation');
        await dispatch(fetchReceptionistPatients());
        
        // Force a re-render by updating the search term slightly
        setSearchTerm(prev => prev + ' ');
        setTimeout(() => setSearchTerm(prev => prev.trim()), 100);
      } else {
        toast.error('Failed to create billing entry. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating consultation billing:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Failed to create consultation billing. Please try again.');
    }
  };


  const handlePartialPaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      // Record partial payment
      const partialPayload = {
        patientId: selectedPatient._id,
        payments: {
          consultation: parseFloat(partialPaymentData.consultationPaid) || 0,
          registration: parseFloat(partialPaymentData.registrationPaid) || 0,
          service: parseFloat(partialPaymentData.servicePaid) || 0
        },
        paymentMethod: partialPaymentData.paymentMethod,
        notes: partialPaymentData.notes
      };

      console.log('🔍 Recording partial payment:', partialPayload);

      // Record partial payment against billing entries
      const response = await API.post('/billing/record-partial-payment', partialPayload);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Partial payment recorded successfully! Invoice updated with remaining balance.');
        
        // Close modal immediately
        setShowPartialPaymentModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated payment status
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to record partial payment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error recording partial payment:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Failed to record partial payment. Please try again.');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const billData = {
        patientId: selectedPatient._id,
        registrationFee: parseFloat(registrationData.registrationFee),
        serviceCharges: parseFloat(registrationData.serviceCharges),
        amount: parseFloat(registrationData.amount),
        notes: registrationData.notes
      };

      const response = await API.post('/billing/registration-fee', billData);
      
      if (response.status === 201) {
        toast.success('Registration fee and service charges billing created successfully!');
        
        // Close modal immediately
        setShowRegistrationModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated payment status
        dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to create registration and service charges billing. Please try again.');
      }
    } catch (error) {
      console.error('Error creating registration fee and service charges:', error);
      toast.error('Failed to create registration fee and service charges billing. Please try again.');
    }
  };

  const handleServiceChargesSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    // Validate services
    const validServices = serviceData.services.filter(service => 
      service.name.trim() && service.amount && parseFloat(service.amount) > 0
    );

    if (validServices.length === 0) {
      toast.error('Please add at least one valid service');
      return;
    }

    try {
      // For regular patients, use assignedDoctor
      const currentDoctor = selectedPatient.assignedDoctor;
      
      const billData = {
        patientId: selectedPatient._id,
        doctorId: currentDoctor?._id || currentDoctor,
        services: validServices,
        notes: serviceData.notes
      };

      // Submitting service charges billing
      const response = await API.post('/billing/service-charges', billData);
      
      if (response.status === 201) {
        toast.success('Service charges billing created successfully!');
        
        // Close modal immediately
        setShowServiceModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated payment status
        dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to create service charges billing. Please try again.');
      }
    } catch (error) {
      console.error('Error creating service charges:', error);
      toast.error('Failed to create service charges billing. Please try again.');
    }
  };

  // NEW WORKFLOW STATS
  const getStats = () => {
    const totalPatients = patients.length;
    const noInvoice = patients.filter(p => !p.billing || p.billing.length === 0).length;
    const pendingPayment = patients.filter(p => {
      const status = getPatientStatus(p);
      return status.status === 'Pending Payment' || status.status === 'Partial Payment';
    }).length;
    const fullyPaid = patients.filter(p => {
      const status = getPatientStatus(p);
      return status.status === 'Fully Paid';
    }).length;
    const cancelledBills = patients.filter(p => {
      const status = getPatientStatus(p);
      return status.status === 'Bill Cancelled';
    }).length;
    const refunded = patients.filter(p => {
      const status = getPatientStatus(p);
      return status.status === 'Refunded';
    }).length;
    
    return { 
      totalPatients, 
      noInvoice, 
      pendingPayment, 
      fullyPaid, 
      cancelledBills, 
      refunded 
    };
  };

  const stats = getStats();

  // Helper function to convert numbers to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n) => {
      let result = '';
      if (n > 99) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n > 9) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    let result = '';
    let scaleIndex = 0;
    
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        const chunkWords = convertHundreds(chunk);
        result = chunkWords + scales[scaleIndex] + ' ' + result;
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }

    return result.trim();
  };

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  Consultation Billing Workflow
                </h1>
                <p className="text-slate-600 text-sm">
                  Create invoices, process payments, and manage billing with full tracking
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log('Manual pending bills check triggered');
                    setShowPendingBillsNotification(true);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  title="Check for pending bills"
                >
                  <Bell className="h-4 w-4" />
                  Pending Bills ({stats.pendingPayment})
                </button>
                <button
                  onClick={() => dispatch(fetchReceptionistPatients())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Reassignment functionality moved to separate page */}

          {/* NEW WORKFLOW STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                  <p className="text-lg font-bold text-slate-800">{stats.totalPatients}</p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">No Invoice</p>
                  <p className="text-lg font-bold text-red-600">{stats.noInvoice}</p>
                </div>
                <FileText className="h-6 w-6 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Pending Payment</p>
                  <p className="text-lg font-bold text-orange-600">{stats.pendingPayment}</p>
                </div>
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Fully Paid</p>
                  <p className="text-lg font-bold text-green-600">{stats.fullyPaid}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Cancelled</p>
                  <p className="text-lg font-bold text-red-600">{stats.cancelledBills}</p>
                </div>
                <Ban className="h-6 w-6 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Refunded</p>
                  <p className="text-lg font-bold text-orange-600">{stats.refunded}</p>
                </div>
                <RotateCcw className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                {/* Primary Search */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patients by name, email, phone, UH ID, assigned doctor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    />
                  </div>
                  {/* Reassigned filter removed - functionality moved to separate page */}
                  {(searchTerm || subSearchTerm) && (
                    <button
                      onClick={clearAllSearches}
                      className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Sub-search Panel */}
                {showSubSearch && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-medium text-slate-700">
                        Refine search in {filteredPatients.length} results:
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      >
                        <option value="all">All Fields</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="uhId">UH ID</option>
                        <option value="assignedDoctor">Assigned Doctor</option>
                        <option value="status">Status</option>
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder={`Search in ${searchField}...`}
                          value={subSearchTerm}
                          onChange={(e) => setSubSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                        />
                      </div>
                      {subSearchTerm && (
                        <button
                          onClick={clearSubSearch}
                          className="px-2 py-2 text-slate-500 hover:text-slate-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Reassigned filter removed - functionality moved to separate page */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-4 sm:p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <ReceiptIcon className="h-5 w-5 mr-2 text-blue-500" />
                Patient Billing Workflow
              </h2>
              <p className="text-slate-600 mt-1 text-xs">
                {finalFilteredPatients.length} patients total - Create invoices, process payments, manage billing
              </p>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600 text-xs">Loading patients...</p>
                </div>
              ) : finalFilteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-600 mb-2">No Patients Found</h3>
                  <p className="text-slate-500 text-xs">
                    {searchTerm || subSearchTerm ? 'No patients match your search criteria.' : 'No patients found in the system.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* NEW WORKFLOW TABLE */}
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">UH ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Appointment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Billing Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Workflow Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {currentPatients.map((patient) => {
                        const statusInfo = getPatientStatus(patient);
                        const hasBilling = patient.billing && patient.billing.length > 0;
                        const totalAmount = hasBilling ? patient.billing.reduce((sum, bill) => sum + (bill.amount || 0), 0) : 0;
                        const totalPaid = hasBilling ? patient.billing.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) : 0;
                        
                        return (
                          <tr key={patient._id} className="hover:bg-slate-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <Users className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                                  <div className="text-xs text-slate-500">{patient.age} years, {patient.gender}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-900">
                                <div>{patient.email || 'No email'}</div>
                                <div className="text-slate-500">{patient.phone || 'No phone'}</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-900">
                              {patient.uhId || 'No UH ID'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-900">
                                {patient.assignedDoctor?.name || 'Not Assigned'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-600 space-y-1">
                                {patient.appointmentTime ? (
                                  <>
                                    <div className="font-medium text-slate-900">
                                      {new Date(patient.appointmentTime).toLocaleDateString('en-GB')}
                                    </div>
                                    <div className="text-slate-500">
                                      {new Date(patient.appointmentTime).toLocaleTimeString('en-GB', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                      patient.appointmentStatus === 'viewed' ? 'bg-green-100 text-green-700' :
                                      patient.appointmentStatus === 'missed' ? 'bg-red-100 text-red-700' :
                                      patient.appointmentStatus === 'reassigned' ? 'bg-orange-100 text-orange-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {patient.appointmentStatus || 'scheduled'}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-slate-400">No appointment</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-600 space-y-1">
                                {hasBilling ? (
                                  <>
                                    <div className="font-medium">
                                      Total: ₹{totalAmount.toLocaleString()}
                                    </div>
                                    <div className="text-slate-500">
                                      Paid: ₹{totalPaid.toLocaleString()}
                                    </div>
                                    {totalAmount > totalPaid && (
                                      <div className="text-orange-600 font-medium">
                                        Due: ₹{(totalAmount - totalPaid).toLocaleString()}
                                </div>
                                      )}
                                    {patient.billing[0]?.invoiceNumber && (
                                      <div className="text-slate-400 text-xs">
                                        INV: {patient.billing[0].invoiceNumber}
                                        </div>
                                      )}
                                    </>
                                ) : (
                                  <span className="text-slate-400">No billing</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs font-medium">
                              <div className="flex items-center gap-1 flex-wrap">
                                {/* View Profile */}
                                <button
                                  onClick={() => navigate(`/dashboard/receptionist/profile/${patient._id}`)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                  title="View Profile"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                
                                {/* NEW WORKFLOW ACTIONS */}
                                
                                {/* Create Invoice - for patients without billing */}
                                {!hasBilling && (
                                <button
                                    onClick={() => handleCreateInvoice(patient)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Create Invoice"
                                  >
                                    <Calculator className="h-3 w-3" />
                                    Create Invoice
                                </button>
                                )}


                                {/* Record Payment - for pending payments */}
                                {(statusInfo.status === 'Pending Payment' || statusInfo.status === 'Partial Payment') && (
                                  <button
                                    onClick={() => handleRecordPayment(patient)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Record Payment"
                                  >
                                    <ReceiptIcon className="h-3 w-3" />
                                    Record Payment
                                  </button>
                                )}

                                {/* View Invoice - for patients with billing */}
                                {hasBilling && (
                                <button
                                    onClick={() => {
                                      setSelectedPatient(patient);
                                      const invoiceData = prepareInvoiceData(patient);
                                      if (invoiceData) {
                                        setInvoiceData(invoiceData);
                                      setShowInvoicePreviewModal(true);
                                      } else {
                                        toast.error('Unable to generate invoice data');
                                      }
                                    }}
                                    className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
                                    title="View Invoice"
                                  >
                                    <FileCheck className="h-4 w-4" />
                                </button>
                                )}

                                {/* Cancel Bill - for any patient with billing */}
                                {hasBilling && statusInfo.status !== 'Bill Cancelled' && statusInfo.status !== 'Refunded' && (
                                  <button
                                    onClick={() => handleCancelBill(patient)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Cancel Bill"
                                  >
                                    <Ban className="h-3 w-3" />
                                    Cancel
                                  </button>
                                )}

                                {/* Process Refund - for cancelled bills with payments */}
                                {statusInfo.status === 'Bill Cancelled' && totalPaid > 0 && (
                                    <button
                                    onClick={() => handleProcessRefund(patient)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Process Refund"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Refund
                                    </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 || finalFilteredPatients.length > 0 ? (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
                      {/* Left side - Results info and per page selector */}
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-700">
                          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(endIndex, finalFilteredPatients.length)}</span> of{' '}
                          <span className="font-medium">{finalFilteredPatients.length}</span> results
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-slate-700">Show:</label>
                          <select
                            value={patientsPerPage}
                            onChange={(e) => handlePatientsPerPageChange(e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span className="text-sm text-slate-700">per page</span>
                        </div>
                      </div>

                      {/* Right side - Page navigation */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">
                          Page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            Previous
                          </button>
                          
                          <button
                            onClick={() => handlePageChange(currentPage)}
                            className="px-3 py-1 text-sm border border-purple-500 rounded text-white bg-purple-500 font-medium"
                          >
                            {currentPage}
                          </button>
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NEW WORKFLOW MODALS */}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Create Invoice for {selectedPatient.name}
              </h3>
              <button
                onClick={() => setShowCreateInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleInvoiceFormSubmit} className="space-y-4">
              {/* Registration Fee */}
              {isPatientNew(selectedPatient) && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                    Registration Fee (₹)
                </label>
                <input
                  type="number"
                    value={invoiceFormData.registrationFee}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, registrationFee: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="150"
                />
              </div>
              )}

              {/* Consultation Fee */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  value={invoiceFormData.consultationFee}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, consultationFee: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="850"
                />
              </div>

              {/* Service Charges */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Service Charges
                </label>
                <div className="space-y-3">
                  {invoiceFormData.serviceCharges.map((service, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const newServices = [...invoiceFormData.serviceCharges];
                            newServices[index].name = e.target.value;
                            setInvoiceFormData({...invoiceFormData, serviceCharges: newServices});
                          }}
                          placeholder="Service name"
                          className="px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                        <input
                          type="number"
                          value={service.amount}
                          onChange={(e) => {
                            const newServices = [...invoiceFormData.serviceCharges];
                            newServices[index].amount = e.target.value;
                            setInvoiceFormData({...invoiceFormData, serviceCharges: newServices});
                          }}
                          placeholder="Amount"
                          className="px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                <button
                  type="button"
                          onClick={() => {
                            const newServices = invoiceFormData.serviceCharges.filter((_, i) => i !== index);
                            setInvoiceFormData({...invoiceFormData, serviceCharges: newServices});
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          <X className="h-4 w-4" />
                </button>
              </div>
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) => {
                          const newServices = [...invoiceFormData.serviceCharges];
                          newServices[index].description = e.target.value;
                          setInvoiceFormData({...invoiceFormData, serviceCharges: newServices});
                        }}
                        placeholder="Description"
                        className="w-full mt-2 px-2 py-1 border border-slate-200 rounded text-xs"
                      />
          </div>
                  ))}
              <button
                    type="button"
                    onClick={() => {
                      setInvoiceFormData({
                        ...invoiceFormData,
                        serviceCharges: [...invoiceFormData.serviceCharges, { name: '', amount: '', description: '' }]
                      });
                    }}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-green-400 hover:text-green-600 transition-colors text-xs"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Service Charge
              </button>
            </div>
            </div>

              {/* Tax and Discount */}
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                    Tax Percentage (%)
                </label>
                <input
                  type="number"
                    value={invoiceFormData.taxPercentage}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, taxPercentage: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="0"
                    min="0"
                    max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                    Discount Percentage (%)
                </label>
                  <input
                    type="number"
                    value={invoiceFormData.discountPercentage}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, discountPercentage: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({...invoiceFormData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Invoice Preview */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-700 mb-2">Invoice Preview</h4>
                <div className="space-y-1 text-xs">
                  {invoiceFormData.registrationFee > 0 && (
                    <div className="flex justify-between">
                      <span>Registration Fee:</span>
                      <span>₹{invoiceFormData.registrationFee}</span>
        </div>
      )}
                  <div className="flex justify-between">
                    <span>Consultation Fee:</span>
                    <span>₹{invoiceFormData.consultationFee}</span>
            </div>
                  {invoiceFormData.serviceCharges.filter(s => s.name && s.amount).map((service, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{service.name}:</span>
                      <span>₹{service.amount}</span>
            </div>
                  ))}
                  {(() => {
                    const subtotal = invoiceFormData.registrationFee + invoiceFormData.consultationFee + 
                      invoiceFormData.serviceCharges.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                    const taxAmount = subtotal * (invoiceFormData.taxPercentage / 100);
                    const discountAmount = subtotal * (invoiceFormData.discountPercentage / 100);
                    const total = subtotal + taxAmount - discountAmount;
                    
                    return (
                      <>
                        <div className="flex justify-between border-t border-slate-300 pt-1">
                          <span>Subtotal:</span>
                          <span>₹{subtotal}</span>
                </div>
                        {taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
                        )}
                        <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
                          <span>Total:</span>
                          <span>₹{total.toFixed(2)}</span>
              </div>
                      </>
                    );
                  })()}
              </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                >
                  Create Invoice & Preview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Preview & Payment Modal */}
      {showInvoicePreviewModal && selectedPatient && invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-xl" id="invoice-print">
            {/* Modal Header with Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Invoice</h2>
                </div>
                <div className="flex items-center gap-3">
                  {/* Action Buttons */}
                  <button
                    onClick={() => {
                      // Calculate outstanding amount
                      const totalAmount = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
                      const totalPaid = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
                      const outstandingAmount = totalAmount - totalPaid;
                      
                      // Create a mock invoice object for payment processing
                      const mockInvoice = {
                        invoiceNumber: selectedPatient.billing?.[0]?.invoiceNumber || `INV-${selectedPatient._id.toString().slice(-6)}`,
                        patientId: selectedPatient._id,
                        total: totalAmount,
                        paid: totalPaid,
                        outstanding: outstandingAmount
                      };
                      
                      // Set the generated invoice for payment processing
                      setGeneratedInvoice(mockInvoice);
                      
                      // Pre-populate payment data
                      setPaymentData({
                        amount: outstandingAmount > 0 ? outstandingAmount.toString() : '',
                        paymentMethod: 'cash',
                        paymentType: outstandingAmount > 0 ? 'full' : 'partial',
                        notes: `Payment for patient: ${selectedPatient.name}`,
                        appointmentTime: '',
                        consultationType: 'OP'
                      });
                      
                      setShowInvoicePreviewModal(false);
                      setShowPaymentModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Process Payment
                  </button>
                  
                  <button
                    onClick={() => {
                      // Generate optimized PDF invoice for A4 printing
                      const printWindow = window.open('', '_blank');
                      const invoiceContent = document.getElementById('invoice-print').innerHTML;
                      
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Invoice - ${selectedPatient.name}</title>
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
                              
                              /* Removed DUPLICA watermark */
                              
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
                    onClick={() => setShowInvoicePreviewModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Invoice Content - Inline Implementation */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6">
              {invoiceData && (
                <div className="bg-white p-6 max-w-4xl mx-auto relative">
                  {/* Content - Watermark removed */}
                  {/* Header - Compact for A4 */}
                  <div className="text-center mb-3">
                    <h1 className="text-sm font-bold text-slate-900 mb-1">
                      {centerInfo.name}
                    </h1>
                    <p className="text-xs text-slate-600 leading-tight">
                      {centerInfo.address}
                    </p>
                    <p className="text-xs text-slate-600">
                      PH: {centerInfo.phone} | Fax: {centerInfo.fax}
                    </p>
                    <p className="text-xs text-slate-600">
                      Website: {centerInfo.website}
                    </p>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-3">
                    <h2 className="text-base font-bold text-slate-900 uppercase">
                      OUTPATIENT BILL
                    </h2>
                  </div>

                  {/* Patient and Bill Details */}
                  <div className="grid grid-cols-2 gap-x-6 mb-4">
                    <div>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">Name:</span> {invoiceData.patient.name}</div>
                        <div><span className="font-medium">Date:</span> {new Date(invoiceData.date).toLocaleDateString('en-GB')} {new Date(invoiceData.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        <div><span className="font-medium">Bill No:</span> {invoiceData.invoiceNumber}</div>
                        <div><span className="font-medium">File No:</span> {invoiceData.patient.fileNo || invoiceData.patient.uhId}</div>
                        <div><span className="font-medium">Sex:</span> {invoiceData.patient.gender}</div>
                        <div><span className="font-medium">Age:</span> {invoiceData.patient.age}Y</div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-1 text-xs">
                        <div><span className="font-medium">Consultant Name:</span> {invoiceData.doctor.name}</div>
                        <div><span className="font-medium">Department:</span> {invoiceData.doctor.specializations}</div>
                        <div><span className="font-medium">User Name / Lab ID:</span> {invoiceData.patient.uhId}</div>
                        <div><span className="font-medium">Password:</span> {invoiceData.password}</div>
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
                        {(() => {
                          let serialNumber = 1;
                          const rows = [];
                          
                          // Add registration fee if exists
                          if (invoiceData.registrationFee > 0) {
                            const regBill = selectedPatient.billing?.find(bill => bill.type === 'registration');
                            const regPaid = regBill?.paidAmount || 0;
                            const regRefunded = regBill?.refundAmount || 0;
                            const regBalance = invoiceData.registrationFee - regPaid;
                            let regStatus, regStatusColor;
                            
                            if (regBill?.status === 'cancelled') {
                              regStatus = 'Cancelled';
                              regStatusColor = 'text-red-600';
                            } else if (regBill?.status === 'refunded') {
                              regStatus = 'Refunded';
                              regStatusColor = 'text-orange-600';
                            } else {
                              regStatus = regPaid >= invoiceData.registrationFee ? 'Paid' : regPaid > 0 ? 'Partial' : 'Unpaid';
                              regStatusColor = regStatus === 'Paid' ? 'text-green-600' : regStatus === 'Partial' ? 'text-orange-600' : 'text-red-600';
                            }
                            
                            rows.push(
                              <tr key="reg">
                                <td className="border border-slate-300 px-3 py-2 text-xs">{serialNumber++}</td>
                                <td className="border border-slate-300 px-3 py-2 text-xs">Registration Fee</td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">1</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{invoiceData.registrationFee.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{regPaid.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{regBalance.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">
                                  <span className={`font-medium ${regStatusColor}`}>
                                    {regStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                          
                          // Add consultation fee if exists
                          if (invoiceData.consultationFee > 0) {
                            const consultBill = selectedPatient.billing?.find(bill => 
                              bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
                            );
                            const consultPaid = consultBill?.paidAmount || 0;
                            const consultRefunded = consultBill?.refundAmount || 0;
                            const consultBalance = invoiceData.consultationFee - consultPaid;
                            let consultStatus, consultStatusColor;
                            
                            if (consultBill?.status === 'cancelled') {
                              consultStatus = 'Cancelled';
                              consultStatusColor = 'text-red-600';
                            } else if (consultBill?.status === 'refunded') {
                              consultStatus = 'Refunded';
                              consultStatusColor = 'text-orange-600';
                            } else {
                              consultStatus = consultPaid >= invoiceData.consultationFee ? 'Paid' : consultPaid > 0 ? 'Partial' : 'Unpaid';
                              consultStatusColor = consultStatus === 'Paid' ? 'text-green-600' : consultStatus === 'Partial' ? 'text-orange-600' : 'text-red-600';
                            }
                            
                            rows.push(
                              <tr key="consult">
                                <td className="border border-slate-300 px-3 py-2 text-xs">{serialNumber++}</td>
                                <td className="border border-slate-300 px-3 py-2 text-xs">
                                  {(() => {
                                    const consultBill = selectedPatient.billing?.find(b => b.type === 'consultation');
                                    if (consultBill?.consultationType === 'followup') return 'Followup Consultation (Free)';
                                    if (consultBill?.consultationType === 'IP') return 'IP Consultation Fee';
                                    return 'OP Consultation Fee';
                                  })()}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">1</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{invoiceData.consultationFee.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{consultPaid.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{consultBalance.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">
                                  <span className={`font-medium ${consultStatusColor}`}>
                                    {consultStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                          
                          // Add service charges
                          invoiceData.serviceCharges.forEach((service, index) => {
                            const serviceBill = selectedPatient.billing?.find(bill => 
                              bill.type === 'service' && bill.description === service.name
                            );
                            const servicePaid = serviceBill?.paidAmount || 0;
                            const serviceRefunded = serviceBill?.refundAmount || 0;
                            const serviceBalance = service.amount - servicePaid;
                            let serviceStatus, serviceStatusColor;
                            
                            if (serviceBill?.status === 'cancelled') {
                              serviceStatus = 'Cancelled';
                              serviceStatusColor = 'text-red-600';
                            } else if (serviceBill?.status === 'refunded') {
                              serviceStatus = 'Refunded';
                              serviceStatusColor = 'text-orange-600';
                            } else {
                              serviceStatus = servicePaid >= service.amount ? 'Paid' : servicePaid > 0 ? 'Partial' : 'Unpaid';
                              serviceStatusColor = serviceStatus === 'Paid' ? 'text-green-600' : serviceStatus === 'Partial' ? 'text-orange-600' : 'text-red-600';
                            }
                            
                            rows.push(
                              <tr key={`service-${index}`}>
                                <td className="border border-slate-300 px-3 py-2 text-xs">{serialNumber++}</td>
                                <td className="border border-slate-300 px-3 py-2 text-xs">{service.name}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">1</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{service.amount.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{servicePaid.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">{serviceBalance.toFixed(2)}</td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">
                                  <span className={`font-medium ${serviceStatusColor}`}>
                                    {serviceStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                          
                          return rows;
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="flex justify-end mb-4">
                    <div className="w-72">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span>₹{invoiceData.totals.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount(-):</span>
                          <span>₹{invoiceData.totals.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax Amount:</span>
                          <span>₹{invoiceData.totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-300 pt-1">
                          <span>Grand Total:</span>
                          <span>₹{invoiceData.totals.total.toFixed(2)}</span>
                        </div>
                        {(() => {
                          const totalPaid = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
                          const totalRefunded = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.refundAmount || 0), 0) || 0;
                          const hasCancelledBills = selectedPatient.billing?.some(bill => bill.status === 'cancelled');
                          const hasRefundedBills = selectedPatient.billing?.some(bill => bill.status === 'refunded');
                          const outstandingAmount = invoiceData.totals.total - totalPaid;
                          
                          return (
                            <>
                              <div className="flex justify-between border-t border-slate-300 pt-1">
                                <span>Amount Paid:</span>
                                <span className="text-green-600 font-medium">₹{totalPaid.toFixed(2)}</span>
                              </div>
                              {totalRefunded > 0 && (
                                <div className="flex justify-between">
                                  <span>Amount Refunded:</span>
                                  <span className="text-orange-600 font-medium">₹{totalRefunded.toFixed(2)}</span>
                                </div>
                              )}
                              {outstandingAmount > 0 && !hasCancelledBills && (
                                <div className="flex justify-between">
                                  <span>Outstanding:</span>
                                  <span className="text-orange-600 font-medium">₹{outstandingAmount.toFixed(2)}</span>
                                </div>
                              )}
                              {hasCancelledBills && (
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <span className="text-red-600 font-bold">BILL CANCELLED</span>
                                </div>
                              )}
                              {hasRefundedBills && !hasCancelledBills && (
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <span className="text-orange-600 font-bold">REFUNDED</span>
                                </div>
                              )}
                              {outstandingAmount === 0 && totalPaid > 0 && !hasCancelledBills && !hasRefundedBills && (
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <span className="text-green-600 font-bold">FULLY PAID</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="mb-6">
                    <div className="text-xs">
                      {(() => {
                        // Calculate total paid amount from patient billing
                        const totalPaid = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
                        const totalRefunded = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.refundAmount || 0), 0) || 0;
                        const hasCancelledBills = selectedPatient.billing?.some(bill => bill.status === 'cancelled');
                        const hasRefundedBills = selectedPatient.billing?.some(bill => bill.status === 'refunded');
                        const totalAmount = invoiceData.totals.total;
                        const outstandingAmount = totalAmount - totalPaid;
                        
                        if (hasCancelledBills) {
                          return (
                            <div className="text-red-600">
                              <div><span className="font-medium">Bill Status:</span> CANCELLED</div>
                              {totalPaid > 0 && (
                                <div className="mt-1"><span className="font-medium">Amount Paid:</span> (Rs.) {numberToWords(totalPaid)} Only</div>
                              )}
                              {totalRefunded > 0 && (
                                <div className="mt-1"><span className="font-medium">Amount Refunded:</span> (Rs.) {numberToWords(totalRefunded)} Only</div>
                              )}
                            </div>
                          );
                        } else if (hasRefundedBills) {
                          return (
                            <div className="text-orange-600">
                              <div><span className="font-medium">Bill Status:</span> REFUNDED</div>
                              {totalPaid > 0 && (
                                <div className="mt-1"><span className="font-medium">Amount Paid:</span> (Rs.) {numberToWords(totalPaid)} Only</div>
                              )}
                              {totalRefunded > 0 && (
                                <div className="mt-1"><span className="font-medium">Amount Refunded:</span> (Rs.) {numberToWords(totalRefunded)} Only</div>
                              )}
                            </div>
                          );
                        } else if (totalPaid > 0) {
                          return (
                            <div>
                              <div><span className="font-medium">Paid Amount:</span> (Rs.) {numberToWords(totalPaid)} Only</div>
                              {outstandingAmount > 0 && (
                                <div className="text-orange-600 mt-1"><span className="font-medium">Outstanding Amount:</span> (Rs.) {numberToWords(outstandingAmount)} Only</div>
                              )}
                              {outstandingAmount === 0 && (
                                <div className="text-green-600 mt-1"><span className="font-medium">Payment Status:</span> Fully Paid</div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-orange-600">
                              <div><span className="font-medium">Amount Due:</span> (Rs.) {numberToWords(totalAmount)} Only</div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Payment History Table */}
                  {selectedPatient.billing && selectedPatient.billing.some(bill => (bill.paidAmount || 0) > 0 || bill.status === 'cancelled' || bill.status === 'refunded') && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3">Payment History</h4>
                      <table className="min-w-full border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 px-3 py-2 text-left text-xs font-medium text-slate-700 uppercase">Date</th>
                            <th className="border border-slate-300 px-3 py-2 text-left text-xs font-medium text-slate-700 uppercase">Service</th>
                            <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Amount</th>
                            <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Paid</th>
                            <th className="border border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-700 uppercase">Payment Method</th>
                            <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Refunded</th>
                            <th className="border border-slate-300 px-3 py-2 text-right text-xs font-medium text-slate-700 uppercase">Balance</th>
                            <th className="border border-slate-300 px-3 py-2 text-center text-xs font-medium text-slate-700 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPatient.billing.map((bill, index) => {
                            const billAmount = bill.amount || 0;
                            const paidAmount = bill.paidAmount || 0;
                            const refundedAmount = bill.refundAmount || 0;
                            const balance = billAmount - paidAmount;
                            const isFullyPaid = paidAmount >= billAmount;
                            const isPartiallyPaid = paidAmount > 0 && paidAmount < billAmount;
                            let statusText, statusColor;
                            
                            if (bill.status === 'cancelled') {
                              statusText = 'Cancelled';
                              statusColor = 'text-red-600';
                            } else if (bill.status === 'refunded') {
                              statusText = 'Refunded';
                              statusColor = 'text-orange-600';
                            } else if (isFullyPaid) {
                              statusText = 'Paid';
                              statusColor = 'text-green-600';
                            } else if (isPartiallyPaid) {
                              statusText = 'Partial';
                              statusColor = 'text-orange-600';
                            } else {
                              statusText = 'Unpaid';
                              statusColor = 'text-red-600';
                            }
                            
                            return (
                              <tr key={index}>
                                <td className="border border-slate-300 px-3 py-2 text-xs">
                                  {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString('en-GB') : 
                                   bill.cancelledAt ? new Date(bill.cancelledAt).toLocaleDateString('en-GB') :
                                   bill.refundedAt ? new Date(bill.refundedAt).toLocaleDateString('en-GB') : '-'}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-xs">
                                  {bill.description || bill.type}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">
                                  ₹{billAmount.toFixed(2)}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">
                                  ₹{paidAmount.toFixed(2)}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">
                                  {bill.paymentMethod ? (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                      {bill.paymentMethod.charAt(0).toUpperCase() + bill.paymentMethod.slice(1)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">
                                  ₹{refundedAmount.toFixed(2)}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-right text-xs">
                                  ₹{balance.toFixed(2)}
                                </td>
                                <td className="border border-slate-300 px-3 py-2 text-center text-xs">
                                  <span className={`font-medium ${statusColor}`}>
                                    {statusText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Payment Summary */}
                  {(() => {
                    const totalPaid = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
                    const totalRefunded = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.refundAmount || 0), 0) || 0;
                    const hasCancelledBills = selectedPatient.billing?.some(bill => bill.status === 'cancelled');
                    const hasRefundedBills = selectedPatient.billing?.some(bill => bill.status === 'refunded');
                    const totalAmount = invoiceData.totals.total;
                    const outstandingAmount = totalAmount - totalPaid;
                    const hasPartialPayments = selectedPatient.billing?.some(bill => (bill.paidAmount || 0) > 0 && (bill.paidAmount || 0) < (bill.amount || 0));
                    
                    if (totalPaid > 0 || hasCancelledBills || hasRefundedBills) {
                      return (
                        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3">Payment Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Total Bill Amount:</span>
                                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Amount Paid:</span>
                                <span className="font-medium text-green-600">₹{totalPaid.toFixed(2)}</span>
                              </div>
                              {totalRefunded > 0 && (
                                <div className="flex justify-between mb-1">
                                  <span>Amount Refunded:</span>
                                  <span className="font-medium text-orange-600">₹{totalRefunded.toFixed(2)}</span>
                                </div>
                              )}
                              {outstandingAmount > 0 && !hasCancelledBills && (
                                <div className="flex justify-between mb-1">
                                  <span>Outstanding:</span>
                                  <span className="font-medium text-orange-600">₹{outstandingAmount.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span>Bill Status:</span>
                                <span className={`font-medium ${
                                  hasCancelledBills ? 'text-red-600' : 
                                  hasRefundedBills ? 'text-orange-600' : 
                                  outstandingAmount === 0 ? 'text-green-600' : 
                                  hasPartialPayments ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  {hasCancelledBills ? 'Cancelled' : 
                                   hasRefundedBills ? 'Refunded' : 
                                   outstandingAmount === 0 ? 'Fully Paid' : 
                                   hasPartialPayments ? 'Partially Paid' : 'Unpaid'}
                                </span>
                              </div>
                              {hasPartialPayments && !hasCancelledBills && !hasRefundedBills && (
                                <div className="text-orange-600 text-xs mt-1">
                                  * Some services have partial payments
                                </div>
                              )}
                              {hasCancelledBills && (
                                <div className="text-red-600 text-xs mt-1">
                                  * Bill has been cancelled
                                </div>
                              )}
                              {hasRefundedBills && !hasCancelledBills && (
                                <div className="text-orange-600 text-xs mt-1">
                                  * Refund has been processed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Generation Details - Compact for A4 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Left - Generation Info */}
                    <div className="text-xs">
                      <div><span className="font-medium">Generated By:</span> {invoiceData.generatedBy}</div>
                      <div><span className="font-medium">Date:</span> {new Date(invoiceData.date).toLocaleDateString('en-GB')}</div>
                      <div><span className="font-medium">Time:</span> {new Date(invoiceData.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    </div>
                    
                    {/* Right - Invoice Terms & Signature */}
                    <div className="text-xs bg-slate-50 border border-slate-200 rounded p-2">
                      <div className="font-semibold text-slate-800 mb-1 text-center">Invoice Terms</div>
                      <div className="space-y-1 text-slate-700 mb-2">
                        <div>• Original invoice document</div>
                        <div>• Payment due upon receipt</div>
                        <div>• Keep for your records</div>
                        <div>• No refunds after 7 days</div>
                      </div>
                      <div className="border-t border-slate-200 pt-1">
                        <div className="font-medium">Signature:</div>
                        <div className="text-center mt-2">For {centerInfo.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Compact */}
                  <div className="text-center text-xs text-slate-600">
                    <div className="mb-1">
                      <strong>"For Home Sample Collection"</strong>
                    </div>
                    <div>
                      <span className="font-medium">Miss Call:</span> {centerInfo.missCallNumber} 
                      <span className="mx-2">|</span>
                      <span className="font-medium">Mobile:</span> {centerInfo.mobileNumber}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Process Payment - {selectedPatient.name}
              </h3>
                <button
                onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Outstanding Amount Display */}
              {selectedPatient.billing && selectedPatient.billing.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Amount:</span>
                      <span className="font-semibold">₹{selectedPatient.billing.reduce((sum, bill) => sum + (bill.amount || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Amount Paid:</span>
                      <span className="font-semibold text-green-600">₹{selectedPatient.billing.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
                    <div className="flex justify-between border-t border-blue-300 pt-1">
                      <span className="text-blue-700 font-semibold">Amount Due:</span>
                      <span className="font-bold text-orange-600">₹{selectedPatient.billing.reduce((sum, bill) => sum + (bill.amount || 0) - (bill.paidAmount || 0), 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
                    </div>
                  )}

                      <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Amount (₹) *
                        </label>
                <div className="flex gap-2">
                        <input
                          type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    required
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="Enter payment amount"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const outstandingAmount = selectedPatient.billing?.reduce((sum, bill) => sum + (bill.amount || 0) - (bill.paidAmount || 0), 0) || 0;
                      setPaymentData({
                        ...paymentData,
                        amount: outstandingAmount.toString(),
                        paymentType: 'full'
                      });
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium whitespace-nowrap"
                  >
                    Pay Full
                  </button>
                      </div>
              </div>

                      <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Type *
                        </label>
                <select
                  value={paymentData.paymentType || 'partial'}
                  onChange={(e) => setPaymentData({...paymentData, paymentType: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                >
                  <option value="partial">Partial Payment</option>
                  <option value="full">Full Payment</option>
                </select>
                <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <p><strong>Full Payment:</strong> This amount will cover all remaining outstanding charges.</p>
                  <p><strong>Partial Payment:</strong> Records partial amount for later completion.</p>
                      </div>
                    </div>

                      <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Method *
                        </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                </select>
                      </div>

                      <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Appointment Time
                    </label>
                    <input
                  type="datetime-local"
                  value={paymentData.appointmentTime}
                  onChange={(e) => setPaymentData({...paymentData, appointmentTime: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Select appointment time"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This will schedule the patient's appointment after payment
                    </p>
                  </div>
                  
                  <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Consultation Type
                    </label>
                    <select
                  value={paymentData.consultationType}
                  onChange={(e) => setPaymentData({...paymentData, consultationType: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    >
                      <option value="OP">OP (Outpatient) - ₹850</option>
                      <option value="IP">IP (Inpatient) - ₹1050</option>
                      <option value="followup" disabled={!selectedPatient?.followupEligible || selectedPatient?.followupUsed}>
                        Followup (Free within 7 days) - ₹0
                      </option>
                    </select>
                    {selectedPatient?.followupEligible && !selectedPatient?.followupUsed && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Patient is eligible for free followup consultation
                      </p>
                    )}
                    {selectedPatient?.followupUsed && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠ Free followup consultation already used
                      </p>
                    )}
                  </div>

                      <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Notes
                    </label>
                    <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                      rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Additional notes..."
                    />
                  </div>

              <div className="flex gap-3 pt-4">
                    <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                    >
                  Cancel
                    </button>
                    <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                    >
                  Record Payment
                    </button>
                  </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Bill Modal */}
      {showCancelBillModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Cancel Bill - {selectedPatient.name}
              </h3>
              <button
                onClick={() => setShowCancelBillModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCancelBillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs"
                  placeholder="Please provide a reason for cancelling this bill..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-xs text-red-700">
                    <p className="font-medium mb-1">Warning:</p>
                    <p>This action will cancel the bill and may initiate a refund if payments were made. This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCancelBillModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                >
                  Cancel Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Process Refund - {selectedPatient.name}
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  value={refundData.amount}
                  onChange={(e) => setRefundData({...refundData, amount: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Enter refund amount"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Refund Method *
                </label>
                <select
                  value={refundData.refundMethod}
                  onChange={(e) => setRefundData({...refundData, refundMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Refund Reason *
                </label>
                <textarea
                  value={refundData.reason}
                  onChange={(e) => setRefundData({...refundData, reason: e.target.value})}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Please provide a reason for the refund..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={refundData.notes}
                  onChange={(e) => setRefundData({...refundData, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                >
                  Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Pending Bills Notification */}
      <PendingBillsNotification 
        isOpen={showPendingBillsNotification} 
        onClose={() => setShowPendingBillsNotification(false)} 
      />
    </ReceptionistLayout>
  );
}
