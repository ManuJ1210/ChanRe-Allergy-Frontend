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

  // Get reassignment information from navigation state
  const reassignmentInfo = location.state || null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [finalFilteredPatients, setFinalFilteredPatients] = useState([]);
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [searchField, setSearchField] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editedInvoiceData, setEditedInvoiceData] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [registrationData, setRegistrationData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [serviceData, setServiceData] = useState({
    services: [{ name: '', amount: '', description: '', details: '' }],
    paymentMethod: 'cash',
    notes: ''
  });
  const [showPendingBillsNotification, setShowPendingBillsNotification] = useState(false);

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
  }, [dispatch]);

  // Auto-select patient if coming from reassignment
  useEffect(() => {
    if (reassignmentInfo?.reassigned && filteredPatients.length > 0) {
      console.log('🔄 Auto-selecting reassigned patient...');
      console.log('📋 Reassignment info:', reassignmentInfo);
      console.log('📋 Filtered patients:', filteredPatients.length);
      
      // Find the reassigned entry (not the original patient)
      const reassignedEntry = filteredPatients.find(p => 
        p.isReassignedEntry && p._id === reassignmentInfo.patientId
      );
      
      console.log('🔍 Found reassigned entry:', reassignedEntry);
      
      if (reassignedEntry) {
        console.log('✅ Auto-selecting patient:', reassignedEntry.name);
        console.log('👤 Assigned doctor:', reassignedEntry.assignedDoctor);
        setSelectedPatient(reassignedEntry);
        toast.info(`Patient ${reassignedEntry.name} selected for consultation billing after doctor reassignment.`);
      } else {
        console.log('❌ Reassigned entry not found');
      }
    }
  }, [filteredPatients, reassignmentInfo]);

  // Clear reassignment info after auto-selection to prevent it from affecting future page loads
  useEffect(() => {
    if (reassignmentInfo?.reassigned && selectedPatient?.isReassignedEntry) {
      // Clear the reassignment info from navigation state after successful auto-selection
      // This prevents it from affecting future page loads
      setTimeout(() => {
        console.log('🧹 Clearing reassignment info from navigation state');
        // Navigate to the same page without state to clear the reassignment info
        navigate('/dashboard/receptionist/consultation-billing', { replace: true });
      }, 1000);
    }
  }, [selectedPatient, reassignmentInfo, navigate]);

  // Primary search filter
  useEffect(() => {
    let filtered = patients.filter(patient => {
      // Apply search filter only - show all patients regardless of payment status
      const matchesSearch = !searchTerm || 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.uhId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Create separate entries for reassigned patients
    const processedPatients = [];
    const reassignedPatientIds = new Set(); // Track which patients we've already processed as reassigned
    
    filtered.forEach(patient => {
      // Skip if we've already processed this patient as reassigned
      if (reassignedPatientIds.has(patient._id)) {
        return;
      }
      
      // Check if this patient has ANY billing records for a different doctor (indicating reassignment)
      const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
      let hasBillingForDifferentDoctor = false;
      
      if (patient.billing && patient.billing.length > 0) {
        hasBillingForDifferentDoctor = patient.billing.some(bill => {
          const hasDoctorId = bill.doctorId && bill.doctorId.toString();
          if (hasDoctorId) {
            const isDifferentDoctor = bill.doctorId.toString() !== currentDoctorId?.toString();
            if (isDifferentDoctor) {
              console.log('🔍 Found billing for different doctor:', {
                patientName: patient.name,
                billId: bill._id,
                billDoctorId: bill.doctorId,
                currentDoctorId: currentDoctorId,
                billType: bill.type,
                billDescription: bill.description
              });
            }
            return isDifferentDoctor;
          }
          return false;
        });
      }
      
      // TEMPORARY FIX: Since all billing records have undefined doctorId, 
      // let's check if patient has multiple consultation fees (indicating reassignment)
      const consultationFees = patient.billing?.filter(bill => 
        bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
      ) || [];
      
      const hasMultipleConsultationFees = consultationFees.length > 1;
      
      if (hasMultipleConsultationFees) {
        console.log('🔍 Found multiple consultation fees (indicating reassignment):', {
          patientName: patient.name,
          consultationFeeCount: consultationFees.length,
          currentDoctorId: currentDoctorId
        });
        hasBillingForDifferentDoctor = true;
      }
      
      // Also check if this is a newly reassigned patient from navigation
      const isNewlyReassigned = reassignmentInfo?.reassigned && reassignmentInfo?.patientId === patient._id;
      
      console.log('🔍 Patient billing check:', {
        patientName: patient.name,
        currentDoctorId: currentDoctorId,
        hasBillingForDifferentDoctor: hasBillingForDifferentDoctor,
        isNewlyReassigned: isNewlyReassigned,
        billingCount: patient.billing?.length || 0
      });
      
      if (hasBillingForDifferentDoctor || isNewlyReassigned) {
        // Mark this patient as processed
        reassignedPatientIds.add(patient._id);
        
        // Create BOTH entries: Original and Reassigned
        
        // 1. Add the original patient entry first
        processedPatients.push({
          ...patient,
          isReassignedEntry: false,
          reassignmentInfo: null,
          isOriginalEntry: true,
          originalPatientId: patient._id
        });
        
        // 2. Create a reassigned entry
        const reassignedPatient = {
          ...patient,
          isReassignedEntry: true,
          reassignmentInfo: isNewlyReassigned ? reassignmentInfo : { reassigned: true, patientId: patient._id },
          reassignedEntryId: `${patient._id}_reassigned`,
          originalPatientId: patient._id
        };
        
        console.log('🔄 Creating BOTH original and reassigned entries for:', patient.name);
        console.log('📋 Patient has billing records for different doctor - maintaining separate entries for invoice purposes');
        console.log('👤 Current doctor:', currentDoctorId);
        console.log('👤 Is newly reassigned:', isNewlyReassigned);
        
        processedPatients.push(reassignedPatient);
      } else {
        // Add the original patient
        processedPatients.push({
          ...patient,
          isReassignedEntry: false,
          reassignmentInfo: null,
          originalPatientId: patient._id
        });
      }
    });
    
    console.log('📊 Processed patients count:', processedPatients.length);
    console.log('📊 Reassigned entries:', processedPatients.filter(p => p.isReassignedEntry).length);
    console.log('📊 Original entries:', processedPatients.filter(p => p.isOriginalEntry).length);
    
    // DEBUG: Log all processed patients
    processedPatients.forEach((patient, index) => {
      console.log(`📋 Patient ${index + 1}:`, {
        name: patient.name,
        id: patient._id,
        isReassignedEntry: patient.isReassignedEntry,
        isOriginalEntry: patient.isOriginalEntry,
        originalPatientId: patient.originalPatientId,
        reassignedEntryId: patient.reassignedEntryId
      });
    });
    
    setFilteredPatients(processedPatients);
    setShowSubSearch(processedPatients.length > 0 && searchTerm.trim() !== '');
    setCurrentPage(1); // Reset to first page when search changes
  }, [patients, searchTerm, reassignmentInfo]);

  // Sub-search filter
  useEffect(() => {
    const subFiltered = filteredPatients.filter(patient => {
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

  const getPatientStatus = (patient) => {
    console.log('🔍 Getting status for patient:', patient.name);
    console.log('🔍 All billing records:', patient.billing?.map(bill => ({
      id: bill._id,
      type: bill.type,
      description: bill.description,
      doctorId: bill.doctorId,
      doctorIdType: typeof bill.doctorId,
      doctorIdString: bill.doctorId?.toString(),
      amount: bill.amount,
      status: bill.status
    })));
    
    if (!patient.billing || patient.billing.length === 0) {
      console.log('❌ No billing records found for:', patient.name);
      return 'Consultation Fee Required';
    }

    // Check for consultation fee for the current doctor
    const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
    const isReassignedEntry = patient.isReassignedEntry || false;
    
    console.log('🔍 Current doctor ID:', currentDoctorId, 'Is reassigned entry:', isReassignedEntry);
    
    // SMART FIX: Handle both regular and reassigned patients properly
    const consultationFee = patient.billing.find(bill => {
      const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      
      if (isConsultationFee) {
        const hasDoctorId = bill.doctorId && bill.doctorId.toString();
        const matchesCurrentDoctor = hasDoctorId && currentDoctorId && bill.doctorId.toString() === currentDoctorId.toString();
        const hasNoDoctorId = !hasDoctorId; // Include old records without doctorId
        
        // For reassigned entries, be more strict - only include consultation fees for current doctor
        // For regular patients, be more flexible - include consultation fees with or without doctorId
        let shouldInclude;
        if (isReassignedEntry) {
          // Reassigned patients: Include consultation fees for current doctor OR if no doctorId (fallback)
          // Since all billing records have undefined doctorId, we need to include them for reassigned patients too
          shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
        } else {
          // Regular patients: Include consultation fees for current doctor OR old records without doctorId
          shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
        }
        
        console.log('🔍 Status consultation fee check (SMART):', {
          patientName: patient.name,
          isReassignedEntry: isReassignedEntry,
          billId: bill._id,
          billDoctorId: bill.doctorId,
          billDoctorIdType: typeof bill.doctorId,
          billDoctorIdString: bill.doctorId?.toString(),
          currentDoctorId: currentDoctorId,
          currentDoctorIdType: typeof currentDoctorId,
          currentDoctorIdString: currentDoctorId?.toString(),
          hasDoctorId: hasDoctorId,
          matchesCurrentDoctor: matchesCurrentDoctor,
          hasNoDoctorId: hasNoDoctorId,
          shouldInclude: shouldInclude,
          description: bill.description
        });
        
        return shouldInclude;
      }
      
      return false;
    });
    
    console.log('🔍 Found consultation fee:', consultationFee);
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    
    // SMART FILTERING: Handle service charges for both regular and reassigned patients
    const serviceCharges = patient.billing.filter(bill => {
      if (bill.type !== 'service') return false;
      
      const hasDoctorId = bill.doctorId && bill.doctorId.toString();
      const matchesCurrentDoctor = hasDoctorId && currentDoctorId && bill.doctorId.toString() === currentDoctorId.toString();
      const hasNoDoctorId = !hasDoctorId; // Include old records without doctorId
      
      // For reassigned entries, be more strict - only include service charges for current doctor
      // For regular patients, be more flexible - include service charges with or without doctorId
      let shouldInclude;
      if (isReassignedEntry) {
        // Reassigned patients: Only include service charges for the current doctor
        shouldInclude = matchesCurrentDoctor;
      } else {
        // Regular patients: Include service charges for current doctor OR old records without doctorId
        shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
      }
      
      console.log('🔍 Status service charges check (SMART):', {
        patientName: patient.name,
        isReassignedEntry: isReassignedEntry,
        billId: bill._id,
        billDoctorId: bill.doctorId,
        billDoctorIdType: typeof bill.doctorId,
        billDoctorIdString: bill.doctorId?.toString(),
        currentDoctorId: currentDoctorId,
        currentDoctorIdType: typeof currentDoctorId,
        currentDoctorIdString: currentDoctorId?.toString(),
        hasDoctorId: hasDoctorId,
        matchesCurrentDoctor: matchesCurrentDoctor,
        hasNoDoctorId: hasNoDoctorId,
        shouldInclude: shouldInclude,
        description: bill.description
      });
      
      return shouldInclude;
    });

    const hasConsultationFee = !!consultationFee;
    const hasRegistrationFee = !!registrationFee;
    const hasServiceCharges = serviceCharges.length > 0;

    const paidConsultationFee = hasConsultationFee && (consultationFee.status === 'paid' || consultationFee.status === 'completed');
    const paidRegistrationFee = hasRegistrationFee && (registrationFee.status === 'paid' || registrationFee.status === 'completed');
    const paidServiceCharges = hasServiceCharges && serviceCharges.every(bill => bill.status === 'paid' || bill.status === 'completed');

    // Determine if patient is new (within 24 hours) OR if it's a reassigned entry
    const isNewPatient = isPatientNew(patient);
    const isReassignedPatient = isReassignedEntry;

    console.log('🔍 Status check results:', {
      hasConsultationFee,
      paidConsultationFee,
      hasRegistrationFee,
      paidRegistrationFee,
      hasServiceCharges,
      paidServiceCharges,
      isNewPatient,
      isReassignedEntry,
      isReassignedPatient
    });

    // Priority order: Registration Fee (new patients only) > Consultation Fee > Service Charges
    
    // Check registration fee for new patients first (but NOT for reassigned patients)
    if (isNewPatient && !isReassignedPatient && !hasRegistrationFee) {
      return 'Registration Fee Required';
    }

    // Check consultation fee
    if (!hasConsultationFee) {
      // For reassigned entries, they need a new consultation fee regardless of previous payments
      if (isReassignedEntry) {
        console.log('✅ Status: Consultation Fee Required (reassigned entry - treat as new patient)');
        return 'Consultation Fee Required';
      }
      console.log('✅ Status: Consultation Fee Required (no consultation fee)');
      return 'Consultation Fee Required';
    }

    // Check if consultation fee is paid
    if (hasConsultationFee && !paidConsultationFee) {
      console.log('✅ Status: Consultation Fee Pending (unpaid consultation fee)');
      return 'Consultation Fee Pending';
    }

    // Check service charges
    if (hasServiceCharges && !paidServiceCharges) {
      console.log('✅ Status: Service Charges Pending (unpaid service charges)');
      return 'Service Charges Pending';
    }

    console.log('✅ Status: All Paid');
    return 'All Paid';
  };

  const getStatusColor = (status, patient) => {
    // Special handling for reassigned entries
    const isReassignedEntry = patient.isReassignedEntry || false;
    
    if (isReassignedEntry && status === 'Consultation Fee Required') {
      return 'text-blue-600 bg-blue-100'; // Special color for reassigned entries
    }
    
    switch (status) {
      case 'All Paid': return 'text-green-600 bg-green-100';
      case 'Consultation Fee Pending': return 'text-orange-600 bg-orange-100';
      case 'Service Charges Pending': return 'text-orange-600 bg-orange-100';
      case 'Consultation Fee Required': return 'text-red-600 bg-red-100';
      case 'Registration Fee Required': return 'text-purple-600 bg-purple-100';
      case 'No Payments': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status, patient) => {
    // Special handling for reassigned entries
    const isReassignedEntry = patient.isReassignedEntry || false;
    
    if (isReassignedEntry && status === 'Consultation Fee Required') {
      return <UserPlus className="h-4 w-4" />; // Special icon for reassigned entries
    }
    
    switch (status) {
      case 'All Paid': return <CheckCircle className="h-4 w-4" />;
      case 'Consultation Fee Pending': return <Clock className="h-4 w-4" />;
      case 'Service Charges Pending': return <Clock className="h-4 w-4" />;
      case 'Consultation Fee Required': return <AlertCircle className="h-4 w-4" />;
      case 'Registration Fee Required': return <UserPlus className="h-4 w-4" />;
      case 'No Payments': return <AlertCircle className="h-4 w-4" />;
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

    // Check for consultation fee for the current doctor
    const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
    const isReassignedEntry = patient.isReassignedEntry || false;
    
    // SMART FIX: Handle both regular and reassigned patients properly
    const consultationFee = patient.billing.find(bill => {
      const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      
      if (isConsultationFee) {
        const hasDoctorId = bill.doctorId && bill.doctorId.toString();
        const matchesCurrentDoctor = hasDoctorId && currentDoctorId && bill.doctorId.toString() === currentDoctorId.toString();
        const hasNoDoctorId = !hasDoctorId; // Include old records without doctorId
        
        // For reassigned entries, be more strict - only include consultation fees for current doctor
        // For regular patients, be more flexible - include consultation fees with or without doctorId
        let shouldInclude;
        if (isReassignedEntry) {
          // Reassigned patients: Include consultation fees for current doctor OR if no doctorId (fallback)
          // Since all billing records have undefined doctorId, we need to include them for reassigned patients too
          shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
        } else {
          // Regular patients: Include consultation fees for current doctor OR old records without doctorId
          shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
        }
        
        console.log('🔍 Consultation fee details check (SMART):', {
          patientName: patient.name,
          isReassignedEntry: isReassignedEntry,
          billId: bill._id,
          billDoctorId: bill.doctorId,
          billDoctorIdType: typeof bill.doctorId,
          billDoctorIdString: bill.doctorId?.toString(),
          currentDoctorId: currentDoctorId,
          currentDoctorIdType: typeof currentDoctorId,
          currentDoctorIdString: currentDoctorId?.toString(),
          hasDoctorId: hasDoctorId,
          matchesCurrentDoctor: matchesCurrentDoctor,
          hasNoDoctorId: hasNoDoctorId,
          shouldInclude: shouldInclude,
          description: bill.description
        });
        
        return shouldInclude;
      }
      
      return false;
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

    const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
    const isReassignedEntry = patient.isReassignedEntry || false;
    
    // SMART FILTERING: Handle service charges for both regular and reassigned patients
    const serviceBills = patient.billing.filter(bill => {
      if (bill.type !== 'service') return false;
      
      const hasDoctorId = bill.doctorId && bill.doctorId.toString();
      const matchesCurrentDoctor = hasDoctorId && currentDoctorId && bill.doctorId.toString() === currentDoctorId.toString();
      const hasNoDoctorId = !hasDoctorId; // Include old records without doctorId
      
      // For reassigned entries, be more strict - only include service charges for current doctor
      // For regular patients, be more flexible - include service charges with or without doctorId
      let shouldInclude;
      if (isReassignedEntry) {
        // Reassigned patients: Include service charges for current doctor OR if no doctorId (fallback)
        // Since all billing records have undefined doctorId, we need to include them for reassigned patients too
        shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
      } else {
        // Regular patients: Include service charges for current doctor OR old records without doctorId
        shouldInclude = matchesCurrentDoctor || hasNoDoctorId;
      }
      
      console.log('🔍 Service charges details check (SMART):', {
        patientName: patient.name,
        isReassignedEntry: isReassignedEntry,
        billId: bill._id,
        billDoctorId: bill.doctorId,
        billDoctorIdType: typeof bill.doctorId,
        billDoctorIdString: bill.doctorId?.toString(),
        currentDoctorId: currentDoctorId,
        currentDoctorIdType: typeof currentDoctorId,
        currentDoctorIdString: currentDoctorId?.toString(),
        hasDoctorId: hasDoctorId,
        matchesCurrentDoctor: matchesCurrentDoctor,
        hasNoDoctorId: hasNoDoctorId,
        shouldInclude: shouldInclude,
        description: bill.description
      });
      
      return shouldInclude;
    });

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
      amount: '500', // Default consultation fee
      paymentMethod: 'cash',
      notes: `Doctor consultation fee for ${patient.name}`
    });
    setShowPaymentModal(true);
  };

  const handleCreateRegistrationBill = (patient) => {
    setSelectedPatient(patient);
    setRegistrationData({
      amount: '100', // Default registration fee
      paymentMethod: 'cash',
      notes: `Registration fee for new patient ${patient.name}`
    });
    setShowRegistrationModal(true);
  };

  const handleCreateServiceCharges = (patient) => {
    setSelectedPatient(patient);
    setServiceData({
      services: [{ name: '', amount: '', description: '', details: '' }],
      paymentMethod: 'cash',
      notes: ''
    });
    setShowServiceModal(true);
  };

  const handleGenerateInvoice = async (patient) => {
    try {
      const response = await API.post('/billing/generate-invoice', {
        patientId: patient._id
      });
      
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

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const billData = {
        patientId: selectedPatient._id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes
      };

      console.log('🚀 Submitting consultation fee payment:', billData);
      console.log('👤 Selected patient:', selectedPatient);

      const response = await API.post('/billing/consultation-fee', billData);
      
      console.log('📋 API Response:', response.data);
      
      if (response.status === 201) {
        toast.success('Consultation fee payment recorded successfully!');
        
        // Close modal immediately
        setShowPaymentModal(false);
        setSelectedPatient(null);
        
        // Clear reassignment info if this was a reassigned patient
        if (reassignmentInfo?.reassigned && reassignmentInfo?.patientId === selectedPatient._id) {
          console.log('🔄 Clearing reassignment info after successful payment');
          // Clear the reassignment info by navigating to the same page without state
          navigate('/dashboard/receptionist/consultation-billing', { replace: true });
        }
        
        // Refresh patient data to show updated payment status
        console.log('🔄 Refreshing patient data...');
        await dispatch(fetchReceptionistPatients());
        
        // Log the updated patients data
        setTimeout(() => {
          console.log('📋 Updated patients after refresh:', patients);
        }, 1000);
      } else {
        toast.error('Failed to record payment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error recording payment:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Failed to record payment. Please try again.');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const billData = {
        patientId: selectedPatient._id,
        amount: parseFloat(registrationData.amount),
        paymentMethod: registrationData.paymentMethod,
        notes: registrationData.notes
      };

      const response = await API.post('/billing/registration-fee', billData);
      
      if (response.status === 201) {
        toast.success('Registration fee payment recorded successfully!');
        
        // Close modal immediately
        setShowRegistrationModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated payment status
        dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to record registration fee. Please try again.');
      }
    } catch (error) {
      console.error('Error recording registration fee:', error);
      toast.error('Failed to record registration fee. Please try again.');
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
      const billData = {
        patientId: selectedPatient._id,
        services: validServices,
        paymentMethod: serviceData.paymentMethod,
        notes: serviceData.notes
      };

      const response = await API.post('/billing/service-charges', billData);
      
      if (response.status === 201) {
        toast.success('Service charges payment recorded successfully!');
        
        // Close modal immediately
        setShowServiceModal(false);
        setSelectedPatient(null);
        
        // Refresh patient data to show updated payment status
        dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to record service charges. Please try again.');
      }
    } catch (error) {
      console.error('Error recording service charges:', error);
      toast.error('Failed to record service charges. Please try again.');
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
                <button
                  onClick={() => {
                    console.log('🧪 TEST: Creating manual reassigned patient for testing');
                    // Find first patient and create reassigned entry
                    if (patients.length > 0) {
                      const testPatient = patients[0];
                      console.log('🧪 Test patient:', testPatient.name);
                      
                      // Simulate reassignment info
                      const mockReassignmentInfo = {
                        reassigned: true,
                        patientId: testPatient._id,
                        patientName: testPatient.name,
                        previousDoctor: testPatient.assignedDoctor,
                        newDoctor: testPatient.assignedDoctor
                      };
                      
                      // Navigate with mock reassignment info
                      navigate('/dashboard/receptionist/consultation-billing', { 
                        state: { reassignmentInfo: mockReassignmentInfo } 
                      });
                    }
                  }}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm"
                  title="Test reassigned patient creation"
                >
                  Test Reassigned
                </button>
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

          {/* Reassignment Notification Banner */}
          {reassignmentInfo?.reassigned && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-800 mb-1">
                    Doctor Reassignment Completed
                  </h3>
                  <div className="text-sm text-orange-700 space-y-1">
                    <p>
                      <span className="font-medium">Patient:</span> {reassignmentInfo.patientName || 'Selected Patient'}
                    </p>
                    <p>
                      <span className="font-medium">Previous Doctor:</span> {reassignmentInfo.previousDoctor || 'Not assigned'}
                    </p>
                    <p>
                      <span className="font-medium">New Doctor:</span> {reassignmentInfo.newDoctor || 'Selected Doctor'}
                    </p>
                    {reassignmentInfo.reason && (
                      <p>
                        <span className="font-medium">Reason:</span> {reassignmentInfo.reason}
                      </p>
                    )}
                    <p className="mt-2 font-medium text-orange-800">
                      ⚠️ Please collect consultation fee and service charges for the new doctor assignment.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Clear the reassignment info by navigating to the same page without state
                    navigate('/dashboard/receptionist/consultation-billing', { replace: true });
                  }}
                  className="flex-shrink-0 text-orange-600 hover:text-orange-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

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
                        const statusColor = getStatusColor(status, patient);
                        const statusIcon = getStatusIcon(status, patient);
                        const feeDetails = getConsultationFeeDetails(patient);
                        const isReassignedEntry = patient.isReassignedEntry || false;
                        
                        return (
                          <tr key={isReassignedEntry ? patient.reassignedEntryId : patient._id} className="hover:bg-slate-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <Users className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                                    {isReassignedEntry && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">
                                        <UserPlus className="h-3 w-3" />
                                        Reassigned
                                      </span>
                                    )}
                                    {patient.isOriginalEntry && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Original
                                      </span>
                                    )}
                                  </div>
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
                                  title="Generate Invoice"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>

                                {status === 'Registration Fee Required' && (
                                  <button
                                    onClick={() => handleCreateRegistrationBill(patient)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Collect Registration Fee"
                                  >
                                    <UserPlus className="h-3 w-3" />
                                    Reg Fee
                                  </button>
                                )}

                                {status === 'Consultation Fee Required' && (
                                  <button
                                    onClick={() => handleCreateConsultationBill(patient)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Collect Consultation Fee"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                    Consult
                                  </button>
                                )}

                                {status === 'No Payments' && (
                                  <>
                                    {isPatientNew(patient) && (
                                      <button
                                        onClick={() => handleCreateRegistrationBill(patient)}
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                        title="Collect Registration Fee"
                                      >
                                        <UserPlus className="h-3 w-3" />
                                        Reg Fee
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleCreateConsultationBill(patient)}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                      title="Collect Consultation Fee"
                                    >
                                      <DollarSign className="h-3 w-3" />
                                      Consult
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => handleCreateServiceCharges(patient)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                  title="Add Service Charges"
                                >
                                  <Settings className="h-3 w-3" />
                                  Services
                                </button>
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Collect Consultation Fee
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
              <p className="text-sm text-slate-600">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
              {selectedPatient.isReassignedEntry && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    <strong>Reassigned Patient:</strong> This patient has been reassigned to a new doctor. 
                    No registration fee required - only consultation fee for the new doctor.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
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
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                >
                  Record Payment
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
                Collect Registration Fee
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
              <p className="text-xs text-purple-600 mt-1">
                <UserPlus className="h-3 w-3 inline mr-1" />
                New Patient Registration Fee
              </p>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Registration Fee Amount *
                </label>
                <input
                  type="number"
                  value={registrationData.amount}
                  onChange={(e) => setRegistrationData({...registrationData, amount: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={registrationData.paymentMethod}
                  onChange={(e) => setRegistrationData({...registrationData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
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
                  Record Registration Fee
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
                Add Service Charges
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
                  Payment Method *
                </label>
                <select
                  value={serviceData.paymentMethod}
                  onChange={(e) => setServiceData({...serviceData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs"
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
                  Record Service Charges
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
                  onClick={handleEditInvoice}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium flex items-center gap-1"
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
