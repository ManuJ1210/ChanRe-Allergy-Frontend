import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchReceptionistPatients } from '../../features/receptionist/receptionistThunks';
import ReceptionistLayout from './ReceptionistLayout';
import { 
  Users, 
  Search, 
  UserPlus, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Settings,
  FileText,
  Plus,
  Calculator,
  CreditCard,
  FileCheck,
  Download,
  Edit3,
  Trash2,
  Ban,
  RotateCcw,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../services/api';

export default function ReassignPatient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, loading } = useSelector((state) => state.receptionist);
  const { user } = useSelector((state) => state.auth);
  
  // Center information state
  const [centerInfo, setCenterInfo] = useState({
    name: 'CHANRE ALLERGY CENTER',
    address: 'No.414/65, 20th Main, West of Chord Road, 1st Block, Rajajinagara, Bangalore-560010',
    phone: '080-42516699',
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
          name: center.name || 'CHANRE ALLERGY CENTER',
          address: center.address || 'No.414/65, 20th Main, West of Chord Road, 1st Block, Rajajinagara, Bangalore-560010',
          phone: center.phone || '080-42516699',
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [finalFilteredPatients, setFinalFilteredPatients] = useState([]);
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [searchField, setSearchField] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [reassignData, setReassignData] = useState({
    newDoctorId: '',
    reason: '',
    notes: ''
  });

  // New workflow states
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelBillModal, setShowCancelBillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  const [invoiceFormData, setInvoiceFormData] = useState({
    registrationFee: '',
    consultationFee: '',
    serviceCharges: [{ name: '', amount: '', description: '' }],
    taxPercentage: 0,
    discountPercentage: 0,
    notes: ''
  });
  
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentType: 'full',
    notes: ''
  });
  
  const [cancelReason, setCancelReason] = useState('');
  const [refundData, setRefundData] = useState({
    amount: '',
    refundMethod: 'cash',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
    fetchAvailableDoctors();
    fetchCenterInfo(); // Fetch center information when component mounts
  }, [dispatch]);

  // Debug: Log patient data to see if currentDoctor is being received
  useEffect(() => {
    if (patients.length > 0) {
     
    }
  }, [patients]);

  const fetchAvailableDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const response = await API.get('/doctors');
      
      setAvailableDoctors(response.data || []);
    } catch (error) {
      
      toast.error('Failed to fetch available doctors');
      setAvailableDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Primary search filter
  useEffect(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.uhId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    setFilteredPatients(filtered);
    setShowSubSearch(filtered.length > 0 && searchTerm.trim() !== '');
    setCurrentPage(1);
  }, [patients, searchTerm]);

  // Sub-search filter
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
        case 'all':
        default:
          return patient.name?.toLowerCase().includes(searchLower) ||
                 patient.email?.toLowerCase().includes(searchLower) ||
                 patient.phone?.toLowerCase().includes(searchLower) ||
                 patient.uhId?.toLowerCase().includes(searchLower) ||
                 patient.assignedDoctor?.name?.toLowerCase().includes(searchLower);
      }
    });
    
    setFinalFilteredPatients(subFiltered);
    setCurrentPage(1);
  }, [filteredPatients, subSearchTerm, searchField]);

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
    setCurrentPage(1);
  };

  const handleReassignPatient = (patient) => {
    setSelectedPatient(patient);
    setReassignData({
      newDoctorId: '',
      reason: '',
      notes: ''
    });
    setShowReassignModal(true);
  };

  // New workflow functions
  const handleCreateInvoice = (patient) => {
    setSelectedPatient(patient);
    
    // Set invoice creation time
    setInvoiceCreationTime(new Date());
    
    setInvoiceFormData({
      registrationFee: '', // Reassigned patients don't pay registration fee again
      consultationFee: '1050', // Default consultation fee for reassigned patients
      serviceCharges: [{ name: '', amount: '', description: '' }],
      taxPercentage: 0,
      discountPercentage: 0,
      notes: `Invoice for reassigned patient: ${patient.name}`
    });
    setShowCreateInvoiceModal(true);
  };

  const handleInvoiceFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const invoicePayload = {
        patientId: selectedPatient._id,
        doctorId: selectedPatient.currentDoctor?._id || selectedPatient.currentDoctor,
        registrationFee: 0, // Reassigned patients don't pay registration fee
        consultationFee: parseFloat(invoiceFormData.consultationFee) || 0,
        serviceCharges: invoiceFormData.serviceCharges.filter(s => s.name && s.amount),
        notes: invoiceFormData.notes,
        taxPercentage: invoiceFormData.taxPercentage,
        discountPercentage: invoiceFormData.discountPercentage,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`
      };

      const response = await API.post('/billing/create-invoice', invoicePayload);
      
      if (response.data.success) {
        setGeneratedInvoice(response.data.invoice);
        setShowCreateInvoiceModal(false);
        setShowInvoicePreviewModal(true);
        toast.success('Invoice created successfully!');
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleProcessPayment = (invoice) => {
    setGeneratedInvoice(invoice);
    
    // Calculate total amount for payment
    const totalAmount = invoice.totals?.total || 0;
    
    setPaymentData({
      amount: totalAmount.toString(),
      paymentMethod: 'cash',
      paymentType: 'full',
      notes: `Payment for reassigned patient: ${selectedPatient?.name}`
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
      const invoiceNumber = generatedInvoice?.invoiceNumber || getReassignedBilling(selectedPatient)?.[0]?.invoiceNumber || `INV-${selectedPatient._id.slice(-6)}`;
      
      const paymentPayload = {
        patientId: selectedPatient._id,
        invoiceId: invoiceNumber,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        notes: paymentData.notes,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`
      };

      console.log('Processing payment:', paymentPayload);

      const response = await API.post('/billing/process-payment', paymentPayload);
      
      if (response.data.success) {
        toast.success('Payment processed successfully!');
        setShowPaymentModal(false);
        setShowInvoicePreviewModal(false);
        
        // Clear payment data
        setPaymentData({
          amount: '',
          paymentMethod: 'cash',
          paymentType: 'partial',
          notes: ''
        });
        
        // Refresh patient data
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

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
        reason: cancelReason,
        initiateRefund: true,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`
      };

      const response = await API.post('/billing/cancel-bill', cancelPayload);
      
      if (response.data.success) {
        toast.success('Bill cancelled successfully!');
        if (response.data.refundInitiated) {
          toast.info('Refund process initiated. Please process the refund.');
        }
        setShowCancelBillModal(false);
        setSelectedPatient(null);
        
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
    
    // Calculate total paid amount for refund
    const totalPaid = getReassignedBilling(patient)?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
    
    setRefundData({
      amount: totalPaid.toString(),
      refundMethod: 'cash',
      reason: 'Bill cancellation refund',
      notes: `Refund for cancelled bill - ${patient.name}`
    });
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const refundPayload = {
        patientId: selectedPatient._id,
        amount: parseFloat(refundData.amount),
        refundMethod: refundData.refundMethod,
        reason: refundData.reason,
        notes: refundData.notes,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`
      };

      const response = await API.post('/billing/process-refund', refundPayload);
      
      if (response.data.success) {
        toast.success('Refund processed successfully!');
        setShowRefundModal(false);
        setSelectedPatient(null);
        
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

  // Helper functions for invoice form
  const addServiceField = () => {
    setInvoiceFormData(prev => ({
      ...prev,
      serviceCharges: [...prev.serviceCharges, { name: '', amount: '', description: '' }]
    }));
  };

  const removeServiceField = (index) => {
    setInvoiceFormData(prev => ({
      ...prev,
      serviceCharges: prev.serviceCharges.filter((_, i) => i !== index)
    }));
  };

  const updateServiceField = (index, field, value) => {
    setInvoiceFormData(prev => ({
      ...prev,
      serviceCharges: prev.serviceCharges.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !reassignData.newDoctorId) {
      toast.error('Please select a new doctor');
      return;
    }

    try {
      const reassignPayload = {
        patientId: selectedPatient._id,
        newDoctorId: reassignData.newDoctorId,
        reason: reassignData.reason,
        notes: reassignData.notes,
        reassignedBy: user.name,
        reassignedAt: new Date().toISOString()
      };

    

      const response = await API.post('/patients/reassign', reassignPayload);
      
      if (response.data.success) {
        toast.success('Patient reassigned successfully!');
        
        // Close modal
        setShowReassignModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data
        await dispatch(fetchReceptionistPatients());
        
        // Navigate to consultation billing for the reassigned patient
        navigate('/dashboard/receptionist/consultation-billing', {
          state: { 
            reassignedPatient: {
              patientId: selectedPatient._id,
              patientName: selectedPatient.name,
              originalDoctor: response.data.data.originalDoctor,
              currentDoctor: response.data.data.currentDoctor,
              reason: reassignData.reason
            }
          }
        });
      } else {
        toast.error('Failed to reassign patient');
      }
    } catch (error) {
      
      toast.error('Failed to reassign patient');
    }
  };

  // Helper function to get reassigned billing records
  const getReassignedBilling = (patient) => {
    return (patient.billing || []).filter(bill => bill.isReassignedEntry);
  };

  // New workflow status logic
  const getPatientStatus = (patient) => {
    if (!patient.isReassigned) {
      return { status: 'Not Reassigned', color: 'text-slate-600 bg-slate-100', icon: <Clock className="h-4 w-4" /> };
    }

    // Filter billing records for reassigned entries
    const billing = getReassignedBilling(patient);
    
    if (billing.length === 0) {
      return { status: 'No Invoice', color: 'text-orange-600 bg-orange-100', icon: <AlertCircle className="h-4 w-4" /> };
    }

    // Check for cancelled bills
    const hasCancelled = billing.some(bill => bill.status === 'cancelled');
    if (hasCancelled) {
      const hasRefunded = billing.some(bill => bill.status === 'refunded');
      if (hasRefunded) {
        return { status: 'Refunded', color: 'text-purple-600 bg-purple-100', icon: <RotateCcw className="h-4 w-4" /> };
      }
      return { status: 'Bill Cancelled', color: 'text-red-600 bg-red-100', icon: <Ban className="h-4 w-4" /> };
    }

    // Check payment status
    const totalAmount = billing.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const totalPaid = billing.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    
    if (totalPaid === 0) {
      return { status: 'Pending Payment', color: 'text-orange-600 bg-orange-100', icon: <AlertCircle className="h-4 w-4" /> };
    } else if (totalPaid < totalAmount) {
      return { status: 'Partial Payment', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-4 w-4" /> };
    } else {
      return { status: 'Fully Paid', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-4 w-4" /> };
    }
  };

  const getStats = () => {
    const totalPatients = patients.length;
    const reassignedPatients = patients.filter(p => p.isReassigned);
    const noInvoice = reassignedPatients.filter(p => getPatientStatus(p).status === 'No Invoice').length;
    const pendingPayment = reassignedPatients.filter(p => getPatientStatus(p).status === 'Pending Payment').length;
    const fullyPaid = reassignedPatients.filter(p => getPatientStatus(p).status === 'Fully Paid').length;
    const cancelledBills = reassignedPatients.filter(p => getPatientStatus(p).status === 'Bill Cancelled').length;
    const refunded = reassignedPatients.filter(p => getPatientStatus(p).status === 'Refunded').length;
    
    return { totalPatients, reassignedPatients: reassignedPatients.length, noInvoice, pendingPayment, fullyPaid, cancelledBills, refunded };
  };

  // Helper function to get consultation fee details for debugging
  const getConsultationFeeDetails = (patient) => {
    if (!patient.isReassigned) {
      return null;
    }
    
    const reassignedBilling = getReassignedBilling(patient);
    if (!reassignedBilling || reassignedBilling.length === 0) {
      return null;
    }
    
    const currentDoctorId = patient.currentDoctor?._id || patient.currentDoctor;
    if (!currentDoctorId) {
      return null;
    }
    
    return reassignedBilling.find(bill => 
      (bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')) &&
      bill.doctorId && 
      bill.doctorId.toString() === currentDoctorId.toString()
    );
  };

  // Debug function to log all patient data
  const debugPatientData = (patient) => {
    console.log('🔍 FULL PATIENT DEBUG DATA:', {
      _id: patient._id,
      name: patient.name,
      isReassigned: patient.isReassigned,
      assignedDoctor: patient.assignedDoctor,
      currentDoctor: patient.currentDoctor,
      billing: patient.billing,
      reassignedBilling: getReassignedBilling(patient),
      reassignmentHistory: patient.reassignmentHistory
    });
  };

  const stats = getStats();

  return (
    <ReceptionistLayout>
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-md font-bold text-slate-800 mb-2">
                  Reassigned Patient Billing Workflow
                </h1>
                <p className="text-slate-600 text-sm">
                  Manage billing workflow for reassigned patients - create invoices, process payments, and handle refunds
                </p>
              </div>
              <div className="flex items-center gap-3">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                  <p className="text-lg font-bold text-slate-800">{stats.totalPatients}</p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Reassigned</p>
                  <p className="text-lg font-bold text-slate-800">{stats.reassignedPatients}</p>
                </div>
                <UserPlus className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">No Invoice</p>
                  <p className="text-lg font-bold text-orange-600">{stats.noInvoice}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Pending Payment</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.pendingPayment}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Fully Paid</p>
                  <p className="text-lg font-bold text-green-600">{stats.fullyPaid}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Cancelled/Refunded</p>
                  <p className="text-lg font-bold text-red-600">{stats.cancelledBills + stats.refunded}</p>
                </div>
                <Ban className="h-6 w-6 text-red-500" />
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-4 sm:p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-blue-500" />
                Reassigned Patients - Billing Status
              </h2>
              <p className="text-slate-600 mt-1 text-xs">
                {finalFilteredPatients.length} patients total ({stats.reassignedPatients} reassigned patients)
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Original Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Doctor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Billing Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Workflow Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {currentPatients.map((patient) => {
                        const hasDoctor = !!patient.assignedDoctor;
                        const isReassigned = !!patient.isReassigned;
                        const currentDoctor = patient.currentDoctor || patient.assignedDoctor;
                        const statusInfo = getPatientStatus(patient);
                        const hasBilling = getReassignedBilling(patient).length > 0;
                        
                        // Calculate billing totals
                        const reassignedBilling = getReassignedBilling(patient);
                        const totalAmount = reassignedBilling?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
                        const totalPaid = reassignedBilling?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
                        const amountDue = totalAmount - totalPaid;
                        
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
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  {patient.email || 'No email'}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  {patient.phone || 'No phone'}
                                </div>
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
                              <div className="text-xs text-slate-900">
                                {patient.currentDoctor?.name || patient.assignedDoctor?.name || 'Not Assigned'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusInfo.color}`}>
                                  {statusInfo.icon} {statusInfo.status}
                                </span>
                                {hasBilling && (
                                  <div className="text-xs text-slate-600">
                                    <div>Total: ₹{totalAmount.toLocaleString('en-IN')}</div>
                                    <div>Paid: ₹{totalPaid.toLocaleString('en-IN')}</div>
                                    <div>Due: ₹{amountDue.toLocaleString('en-IN')}</div>
                                    <div className="text-slate-500">Invoice #: {reassignedBilling?.[0]?.invoiceNumber || 'N/A'}</div>
                                  </div>
                                )}
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
                                {!isReassigned && (
                                  <button
                                    onClick={() => handleReassignPatient(patient)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Reassign Patient"
                                  >
                                    <UserPlus className="h-3 w-3" /> Reassign
                                  </button>
                                )}
                                {/* Workflow Actions for Reassigned Patients */}
                                {isReassigned && (
                                  <>
                                    {/* Create Invoice - for patients without billing */}
                                    {statusInfo.status === 'No Invoice' && (
                                      <button
                                        onClick={() => handleCreateInvoice(patient)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                        title="Create Invoice"
                                      >
                                        <Calculator className="h-3 w-3" /> Create Invoice
                                      </button>
                                    )}
                                    {/* Process Payment - for pending/partial payments */}
                                    {(statusInfo.status === 'Pending Payment' || statusInfo.status === 'Partial Payment') && (
                                      <button
                                        onClick={() => {
                                          // Generate invoice first, then process payment
                                          setSelectedPatient(patient);
                                          setShowInvoicePreviewModal(true);
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                        title="Process Payment"
                                      >
                                        <CreditCard className="h-3 w-3" /> Process Payment
                                      </button>
                                    )}
                                    {/* View Invoice - for patients with billing */}
                                    {hasBilling && (
                                      <button
                                        onClick={() => {
                                          setSelectedPatient(patient);
                                          setShowInvoicePreviewModal(true);
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
                                        <Ban className="h-3 w-3" /> Cancel
                                      </button>
                                    )}
                                    {/* Refund - for cancelled bills with payments */}
                                    {statusInfo.status === 'Bill Cancelled' && totalPaid > 0 && (
                                      <button
                                        onClick={() => handleProcessRefund(patient)}
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                        title="Process Refund"
                                      >
                                        <RotateCcw className="h-3 w-3" /> Refund
                                      </button>
                                    )}
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
        </div> {/* Closing the <div className="min-h-screen..."> */}
        
        {/* Reassignment Modal */}
        {showReassignModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Reassign Patient
                </h3>
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Patient:</strong> {selectedPatient.name}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Original Doctor:</strong> {selectedPatient.assignedDoctor?.name || 'Not Assigned'}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Current Doctor:</strong> {selectedPatient.currentDoctor?.name || selectedPatient.assignedDoctor?.name || 'Not Assigned'}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
                </p>
              </div>
              <form onSubmit={handleReassignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    New Doctor *
                  </label>
                  <select
                    value={reassignData.newDoctorId}
                    onChange={(e) => setReassignData({...reassignData, newDoctorId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  >
                    <option value="">
                      {doctorsLoading ? 'Loading doctors...' : 'Select a doctor'}
                    </option>
                    {availableDoctors.length === 0 && !doctorsLoading ? (
                      <option value="" disabled>No doctors available</option>
                    ) : (
                      availableDoctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.specialization || 'General'}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Reason for Reassignment *
                  </label>
                  <select
                    value={reassignData.reason}
                    onChange={(e) => setReassignData({...reassignData, reason: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  >
                    <option value="">Select a reason</option>
                    <option value="doctor_unavailable">Doctor Unavailable</option>
                    <option value="specialization_needed">Specialization Needed</option>
                    <option value="patient_request">Patient Request</option>
                    <option value="workload_management">Workload Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={reassignData.notes}
                    onChange={(e) => setReassignData({...reassignData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="Additional notes about the reassignment..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" /> Reassign Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Create Invoice Modal */}
        {showCreateInvoiceModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Create Invoice for Reassigned Patient
                </h3>
                <button
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800 mb-4">
                <p><strong>Patient:</strong> {selectedPatient.name} (UH ID: {selectedPatient.uhId || 'N/A'})</p>
                <p><strong>Current Doctor:</strong> {selectedPatient.currentDoctor?.name || 'N/A'}</p>
                <p>Reassigned patients do not pay registration fees again.</p>
              </div>

              <form onSubmit={handleInvoiceFormSubmit} className="space-y-4">
                {/* Consultation Fee */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Consultation Fee * (₹)
                  </label>
                  <input
                    type="number"
                    value={invoiceFormData.consultationFee}
                    onChange={(e) => setInvoiceFormData({...invoiceFormData, consultationFee: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    placeholder="e.g., 1050"
                  />
                </div>

                {/* Service Charges */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Additional Service Charges
                  </label>
                  <div className="space-y-3">
                    {invoiceFormData.serviceCharges.map((service, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateServiceField(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            placeholder="Service Name (e.g., Blood Test)"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={service.amount}
                            onChange={(e) => updateServiceField(index, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            placeholder="Amount"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeServiceField(index)}
                          className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                          disabled={invoiceFormData.serviceCharges.length === 1 && !service.name && !service.amount}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addServiceField}
                    className="mt-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-xs flex items-center gap-1 border border-slate-300"
                  >
                    <Plus className="h-3 w-3" /> Add Service
                  </button>
                </div>
                
                {/* Tax and Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Tax Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceFormData.taxPercentage}
                      onChange={(e) => setInvoiceFormData({...invoiceFormData, taxPercentage: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceFormData.discountPercentage}
                      onChange={(e) => setInvoiceFormData({...invoiceFormData, discountPercentage: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                      placeholder="e.g., 10"
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
                    placeholder="Notes for the invoice..."
                  />
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
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <Calculator className="h-4 w-4" /> Generate Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Preview Modal */}
        {showInvoicePreviewModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-xl" id="invoice-print">
              <div className="flex items-center justify-between mb-4 border-b pb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <ReceiptIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Invoice Preview - Reassigned Patient
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // Calculate outstanding amount
                      const reassignedBilling = getReassignedBilling(selectedPatient);
                      const totalAmount = reassignedBilling?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
                      const totalPaid = reassignedBilling?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0;
                      const outstandingAmount = totalAmount - totalPaid;
                      
                      // Create a mock invoice object for payment processing
                      const mockInvoice = {
                        invoiceNumber: reassignedBilling?.[0]?.invoiceNumber || `INV-${selectedPatient._id.slice(-6)}`,
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
                        notes: `Payment for reassigned patient: ${selectedPatient.name}`
                      });
                      
                      setShowInvoicePreviewModal(false);
                      setShowPaymentModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1"
                  >
                    <CreditCard className="h-3 w-3" />
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
                                padding: 10px;
                                color: #000;
                                background: white;
                                font-size: 11px;
                                line-height: 1.3;
                              }
                              
                              .invoice-container {
                                max-width: 210mm;
                                margin: 0 auto;
                                background: white;
                              }
                              
                              /* Header Styles */
                              .header-section {
                                border-bottom: 2px solid #d1d5db;
                                padding-bottom: 12px;
                                margin-bottom: 12px;
                              }
                              
                              .center-name {
                                font-size: 16px;
                                font-weight: bold;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin-bottom: 6px;
                              }
                              
                              .center-address {
                                font-size: 10px;
                                color: #374151;
                                line-height: 1.2;
                              }
                              
                              .document-title {
                                text-align: center;
                                font-size: 18px;
                                font-weight: bold;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                                margin: 12px 0;
                              }
                              
                              /* Patient Info Section */
                              .patient-info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 15px;
                                margin-bottom: 15px;
                              }
                              
                              .info-section h3 {
                                font-size: 13px;
                                font-weight: bold;
                                margin-bottom: 6px;
                                color: #000;
                              }
                              
                              .info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 6px;
                                font-size: 10px;
                              }
                              
                              .info-item {
                                margin-bottom: 3px;
                              }
                              
                              .info-label {
                                font-weight: 600;
                              }
                              
                              .info-value {
                                font-weight: bold;
                              }
                              
                              /* Table Styles */
                              .service-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 15px;
                                font-size: 10px;
                              }
                              
                              .service-table th,
                              .service-table td {
                                border: 1px solid #d1d5db;
                                padding: 6px;
                                text-align: left;
                              }
                              
                              .service-table th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                text-align: center;
                              }
                              
                              .service-table .text-center {
                                text-align: center;
                              }
                              
                              .service-table .text-right {
                                text-align: right;
                              }
                              
                              /* Financial Summary */
                              .financial-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 15px;
                                margin-bottom: 15px;
                              }
                              
                              .financial-section h3 {
                                font-size: 13px;
                                font-weight: bold;
                                margin-bottom: 6px;
                                color: #000;
                              }
                              
                              .financial-item {
                                display: flex;
                                justify-content: space-between;
                                padding: 3px 0;
                                border-bottom: 1px solid #d1d5db;
                                font-size: 10px;
                              }
                              
                              .financial-item.final {
                                border-bottom: 2px solid #9ca3af;
                                font-weight: bold;
                                font-size: 11px;
                              }
                              
                              /* Footer Section */
                              .footer-section {
                                border-top: 2px solid #d1d5db;
                                padding-top: 12px;
                                margin-top: 15px;
                              }
                              
                              .footer-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr 1fr;
                                gap: 15px;
                                margin-bottom: 12px;
                              }
                              
                              .footer-item {
                                font-size: 10px;
                              }
                              
                              .footer-label {
                                font-weight: 600;
                                margin-bottom: 3px;
                              }
                              
                              .signature-line {
                                border-bottom: 1px solid #9ca3af;
                                width: 100px;
                                margin: 6px 0 3px 0;
                              }
                              
                              /* Special Notes */
                              .special-notes {
                                background-color: #eff6ff;
                                border: 1px solid #bfdbfe;
                                padding: 8px;
                                margin-top: 12px;
                                font-size: 10px;
                              }
                              
                              .special-notes-title {
                                font-weight: 600;
                                color: #1e40af;
                                margin-bottom: 4px;
                              }
                              
                              .special-notes-content {
                                color: #1d4ed8;
                                line-height: 1.2;
                              }
                              
                              /* Colors */
                              .text-green-600 { color: #059669 !important; }
                              .text-orange-600 { color: #ea580c !important; }
                              .text-blue-600 { color: #2563eb !important; }
                              
                              /* Hide elements that shouldn't print */
                              .no-print,
                              button,
                              .action-buttons {
                                display: none !important;
                              }
                              
                              @media print {
                                body {
                                  margin: 0;
                                  padding: 8mm;
                                }
                                
                                .invoice-container {
                                  max-width: none;
                                  margin: 0;
                                }
                                
                                @page {
                                  size: A4;
                                  margin: 8mm;
                                }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="invoice-container">
                              ${invoiceContent}
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download PDF
                  </button>
                  
                  <button
                    onClick={() => setShowInvoicePreviewModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Professional Invoice Content */}
              <div className="bg-white">
                {/* Professional Invoice Header - Matching ChanRe Design */}
                <div className="bg-white p-6 border-b-2 border-gray-300 mb-6">
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-black uppercase tracking-wide mb-2">{centerInfo.name}</h1>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{centerInfo.address}</p>
                      <p>PH-{centerInfo.phone} | Fax-{centerInfo.fax}</p>
                      <div className="mt-2 space-y-1">
                        <p>For Information On Health, Treatment & Other Queries: <span className="text-blue-600">{centerInfo.website}</span></p>
                        <p>For Online Lab Reports: <span className="text-blue-600">{centerInfo.labWebsite}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Title */}
                  <div className="text-center mt-6">
                    <h2 className="text-2xl font-bold text-black uppercase tracking-wider">OUTPATIENT BILL</h2>
                    <p className="text-sm text-blue-600 mt-1">Reassigned Patient Billing</p>
                  </div>
                </div>

                {/* Conditional Invoice Selection */}
                {generatedInvoice || getReassignedBilling(selectedPatient).length > 0 ? (
                  <div className="space-y-6">
                    {/* Patient and Bill Information - Matching ChanRe Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Patient Information */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-black text-lg mb-4">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold">Patient Name:</span>
                            <p className="font-bold">{selectedPatient.name}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Date of Bill Generation:</span>
                            <p>{invoiceCreationTime ? invoiceCreationTime.toLocaleString('en-IN', { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true 
                            }) : new Date().toLocaleString('en-IN', { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true 
                            })}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Bill Number:</span>
                            <p className="font-bold">{getReassignedBilling(selectedPatient)?.[0]?.invoiceNumber || `OP${Date.now().toString().slice(-6)}`}</p>
                          </div>
                          <div>
                            <span className="font-semibold">File Number:</span>
                            <p>{selectedPatient.uhId || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Sex:</span>
                            <p className="capitalize">{selectedPatient.gender || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Age:</span>
                            <p>{selectedPatient.age ? `${selectedPatient.age} Years` : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Consultant Name:</span>
                            <p>{selectedPatient.currentDoctor?.name || 'Not Assigned'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Department:</span>
                            <p>Allergy & Immunology</p>
                          </div>
                          <div>
                            <span className="font-semibold">User Name / Lab ID:</span>
                            <p>{selectedPatient.uhId || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Password:</span>
                            <p>{selectedPatient.uhId ? `${selectedPatient.uhId}${selectedPatient.gender?.charAt(0) || 'P'}` : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Referring Doctor:</span>
                            <p>Self Referral</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-black text-lg mb-4">Contact Information</h3>
                        <div className="space-y-4 text-sm">
                          <div>
                            <span className="font-semibold">Phone Number:</span>
                            <p>{selectedPatient.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Email Address:</span>
                            <p>{selectedPatient.email || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Address:</span>
                            <p>{selectedPatient.address || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-semibold">City:</span>
                            <p>{selectedPatient.city || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Service Details Table - Matching ChanRe Format */}
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-black mb-4">Service Details</h3>
                      
                      <div className="border border-gray-300">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold text-black border border-gray-300">S.No</th>
                              <th className="px-4 py-3 text-left text-sm font-bold text-black border border-gray-300">Service Name</th>
                              <th className="px-4 py-3 text-center text-sm font-bold text-black border border-gray-300">Quantity</th>
                              <th className="px-4 py-3 text-right text-sm font-bold text-black border border-gray-300">Charges</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getReassignedBilling(selectedPatient)?.map((bill, index) => {
                              const getServiceName = (bill) => {
                                if (bill.type === 'consultation') return 'Consultation Fee';
                                if (bill.type === 'service') return bill.description || 'Service Charge';
                                return bill.description || `${bill.type} fee`;
                              };

                              const getServiceDescription = (bill) => {
                                if (bill.type === 'consultation') return 'Doctor consultation and examination';
                                if (bill.type === 'service') return bill.description || 'Medical service provided';
                                return bill.description || 'Service provided';
                              };
                              
                              return (
                                <tr key={index}>
                                  <td className="px-4 py-3 text-sm border border-gray-300">{index + 1}</td>
                                  <td className="px-4 py-3 text-sm border border-gray-300">
                                    <div>
                                      <div className="font-medium">{getServiceName(bill)}</div>
                                      <div className="text-xs text-gray-600">({getServiceDescription(bill)})</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm border border-gray-300">1</td>
                                  <td className="px-4 py-3 text-right text-sm font-bold border border-gray-300">
                                    {(bill.amount || 0).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-full max-w-xs space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <p>Subtotal:</p>
                          <p>₹{(generatedInvoice?.totals?.subtotal || getReassignedBilling(selectedPatient)?.[0]?.amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex justify-between">
                          <p>Tax ({generatedInvoice?.taxPercentage || 0}%):</p>
                          <p>₹{(generatedInvoice?.totals?.taxAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex justify-between">
                          <p>Discount ({generatedInvoice?.discountPercentage || 0}%):</p>
                          <p>-₹{(generatedInvoice?.totals?.discountAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-base text-blue-700">
                          <p>TOTAL AMOUNT:</p>
                          <p>₹{(generatedInvoice?.totals?.total || getReassignedBilling(selectedPatient)?.[0]?.amount || 0).toLocaleString('en-IN')}</p>
                        </div>

                        <div className="h-px bg-slate-300 my-2"></div>
                        
                        {/* Payment Status Summary */}
                        <div className="flex justify-between text-green-600 font-bold">
                          <p>Total Paid:</p>
                          <p>₹{(getReassignedBilling(selectedPatient)?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex justify-between text-red-600 font-bold">
                          <p>Amount Due:</p>
                          <p>₹{((generatedInvoice?.totals?.total || getReassignedBilling(selectedPatient)?.[0]?.amount || 0) - (getReassignedBilling(selectedPatient)?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0)).toLocaleString('en-IN')}</p>
                        </div>
                        
                      </div>
                    </div>

                    {/* Notes */}
                    {(generatedInvoice?.notes || getReassignedBilling(selectedPatient)?.[0]?.notes) && (
                      <div className="text-xs border-t pt-4 mt-4">
                        <p className="font-semibold text-slate-700">Notes:</p>
                        <p className="text-slate-600">{generatedInvoice?.notes || getReassignedBilling(selectedPatient)?.[0]?.notes}</p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">No invoice found for preview.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowInvoicePreviewModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => handleProcessPayment(generatedInvoice || getReassignedBilling(selectedPatient)?.[0])}
                  disabled={getReassignedBilling(selectedPatient)?.every(b => (b.amount || 0) <= (b.paidAmount || 0)) && !generatedInvoice}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="h-4 w-4" /> Process Payment
                </button>
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
                  Process Payment for Invoice #{generatedInvoice?.invoiceNumber || getReassignedBilling(selectedPatient)?.[0]?.invoiceNumber || 'N/A'}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                <strong>Patient:</strong> {selectedPatient.name}
                <br />
                <strong>Total Amount:</strong> ₹{(generatedInvoice?.totals?.total || getReassignedBilling(selectedPatient)?.[0]?.amount || 0).toLocaleString('en-IN')}
                <br />
                <strong>Amount Due:</strong> ₹{((generatedInvoice?.totals?.total || getReassignedBilling(selectedPatient)?.[0]?.amount || 0) - (getReassignedBilling(selectedPatient)?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0)).toLocaleString('en-IN')}
              </p>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Amount to Pay *
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI/Net Banking</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
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
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" /> Process Payment
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
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Ban className="h-5 w-5 mr-2 text-red-500" /> Cancel Bill
                </h3>
                <button
                  onClick={() => setShowCancelBillModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to cancel the bill for **{selectedPatient.name}**? This action will mark the bill as cancelled and potentially initiate a refund for any amounts paid.
              </p>
              <form onSubmit={handleCancelBillSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Cancellation Reason *
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs"
                    placeholder="Briefly explain the reason for cancellation"
                  />
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
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <Ban className="h-4 w-4" /> Confirm Cancellation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <RotateCcw className="h-5 w-5 mr-2 text-purple-500" /> Process Refund
                </h3>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Processing a refund for **{selectedPatient.name}** for the cancelled bill.
                <br />
                <strong>Max Refundable:</strong> ₹{(getReassignedBilling(selectedPatient)?.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0) || 0).toLocaleString('en-IN')}
              </p>
              <form onSubmit={handleRefundSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Refund Amount *
                  </label>
                  <input
                    type="number"
                    value={refundData.amount}
                    onChange={(e) => setRefundData({...refundData, amount: e.target.value})}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                    placeholder="Enter amount to refund"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Refund Method *
                  </label>
                  <select
                    value={refundData.refundMethod}
                    onChange={(e) => setRefundData({...refundData, refundMethod: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="card_reversal">Card Reversal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Reason for Refund *
                  </label>
                  <input
                    type="text"
                    value={refundData.reason}
                    onChange={(e) => setRefundData({...refundData, reason: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                    placeholder="Enter refund reason"
                  />
                </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={refundData.notes}
                  onChange={(e) => setRefundData({...refundData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
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
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium"
                >
                  Process Refund
                </button>
            </div>
            </form>
          </div>
        </div>
      )}

      </>
    </ReceptionistLayout>
  );
}