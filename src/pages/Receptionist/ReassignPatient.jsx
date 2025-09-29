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
  Receipt as ReceiptIcon,
  Bell,
  Receipt
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../services/api';
// InvoiceDisplay component not found - commenting out the import
// import InvoiceDisplay from '../../components/billing/InvoiceDisplay'; 

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

  // New workflow states - Same as ConsultationBilling
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelBillModal, setShowCancelBillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  const [invoiceFormData, setInvoiceFormData] = useState({
    registrationFee: 0, // Reassigned patients don't pay registration fee again
    consultationFee: 850, // Default consultation fee (will be adjusted based on type)
    serviceCharges: [{ name: '', amount: '', description: '' }],
    taxPercentage: 0,
    discountPercentage: 0,
    notes: '',
    consultationType: 'OP' // OP, IP, or followup
  });
  
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    receiptNumber: '',
    paymentMethod: 'cash',
    paymentType: 'full', // full or partial
    notes: '',
    appointmentTime: '',
    consultationType: 'OP',
    markAsPaid: true
  });
  
  const [cancelReason, setCancelReason] = useState('');
  const [refundData, setRefundData] = useState({
    amount: '',
    refundMethod: 'cash',
    reason: '',
    paymentReference: '',
    notes: ''
  });

  // Followup eligibility tracking
  const [followupChecked, setFollowupChecked] = useState(false);

  // Invoice data for InvoiceDisplay component 
  const [invoiceData, setInvoiceData] = useState(null);

  // Invoice editing states
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editedInvoiceData, setEditedInvoiceData] = useState(null);

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
      const allDoctors = response.data || [];
      
      // Filter out the current doctor of selected patient and doctors already assigned to other patients
      const filtered = allDoctors.filter(doctor => {
        // Exclude current doctor of selected patient
        if (selectedPatient?.currentDoctor?._id === doctor._id) {
          return false;
        }
        
        // Exclude doctors already assigned to other patients
        const isAssignedToOtherPatient = patients.some(patient => 
          patient._id !== selectedPatient?._id && 
          patient.isReassigned && 
          patient.currentDoctor?._id === doctor._id
        );
        
        return !isAssignedToOtherPatient;
      });
      
      setAvailableDoctors(filtered);
    } catch (error) {
      console.error('Error fetching doctors:', error);
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
    
    // Check followup eligibility
    const followupEligibility = getFollowupEligibility(patient);
    
    // Set invoice creation time
    setInvoiceCreationTime(new Date());
    
    // Determine default consultation type and fee
    let defaultConsultationType = 'IP'; // Default for reassigned patients
    let defaultConsultationFee = getConsultationFee(patient, 'IP');
    
    // If eligible for followup, consider it as default option
    if (followupEligibility.eligible) {
      defaultConsultationType = 'followup';
      defaultConsultationFee = getConsultationFee(patient, 'followup');
    }
    
    setInvoiceFormData({
      registrationFee: 0, // Reassigned patients don't pay registration fee again
      consultationFee: defaultConsultationFee.toString(),
      serviceCharges: [{ name: '', amount: '', description: '' }],
      taxPercentage: 0,
      discountPercentage: 0,
      notes: `Invoice for reassigned patient: ${patient.name}`,
      consultationType: defaultConsultationType
    });
    
    // Reset followup check
    setFollowupChecked(false);
    setShowCreateInvoiceModal(true);
  };

  const handleInvoiceFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('No patient selected');
      return;
    }

    const currentDoctorId = getCurrentDoctorId(selectedPatient);
    if (!currentDoctorId) {
      toast.error('Current/reassigned doctor not found for patient');
      return;
    }

    // Consultation fee will be calculated automatically based on type
    // No need to validate user input since it's system-calculated

    try {
      // Determine actual consultation fee based on type
      const consultationType = invoiceFormData.consultationType || 'OP';
      const calculatedFee = getConsultationFee(selectedPatient, consultationType);
      
      const invoicePayload = {
        patientId: selectedPatient._id,
        doctorId: getCurrentDoctorId(selectedPatient),
        registrationFee: 0, // Reassigned patients don't pay registration fee


        consultationFee: calculatedFee,
        consultationType: consultationType,
        serviceCharges: invoiceFormData.serviceCharges.filter(s => s.name && s.amount).map(s => ({
          name: s.name,
          amount: parseFloat(s.amount) || 0,
          description: s.description || s.name
        })),
        notes: invoiceFormData.notes || `Invoice for reassigned patient: ${selectedPatient.name}`,
        taxPercentage: parseFloat(invoiceFormData.taxPercentage) || 0,
        discountPercentage: parseFloat(invoiceFormData.discountPercentage) || 0,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`,
        centerId: getCenterId(),
        createdBy: user?.id || user?._id,
        createdAt: new Date().toISOString(),
        followupEligible: getFollowupEligibility(selectedPatient).eligible,
        isFollowupConsultation: consultationType === 'followup'
      };

      console.log('Creating invoice with payload:', invoicePayload);

      const response = await API.post('/billing/create-invoice', invoicePayload);
      
      if (response.data.success) {
        toast.success('Invoice created successfully!');
        
        // Clear invoice form
        setInvoiceFormData({
          registrationFee: '',
          consultationFee: '1050',
          serviceCharges: [{ name: '', amount: '', description: '' }],
          taxPercentage: 0,
          discountPercentage: 0,
          notes: ''
        });
        
        // Close create modal and open preview
        setShowCreateInvoiceModal(false);
        
        // Refresh patient data to get the new invoice
        await dispatch(fetchReceptionistPatients());
        
        // Show invoice preview with updated data
        setTimeout(() => {
          setShowInvoicePreviewModal(true);
        }, 500);
        
      } else {
        toast.error(response.data.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error('Patient or doctor not found');
      } else if (error.response?.status === 422) {
        toast.error('Validation error: Please check all fields');
      } else {
        toast.error('Failed to create invoice. Please try again.');
      }
    }
  };

  const handleProcessPayment = (invoice) => {
    // invoice here might be the generatedInvoice object or the prepared data from View Bill
    setGeneratedInvoice(invoice);
    
    // Calculate total amount for payment
    // We use the total from the invoice object for accuracy
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
      // Get reassigned billing data
      const reassignedBilling = getReassignedBilling(selectedPatient);
      
      if (!reassignedBilling || reassignedBilling.length === 0) {
        toast.error('No invoice found for this patient');
        return;
      }

      // Get the first billing entry (for reassigned patients, there should be one main invoice)
      const currentBill = reassignedBilling[0];
      
      const paymentPayload = {
        patientId: selectedPatient._id,
        doctorId: getCurrentDoctorId(selectedPatient),
        invoiceId: currentBill._id || currentBill.id, // Use billing record ID
        invoiceNumber: currentBill.invoiceNumber,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        notes: paymentData.notes,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`,
        billingRecordId: currentBill._id || currentBill.id
      };

      console.log('Processing payment with payload:', paymentPayload);

      const response = await API.post('/billing/process-payment', paymentPayload);
      
      if (response.data.success) {
        toast.success('Payment processed successfully!');
        
        // Clear modals
        setShowPaymentModal(false);
        setShowInvoicePreviewModal(false);
        
        // Clear payment data
        setPaymentData({
          amount: '',
          paymentMethod: 'cash',
          paymentType: 'full',
          notes: ''
        });
        
        // Clear generated invoice to force fresh data
        setGeneratedInvoice(null);
        
        // Refresh patient data to get updated billing information
        await dispatch(fetchReceptionistPatients());
        
        // Show updated invoice after payment
        setTimeout(() => {
          setShowInvoicePreviewModal(true);
        }, 500);
        
      } else {
        toast.error(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // More specific error handling
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 422) {
        toast.error('Validation error: Please check all fields');
      } else if (error.response?.status === 404) {
        toast.error('Invoice or patient not found');
      } else {
        toast.error('Failed to process payment. Please try again.');
      }
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
    
    const currentDoctorId = getCurrentDoctorId(patient);
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

  // Helper function to check followup eligibility for reassigned patients
  const getFollowupEligibility = (patient) => {
    if (!patient.isReassigned) {
      return { eligible: false, reason: 'Patient not reassigned' };
    }

    // Check if patient has already had a followup consultation
    const reassignedBilling = getReassignedBilling(patient);
    const hasFollowupConsultation = reassignedBilling.some(bill => 
      bill.consultationType === 'followup' || bill.description?.toLowerCase().includes('followup')
    );

    if (hasFollowupConsultation) {
      return { eligible: false, reason: 'Followup consultation already provided', used: true };
    }

    // Check time since original consultation (within 7 days)
    // Use reassignment date or original doctor consultation date
    const originalDate = patient.reassignmentDate || patient.assignedDoctor?.consultationDate || patient.createdAt;
    const originalConsultationDate = new Date(originalDate);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - originalConsultationDate) / (1000 * 60 * 60 * 24));

    if (daysDifference > 7) {
      return { eligible: false, reason: 'Outside 7-day followup window', daysPast: daysDifference };
    }

    return { 
      eligible: true, 
      reason: 'Eligible for free followup consultation', 
      daysLeft: 7 - daysDifference 
    };
  };

  // Helper function to get consultation fee based on type
  const getConsultationFee = (patient, consultationType) => {
    const followupEligibility = getFollowupEligibility(patient);
    
    if (consultationType === 'followup' && followupEligibility.eligible) {
      return 0; // Free followup consultation within 7 days
    }
    
    if (consultationType === 'IP') {
      return 1050; // IP consultation fee for reassigned patients
    }
    
    return 850; // Default OP consultation fee
  };

  // Helper function to get current/reassigned doctor name
  const getCurrentDoctorName = (patient) => {
    if (!patient.isReassigned) {
      return patient.currentDoctor?.name || patient.assignedDoctor?.name || 'Not Assigned';
    }

    // For reassigned patients, check multiple possible fields
    if (patient.reassignedDoctor?.name) {
      return patient.reassignedDoctor.name;
    }
    
    if (patient.currentDoctor?.name) {
      return patient.currentDoctor.name;
    }

    // Check reassignment history if available
    if (patient.reassignmentHistory && patient.reassignmentHistory.length > 0) {
      const latestReassignment = patient.reassignmentHistory[patient.reassignmentHistory.length - 1];
      if (latestReassignment?.newDoctor?.name) {
        return latestReassignment.newDoctor.name;
      }
    }

    return 'Reassigned Doctor Not Found';
  };

  // Helper function to get current/reassigned doctor ID
  const getCurrentDoctorId = (patient) => {
    if (!patient.isReassigned) {
      return patient.currentDoctor?._id || patient.currentDoctor?.id || patient.currentDoctor || patient.assignedDoctor?._id;
    }

    // For reassigned patients, check multiple possible fields
    if (patient.reassignedDoctor?._id || patient.reassignedDoctor?.id) {
      return patient.reassignedDoctor._id || patient.reassignedDoctor.id;
    }
    
    if (patient.currentDoctor?._id || patient.currentDoctor?.id) {
      return patient.currentDoctor._id || patient.currentDoctor.id;
    }

    // Check reassignment history if available
    if (patient.reassignmentHistory && patient.reassignmentHistory.length > 0) {
      const latestReassignment = patient.reassignmentHistory[patient.reassignmentHistory.length - 1];
      if (latestReassignment?.newDoctor?._id) {
        return latestReassignment.newDoctor._id;
      }
    }

    return null;
  };

  // Helper function to convert numbers to words (from ConsultationBilling)
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

  // Function to prepare invoice data for reassigned patients
  const prepareInvoiceData = (patient) => {
    const reassignedBilling = getReassignedBilling(patient);
    
    if (!patient || !reassignedBilling || reassignedBilling.length === 0) {
      return null;
    }

    // Calculate totals from reassigned billing
    const totalAmount = reassignedBilling.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const totalPaid = reassignedBilling.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    
    // Prepare service charges
    const serviceCharges = reassignedBilling
      .filter(bill => bill.type === 'service')
      .map(bill => ({
        name: bill.description || 'Service Charge',
        amount: bill.amount || 0,
        description: bill.description || 'Medical service provided'
      }));

    // Get consultation fee (reassigned patients don't pay registration fee)
    const consultationFee = reassignedBilling.find(bill => 
      bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
    )?.amount || 0;

    // Get registration fee (should be 0 for reassigned patients, but check just in case)
    const registrationFee = reassignedBilling.find(bill => bill.type === 'registration')?.amount || 0;

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
        name: getCurrentDoctorName(patient),
        specializations: (() => {
          const doctor = patient.currentDoctor || patient.reassignedDoctor;
          if (doctor?.specializations && Array.isArray(doctor.specializations) && doctor.specializations.length > 0) {
            return doctor.specializations.join(', ');
          }
          if (doctor?.specializations && typeof doctor.specializations === 'string' && doctor.specializations.trim()) {
            return doctor.specializations;
          }
          if (doctor?.specialization) {
            return doctor.specialization;
          }
          return 'Allergy & Immunology';
        })()
      },
      registrationFee,
      consultationFee,
      serviceCharges,
      totals: {
        subtotal: totalAmount,
        discount: 0,
        tax: 0,
        total: totalAmount,
        paid: totalPaid, // Added paid field
        due: totalAmount - totalPaid // Added due field
      },
      invoiceNumber: reassignedBilling[0]?.invoiceNumber || `RP-${patient._id.slice(-6)}`,
      date: new Date(reassignedBilling[0]?.createdAt || new Date()),
      generatedBy: user?.name || 'Receptionist',
      password: patient.uhId ? `${patient.uhId}${patient.gender?.charAt(0) || 'P'}` : 'N/A'
    };
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
                  <button onClick={() => dispatch(fetchReceptionistPatients())} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" >
                    <RefreshCw className="h-4 w-4" /> Refresh
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
                        <X className="h-3 w-3" /> Clear All
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
                  <UserPlus className="h-5 w-5 mr-2 text-blue-500" /> Reassigned Patients - Billing Status
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
                                    <Mail className="h-3 w-3 text-slate-400" /> {patient.email || 'No email'}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3 text-slate-400" /> {patient.phone || 'No phone'}
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
                                  {getCurrentDoctorName(patient)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.icon}
                                  {statusInfo.status}
                                </span>
                                {hasBilling && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    <span className="font-semibold">₹{totalAmount.toFixed(2)}</span> total,
                                    <span className={`font-semibold ${amountDue > 0 ? 'text-red-500' : 'text-green-500'}`}> ₹{amountDue.toFixed(2)}</span> due
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-xs flex flex-col gap-1">
                                  {/* 1. Reassign Button */}
                                  {isReassigned ? (
                                    <button
                                      onClick={() => handleReassignPatient(patient)}
                                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1 border border-yellow-200"
                                    >
                                      <RotateCcw className="h-3 w-3" /> Reassign Again
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleReassignPatient(patient)}
                                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-1 border border-red-200"
                                    >
                                      <UserPlus className="h-3 w-3" /> Reassign
                                    </button>
                                  )}

                                  {/* 2. Billing Buttons (Conditional based on isReassigned) */}
                                  {isReassigned && (
                                    <>
                                      {/* Create Invoice / View Invoice button */}
                                      {!hasBilling || statusInfo.status === 'Bill Cancelled' || statusInfo.status === 'Refunded' ? (
                                        <button
                                          onClick={() => handleCreateInvoice(patient)}
                                          disabled={statusInfo.status === 'Bill Cancelled' || statusInfo.status === 'Refunded'}
                                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center gap-1 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <Calculator className="h-3 w-3" /> Create Invoice
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSelectedPatient(patient);
                                            setShowInvoicePreviewModal(true);
                                          }}
                                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 border border-blue-200"
                                        >
                                          <Eye className="h-3 w-3" /> View Bill
                                        </button>
                                      )}

                                      {/* Payment / Refund / Cancel Bill buttons */}
                                      {hasBilling && statusInfo.status !== 'Bill Cancelled' && statusInfo.status !== 'Refunded' && (
                                        <>
                                          {/* Pay Button */}
                                          {amountDue > 0 && (
                                            <button
                                              onClick={() => handleProcessPayment(getReassignedBilling(patient)[0])}
                                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                                            >
                                              <CreditCard className="h-3 w-3" /> Pay ₹{amountDue.toFixed(2)}
                                            </button>
                                          )}

                                          {/* Cancel Bill Button */}
                                          <button
                                            onClick={() => handleCancelBill(patient)}
                                            className="text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                                          >
                                            <Trash2 className="h-3 w-3" /> Cancel Bill
                                          </button>
                                        </>
                                      )}

                                      {/* Refund Button (for cancelled/paid bills) */}
                                      {statusInfo.status === 'Bill Cancelled' && totalPaid > 0 && (
                                        <button
                                          onClick={() => handleProcessRefund(patient)}
                                          className="text-xs px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                                        >
                                          <RotateCcw className="h-3 w-3" /> Process Refund
                                        </button>
                                      )}

                                      {/* Debug Button */}
                                      <button
                                        onClick={() => debugPatientData(patient)}
                                        className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 border border-slate-200"
                                      >
                                        <Settings className="h-3 w-3" /> Debug
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              {/* Pagination */}
              {finalFilteredPatients.length > patientsPerPage && (
                <div className="flex justify-between items-center p-4 sm:p-6 border-t border-slate-200">
                  <div className="text-xs text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, finalFilteredPatients.length)} of {finalFilteredPatients.length} patients
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Rows per page:</span>
                      <select
                        value={patientsPerPage}
                        onChange={(e) => handlePatientsPerPageChange(e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-slate-700 font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- MODALS --- */}

        {/* Reassign Patient Modal */}
        {showReassignModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" onClick={() => setShowReassignModal(false)}>
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-blue-500" /> Reassign Patient
                </h2>
                
                <p className="text-sm text-slate-600 mb-4">
                  Reassigning patient <span className="font-semibold text-blue-600">{selectedPatient.name}</span> (UH ID: {selectedPatient.uhId}) from Dr. {getCurrentDoctorName(selectedPatient)}.
                </p>

                <form onSubmit={handleReassignSubmit} className="space-y-4">
                  {/* Current Doctor */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Current Doctor
                    </label>
                    <p className="text-sm font-semibold text-slate-800">{getCurrentDoctorName(selectedPatient)}</p>
                  </div>

                  {/* New Doctor Selection */}
                  <div>
                    <label htmlFor="newDoctor" className="block text-sm font-medium text-slate-700 mb-2">
                      New Doctor *
                    </label>
                    <select
                      id="newDoctor"
                      value={reassignData.newDoctorId}
                      onChange={(e) => setReassignData({...reassignData, newDoctorId: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select a Doctor</option>
                      {doctorsLoading ? (
                        <option disabled>Loading doctors...</option>
                      ) : (
                        availableDoctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Reason for Reassignment */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                      Reason for Reassignment *
                    </label>
                    <input
                      id="reason"
                      type="text"
                      value={reassignData.reason}
                      onChange={(e) => setReassignData({...reassignData, reason: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., Doctor A is on leave, Specialist referral"
                    />
                  </div>
                  
                  {/* Notes (Optional) */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      id="notes"
                      value={reassignData.notes}
                      onChange={(e) => setReassignData({...reassignData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Any additional details for the record"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReassignModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!reassignData.newDoctorId || !reassignData.reason}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <UserCheck className="h-5 w-5" />
                      Confirm Reassignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Invoice Modal */}
        {showCreateInvoiceModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" onClick={() => setShowCreateInvoiceModal(false)}>
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-green-500" /> Create Invoice for Reassigned Patient
                </h2>
                
                <p className="text-sm text-slate-600 mb-4">
                  Patient: <span className="font-semibold text-blue-600">{selectedPatient.name}</span> (UH ID: {selectedPatient.uhId})
                  <br />
                  Doctor: <span className="font-semibold text-blue-600">{getCurrentDoctorName(selectedPatient)}</span>
                </p>

                <form onSubmit={handleInvoiceFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  
                  {/* Consultation Type and Fee */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="consultationType" className="block text-sm font-medium text-slate-700 mb-2">
                        Consultation Type *
                      </label>
                      <select
                        id="consultationType"
                        value={invoiceFormData.consultationType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const newFee = getConsultationFee(selectedPatient, newType);
                          setInvoiceFormData(prev => ({ 
                            ...prev, 
                            consultationType: newType, 
                            consultationFee: newFee.toString() 
                          }));
                        }}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      >
                        <option value="OP">OP Consultation (₹850)</option>
                        <option value="IP">IP Consultation (₹1050)</option>
                        {getFollowupEligibility(selectedPatient).eligible && (
                          <option value="followup">Followup Consultation (Free)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="consultationFee" className="block text-sm font-medium text-slate-700 mb-2">
                        Consultation Fee (System Calculated)
                      </label>
                      <input
                        id="consultationFee"
                        type="number"
                        value={invoiceFormData.consultationFee}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Service Charges */}
                  <div className="border border-slate-200 p-4 rounded-lg space-y-3">
                    <h3 className="text-md font-semibold text-slate-800">Additional Service Charges</h3>
                    {invoiceFormData.serviceCharges.map((service, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Service Name</label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateServiceField(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                            placeholder="e.g., Injection, Dressings"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                          <input
                            type="number"
                            value={service.amount}
                            onChange={(e) => updateServiceField(index, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                            placeholder="0.00"
                          />
                        </div>
                        {invoiceFormData.serviceCharges.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceField(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addServiceField}
                      className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 mt-3"
                    >
                      <Plus className="h-3 w-3" /> Add Service
                    </button>
                  </div>
                  
                  {/* Tax and Discount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tax" className="block text-sm font-medium text-slate-700 mb-2">
                        Tax Percentage (%)
                      </label>
                      <input
                        id="tax"
                        type="number"
                        min="0"
                        value={invoiceFormData.taxPercentage}
                        onChange={(e) => setInvoiceFormData({...invoiceFormData, taxPercentage: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="discount" className="block text-sm font-medium text-slate-700 mb-2">
                        Discount Percentage (%)
                      </label>
                      <input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={invoiceFormData.discountPercentage}
                        onChange={(e) => setInvoiceFormData({...invoiceFormData, discountPercentage: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                      Invoice Notes (for patient)
                    </label>
                    <textarea
                      id="notes"
                      value={invoiceFormData.notes}
                      onChange={(e) => setInvoiceFormData({...invoiceFormData, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g., Payment due immediately. Thank you for your visit."
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowCreateInvoiceModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FileText className="h-5 w-5" />
                      Generate & Preview Invoice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Preview Modal */}
        {showInvoicePreviewModal && selectedPatient && (
          <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" 
            onClick={() => {
              setShowInvoicePreviewModal(false);
              setGeneratedInvoice(null);
            }}
          >
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowInvoicePreviewModal(false);
                    setGeneratedInvoice(null);
                  }}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 z-10 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-blue-500" /> Invoice Preview
                </h2>
                
                {/* Invoice Display Content */}
                {(() => {
                  // Determine which invoice data to display: the freshly generated one, or the one prepared from existing billing records
                  const invoiceDataToDisplay = generatedInvoice || prepareInvoiceData(selectedPatient);

                  if (!invoiceDataToDisplay) {
                    return (
                      <div className="text-center py-8">
                        <AlertCircle className="h-10 w-10 text-orange-400 mx-auto mb-4" />
                        <p className="text-sm text-slate-600">No invoice data available for preview. Billing records might be missing or corrupt.</p>
                      </div>
                    );
                  }

                  // Data is ready, render the content
                  const amountDue = invoiceDataToDisplay.totals?.due || 0;
                  
                  return (
                    <div className="space-y-4">
                      {/* Print-friendly section - use max height and scroll for large invoices */}
                      <div className="max-h-[70vh] overflow-y-auto pr-2"> 
                        <div className="bg-white p-6 max-w-4xl mx-auto relative">
                          {/* Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <div className="text-6xl font-bold text-gray-200 transform -rotate-45 select-none">
                              DUPLICA
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="relative z-10">
                            {/* Header */}
                            <div className="text-center mb-6">
                              <h1 className="text-base font-bold text-slate-900 mb-1">
                                {centerInfo.name}
                              </h1>
                              <p className="text-xs text-slate-600 leading-tight">
                                {centerInfo.address}
                              </p>
                              <p className="text-xs text-slate-600">
                                PH-{centerInfo.phone} | Fax-{centerInfo.fax}
                              </p>
                            </div>

                            {/* Title */}
                            <div className="text-center mb-6">
                              <h2 className="text-lg font-bold text-slate-900 uppercase">
                                REASSIGNED PATIENT BILL
                              </h2>
                            </div>

                            {/* Patient Details */}
                            <div className="grid grid-cols-2 gap-x-8 mb-6">
                              <div>
                                <div className="space-y-1 text-xs">
                                  <div><span className="font-medium">Name:</span> {invoiceDataToDisplay.patient.name}</div>
                                  <div><span className="font-medium">Date:</span> {new Date(invoiceDataToDisplay.date).toLocaleDateString('en-GB')}</div>
                                  <div><span className="font-medium">Bill No:</span> {invoiceDataToDisplay.invoiceNumber}</div>
                                  <div><span className="font-medium">Sex:</span> {invoiceDataToDisplay.patient.gender}</div>
                                  <div><span className="font-medium">Age:</span> {invoiceDataToDisplay.patient.age}Y</div>
                                </div>
                              </div>
                              <div>
                                <div className="space-y-1 text-xs">
                                  <div><span className="font-medium">Consultant Name:</span> {invoiceDataToDisplay.doctor.name}</div>
                                  <div><span className="font-medium">Department:</span> {invoiceDataToDisplay.doctor.specializations}</div>
                                  <div><span className="font-medium">UH ID:</span> {invoiceDataToDisplay.patient.uhId}</div>
                                  <div><span className="font-medium">Password:</span> {invoiceDataToDisplay.password}</div>
                                </div>
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="flex justify-end mb-6">
                              <div className="w-80">
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Total Amount:</span>
                                    <span>₹{invoiceDataToDisplay.totals.total.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Amount Paid:</span>
                                    <span className="text-green-600 font-medium">₹{(invoiceDataToDisplay.totals.paid || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-slate-300 pt-1">
                                    <span>Amount Due:</span>
                                    <span className="text-orange-600 font-medium">₹{(invoiceDataToDisplay.totals.due || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Terms */}
                            <div className="text-xs mb-4">
                              <p><strong>Terms:</strong> Amount is not acceptable after three days from the bill date.</p>
                              <p><strong>Please retain this bill carefully</strong></p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer buttons for Payment and Close */}
                      <div className="flex justify-end gap-3 border-t pt-4">
                        
                        {/* Payment Button (Only if amount is due) */}
                        {amountDue > 0 && (
                          <button
                            onClick={() => handleProcessPayment(invoiceDataToDisplay)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" /> Process Payment: ₹{amountDue.toFixed(2)}
                          </button>
                        )}
                        
                        {/* Status Paid (If no amount is due) */}
                        {amountDue <= 0 && (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-green-200">
                            <CheckCircle className="h-4 w-4" /> Fully Paid
                          </span>
                        )}
                        
                        <button
                          onClick={() => {
                            setShowInvoicePreviewModal(false);
                            setGeneratedInvoice(null);
                          }}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPatient && generatedInvoice && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" onClick={() => setShowPaymentModal(false)}>
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-blue-500" /> Process Payment
                </h2>
                
                <p className="text-sm text-slate-600 mb-4">
                  Patient: <span className="font-semibold text-blue-600">{selectedPatient.name}</span>
                </p>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <p className="text-xs font-medium text-blue-700">Invoice Total: ₹{generatedInvoice.totals?.total?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs font-medium text-blue-700">Total Paid: ₹{generatedInvoice.totals?.paid?.toFixed(2) || '0.00'}</p>
                  <p className="text-lg font-bold text-blue-800 mt-2">Amount Due: ₹{(generatedInvoice.totals?.due || 0).toFixed(2)}</p>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Amount *
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., 850.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="method" className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      id="method"
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI/Online Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Notes
                    </label>
                    <textarea
                      id="notes"
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., Payment received by Riya"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <DollarSign className="h-5 w-5" />
                      Process Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Bill Modal */}
        {showCancelBillModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" onClick={() => setShowCancelBillModal(false)}>
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowCancelBillModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 text-red-600">
                  <Ban className="h-6 w-6" /> Confirm Bill Cancellation
                </h2>
                
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                  <AlertCircle className="inline h-4 w-4 mr-2" />
                  Warning: This action will cancel the latest bill for <span className="font-semibold">{selectedPatient.name}</span> and initiate a refund process if payment was made.
                </p>

                <form onSubmit={handleCancelBillSubmit} className="space-y-4">
                  
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                      Cancellation Reason *
                    </label>
                    <textarea
                      id="reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="e.g., Patient decided not to take the service, Wrong service billed"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCancelBillModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!cancelReason.trim()}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                      Confirm Cancellation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Process Refund Modal */}
        {showRefundModal && selectedPatient && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" onClick={() => setShowRefundModal(false)}>
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 text-purple-600">
                  <RotateCcw className="h-6 w-6" /> Process Refund
                </h2>
                
                <p className="text-sm text-slate-600 mb-4">
                  Processing refund for <span className="font-semibold text-purple-600">{selectedPatient.name}</span>.
                </p>

                <form onSubmit={handleRefundSubmit} className="space-y-4">
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                      Refund Amount *
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={refundData.amount}
                      onChange={(e) => setRefundData({...refundData, amount: e.target.value})}
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="e.g., 850.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="refundMethod" className="block text-sm font-medium text-slate-700 mb-2">
                      Refund Method *
                    </label>
                    <select
                      id="refundMethod"
                      value={refundData.refundMethod}
                      onChange={(e) => setRefundData({...refundData, refundMethod: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Bank Transfer</option>
                      <option value="card">Card Reversal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                      Refund Reason *
                    </label>
                    <textarea
                      value={refundData.reason}
                      onChange={(e) => setRefundData({...refundData, reason: e.target.value})}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                      placeholder="Briefly explain the reason for refund"
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
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Process Refund
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    </ReceptionistLayout>
  );
}