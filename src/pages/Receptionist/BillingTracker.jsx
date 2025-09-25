import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/environment';
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
  Shield,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Target,
  BarChart3,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import API from '../../services/api';

const ReceptionistBillingTracker = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [localUser, setLocalUser] = useState(null);
  
  // Payment recording states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('consultation'); // consultation, service, registration
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: '',
    doctorId: '',
    serviceName: '',
    serviceDescription: ''
  });
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  
  // Pagination for payments table
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(10);
  
  // Pagination state for each section
  const [currentPage, setCurrentPage] = useState({
    fullyPaid: 1,
    multiplePayments: 1,
    pendingBills: 1
  });
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Fetch patients and doctors for payment recording
  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        API.get('/patients'),
        API.get('/doctors')
      ]);
      
      setPatients(patientsResponse.data.patients || patientsResponse.data || []);
      setDoctors(doctorsResponse.data || []);
    } catch (error) {
      console.error('Error fetching patients and doctors:', error);
      toast.error('Failed to fetch patients and doctors');
    }
  };

  // Clear all dummy/test data from localStorage
  const clearDummyData = () => {
    console.log('🧹 Clearing dummy/test data from localStorage...');
    const keysToRemove = [];
    
    // Check all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('payment_record_')) {
        try {
          const payment = JSON.parse(localStorage.getItem(key));
          // Check if this is dummy/test data
          if (payment.patientName && (
            payment.patientName.toLowerCase().includes('test') ||
            payment.patientName.toLowerCase().includes('dummy') ||
            payment.patientName.toLowerCase().includes('sample') ||
            payment.patientName.toLowerCase().includes('example') ||
            payment.patientName.toLowerCase().includes('demo') ||
            payment.patientName.toLowerCase().includes('fake') ||
            payment.doctorName?.toLowerCase().includes('test') ||
            payment.doctorName?.toLowerCase().includes('dummy') ||
            payment.doctorName?.toLowerCase().includes('sample') ||
            payment.doctorName?.toLowerCase().includes('example') ||
            payment.doctorName?.toLowerCase().includes('demo') ||
            payment.doctorName?.toLowerCase().includes('fake') ||
            // Check for common test patterns
            payment.patientName.match(/^test.*\d+$/i) ||
            payment.patientName.match(/^sample.*\d+$/i) ||
            payment.patientName.match(/^dummy.*\d+$/i) ||
            payment.patientName.match(/^user.*\d+$/i) ||
            payment.patientName.match(/^patient.*\d+$/i)
          )) {
            keysToRemove.push(key);
            console.log('🗑️ Marking dummy data for removal:', key, payment.patientName);
          }
        } catch (error) {
          console.error('❌ Error parsing payment for dummy check:', error);
        }
      }
    }
    
    // Remove dummy data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('✅ Removed dummy data:', key);
    });
    
    if (keysToRemove.length > 0) {
      toast.success(`Removed ${keysToRemove.length} dummy/test payment records`);
      // Reload payments after clearing dummy data
      loadAllPayments();
    } else {
      toast.info('No dummy/test data found to remove');
    }
  };

  // Load all payments from localStorage (excluding dummy data)
  const loadAllPayments = () => {
    console.log('🔍 Loading payments from localStorage...');
    const payments = [];
    
    // Check all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log('🔍 Checking key:', key);
      
      if (key && key.startsWith('payment_record_')) {
        try {
          const payment = JSON.parse(localStorage.getItem(key));
          console.log('✅ Found payment:', payment);
          
          // Skip dummy/test data
          if (payment.patientName && (
            payment.patientName.toLowerCase().includes('test') ||
            payment.patientName.toLowerCase().includes('dummy') ||
            payment.patientName.toLowerCase().includes('sample') ||
            payment.patientName.toLowerCase().includes('example') ||
            payment.patientName.toLowerCase().includes('demo') ||
            payment.patientName.toLowerCase().includes('fake') ||
            payment.doctorName?.toLowerCase().includes('test') ||
            payment.doctorName?.toLowerCase().includes('dummy') ||
            payment.doctorName?.toLowerCase().includes('sample') ||
            payment.doctorName?.toLowerCase().includes('example') ||
            payment.doctorName?.toLowerCase().includes('demo') ||
            payment.doctorName?.toLowerCase().includes('fake') ||
            // Check for common test patterns
            payment.patientName.match(/^test.*\d+$/i) ||
            payment.patientName.match(/^sample.*\d+$/i) ||
            payment.patientName.match(/^dummy.*\d+$/i) ||
            payment.patientName.match(/^user.*\d+$/i) ||
            payment.patientName.match(/^patient.*\d+$/i)
          )) {
            console.log('⏭️ Skipping dummy data:', payment.patientName);
            continue;
          }
          
          payments.push(payment);
        } catch (error) {
          console.error('❌ Error parsing payment:', error);
        }
      }
    }
    
    console.log('📊 Total payments found (excluding dummy data):', payments.length);
    console.log('📊 All payments:', payments);
    
    const sortedPayments = payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllPayments(sortedPayments);
    
    // If no payments found, just show empty state
    if (payments.length === 0) {
      console.log('📊 No payments found in localStorage');
    }
  };


  // Filter payments based on search and type
  const filterPayments = () => {
    console.log('🔍 Starting filterPayments with:', {
      allPaymentsCount: allPayments.length,
      paymentSearchTerm,
      paymentTypeFilter
    });
    
    let filtered = allPayments;

    // Search filter
    if (paymentSearchTerm) {
      console.log('🔍 Applying search filter:', paymentSearchTerm);
      filtered = filtered.filter(payment => {
        const searchLower = paymentSearchTerm.toLowerCase();
        const matches = (
          (payment.patientName || '').toLowerCase().includes(searchLower) ||
          (payment.patientPhone || '').toLowerCase().includes(searchLower) ||
          (payment.doctorName || '').toLowerCase().includes(searchLower) ||
          (payment.serviceName || '').toLowerCase().includes(searchLower) ||
          (payment.paymentMethod || '').toLowerCase().includes(searchLower) ||
          (payment.recordedBy || '').toLowerCase().includes(searchLower) ||
          (payment.type || '').toLowerCase().includes(searchLower)
        );
        console.log('🔍 Payment matches search:', payment.patientName, matches);
        return matches;
      });
    }

    // Type filter
    if (paymentTypeFilter !== 'all') {
      console.log('🔍 Applying type filter:', paymentTypeFilter);
      filtered = filtered.filter(payment => {
        const matches = payment.type === paymentTypeFilter;
        console.log('🔍 Payment matches type:', payment.patientName, payment.type, matches);
        return matches;
      });
    }

    console.log('✅ Final filtered count:', filtered.length);
    setFilteredPayments(filtered);
    
    // Reset to first page when filtering
    setCurrentPaymentPage(1);
  };

  // Calculate pagination for payments
  const getPaginatedPayments = () => {
    const startIndex = (currentPaymentPage - 1) * paymentsPerPage;
    const endIndex = startIndex + paymentsPerPage;
    return filteredPayments.slice(startIndex, endIndex);
  };

  const getTotalPaymentPages = () => {
    return Math.ceil(filteredPayments.length / paymentsPerPage);
  };

  // Update filtered payments when allPayments or filters change
  useEffect(() => {
    console.log('🔄 Filtering payments...', {
      allPayments: allPayments.length,
      paymentSearchTerm,
      paymentTypeFilter
    });
    filterPayments();
  }, [allPayments, paymentSearchTerm, paymentTypeFilter]);

  // Save payment to localStorage
  const savePayment = (payment) => {
    const paymentId = `payment_record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentRecord = {
      ...payment,
      id: paymentId,
      timestamp: new Date().toISOString(),
      recordedBy: user.name,
      centerId: localUser?.centerId || localUser?.center?.id
    };
    
    localStorage.setItem(paymentId, JSON.stringify(paymentRecord));
    loadAllPayments();
    toast.success('Payment recorded successfully!');
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !paymentData.amount) {
      toast.error('Please select a patient and enter amount');
      return;
    }

    try {
      const paymentRecord = {
        patientId: selectedPatient._id,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        patientEmail: selectedPatient.email,
        type: paymentType,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        doctorId: paymentData.doctorId,
        doctorName: doctors.find(d => d._id === paymentData.doctorId)?.name || 'N/A',
        serviceName: paymentData.serviceName,
        serviceDescription: paymentData.serviceDescription,
        isReassigned: selectedPatient.isReassigned || false,
        originalDoctor: selectedPatient.assignedDoctor?.name || 'N/A',
        currentDoctor: selectedPatient.currentDoctor?.name || selectedPatient.assignedDoctor?.name || 'N/A'
      };

      // Save to localStorage
      savePayment(paymentRecord);

      // Also save to backend if needed
      if (paymentType === 'consultation') {
        await API.post('/billing/consultation-fee', {
          patientId: selectedPatient._id,
          doctorId: paymentData.doctorId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes
        });
      } else if (paymentType === 'service') {
        await API.post('/billing/service-charges', {
          patientId: selectedPatient._id,
          doctorId: paymentData.doctorId,
          services: [{
            name: paymentData.serviceName,
            amount: paymentData.amount,
            description: paymentData.serviceDescription
          }],
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes
        });
      }

      // Reset form
      setPaymentData({
        amount: '',
        paymentMethod: 'cash',
        notes: '',
        doctorId: '',
        serviceName: '',
        serviceDescription: ''
      });
      setSelectedPatient(null);
      setShowPaymentModal(false);
      
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  // Export payments to Excel
  // Enhanced export function with comprehensive data for SAP-like analysis
  const exportPaymentsToExcel = () => {
    if (allPayments.length === 0) {
      toast.error('No payments to export');
      return;
    }

    // Prepare comprehensive data for analysis
    const exportData = allPayments.map((payment, index) => {
      const paymentDate = new Date(payment.timestamp);
      
      return {
        'Record ID': payment.id,
        'Payment Sequence': index + 1,
        'Transaction Date': paymentDate.toLocaleDateString('en-GB'),
        'Transaction Time': paymentDate.toLocaleTimeString('en-GB'),
        'Payment Type': payment.type?.toUpperCase() || 'UNKNOWN',
        'Payment Category': payment.isReassigned ? 'REASSIGNED' : 'REGULAR',
        
        // Patient Information
        'Patient ID': payment.patientId || 'N/A',
        'Patient Name': payment.patientName || 'N/A',
        'Patient UH ID': payment.uhId || 'N/A',
        'Patient Age': payment.patientAge || 'N/A',
        'Patient Gender': payment.patientGender?.toUpperCase() || 'N/A',
        'Patient Phone': payment.patientPhone || 'N/A',
        'Patient Email': payment.patientEmail || 'N/A',
        
        // Doctor Information
        'Doctor ID': payment.doctorId || 'N/A',
        'Doctor Name': payment.doctorName || 'N/A',
        'Original Doctor': payment.originalDoctor || 'N/A',
        'Current Doctor': payment.currentDoctor || 'N/A',
        
        // Financial Information
        'Amount (INR)': payment.amount || 0,
        'Payment Method': payment.paymentMethod?.toUpperCase() || 'N/A',
        'Invoice Number': payment.invoiceNumber || 'N/A',
        'Bill ID': payment.billId || 'N/A',
        
        // Service Information
        'Service Name': payment.serviceName || 'N/A',
        'Service Description': payment.serviceDescription || 'N/A',
        
        // Administrative Information
        'Center ID': payment.centerId || 'N/A',
        'Center Name': payment.centerName || 'N/A',
        'Recorded By': payment.recordedBy || 'N/A',
        'Notes': payment.notes || 'N/A',
        
        // Analysis Fields
        'Month': paymentDate.getMonth() + 1,
        'Year': paymentDate.getFullYear(),
        'Quarter': Math.ceil((paymentDate.getMonth() + 1) / 3),
        'Weekday': paymentDate.toLocaleDateString('en-GB', { weekday: 'long' }),
        'Is Weekend': [0, 6].includes(paymentDate.getDay()) ? 'YES' : 'NO',
        'Amount Category': payment.amount >= 1000 ? 'HIGH' : payment.amount >= 500 ? 'MEDIUM' : 'LOW',
        'Payment Status': 'COMPLETED',
        
        // Reassignment Information
        'Is Reassigned': payment.isReassigned ? 'YES' : 'NO',
        'Reassignment Type': payment.isReassigned ? 'PATIENT_REASSIGNED' : 'REGULAR_PATIENT',
        
        // Timestamp for sorting
        'Sort Timestamp': payment.timestamp
      };
    });

    // Sort by timestamp (newest first)
    exportData.sort((a, b) => new Date(b['Sort Timestamp']) - new Date(a['Sort Timestamp']));

    // Calculate summary statistics
    const summary = {
      'Total Records': allPayments.length,
      'Total Amount': allPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      'Consultation Fees': allPayments.filter(p => p.type === 'consultation').length,
      'Service Charges': allPayments.filter(p => p.type === 'service').length,
      'Registration Fees': allPayments.filter(p => p.type === 'registration').length,
      'Reassigned Payments': allPayments.filter(p => p.isReassigned).length,
      'Cash Payments': allPayments.filter(p => p.paymentMethod?.toLowerCase() === 'cash').length,
      'Card Payments': allPayments.filter(p => p.paymentMethod?.toLowerCase() === 'card').length,
      'Online Payments': allPayments.filter(p => p.paymentMethod?.toLowerCase() === 'online').length,
      'Average Amount': allPayments.length > 0 ? (allPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / allPayments.length).toFixed(2) : 0,
      'Export Date': new Date().toLocaleString('en-GB'),
      'Export Generated By': localUser?.name || 'System'
    };

    // Convert to CSV format
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      // Summary section
      ['PAYMENT ANALYSIS SUMMARY'],
      Object.keys(summary).map(key => `${key}: ${summary[key]}`).join('\n'),
      '',
      'DETAILED PAYMENT RECORDS',
      '',
      // Headers
      headers.join(','),
      // Data rows
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${allPayments.length} payment records with comprehensive analysis data`);
  };

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

  // Fetch billing data for the center
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      if (!user || !localUser) {
        console.log('User not authenticated, skipping billing data fetch');
        setBillingData([]);
        setLoading(false);
        return;
      }
      
      if (!localUser) {
        console.error('localUser is not available');
        toast.error('User data not available. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      if (!centerId) {
        toast.error('Center ID not found. Please check your user profile.');
        setLoading(false);
        return;
      }
      
      const response = await API.get(`/billing/center`);
      
      if (response.data && Array.isArray(response.data.billingRequests)) {
        setBillingData(response.data.billingRequests);
      } else if (response.data && Array.isArray(response.data)) {
        setBillingData(response.data);
      } else {
        setBillingData([]);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (status === 403) {
          toast.error('Access denied. You do not have permission to view billing data.');
        } else {
          toast.error(`Failed to fetch billing data: ${error.response.data?.message || `Server error (${status})`}`);
        }
      } else if (error.request) {
        toast.error('Unable to connect to server. Please check your internet connection.');
      } else {
        toast.error(`Error fetching billing data: ${error.message}`);
      }
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultation fee billing data from patients
  // Fetch all billing data from patients (consultation, service, registration)
  const fetchAllBillingData = async () => {
    try {
      console.log('🔍 Fetching all billing data from patients...');
      
      if (!user || !localUser) {
        console.log('User not authenticated, skipping billing data fetch');
        return;
      }
      
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      if (!centerId) {
        console.error('Center ID not found');
        return;
      }
      
      // Fetch all patients for the center
      const patientsResponse = await API.get('/patients');
      const patients = patientsResponse.data.patients || patientsResponse.data || [];
      
      console.log('📊 Found patients:', patients.length);
      
      // Extract all payment types from patient billing records
      const allPaymentsData = [];
      
      patients.forEach(patient => {
        // Regular billing records
        if (patient.billing && Array.isArray(patient.billing)) {
          patient.billing.forEach(bill => {
            if (bill.status === 'paid') {
              allPaymentsData.push({
                id: `regular_${bill.type}_${bill._id}`,
                patientId: patient._id,
                patientName: patient.name,
                patientPhone: patient.phone,
                patientEmail: patient.email,
                patientAge: patient.age,
                patientGender: patient.gender,
                uhId: patient.uhId,
                type: bill.type,
                amount: bill.amount,
                paymentMethod: bill.paymentMethod,
                notes: bill.notes || '',
                doctorId: bill.doctorId,
                doctorName: bill.doctorName || patient.assignedDoctor?.name || 'N/A',
                serviceName: bill.serviceName || '',
                serviceDescription: bill.serviceDescription || '',
                isReassigned: false,
                originalDoctor: patient.assignedDoctor?.name || 'N/A',
                currentDoctor: patient.assignedDoctor?.name || 'N/A',
                timestamp: bill.createdAt || bill.timestamp || new Date().toISOString(),
                recordedBy: bill.recordedBy || 'System',
                centerId: centerId,
                centerName: patient.centerName || 'N/A',
                invoiceNumber: bill.invoiceNumber || 'N/A',
                billId: bill._id
              });
            }
          });
        }
        
        // Reassigned billing records
        if (patient.isReassigned && patient.reassignedBilling && Array.isArray(patient.reassignedBilling)) {
          patient.reassignedBilling.forEach(bill => {
            if (bill.status === 'paid') {
              allPaymentsData.push({
                id: `reassigned_${bill.type}_${bill._id}`,
                patientId: patient._id,
                patientName: patient.name,
                patientPhone: patient.phone,
                patientEmail: patient.email,
                patientAge: patient.age,
                patientGender: patient.gender,
                uhId: patient.uhId,
                type: bill.type,
                amount: bill.amount,
                paymentMethod: bill.paymentMethod,
                notes: bill.notes || '',
                doctorId: bill.doctorId,
                doctorName: bill.doctorName || patient.currentDoctor?.name || 'N/A',
                serviceName: bill.serviceName || '',
                serviceDescription: bill.serviceDescription || '',
                isReassigned: true,
                originalDoctor: patient.assignedDoctor?.name || 'N/A',
                currentDoctor: patient.currentDoctor?.name || 'N/A',
                timestamp: bill.createdAt || bill.timestamp || new Date().toISOString(),
                recordedBy: bill.recordedBy || 'System',
                centerId: centerId,
                centerName: patient.centerName || 'N/A',
                invoiceNumber: bill.invoiceNumber || 'N/A',
                billId: bill._id
              });
            }
          });
        }
      });
      
      console.log('💰 Found all payments:', allPaymentsData.length);
      console.log('📈 Payment breakdown:', {
        consultation: allPaymentsData.filter(p => p.type === 'consultation').length,
        service: allPaymentsData.filter(p => p.type === 'service').length,
        registration: allPaymentsData.filter(p => p.type === 'registration').length,
        reassigned: allPaymentsData.filter(p => p.isReassigned).length
      });
      
      // Save all payments to localStorage
      allPaymentsData.forEach(payment => {
        localStorage.setItem(payment.id, JSON.stringify(payment));
      });
      
      // Reload all payments
      loadAllPayments();
      
      const consultationCount = allPaymentsData.filter(p => p.type === 'consultation').length;
      const serviceCount = allPaymentsData.filter(p => p.type === 'service').length;
      const registrationCount = allPaymentsData.filter(p => p.type === 'registration').length;
      
      toast.success(`Loaded ${allPaymentsData.length} payment records (${consultationCount} consultation, ${serviceCount} service, ${registrationCount} registration)`);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to fetch billing data');
    }
  };

  useEffect(() => {
    if (!user) {
      setLocalUser(null);
      setBillingData([]);
      return;
    }
    
    try {
      if (user && !localUser) {
        const safeUser = { ...user };
        setLocalUser(safeUser);
      }
      
      let centerId = localUser?.centerId || localUser?.center?.id || localUser?.centerId || localUser?.center_id;
      
      if (centerId && typeof centerId === 'object' && centerId._id) {
        centerId = centerId._id;
      }
      
      if (centerId) {
        fetchBillingData();
        fetchPatientsAndDoctors();
        loadAllPayments();
        fetchAllBillingData();
      } else {
        if (localUser && Object.keys(localUser).length > 0) {
          if (localUser.role === 'receptionist') {
            fetchCenterInfo();
          } else {
            toast.warning('Center ID not found in user profile. Please contact support.');
          }
        }
      }
    } catch (error) {
      toast.error('Error processing user data');
    }
  }, [user, localUser, localUser?.centerId, localUser?.center?.id]);

  // Fetch center information if centerId is not available
  const fetchCenterInfo = async () => {
    try {
      if (!user) {
        console.log('User not authenticated, skipping center info fetch');
        return;
      }
      
      if (!user?._id) {
        console.error('User missing _id:', user);
        toast.error('User ID not found');
        return;
      }
      
      const response = await API.get(`/centers/by-admin/${user._id}`);
      
      console.log('Center info fetched:', response.data);
      if (response.data._id) {
        const updatedUser = { ...user, centerId: response.data._id };
        console.log('Updated user with centerId:', updatedUser);
        setLocalUser(updatedUser);
        
        setTimeout(() => {
          fetchBillingData();
        }, 100);
      } else {
        console.error('Center data missing _id:', response.data);
        toast.error('Invalid center data received');
      }
    } catch (error) {
      console.error('Error fetching center info:', error);
      toast.error('Error fetching center information');
    }
  };

  // Categorize bills based on payment status
  const categorizeBills = () => {
    const fullyPaidBills = [];
    const multiplePaymentBills = [];
    const pendingBills = [];

    billingData.forEach(item => {
      if (!item || typeof item !== 'object' || !item.billing) return;

      const partialData = getPartialPaymentData(item._id);
      const totalPaidFromStorage = partialData.totalPaid;
      const backendPaidAmount = item.billing?.paidAmount || 0;
      const totalAmount = item.billing?.amount || 0;
      const status = item.billing?.status;
      
      // Check if bill is fully paid by status
      const isFullyPaidByStatus = status === 'paid' || status === 'verified';
      
      // Calculate actual paid amount - prioritize localStorage data over backend status
      let actualPaidAmount;
      if (totalPaidFromStorage > 0) {
        actualPaidAmount = totalPaidFromStorage;
      } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
        actualPaidAmount = totalAmount;
      } else {
        actualPaidAmount = backendPaidAmount;
      }
      
      const hasMultiplePayments = partialData.paymentCount > 1;
      const isFullyPaid = actualPaidAmount >= totalAmount && totalAmount > 0;
      const hasPartialPayment = actualPaidAmount > 0 && actualPaidAmount < totalAmount;
      
      // Categorize bills
      if (isFullyPaid) {
        if (hasMultiplePayments) {
          multiplePaymentBills.push({
            ...item,
            billing: {
              ...item.billing,
              paidAmount: actualPaidAmount,
              partialPayments: partialData.payments,
              remainingAmount: 0,
              paymentType: 'multiple'
            }
          });
        } else {
          fullyPaidBills.push({
            ...item,
            billing: {
              ...item.billing,
              paidAmount: actualPaidAmount,
              partialPayments: partialData.payments,
              remainingAmount: 0,
              paymentType: 'single'
            }
          });
        }
      } else if (hasPartialPayment) {
        pendingBills.push({
          ...item,
          billing: {
            ...item.billing,
            paidAmount: actualPaidAmount,
            partialPayments: partialData.payments,
            remainingAmount: totalAmount - actualPaidAmount,
            paymentType: 'partial'
          }
        });
      } else if (status === 'generated' || status === 'not_generated') {
        pendingBills.push({
          ...item,
          billing: {
            ...item.billing,
            paidAmount: 0,
            partialPayments: [],
            remainingAmount: totalAmount,
            paymentType: 'unpaid'
          }
        });
      }
    });

    return { fullyPaidBills, multiplePaymentBills, pendingBills };
  };

  // Apply filters to categorized bills
  const applyFilters = (bills) => {
    let filtered = bills;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if (!item || typeof item !== 'object') return false;
        
        return (
          (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.testType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.billing?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            try {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt || Date.now());
              return itemDate >= filterDate;
            } catch (error) {
              console.warn('Invalid date for item:', item);
              return false;
            }
          });
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            try {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt || Date.now());
              return itemDate >= filterDate;
            } catch (error) {
              console.warn('Invalid date for item:', item);
              return false;
            }
          });
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            try {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt || Date.now());
              return itemDate >= filterDate;
            } catch (error) {
              console.warn('Invalid date for item:', item);
              return false;
            }
          });
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const { fullyPaidBills, multiplePaymentBills, pendingBills } = categorizeBills();
  const filteredFullyPaid = applyFilters(fullyPaidBills);
  const filteredMultiplePayments = applyFilters(multiplePaymentBills);
  const filteredPendingBills = applyFilters(pendingBills);

  // Pagination logic for each section
  const getPaginatedData = (data, section) => {
    const startIndex = (currentPage[section] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage({
      fullyPaid: 1,
      multiplePayments: 1,
      pendingBills: 1
    });
  }, [searchTerm, dateFilter]);

  // Pagination controls component
  const PaginationControls = ({ data, section, totalPages }) => {
    if (!data || data.length === 0) return null;

    const startIndex = (currentPage[section] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return (
      <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> results
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{currentPage[section]}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => ({ ...prev, [section]: Math.max(prev[section] - 1, 1) }))}
              disabled={currentPage[section] === 1 || totalPages <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => ({ ...prev, [section]: Math.min(prev[section] + 1, totalPages) }))}
              disabled={currentPage[section] === totalPages || totalPages <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  // View invoice PDF
  const handleViewInvoice = async (testRequestId) => {
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
      
      // Create blob and open in new tab
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast.success('Invoice opened successfully!');
    } catch (error) {
      console.error('Error viewing invoice:', error);
      toast.error('Failed to view invoice');
    }
  };

  // View patient profile
  const handleViewProfile = (patientId) => {
    console.log('🔍 handleViewProfile called with:', patientId);
    console.log('🔍 Type:', typeof patientId);
    console.log('🔍 Is null/undefined:', patientId === null || patientId === undefined);
    console.log('🔍 String value:', String(patientId));
    
    // Ensure we have a valid string ID
    let validPatientId = null;
    
    if (patientId === null || patientId === undefined) {
      console.log('❌ Patient ID is null or undefined');
      toast.error('Patient ID is missing');
      return;
    }
    
    if (typeof patientId === 'string' && patientId.trim() !== '') {
      validPatientId = patientId.trim();
      console.log('✅ Using string patient ID:', validPatientId);
    } else if (typeof patientId === 'object' && patientId !== null) {
      // If it's an object, try to extract the _id
      validPatientId = patientId._id || patientId.id;
      console.log('✅ Extracted from object:', validPatientId);
    } else {
      // Try to convert to string
      validPatientId = String(patientId);
      console.log('✅ Converted to string:', validPatientId);
    }
    
    console.log('🎯 Final valid patient ID:', validPatientId);
    console.log('🎯 Final type:', typeof validPatientId);
    
    if (validPatientId && validPatientId !== 'null' && validPatientId !== 'undefined') {
      // Navigate to patient profile page
      console.log('🚀 Navigating to:', `/dashboard/receptionist/profile/${validPatientId}`);
      navigate(`/dashboard/receptionist/profile/${validPatientId}`);
    } else {
      console.log('❌ Invalid patient ID:', validPatientId);
      toast.error('Patient ID not found or invalid');
    }
  };

  // Safety check: if user is not authenticated
  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Authentication Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Please log in to access the billing tracker.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Billing Payment Tracker</h1>
              <p className="text-slate-600 text-lg">Track and manage all payment statuses for easy follow-up</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Bills</div>
                <div className="text-2xl font-bold text-slate-800">{billingData.length}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Fully Paid (Single)</p>
                <p className="text-2xl font-bold text-green-600">{filteredFullyPaid.length}</p>
                <p className="text-xs text-slate-500 mt-1">One-time payments</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Multiple Payments</p>
                <p className="text-2xl font-bold text-blue-600">{filteredMultiplePayments.length}</p>
                <p className="text-xs text-slate-500 mt-1">Paid in installments</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending Bills</p>
                <p className="text-2xl font-bold text-orange-600">{filteredPendingBills.length}</p>
                <p className="text-xs text-slate-500 mt-1">Need follow-up</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{billingData.reduce((sum, item) => sum + (item.billing?.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">All billing amounts</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Recording Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Consultation Fee Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
               onClick={() => {
                 setPaymentType('consultation');
                 setShowPaymentModal(true);
               }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Consultation Fee</p>
                <p className="text-2xl font-bold text-blue-600">{allPayments.filter(p => p.type === 'consultation').length}</p>
                <p className="text-xs text-slate-500 mt-1">Doctor consultations</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" />
              Record Payment
            </div>
          </div>

          {/* Service Charges Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
               onClick={() => {
                 setPaymentType('service');
                 setShowPaymentModal(true);
               }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Service Charges</p>
                <p className="text-2xl font-bold text-green-600">{allPayments.filter(p => p.type === 'service').length}</p>
                <p className="text-xs text-slate-500 mt-1">Additional services</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" />
              Record Payment
            </div>
          </div>

          {/* Registration Fee Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
               onClick={() => {
                 setPaymentType('registration');
                 setShowPaymentModal(true);
               }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Registration Fee</p>
                <p className="text-2xl font-bold text-purple-600">{allPayments.filter(p => p.type === 'registration').length}</p>
                <p className="text-xs text-slate-500 mt-1">New patient registration</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
              <Plus className="w-4 h-4 mr-1" />
              Record Payment
            </div>
          </div>

          {/* Export Payments Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
               onClick={exportPaymentsToExcel}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Export Payments</p>
                <p className="text-2xl font-bold text-orange-600">{allPayments.length}</p>
                <p className="text-xs text-slate-500 mt-1">Total payments</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
              <Download className="w-4 h-4 mr-1" />
              Export to Excel
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filters & Search</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={fetchBillingData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>


        {/* Fully Paid Bills Section */}
        {!loading && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Fully Paid Bills (Single Payment)</h3>
                      <p className="text-gray-600 font-medium">Patients who paid the full amount in one payment</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 mb-1">{filteredFullyPaid.length}</div>
                    <div className="text-xs font-semibold text-gray-600">Total Records</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                {filteredFullyPaid.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No fully paid bills found</p>
                    <p className="text-gray-500 text-sm mt-2">All bills are either partially paid or unpaid</p>
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(filteredFullyPaid, 'fullyPaid').map((item) => {
                        const partialPayments = item.billing?.partialPayments || [];
                        const totalAmount = item.billing?.amount || 0;
                        const paidAmount = item.billing?.paidAmount || 0;
                        const remainingAmount = item.billing?.remainingAmount || 0;
                        const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                  <FileText className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.billing?.invoiceNumber || `Bill #${item._id?.slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">Invoice</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.patientId?.name || item.patient?.name || item.patientName || 'Patient'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.patientId?.phone || item.patientId?.mobile || item.patient?.phone || item.patient?.mobile || item.patientPhone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.doctorId?.name || item.doctor?.name || item.doctorName || 'Doctor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.doctorId?.email || item.doctor?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.testType || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{totalAmount.toLocaleString()}</div>
                              <div className="text-sm text-green-600">₹{paidAmount.toLocaleString()} paid</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                100% Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 === BUTTON CLICK DEBUG ===');
                                    console.log('🔍 Full item:', item);
                                    console.log('🔍 item.patient:', item.patient);
                                    console.log('🔍 item.patientId:', item.patientId);
                                    console.log('🔍 item.patient?._id:', item.patient?._id);
                                    console.log('🔍 item.patient?.id:', item.patient?.id);
                                    console.log('🔍 item.patient type:', typeof item.patient);
                                    console.log('🔍 item.patientId type:', typeof item.patientId);
                                    
                                    // Extract patient ID properly
                                    let patientId = null;
                                    
                                    // Try different ways to get the patient ID
                                    if (item.patientId && typeof item.patientId === 'string' && item.patientId.trim() !== '') {
                                      patientId = item.patientId.trim();
                                      console.log('✅ Using item.patientId as string:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId._id) {
                                      patientId = item.patientId._id;
                                      console.log('✅ Using item.patientId._id:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId.id) {
                                      patientId = item.patientId.id;
                                      console.log('✅ Using item.patientId.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient._id) {
                                      patientId = item.patient._id;
                                      console.log('✅ Using item.patient._id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient.id) {
                                      patientId = item.patient.id;
                                      console.log('✅ Using item.patient.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'string' && item.patient.trim() !== '') {
                                      patientId = item.patient.trim();
                                      console.log('✅ Using item.patient as string:', patientId);
                                    } else {
                                      console.log('❌ No valid patient ID found');
                                      console.log('❌ Available keys in item:', Object.keys(item));
                                      if (item.patient) {
                                        console.log('❌ Available keys in item.patient:', Object.keys(item.patient));
                                      }
                                      if (item.patientId) {
                                        console.log('❌ Available keys in item.patientId:', Object.keys(item.patientId));
                                      }
                                    }
                                    
                                    console.log('🎯 Final extracted patient ID:', patientId);
                                    console.log('🎯 Final type:', typeof patientId);
                                    handleViewProfile(patientId);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Patient Profile"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(item._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <PaginationControls 
                data={filteredFullyPaid} 
                section="fullyPaid" 
                totalPages={getTotalPages(filteredFullyPaid)} 
              />
            </div>

            {/* Multiple Payments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Multiple Payment Bills</h3>
                      <p className="text-gray-600 font-medium">Patients who paid in multiple installments</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 mb-1">{filteredMultiplePayments.length}</div>
                    <div className="text-xs font-semibold text-gray-600">Total Records</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                {filteredMultiplePayments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No multiple payment bills found</p>
                    <p className="text-gray-500 text-sm mt-2">All payments were made in single transactions</p>
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(filteredMultiplePayments, 'multiplePayments').map((item) => {
                        const partialPayments = item.billing?.partialPayments || [];
                        const totalAmount = item.billing?.amount || 0;
                        const paidAmount = item.billing?.paidAmount || 0;
                        const remainingAmount = item.billing?.remainingAmount || 0;
                        const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.billing?.invoiceNumber || `Bill #${item._id?.slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">Invoice</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.patientId?.name || item.patient?.name || item.patientName || 'Patient'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.patientId?.phone || item.patientId?.mobile || item.patient?.phone || item.patient?.mobile || item.patientPhone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.doctorId?.name || item.doctor?.name || item.doctorName || 'Doctor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.doctorId?.email || item.doctor?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.testType || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{totalAmount.toLocaleString()}</div>
                              <div className="text-sm text-blue-600">₹{paidAmount.toLocaleString()} paid</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  {partialPayments.length} Payments
                                </span>
                                <div className="text-xs text-gray-500">
                                  Last: {partialPayments.length > 0 && partialPayments[0].timestamp ? 
                                    new Date(partialPayments[0].timestamp).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 === BUTTON CLICK DEBUG ===');
                                    console.log('🔍 Full item:', item);
                                    console.log('🔍 item.patient:', item.patient);
                                    console.log('🔍 item.patientId:', item.patientId);
                                    console.log('🔍 item.patient?._id:', item.patient?._id);
                                    console.log('🔍 item.patient?.id:', item.patient?.id);
                                    console.log('🔍 item.patient type:', typeof item.patient);
                                    console.log('🔍 item.patientId type:', typeof item.patientId);
                                    
                                    // Extract patient ID properly
                                    let patientId = null;
                                    
                                    // Try different ways to get the patient ID
                                    if (item.patientId && typeof item.patientId === 'string' && item.patientId.trim() !== '') {
                                      patientId = item.patientId.trim();
                                      console.log('✅ Using item.patientId as string:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId._id) {
                                      patientId = item.patientId._id;
                                      console.log('✅ Using item.patientId._id:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId.id) {
                                      patientId = item.patientId.id;
                                      console.log('✅ Using item.patientId.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient._id) {
                                      patientId = item.patient._id;
                                      console.log('✅ Using item.patient._id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient.id) {
                                      patientId = item.patient.id;
                                      console.log('✅ Using item.patient.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'string' && item.patient.trim() !== '') {
                                      patientId = item.patient.trim();
                                      console.log('✅ Using item.patient as string:', patientId);
                                    } else {
                                      console.log('❌ No valid patient ID found');
                                      console.log('❌ Available keys in item:', Object.keys(item));
                                      if (item.patient) {
                                        console.log('❌ Available keys in item.patient:', Object.keys(item.patient));
                                      }
                                      if (item.patientId) {
                                        console.log('❌ Available keys in item.patientId:', Object.keys(item.patientId));
                                      }
                                    }
                                    
                                    console.log('🎯 Final extracted patient ID:', patientId);
                                    console.log('🎯 Final type:', typeof patientId);
                                    handleViewProfile(patientId);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Patient Profile"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(item._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <PaginationControls 
                data={filteredMultiplePayments} 
                section="multiplePayments" 
                totalPages={getTotalPages(filteredMultiplePayments)} 
              />
            </div>

            {/* Pending Bills Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Pending Bills (Follow-up Required)</h3>
                      <p className="text-gray-600 font-medium">Bills that need payment or have outstanding amounts</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600 mb-1">{filteredPendingBills.length}</div>
                    <div className="text-xs font-semibold text-gray-600">Total Records</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto w-full">
                {filteredPendingBills.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No pending bills found</p>
                    <p className="text-gray-500 text-sm mt-2">All bills have been fully paid</p>
                  </div>
                ) : (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedData(filteredPendingBills, 'pendingBills').map((item) => {
                        const partialPayments = item.billing?.partialPayments || [];
                        const totalAmount = item.billing?.amount || 0;
                        const paidAmount = item.billing?.paidAmount || 0;
                        const remainingAmount = item.billing?.remainingAmount || 0;
                        const paymentPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                  <FileText className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.billing?.invoiceNumber || `Bill #${item._id?.slice(-6)}`}
                                  </div>
                                  <div className="text-sm text-gray-500">Invoice</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.patientId?.name || item.patient?.name || item.patientName || 'Patient'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.patientId?.phone || item.patientId?.mobile || item.patient?.phone || item.patient?.mobile || item.patientPhone || 'No phone'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {item.doctorId?.name || item.doctor?.name || item.doctorName || 'Doctor'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.doctorId?.email || item.doctor?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                {item.testType || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <div className="text-sm text-gray-900">Total: ₹{totalAmount.toLocaleString()}</div>
                                <div className="text-sm text-green-600">Paid: ₹{paidAmount.toLocaleString()}</div>
                                <div className="text-sm text-orange-600">Remaining: ₹{remainingAmount.toLocaleString()}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {paymentPercentage}% Paid
                                </span>
                                <div className="text-xs text-gray-500">
                                  {partialPayments.length > 0 ? `${partialPayments.length} payments` : 'No payments'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 === BUTTON CLICK DEBUG ===');
                                    console.log('🔍 Full item:', item);
                                    console.log('🔍 item.patient:', item.patient);
                                    console.log('🔍 item.patientId:', item.patientId);
                                    console.log('🔍 item.patient?._id:', item.patient?._id);
                                    console.log('🔍 item.patient?.id:', item.patient?.id);
                                    console.log('🔍 item.patient type:', typeof item.patient);
                                    console.log('🔍 item.patientId type:', typeof item.patientId);
                                    
                                    // Extract patient ID properly
                                    let patientId = null;
                                    
                                    // Try different ways to get the patient ID
                                    if (item.patientId && typeof item.patientId === 'string' && item.patientId.trim() !== '') {
                                      patientId = item.patientId.trim();
                                      console.log('✅ Using item.patientId as string:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId._id) {
                                      patientId = item.patientId._id;
                                      console.log('✅ Using item.patientId._id:', patientId);
                                    } else if (item.patientId && typeof item.patientId === 'object' && item.patientId.id) {
                                      patientId = item.patientId.id;
                                      console.log('✅ Using item.patientId.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient._id) {
                                      patientId = item.patient._id;
                                      console.log('✅ Using item.patient._id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'object' && item.patient.id) {
                                      patientId = item.patient.id;
                                      console.log('✅ Using item.patient.id:', patientId);
                                    } else if (item.patient && typeof item.patient === 'string' && item.patient.trim() !== '') {
                                      patientId = item.patient.trim();
                                      console.log('✅ Using item.patient as string:', patientId);
                                    } else {
                                      console.log('❌ No valid patient ID found');
                                      console.log('❌ Available keys in item:', Object.keys(item));
                                      if (item.patient) {
                                        console.log('❌ Available keys in item.patient:', Object.keys(item.patient));
                                      }
                                      if (item.patientId) {
                                       
                                      }
                                    }
                                    
                                    
                                    handleViewProfile(patientId);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="View Patient Profile"
                                >
                                  <User className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewInvoice(item._id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title="View Invoice"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              
              <PaginationControls 
                data={filteredPendingBills} 
                section="pendingBills" 
                totalPages={getTotalPages(filteredPendingBills)} 
              />
            </div>
          </>
        )}

        {/* All Payment Records Table - Moved to Last Position */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">All Payment Records</h3>
                  <p className="text-gray-600 font-medium">Complete payment history with detailed information</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600 mb-1">{filteredPayments.length}</div>
                <div className="text-xs font-semibold text-gray-600">Filtered Payments</div>
              </div>
            </div>
            
            {/* Payment Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={paymentSearchTerm}
                  onChange={(e) => setPaymentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="all">All Payment Types</option>
                <option value="consultation">Consultation Fees</option>
                <option value="service">Service Charges</option>
                <option value="registration">Registration Fees</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPaymentSearchTerm('');
                    setPaymentTypeFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium"
                >
                  Clear Filters
                </button>
                <button
                  onClick={fetchAllBillingData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Load All Payments
                </button>
                <button
                  onClick={loadAllPayments}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={clearDummyData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Dummy Data
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium">
                  {allPayments.length === 0 ? 'No payment records found' : 'No payments match your filters'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {allPayments.length === 0 ? 'Click "Load All Payments" to fetch real payment data from your system' : 'Try adjusting your search criteria'}
                </p>
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Information</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Information</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount & Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedPayments().map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${
                            payment.type === 'consultation' ? 'bg-blue-100' :
                            payment.type === 'service' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            {payment.type === 'consultation' ? (
                              <User className="w-4 h-4 text-blue-600" />
                            ) : payment.type === 'service' ? (
                              <Settings className="w-4 h-4 text-green-600" />
                            ) : (
                              <Users className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.invoiceNumber || payment.id.split('_')[2]?.slice(0, 8) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.type === 'consultation' ? 'Consultation Fee' :
                               payment.type === 'service' ? 'Service Charges' :
                               'Registration Fee'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.patientName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.patientAge && payment.patientGender ? 
                                `${payment.patientAge} years, ${payment.patientGender}` : 
                                payment.patientPhone || 'No phone'
                              }
                            </div>
                            <div className="text-xs text-gray-400">
                              {payment.uhId ? `UH ID: ${payment.uhId}` : (payment.patientEmail || 'No email')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {payment.patientPhone || 'No phone'}
                            </div>
                            {payment.isReassigned && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                Reassigned
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.doctorName || 'N/A'}
                        </div>
                        {payment.isReassigned && (
                          <div className="text-xs text-gray-500 mt-1">
                            <div>Original: {payment.originalDoctor || 'N/A'}</div>
                            <div>Current: {payment.currentDoctor || 'N/A'}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.type === 'consultation' ? 'bg-blue-100 text-blue-800' :
                          payment.type === 'service' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {payment.type === 'consultation' ? 'Consultation' :
                           payment.type === 'service' ? 'Service' :
                           'Registration'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{payment.amount?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {payment.paymentMethod || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.type === 'service' ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.serviceName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {payment.serviceDescription || 'No description'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {payment.type === 'consultation' ? 'Doctor consultation' : 'Patient registration'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.recordedBy || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Copy payment details to clipboard
                              const paymentText = `
Payment ID: ${payment.id}
Patient: ${payment.patientName}
Amount: ₹${payment.amount}
Type: ${payment.type}
Method: ${payment.paymentMethod}
Date: ${new Date(payment.timestamp).toLocaleString()}
Recorded By: ${payment.recordedBy}
                              `.trim();
                              navigator.clipboard.writeText(paymentText);
                              toast.success('Payment details copied to clipboard');
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Copy Payment Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this payment record?')) {
                                localStorage.removeItem(payment.id);
                                loadAllPayments();
                                toast.success('Payment record deleted');
                              }
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Payment Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredPayments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPaymentPage - 1) * paymentsPerPage) + 1} to {Math.min(currentPaymentPage * paymentsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={paymentsPerPage}
                      onChange={(e) => {
                        setPaymentsPerPage(Number(e.target.value));
                        setCurrentPaymentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPaymentPage(1)}
                    disabled={currentPaymentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPaymentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPaymentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, getTotalPaymentPages()) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(getTotalPaymentPages(), currentPaymentPage - 2 + i));
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPaymentPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded ${
                            currentPaymentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPaymentPage(prev => Math.min(prev + 1, getTotalPaymentPages()))}
                    disabled={currentPaymentPage === getTotalPaymentPages()}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPaymentPage(getTotalPaymentPages())}
                    disabled={currentPaymentPage === getTotalPaymentPages()}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Recording Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Record {paymentType === 'consultation' ? 'Consultation Fee' : 
                            paymentType === 'service' ? 'Service Charges' : 
                            'Registration Fee'} Payment
                  </h3>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPatient(null);
                      setPaymentData({
                        amount: '',
                        paymentMethod: 'cash',
                        notes: '',
                        doctorId: '',
                        serviceName: '',
                        serviceDescription: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient *
                  </label>
                  <select
                    value={selectedPatient?._id || ''}
                    onChange={(e) => {
                      const patient = patients.find(p => p._id === e.target.value);
                      setSelectedPatient(patient);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.phone} {patient.isReassigned ? '(Reassigned)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor *
                  </label>
                  <select
                    value={paymentData.doctorId}
                    onChange={(e) => setPaymentData({...paymentData, doctorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Details (only for service charges) */}
                {paymentType === 'service' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        value={paymentData.serviceName}
                        onChange={(e) => setPaymentData({...paymentData, serviceName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Blood Test, X-Ray, etc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Description
                      </label>
                      <textarea
                        value={paymentData.serviceDescription}
                        onChange={(e) => setPaymentData({...paymentData, serviceDescription: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Describe the service provided..."
                      />
                    </div>
                  </>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Patient Info Display */}
                {selectedPatient && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Name:</span> {selectedPatient.name}
                      </div>
                      <div>
                        <span className="text-blue-700">Phone:</span> {selectedPatient.phone}
                      </div>
                      <div>
                        <span className="text-blue-700">Email:</span> {selectedPatient.email || 'N/A'}
                      </div>
                      <div>
                        <span className="text-blue-700">Status:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          selectedPatient.isReassigned ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedPatient.isReassigned ? 'Reassigned' : 'Regular'}
                        </span>
                      </div>
                      {selectedPatient.isReassigned && (
                        <>
                          <div>
                            <span className="text-blue-700">Original Doctor:</span> {selectedPatient.assignedDoctor?.name || 'N/A'}
                          </div>
                          <div>
                            <span className="text-blue-700">Current Doctor:</span> {selectedPatient.currentDoctor?.name || 'N/A'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedPatient(null);
                      setPaymentData({
                        amount: '',
                        paymentMethod: 'cash',
                        notes: '',
                        doctorId: '',
                        serviceName: '',
                        serviceDescription: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistBillingTracker;
