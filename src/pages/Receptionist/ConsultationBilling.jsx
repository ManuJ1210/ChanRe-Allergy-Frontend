import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchReceptionistPatients } from '../../features/receptionist/receptionistThunks';
import { updatePatient } from '../../features/receptionist/receptionistSlice';
import ReceptionistLayout from './ReceptionistLayout';
import PendingBillsNotification from '../../components/PendingBillsNotification';
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
  Bell
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../services/api';

export default function ConsultationBilling() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { patients, loading } = useSelector((state) => state.receptionist);
  const { user } = useSelector((state) => state.auth);

  // Removed reassignment logic - now handled in separate ReassignPatient page

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [finalFilteredPatients, setFinalFilteredPatients] = useState([]);
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [searchField, setSearchField] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  // Removed reassignedFilter - no longer needed
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editedInvoiceData, setEditedInvoiceData] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentType: 'partial',
    notes: ''
  });
  const [partialPaymentData, setPartialPaymentData] = useState({
    consultationPaid: '',
    registrationPaid: '',
    servicePaid: '',
    totalPaid: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [registrationData, setRegistrationData] = useState({
    registrationFee: '150',
    serviceCharges: '150',
    amount: '300',
    notes: ''
  });
  const [serviceData, setServiceData] = useState({
    services: [{ name: '', amount: '', description: '', details: '' }],
    notes: ''
  });
  const [showPendingBillsNotification, setShowPendingBillsNotification] = useState(false);

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
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

  const getPatientStatus = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return 'Invoice Required';
    }

    // Check for consultation fee
    const consultationFee = patient.billing.find(bill => {
      const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      return isConsultationFee;
    });
    
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    const serviceCharges = patient.billing.filter(bill => bill.type === 'service');

    const hasConsultationFee = !!consultationFee;
    const hasRegistrationFee = !!registrationFee;
    const hasServiceCharges = serviceCharges.length > 0;

    // Check payment status - support for partial payments
    const getPaymentStatus = (bill) => {
      if (!bill) return { paidAmount: 0, status: 'unpaid' };
      const paidAmount = bill.paidAmount || 0;
      const totalAmount = bill.amount || 0;
      
      if (paidAmount >= totalAmount && totalAmount > 0) return { paidAmount, status: 'paid' };
      if (paidAmount > 0) return { paidAmount, status: 'partial' };
      return { paidAmount, status: 'unpaid' };
    };

    const consultationPayment = getPaymentStatus(consultationFee);
    const registrationPayment = getPaymentStatus(registrationFee);
    const servicePayments = serviceCharges.map(s => getPaymentStatus(s));

    // Check if all services are paid
    const allServiceChargesPaid = servicePayments.length === 0 || servicePayments.every(p => p.status === 'paid');
    const hasPartialServiceCharges = servicePayments.some(p => p.status === 'partial');
    const hasUnpaidServiceCharges = servicePayments.some(p => p.status === 'unpaid');

    // Determine if patient is new (within 24 hours)
    const isNewPatient = isPatientNew(patient);

    // Check registration fee first (new patients only)
    if (isNewPatient && !hasRegistrationFee) {
      return 'Registration Fee Required';
    }
    
    // Check consultation fee
    if (!hasConsultationFee) {
      return 'Consultation Fee Required';
    }

    // Check payment statuses
    const needsConsultationPayment = consultationPayment.status === 'unpaid';
    const needsPartialConsultationPayment = consultationPayment.status === 'partial';
    const needsRegistrationPayment = hasRegistrationFee && registrationPayment.status === 'unpaid';
    const needsPartialRegistrationPayment = hasRegistrationFee && registrationPayment.status === 'partial';

    if (needsConsultationPayment) {
      return 'Consultation Pending Payment';
    }
    
    if (needsRegistrationPayment) {
      return 'Registration Pending Payment';
    }

    if (needsPartialConsultationPayment) {
      return 'Consultation Partial Payment';
    }

    if (needsPartialRegistrationPayment) {
      return 'Registration Partial Payment';
    }

    if (hasServiceCharges) {
      if (hasUnpaidServiceCharges && !hasPartialServiceCharges) {
        return 'Service Charges Pending';
      }
      if (hasPartialServiceCharges) {
        return 'Service Charges Partial';
      }
    }
    
    // All payments completed
    const allPaid = consultationPayment.status === 'paid' && 
                  (hasRegistrationFee ? registrationPayment.status === 'paid' : true) &&
                  allServiceChargesPaid;
    
    if (allPaid) {
      return 'All Paid';
    }

    // Catch-all for other payment statuses
    const hasAnyPartial = needsPartialConsultationPayment || needsPartialRegistrationPayment || hasPartialServiceCharges;
    return hasAnyPartial ? 'Partial Payment Received' : 'Pending Payment';
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
    
    setPaymentData({
      amount: suggestedAmount.toString(),
      paymentMethod: 'cash',
      paymentType: outstanding.totalOutstanding > 0 ? 'full' : 'partial',
      notes: ''
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

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      // Record payment for existing billing entries
      const paymentPayload = {
        patientId: selectedPatient._id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        notes: paymentData.notes,
        receivePayment: true
      };

      console.log('🔍 Recording payment:', paymentPayload);

      // Record payment against billing entries
      const response = await API.post('/billing/record-payment', paymentPayload);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Payment recorded successfully!');
        
        // Close modal immediately
        setShowPaymentModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated payment status
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to record payment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Failed to record payment. Please try again.');
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

  const getStats = () => {
    const totalPatients = patients.length;
    const needsConsultationFee = patients.filter(p => {
      const hasConsultationFee = p.billing && p.billing.some(bill => 
        bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
      );
      const hasPaidConsultationFee = hasConsultationFee && p.billing.some(bill => 
        (bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')) && 
        (bill.status === 'paid' || bill.status === 'completed')
      );
      return !hasPaidConsultationFee;
    }).length;
    const paidConsultationFee = patients.filter(p => {
      const hasConsultationFee = p.billing && p.billing.some(bill => 
        bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
      );
      const hasPaidConsultationFee = hasConsultationFee && p.billing.some(bill => 
        (bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')) && 
        (bill.status === 'paid' || bill.status === 'completed')
      );
      return hasPaidConsultationFee;
    }).length;
    
    return { totalPatients, needsConsultationFee, paidConsultationFee };
  };

  const stats = getStats();

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-md font-bold text-slate-800 mb-2">
                  Doctor Consultation Fee Billing
                </h1>
                <p className="text-slate-600 text-sm">
                  Manage consultation fees - collect payments and track payment history
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
                  Pending Bills ({patients.filter(p => {
                    const status = getPatientStatus(p);
                    return status !== 'All Paid';
                  }).length})
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('pendingBillsNotificationShown');
                    console.log('Notification reset - will show on next login');
                    toast.success('Notification reset! Will show on next login.');
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                  title="Reset notification for testing"
                >
                  Reset Notification
                </button>
                {/* Test reassignment button removed - functionality moved to separate page */}
                {user?.role === 'superadmin' && (
                  <button
                    onClick={handleUpdateMissingInvoiceNumbers}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    title="Update missing invoice numbers for existing billing records"
                  >
                    <Settings className="h-4 w-4" />
                    Fix Invoice Numbers
                  </button>
                )}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                  <p className="text-md font-bold text-slate-800">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Need Consultation Fee</p>
                  <p className="text-md font-bold text-slate-800">{stats.needsConsultationFee}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Paid Consultation Fee</p>
                  <p className="text-md font-bold text-slate-800">{stats.paidConsultationFee}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
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
                <Receipt className="h-5 w-5 mr-2 text-blue-500" />
                All Patients - Consultation Fee Status
              </h2>
              <p className="text-slate-600 mt-1 text-xs">
                {finalFilteredPatients.length} patients total ({stats.needsConsultationFee} need payment, {stats.paidConsultationFee} paid)
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
                  {/* Desktop Table */}
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">UH ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Details</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {currentPatients.map((patient) => {
                        const status = getPatientStatus(patient);
                        const statusColor = getStatusColor(status);
                        const statusIcon = getStatusIcon(status);
                        const feeDetails = getConsultationFeeDetails(patient);
                        
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusColor}`}>
                                {statusIcon}
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-600 space-y-1">
                                {(() => {
                                  const consultationFee = getConsultationFeeDetails(patient);
                                  const registrationFee = getRegistrationFeeDetails(patient);
                                  const serviceCharges = getServiceChargesDetails(patient);
                                  
                                  return (
                                    <>
                                      {consultationFee && (
                                        <div className="border-l-2 border-blue-400 pl-2">
                                          <div className="font-medium text-blue-600">Consultation: ₹{consultationFee.amount}</div>
                                          <div className="text-slate-500">{consultationFee.paymentMethod}</div>
                                          {consultationFee.invoiceNumber && (
                                            <div className="text-slate-400 text-xs">INV: {consultationFee.invoiceNumber}</div>
                                          )}
                                    </div>
                                      )}
                                      {registrationFee && (
                                        <div className="border-l-2 border-purple-400 pl-2">
                                          <div className="font-medium text-purple-600">Registration: ₹{registrationFee.amount}</div>
                                          <div className="text-slate-500">{registrationFee.paymentMethod}</div>
                                          {registrationFee.invoiceNumber && (
                                            <div className="text-slate-400 text-xs">INV: {registrationFee.invoiceNumber}</div>
                                  )}
                                </div>
                                      )}
                                      {serviceCharges.length > 0 && (
                                        <div className="border-l-2 border-green-400 pl-2">
                                          <div className="font-medium text-green-600">
                                            Services: ₹{serviceCharges.reduce((sum, s) => sum + s.amount, 0)}
                                          </div>
                                          <div className="text-slate-500">{serviceCharges[0].paymentMethod}</div>
                                          <div className="text-slate-400 text-xs">{serviceCharges.length} service(s)</div>
                                        </div>
                                      )}
                                      {!consultationFee && !registrationFee && serviceCharges.length === 0 && (
                                        <span className="text-slate-400">No payments</span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs font-medium">
                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  onClick={() => navigate(`/dashboard/receptionist/profile/${patient._id}`)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                  title="View Profile"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => handleGenerateInvoice(patient)}
                                  className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
                                  title="Generate/View Invoice"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>

                                {/* Registration Fee Button - only for new patients who don't have registration billing */}
                                {isPatientNew(patient) && !getRegistrationFeeDetails(patient) && (
                                  <button
                                    onClick={() => handleCreateRegistrationBill(patient)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Add Registration Fee"
                                  >
                                    <UserPlus className="h-3 w-3" />
                                    Reg Fee
                                  </button>
                                )}

                                {/* Consultation Fee Button - only if no consultation fee billing exists */}
                                {!getConsultationFeeDetails(patient) && (
                                  <button
                                    onClick={() => handleCreateConsultationBill(patient)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Add Consultation Fee"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                    Consult
                                  </button>
                                )}

                                {/* Service Charges Button - for adding service charges */}
                                <button
                                  onClick={() => handleCreateServiceCharges(patient)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                  title="Add Service Charges"
                                >
                                  <Settings className="h-3 w-3" />
                                  Services
                                </button>

                                {/* Payment Recording Buttons based on status */}
                                {(status === 'Consultation Pending Payment' || status === 'Registration Pending Payment' || 
                                  status === 'Service Charges Pending' || status === 'Pending Payment') && (
                                  <button
                                    onClick={() => handleRecordPayment(patient)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Record Payment"
                                  >
                                    <CreditCard className="h-3 w-3" />
                                    Record Payment
                                  </button>
                                )}

                                {(status === 'Consultation Partial Payment' || status === 'Registration Partial Payment' || 
                                  status === 'Service Charges Partial' || status === 'Partial Payment Received') && (
                                  <>
                                    <button
                                      onClick={() => handleRecordPartialPayment(patient)}
                                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                      title="Record Additional Payment"
                                    >
                                      <CreditCard className="h-3 w-3" />
                                      Record More
                                    </button>
                                  </>
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

      {/* Consultation Fee Billing Modal */}
      {showConsultationModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Add Consultation Fee Billing
              </h3>
              <button
                onClick={() => setShowConsultationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Patient:</strong> {selectedPatient.name}
              </p>
              <p className="text-sm text-slate-600">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
            </div>

            <form onSubmit={handleConsultationFeeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Consultation Fee Amount *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter amount"
                />
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
                  onClick={() => setShowConsultationModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                >
                  Create Billing Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Record Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Patient:</strong> {selectedPatient.name}
              </p>
              <p className="text-sm text-slate-600 mb-3">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
              
              {/* Outstanding Payments Overview */}
              {(() => {
                const outstanding = getOutstandingPayments(selectedPatient);
                if (outstanding.totalOutstanding > 0) {
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-semibold text-yellow-800 mb-2">Outstanding Payments:</h4>
                      <div className="text-xs text-yellow-700 space-y-1">
                        {outstanding.breakdown.consultation > 0 && (
                          <div>Consultation Fee: ₹{outstanding.breakdown.consultation}</div>
                        )}
                        {outstanding.breakdown.registration > 0 && (
                          <div>Registration Fee: ₹{outstanding.breakdown.registration}</div>
                        )}
                        {outstanding.breakdown.services > 0 && (
                          <div>Service Charges: ₹{outstanding.breakdown.services}</div>
                        )}
                        <div className="font-semibold border-t border-yellow-300 pt-1 mt-1">
                          Total Outstanding: ₹{outstanding.totalOutstanding}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  placeholder="Enter payment amount"
                />
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

      {/* Partial Payment Modal */}
      {showPartialPaymentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Record Partial Payment
              </h3>
              <button
                onClick={() => setShowPartialPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Patient:</strong> {selectedPatient.name}
              </p>
              <p className="text-sm text-slate-600">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
            </div>

            <form onSubmit={handlePartialPaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Consultation Paid
                  </label>
                  <input
                    type="number"
                    value={partialPaymentData.consultationPaid}
                    onChange={(e) => setPartialPaymentData({...partialPaymentData, consultationPaid: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Registration Paid
                  </label>
                  <input
                    type="number"
                    value={partialPaymentData.registrationPaid}
                    onChange={(e) => setPartialPaymentData({...partialPaymentData, registrationPaid: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Service Paid
                  </label>
                  <input
                    type="number"
                    value={partialPaymentData.servicePaid}
                    onChange={(e) => setPartialPaymentData({...partialPaymentData, servicePaid: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Total Payment Amount 
                </label>
                <input
                  type="number"
                  value={partialPaymentData.totalPaid}
                  onChange={(e) => setPartialPaymentData({...partialPaymentData, totalPaid: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Auto-calculated from individual payments"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={partialPaymentData.paymentMethod}
                  onChange={(e) => setPartialPaymentData({...partialPaymentData, paymentMethod: e.target.value})}
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
                  Notes
                </label>
                <textarea
                  value={partialPaymentData.notes}
                  onChange={(e) => setPartialPaymentData({...partialPaymentData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Payment notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPartialPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs font-medium"
                >
                  Record Partial Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Fee Modal */}
      {showRegistrationModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Add Registration & Service Charges Billing
              </h3>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Patient:</strong> {selectedPatient.name}
              </p>
              <p className="text-sm text-slate-600">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
              <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" />
                  <strong>New Patient Fee:</strong> Registration (₹150) + Service Charges (₹150) = ₹300
                </p>
              </div>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Registration Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={registrationData.registrationFee}
                    onChange={(e) => {
                      const fee = e.target.value || '0';
                      const total = parseInt(fee) + parseInt(registrationData.serviceCharges || '0');
                      setRegistrationData({
                        ...registrationData,
                        registrationFee: fee,
                        amount: total.toString()
                      });
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                    placeholder="150"
                  />
                  <p className="text-xs text-slate-500 mt-1">Standard: ₹150</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Service Charges (₹) *
                  </label>
                  <input
                    type="number"
                    value={registrationData.serviceCharges}
                    onChange={(e) => {
                      const charges = e.target.value || '0';
                      const total = parseInt(registrationData.registrationFee || '0') + parseInt(charges);
                      setRegistrationData({
                        ...registrationData,
                        serviceCharges: charges,
                        amount: total.toString()
                      });
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                    placeholder="150"
                  />
                  <p className="text-xs text-slate-500 mt-1">Standard: ₹150</p>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Total Amount *
                </label>
                <input
                  type="number"
                  value={registrationData.amount}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Auto-calculated from registration fee and service charges
                </p>
              </div>


              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={registrationData.notes}
                  onChange={(e) => setRegistrationData({...registrationData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium"
                >
                  Create Registration & Service Billing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Charges Modal */}
      {showServiceModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Add Service Charges Billing
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>Patient:</strong> {selectedPatient.name}
              </p>
              <p className="text-sm text-slate-600">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
            </div>

            <form onSubmit={handleServiceChargesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Services *
                </label>
                <div className="space-y-3">
                  {serviceData.services.map((service, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">Service {index + 1}</span>
                        {serviceData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceField(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateServiceField(index, 'name', e.target.value)}
                          placeholder="Service name"
                          className="px-2 py-1 border border-slate-200 rounded text-xs"
                          required
                        />
                        <input
                          type="number"
                          value={service.amount}
                          onChange={(e) => updateServiceField(index, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="px-2 py-1 border border-slate-200 rounded text-xs"
                          required
                        />
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) => updateServiceField(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={service.details}
                          onChange={(e) => updateServiceField(index, 'details', e.target.value)}
                          placeholder="Additional details"
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addServiceField}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-green-400 hover:text-green-600 transition-colors text-xs"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Another Service
                  </button>
                </div>
              </div>


              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={serviceData.notes}
                  onChange={(e) => setServiceData({...serviceData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                >
                  Create Service Charges
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Patient Invoice
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const currentPatient = patients.find(p => p._id === invoiceData.patient._id);
                    if (currentPatient) {
                      await refreshInvoiceData(currentPatient);
                      toast.success('Invoice data refreshed');
                    }
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center gap-1"
                  title="Refresh invoice data with latest billing information"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={handleEditInvoice}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                >
                  <Settings className="h-4 w-4" />
                  Edit Invoice
                </button>
                <button
                  onClick={() => {
                    // Professional invoice download functionality
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Invoice ${invoiceData.invoiceNumber}</title>
                          <meta charset="UTF-8">
                          <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                              font-family: Arial, sans-serif; 
                              line-height: 1.4; 
                              color: #333; 
                              background: #fff;
                              padding: 20px;
                              font-size: 12px;
                            }
                            .invoice-container {
                              max-width: 800px;
                              margin: 0 auto;
                              background: white;
                              border: 2px solid #333;
                              page-break-inside: avoid;
                            }
                            .header {
                              background: #f8f9fa;
                              border-bottom: 2px solid #333;
                              padding: 20px;
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                            }
                            .clinic-info {
                              flex: 1;
                            }
                            .clinic-name {
                              font-size: 24px;
                              font-weight: bold;
                              color: #333;
                              margin-bottom: 5px;
                            }
                            .clinic-tagline {
                              font-size: 12px;
                              color: #666;
                              margin-bottom: 10px;
                            }
                            .invoice-info {
                              text-align: right;
                              flex: 1;
                            }
                            .invoice-title {
                              font-size: 28px;
                              font-weight: bold;
                              color: #333;
                              margin-bottom: 10px;
                            }
                            .invoice-number {
                              font-size: 14px;
                              font-weight: bold;
                              color: #333;
                            }
                            .content {
                              padding: 20px;
                            }
                            .invoice-details {
                              display: flex;
                              justify-content: space-between;
                              margin-bottom: 20px;
                              padding: 15px;
                              background: #f8f9fa;
                              border: 1px solid #ddd;
                            }
                            .detail-section {
                              flex: 1;
                              margin-right: 20px;
                            }
                            .detail-section:last-child {
                              margin-right: 0;
                            }
                            .detail-section h3 {
                              font-size: 14px;
                              font-weight: bold;
                              color: #333;
                              margin-bottom: 10px;
                              text-transform: uppercase;
                              border-bottom: 1px solid #333;
                              padding-bottom: 5px;
                            }
                            .detail-section p {
                              margin-bottom: 5px;
                              font-size: 12px;
                            }
                            .detail-section strong {
                              font-weight: bold;
                              min-width: 60px;
                              display: inline-block;
                            }
                            .billing-table {
                              width: 100%;
                              border-collapse: collapse;
                              margin-bottom: 20px;
                              border: 1px solid #333;
                            }
                            .billing-table th {
                              background: #333;
                              color: white;
                              padding: 8px 6px;
                              text-align: left;
                              font-weight: bold;
                              font-size: 11px;
                              text-transform: uppercase;
                              border: 1px solid #333;
                            }
                            .billing-table td {
                              padding: 6px;
                              border: 1px solid #ddd;
                              font-size: 11px;
                              vertical-align: top;
                            }
                            .billing-table tr:nth-child(even) {
                              background: #f8f9fa;
                            }
                            .type-badge {
                              padding: 2px 6px;
                              border-radius: 3px;
                              font-size: 10px;
                              font-weight: bold;
                              text-transform: uppercase;
                            }
                            .type-consultation { background: #e3f2fd; color: #1976d2; }
                            .type-registration { background: #f3e5f5; color: #7b1fa2; }
                            .type-service { background: #e8f5e8; color: #388e3c; }
                            .type-test { background: #fff3e0; color: #f57c00; }
                            .type-medication { background: #fce4ec; color: #c2185b; }
                            .totals-section {
                              background: #f8f9fa;
                              padding: 15px;
                              border: 1px solid #333;
                              margin-top: 20px;
                            }
                            .totals-section h3 {
                              font-size: 14px;
                              font-weight: bold;
                              color: #333;
                              margin-bottom: 10px;
                              text-transform: uppercase;
                              border-bottom: 1px solid #333;
                              padding-bottom: 5px;
                            }
                            .totals-grid {
                              max-width: 250px;
                              margin-left: auto;
                            }
                            .total-line {
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              padding: 3px 0;
                              font-size: 12px;
                              border-bottom: 1px solid #eee;
                            }
                            .total-line.subtotal {
                              border-top: 2px solid #333;
                              padding-top: 8px;
                              margin-top: 5px;
                              font-weight: bold;
                            }
                            .total-line.tax {
                              color: #dc3545;
                            }
                            .total-line.discount {
                              color: #28a745;
                            }
                            .total-line.final {
                              border-top: 2px solid #333;
                              padding-top: 8px;
                              margin-top: 8px;
                              font-size: 14px;
                              font-weight: bold;
                              background: #333;
                              color: white;
                              padding: 8px 10px;
                              margin: 10px -10px -10px -10px;
                            }
                            .footer {
                              margin-top: 20px;
                              padding: 15px;
                              background: #f8f9fa;
                              border-top: 2px solid #333;
                              text-align: center;
                              font-size: 11px;
                              color: #666;
                            }
                            .footer .thank-you {
                              font-size: 14px;
                              font-weight: bold;
                              color: #333;
                              margin: 10px 0;
                            }
                            @media print {
                              body { padding: 0; margin: 0; }
                              .invoice-container { border: none; }
                              .invoice-container { page-break-inside: avoid; }
                            }
                            @page {
                              margin: 0.5in;
                              size: A4;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="invoice-container">
                            <div class="header">
                              <div class="clinic-info">
                                <div class="clinic-name">${invoiceData.center.name}</div>
                                <div class="clinic-tagline">Medical Excellence & Care</div>
                              </div>
                              <div class="invoice-info">
                                <div class="invoice-title">INVOICE</div>
                                <div class="invoice-number"># ${invoiceData.invoiceNumber}</div>
                              </div>
                            </div>
                            
                            <div class="content">
                              <div class="invoice-details">
                                <div class="detail-section">
                                  <h3>Patient Information</h3>
                                  <p><strong>Name:</strong> ${invoiceData.patient.name}</p>
                                  <p><strong>UH ID:</strong> ${invoiceData.patient.uhId || 'N/A'}</p>
                                  <p><strong>Phone:</strong> ${invoiceData.patient.phone || 'N/A'}</p>
                                  <p><strong>Email:</strong> ${invoiceData.patient.email || 'N/A'}</p>
                                  ${invoiceData.patient.address ? `<p><strong>Address:</strong> ${invoiceData.patient.address}</p>` : ''}
                                  ${invoiceData.isReassignedEntry ? `
                                    <div style="margin-top: 10px; padding: 8px; background: #e3f2fd; border: 1px solid #1976d2; border-radius: 4px;">
                                      <p style="font-size: 11px; color: #1976d2; margin: 0; font-weight: bold;">
                                        🔄 REASSIGNED PATIENT: This patient has been reassigned to a new doctor
                                      </p>
                                      ${invoiceData.patient.reassignmentHistory && invoiceData.patient.reassignmentHistory.length > 0 ? `
                                        <p style="font-size: 10px; color: #1565c0; margin: 5px 0 0 0;">
                                          Reason: ${invoiceData.patient.reassignmentHistory[invoiceData.patient.reassignmentHistory.length - 1].reason}
                                        </p>
                                      ` : ''}
                                    </div>
                                  ` : ''}
                                </div>
                                <div class="detail-section">
                                  <h3>Invoice Details</h3>
                                  <p><strong>Date:</strong> ${new Date(invoiceData.generatedAt).toLocaleDateString('en-IN', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}</p>
                                  <p><strong>Doctor:</strong> ${invoiceData.doctor}</p>
                                  <p><strong>Generated By:</strong> ${invoiceData.generatedBy}</p>
                                  <p><strong>Time:</strong> ${new Date(invoiceData.generatedAt).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}</p>
                                  ${invoiceData.isReassignedEntry ? `
                                    <div style="margin-top: 8px; padding: 6px; background: #fff3e0; border: 1px solid #f57c00; border-radius: 3px;">
                                      <p style="font-size: 10px; color: #f57c00; margin: 0; font-weight: bold;">
                                        🔄 REASSIGNED PATIENT INVOICE
                                      </p>
                                    </div>
                                  ` : ''}
                                </div>
                              </div>
                              
                              <table class="billing-table">
                                <thead>
                                  <tr>
                                    <th>Service Type</th>
                                    <th>Description</th>
                                    <th>Amount (₹)</th>
                                    <th>Payment Method</th>
                                    <th>Invoice #</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${invoiceData.billingRecords.map(bill => `
                                    <tr>
                                      <td><span class="type-badge type-${bill.type}">${bill.type}</span></td>
                                      <td>${bill.description}</td>
                                      <td style="text-align: right; font-weight: 600;">₹${bill.amount.toLocaleString('en-IN')}</td>
                                      <td style="text-transform: capitalize;">${bill.paymentMethod}</td>
                                      <td style="font-family: monospace; font-size: 12px;">${bill.invoiceNumber || 'N/A'}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                              
                              <div class="totals-section">
                                <h3>Payment Summary</h3>
                                <div class="totals-grid">
                                  ${Object.entries(invoiceData.totals).filter(([key, value]) => key !== 'total' && value > 0).map(([key, value]) => `
                                    <div class="total-line">
                                      <span>${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                      <span>₹${value.toLocaleString('en-IN')}</span>
                                    </div>
                                  `).join('')}
                                  ${invoiceData.totals.subtotal ? `
                                    <div class="total-line subtotal">
                                      <span>Subtotal:</span>
                                      <span>₹${invoiceData.totals.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                  ` : ''}
                                  ${invoiceData.totals.tax ? `
                                    <div class="total-line tax">
                                      <span>Tax:</span>
                                      <span>₹${invoiceData.totals.tax.toLocaleString('en-IN')}</span>
                                    </div>
                                  ` : ''}
                                  ${invoiceData.totals.discount ? `
                                    <div class="total-line discount">
                                      <span>Discount:</span>
                                      <span>-₹${invoiceData.totals.discount.toLocaleString('en-IN')}</span>
                                    </div>
                                  ` : ''}
                                  <div class="total-line final">
                                    <span>Total Amount:</span>
                                    <span>₹${invoiceData.totals.total.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div class="footer">
                              <h4>Thank You for Choosing Our Services!</h4>
                              <div class="thank-you">We appreciate your trust in our medical care</div>
                              <p>For any queries regarding this invoice, please contact us</p>
                              <p>Generated on ${new Date(invoiceData.generatedAt).toLocaleString('en-IN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                              <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
                                This is a computer-generated invoice and does not require a signature
                              </p>
                            </div>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center gap-1"
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Patient Information</h4>
                    <p><strong>Name:</strong> {invoiceData.patient.name}</p>
                    <p><strong>UH ID:</strong> {invoiceData.patient.uhId || 'N/A'}</p>
                    <p><strong>Phone:</strong> {invoiceData.patient.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {invoiceData.patient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Invoice Details</h4>
                    <p><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
                    <p><strong>Date:</strong> {new Date(invoiceData.generatedAt).toLocaleDateString()}</p>
                    <p><strong>Doctor:</strong> {invoiceData.doctor}</p>
                    <p><strong>Generated By:</strong> {invoiceData.generatedBy}</p>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Billing Details</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Type</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Description</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Amount (₹)</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Payment Method</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Invoice #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.billingRecords.map((bill, index) => (
                        <tr key={index} className="border-t border-slate-200">
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              bill.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                              bill.type === 'registration' ? 'bg-purple-100 text-purple-800' :
                              bill.type === 'service' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bill.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs">{bill.description}</td>
                          <td className="px-3 py-2 text-xs text-right font-medium">₹{bill.amount}</td>
                          <td className="px-3 py-2 text-xs">{bill.paymentMethod}</td>
                          <td className="px-3 py-2 text-xs">{bill.invoiceNumber || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  {Object.entries(invoiceData.totals).filter(([key, value]) => key !== 'total' && value > 0).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key}:</span>
                      <span className="font-medium">₹{value}</span>
                    </div>
                  ))}
                  {invoiceData.totals.subtotal && (
                    <div className="flex justify-between text-sm border-t border-slate-300 pt-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{invoiceData.totals.subtotal}</span>
                    </div>
                  )}
                  {invoiceData.totals.tax && (
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span className="font-medium">₹{invoiceData.totals.tax}</span>
                    </div>
                  )}
                  {invoiceData.totals.discount && (
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span className="font-medium text-green-600">-₹{invoiceData.totals.discount}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2 flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{invoiceData.totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Edit Invoice Form */}
              {isEditingInvoice && editedInvoiceData && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-4 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Invoice Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tax Section */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-slate-700">Tax Settings</h5>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Tax Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={editedInvoiceData.taxPercentage}
                          onChange={(e) => setEditedInvoiceData({
                            ...editedInvoiceData,
                            taxPercentage: parseFloat(e.target.value) || 0,
                            tax: 0
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                          placeholder="Enter tax percentage"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Or Fixed Tax Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={editedInvoiceData.tax}
                          onChange={(e) => setEditedInvoiceData({
                            ...editedInvoiceData,
                            tax: parseFloat(e.target.value) || 0,
                            taxPercentage: 0
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                          placeholder="Enter fixed tax amount"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Discount Section */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-slate-700">Discount Settings</h5>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={editedInvoiceData.discountPercentage}
                          onChange={(e) => setEditedInvoiceData({
                            ...editedInvoiceData,
                            discountPercentage: parseFloat(e.target.value) || 0,
                            discount: 0
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                          placeholder="Enter discount percentage"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Or Fixed Discount Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={editedInvoiceData.discount}
                          onChange={(e) => setEditedInvoiceData({
                            ...editedInvoiceData,
                            discount: parseFloat(e.target.value) || 0,
                            discountPercentage: 0
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                          placeholder="Enter fixed discount amount"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Invoice Notes
                    </label>
                    <textarea
                      value={editedInvoiceData.notes}
                      onChange={(e) => setEditedInvoiceData({
                        ...editedInvoiceData,
                        notes: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                      placeholder="Additional notes for the invoice..."
                    />
                  </div>

                  {/* Preview Section */}
                  <div className="mt-4 bg-white rounded-lg p-3 border border-slate-200">
                    <h5 className="font-medium text-slate-700 mb-2">Preview</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{editedInvoiceData.totals.total}</span>
                      </div>
                      {(() => {
                        const subtotal = editedInvoiceData.totals.total;
                        const taxAmount = editedInvoiceData.taxPercentage > 0 
                          ? (subtotal * editedInvoiceData.taxPercentage / 100)
                          : editedInvoiceData.tax;
                        const discountAmount = editedInvoiceData.discountPercentage > 0
                          ? (subtotal * editedInvoiceData.discountPercentage / 100)
                          : editedInvoiceData.discount;
                        const finalTotal = subtotal + taxAmount - discountAmount;
                        
                        return (
                          <>
                            {taxAmount > 0 && (
                              <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>₹{taxAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {discountAmount > 0 && (
                              <div className="flex justify-between">
                                <span>Discount:</span>
                                <span className="text-green-600">-₹{discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold border-t border-slate-300 pt-1">
                              <span>Total:</span>
                              <span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSaveInvoice}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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