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
  FileDown
} from 'lucide-react';

const CenterAdminConsultationFeeBilling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // Get reassignment info from navigation state
  const reassignmentInfo = location.state?.reassignmentInfo;
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);


  useEffect(() => {
    fetchCenterPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter]);

  // Clear reassignment info only when user manually dismisses the notification
  // or when payment is completed - NOT automatically after 1 second
  const clearReassignmentInfo = () => {
    console.log('🧹 Manually clearing reassignment info');
    navigate('/dashboard/centeradmin/consultation-fee-billing', { replace: true });
  };

  const fetchCenterPatients = async () => {
    try {
      setLoading(true);
      
      // First, get the total count to understand pagination (with reassigned patients)
      const firstResponse = await API.get('/patients?limit=10&page=1&includeReassigned=true');
      
      const totalPatients = firstResponse.data.pagination?.total || 0;
      const totalPages = firstResponse.data.pagination?.totalPages || 1;
      
      if (totalPatients === 0) {
        setPatients([]);
        return;
      }
      
      // Try multiple approaches to get all patients including reassigned ones
      
      // Approach 1: Try /patients/all (superadmin endpoint) - only for superadmin users
      if (user?.role === 'superadmin') {
        try {
          const allResponse = await API.get('/patients/all');
          if (allResponse.data.patients && allResponse.data.patients.length > 0) {
            setPatients(allResponse.data.patients);
            return;
          }
        } catch (allError) {
          // Continue to next approach
        }
      }
      
      // Approach 2: Try with includeReassigned parameter
      try {
        const reassignedResponse = await API.get('/patients?limit=10000&page=1&includeReassigned=true');
        if (reassignedResponse.data.patients && reassignedResponse.data.patients.length > 0) {
          setPatients(reassignedResponse.data.patients);
          return;
        }
      } catch (reassignedError) {
        // Continue to next approach
      }
      
      // Approach 3: Try simple high limit approach
      try {
        const simpleResponse = await API.get('/patients?limit=10000&page=1');
        if (simpleResponse.data.patients && simpleResponse.data.patients.length > 0) {
          if (simpleResponse.data.patients.length >= totalPatients) {
            setPatients(simpleResponse.data.patients);
            return;
          }
        }
      } catch (simpleError) {
        // Continue to pagination approach
      }
      
      // If simple approach didn't work, try pagination
      const allPatients = [];
      const promises = [];
      
      // Create promises for all pages
      for (let page = 1; page <= totalPages; page++) {
        promises.push(
          API.get(`/patients?limit=100&page=${page}&includeReassigned=true`)
            .then(response => response.data.patients || [])
            .catch(error => [])
        );
      }
      
      // Wait for all pages to load
      const pageResults = await Promise.all(promises);
      
      // Combine all patients from all pages
      pageResults.forEach((pagePatients) => {
        allPatients.push(...pagePatients);
      });
      
      // If we still don't have all patients, try alternative approaches
      if (allPatients.length < totalPatients) {
        // Try alternative approach - get all patients without pagination
        try {
          const altResponse = await API.get('/patients/all');
          if (altResponse.data.patients && altResponse.data.patients.length > allPatients.length) {
            setPatients(altResponse.data.patients);
            return;
          }
        } catch (altError) {
          // Continue to next approach
        }
        
        // Try with very high limit
        try {
          const highLimitResponse = await API.get('/patients?limit=10000&page=1&includeReassigned=true');
          if (highLimitResponse.data.patients && highLimitResponse.data.patients.length > allPatients.length) {
            setPatients(highLimitResponse.data.patients);
            return;
          }
        } catch (highLimitError) {
          // Continue with pagination results
        }
      }
      
      setPatients(allPatients);
      
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
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

    // Process patients - create separate entries for reassigned patients
    const processedPatients = [];
    const processedPatientIds = new Set(); // Track processed patients to avoid duplicates
    
    filtered.forEach(patient => {
      // Check if this is a newly reassigned patient from navigation
      const isNewlyReassigned = reassignmentInfo?.reassigned && reassignmentInfo?.patientId === patient._id;
      
      // Check if patient has billing records for different doctors (indicating previous reassignment)
      const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
      const hasBillingForDifferentDoctor = patient.billing && patient.billing.some(bill => {
        const hasDoctorId = bill.doctorId && bill.doctorId.toString();
        return hasDoctorId && bill.doctorId.toString() !== currentDoctorId?.toString();
      });
      
      // Check if patient has multiple consultation fees (indicating reassignment)
      const consultationFees = patient.billing?.filter(bill => 
        bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
      ) || [];
      const hasMultipleConsultationFees = consultationFees.length > 1;
      
      // Check if this patient was previously reassigned (has reassignment marker in localStorage)
      const reassignmentKey = `reassigned_${patient._id}`;
      const wasPreviouslyReassigned = localStorage.getItem(reassignmentKey) === 'true';
      
      const needsReassignedEntry = isNewlyReassigned || hasBillingForDifferentDoctor || hasMultipleConsultationFees || wasPreviouslyReassigned;
      
      if (needsReassignedEntry && !processedPatientIds.has(patient._id)) {
        // Mark as processed
        processedPatientIds.add(patient._id);
        
        // 1. Add the original patient entry
        processedPatients.push({
          ...patient,
          isReassignedEntry: false,
          reassignmentInfo: null,
          isOriginalEntry: true,
          originalPatientId: patient._id
        });
        
        // 2. Create a reassigned entry (keep billing records but check for current doctor's consultation fee)
        const reassignedPatient = {
          ...patient,
          isReassignedEntry: true,
          reassignmentInfo: isNewlyReassigned ? reassignmentInfo : { 
            reassigned: true, 
            patientId: patient._id,
            reason: 'Doctor reassignment'
          },
          reassignedEntryId: `${patient._id}_reassigned`,
          originalPatientId: patient._id,
          // Keep billing records but filter for current doctor's consultation fee
          billing: patient.billing || []
        };
        
        // Mark this patient as reassigned in localStorage so it persists
        const reassignmentKey = `reassigned_${patient._id}`;
        localStorage.setItem(reassignmentKey, 'true');
        
        // Creating separate entries for reassigned patient
        
        processedPatients.push(reassignedPatient);
      } else if (!processedPatientIds.has(patient._id)) {
        // Add regular patient
        processedPatientIds.add(patient._id);
        processedPatients.push({
          ...patient,
          isReassignedEntry: false,
          reassignmentInfo: null,
          originalPatientId: patient._id
        });
      }
    });

    // Apply status filter to processed patients
    if (statusFilter !== 'all') {
      const statusFiltered = processedPatients.filter(patient => {
        const status = getPatientStatus(patient);
        return status === statusFilter;
      });
      setFilteredPatients(statusFiltered);
    } else {
      setFilteredPatients(processedPatients);
    }
    
    setCurrentPage(1);
  };

  const getPatientStatus = (patient) => {
    const isReassignedEntry = patient.isReassignedEntry || false;
    
    if (!patient.billing || patient.billing.length === 0) {
      return 'Consultation Fee Required';
    }

    // Check for consultation fee for the current doctor
    const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
    
    // For reassigned patients, check if they have consultation fee for current doctor
    if (isReassignedEntry) {
      const consultationFeeForCurrentDoctor = patient.billing.find(bill => {
        const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
        if (isConsultationFee) {
          const hasDoctorId = bill.doctorId && bill.doctorId.toString();
          const matchesCurrentDoctor = hasDoctorId && currentDoctorId && bill.doctorId.toString() === currentDoctorId.toString();
          return matchesCurrentDoctor;
        }
        return false;
      });
      
      if (!consultationFeeForCurrentDoctor) {
        return 'Consultation Fee Required';
      }
      
      if (consultationFeeForCurrentDoctor.status === 'paid' || consultationFeeForCurrentDoctor.status === 'completed') {
        return 'All Paid';
      } else {
        return 'Consultation Fee Pending';
      }
    }
    
    // For regular patients, check any consultation fee
    const consultationFee = patient.billing.find(bill => {
      const isConsultationType = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      const hasDoctorId = bill.doctorId && bill.doctorId.toString();
      const matchesCurrentDoctor = !hasDoctorId || bill.doctorId.toString() === currentDoctorId?.toString();
      
      return isConsultationType && matchesCurrentDoctor;
    });
    
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    const serviceCharges = patient.billing.filter(bill => bill.type === 'service');

    const hasConsultationFee = !!consultationFee;
    const hasRegistrationFee = !!registrationFee;
    const hasServiceCharges = serviceCharges.length > 0;

    const paidConsultationFee = hasConsultationFee && (consultationFee.status === 'paid' || consultationFee.status === 'completed');
    const paidRegistrationFee = hasRegistrationFee && (registrationFee.status === 'paid' || registrationFee.status === 'completed');
    const paidServiceCharges = hasServiceCharges && serviceCharges.every(bill => bill.status === 'paid' || bill.status === 'completed');

    const isNewPatient = isPatientNew(patient);

    // Status check results

    if (isReassignedEntry) {
      // For reassigned patients, treat as new patient but WITHOUT registration fee
      // They only need consultation fee for the new doctor
      if (!hasConsultationFee) {
        return 'Consultation Fee Required';
      }
      if (hasConsultationFee && !paidConsultationFee) {
        return 'Consultation Fee Pending';
      }
      if (hasServiceCharges && !paidServiceCharges) {
        return 'Service Charges Pending';
      }
      return 'All Paid';
    } else {
      // For regular patients, check registration fee first (new patients only)
      if (isNewPatient && !hasRegistrationFee) {
        return 'Registration Fee Required';
      }
      
      // Check consultation fee
      if (!hasConsultationFee) {
        return 'Consultation Fee Required';
      }
      if (hasConsultationFee && !paidConsultationFee) {
        return 'Consultation Fee Pending';
      }
      
      // Check service charges
      if (hasServiceCharges && !paidServiceCharges) {
        return 'Service Charges Pending';
      }
      
      return 'All Paid';
    }
  };

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

    const isReassignedEntry = patient.isReassignedEntry || false;
    
    // For reassigned patients with empty billing, they need new consultation fee
    if (isReassignedEntry && patient.billing.length === 0) {
      return null;
    }

    // Check for consultation fee for the current doctor
    const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;

    const consultationFee = patient.billing.find(bill => {
      const isConsultationType = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      const hasDoctorId = bill.doctorId && bill.doctorId.toString();
      const matchesCurrentDoctor = !hasDoctorId || bill.doctorId.toString() === currentDoctorId?.toString();
      
      return isConsultationType && matchesCurrentDoctor;
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

    const isReassignedEntry = patient.isReassignedEntry || false;
    
    // For reassigned patients with empty billing, they have no service charges yet
    if (isReassignedEntry && patient.billing.length === 0) {
      return [];
    }

    return patient.billing.filter(bill => bill.type === 'service').map(bill => ({
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

  const handleGenerateInvoice = async (patient) => {
    try {
      // For reassigned patients, use the original patient ID to get billing records
      // For regular patients, use the patient ID directly
      const patientIdToUse = patient.isReassignedEntry ? patient.originalPatientId : patient._id;
      
      console.log('🧾 Generating invoice for:', patient.name);
      console.log('🧾 Is reassigned entry:', patient.isReassignedEntry);
      console.log('🧾 Using patient ID:', patientIdToUse);
      
      const response = await API.post('/billing/generate-invoice', {
        patientId: patientIdToUse
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

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const exportData = filteredPatients.map(patient => {
        const status = getPatientStatus(patient);
        const consultationFee = getConsultationFeeDetails(patient);
        const registrationFee = getRegistrationFeeDetails(patient);
        const serviceCharges = getServiceChargesDetails(patient);
        
        return {
          name: patient.name,
          uhId: patient.uhId || 'N/A',
          doctor: patient.assignedDoctor?.name || 'Not Assigned',
          visit: getVisitNumber(patient),
          status: status,
          consultationAmount: consultationFee?.amount || 0,
          consultationStatus: consultationFee?.status || 'N/A',
          registrationAmount: registrationFee?.amount || 0,
          registrationStatus: registrationFee?.status || 'N/A',
          serviceAmount: serviceCharges.reduce((sum, s) => sum + s.amount, 0),
          serviceCount: serviceCharges.length,
          totalAmount: (consultationFee?.amount || 0) + (registrationFee?.amount || 0) + serviceCharges.reduce((sum, s) => sum + s.amount, 0),
          createdAt: new Date(patient.createdAt).toLocaleDateString()
        };
      });

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Patient Billing Report - ${new Date().toLocaleDateString()}</title>
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
              .report-container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border: 2px solid #333;
                page-break-inside: avoid;
              }
              .header {
                background: #f8f9fa;
                border-bottom: 2px solid #333;
                padding: 20px;
                text-align: center;
              }
              .clinic-name {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
              }
              .report-title {
                font-size: 20px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
              }
              .report-date {
                font-size: 14px;
                color: #666;
              }
              .content {
                padding: 20px;
              }
              .summary-stats {
                display: flex;
                justify-content: space-around;
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border: 1px solid #ddd;
              }
              .stat-item {
                text-align: center;
              }
              .stat-number {
                font-size: 18px;
                font-weight: bold;
                color: #333;
              }
              .stat-label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
              }
              .data-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                border: 1px solid #333;
              }
              .data-table th {
                background: #333;
                color: white;
                padding: 8px 6px;
                text-align: left;
                font-weight: bold;
                font-size: 11px;
                text-transform: uppercase;
                border: 1px solid #333;
              }
              .data-table td {
                padding: 6px;
                border: 1px solid #ddd;
                font-size: 11px;
                vertical-align: top;
              }
              .data-table tr:nth-child(even) {
                background: #f8f9fa;
              }
              .status-badge {
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
              }
              .status-paid { background: #d4edda; color: #155724; }
              .status-pending { background: #fff3cd; color: #856404; }
              .status-required { background: #f8d7da; color: #721c24; }
              .amount {
                text-align: right;
                font-weight: 600;
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
              @media print {
                body { padding: 0; margin: 0; }
                .report-container { border: none; }
                .report-container { page-break-inside: avoid; }
              }
              @page {
                margin: 0.5in;
                size: A4 landscape;
              }
            </style>
          </head>
          <body>
            <div class="report-container">
              <div class="header">
                <div class="clinic-name">Patient Billing Report</div>
                <div class="report-title">Consultation Fee Billing Summary</div>
                <div class="report-date">Generated on ${new Date().toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
              
              <div class="content">
                <div class="summary-stats">
                  <div class="stat-item">
                    <div class="stat-number">${exportData.length}</div>
                    <div class="stat-label">Total Patients</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">${exportData.filter(p => p.status === 'All Paid').length}</div>
                    <div class="stat-label">Fully Paid</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">${exportData.filter(p => p.status.includes('Pending')).length}</div>
                    <div class="stat-label">Pending Payments</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">₹${exportData.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString('en-IN')}</div>
                    <div class="stat-label">Total Revenue</div>
                  </div>
                </div>
                
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>UH ID</th>
                      <th>Doctor</th>
                      <th>Visit</th>
                      <th>Status</th>
                      <th>Consultation (₹)</th>
                      <th>Registration (₹)</th>
                      <th>Services (₹)</th>
                      <th>Total (₹)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${exportData.map(patient => `
                      <tr>
                        <td>${patient.name}</td>
                        <td>${patient.uhId}</td>
                        <td>${patient.doctor}</td>
                        <td>${patient.visit}</td>
                        <td><span class="status-badge ${
                          patient.status === 'All Paid' ? 'status-paid' :
                          patient.status.includes('Pending') ? 'status-pending' :
                          'status-required'
                        }">${patient.status}</span></td>
                        <td class="amount">${patient.consultationAmount > 0 ? '₹' + patient.consultationAmount.toLocaleString('en-IN') : '-'}</td>
                        <td class="amount">${patient.registrationAmount > 0 ? '₹' + patient.registrationAmount.toLocaleString('en-IN') : '-'}</td>
                        <td class="amount">${patient.serviceAmount > 0 ? '₹' + patient.serviceAmount.toLocaleString('en-IN') : '-'}</td>
                        <td class="amount">₹${patient.totalAmount.toLocaleString('en-IN')}</td>
                        <td>${patient.createdAt}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="footer">
                <p>This report contains billing information for patients with payment records</p>
                <p>Generated on ${new Date().toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = filteredPatients.map(patient => {
        const status = getPatientStatus(patient);
        const consultationFee = getConsultationFeeDetails(patient);
        const registrationFee = getRegistrationFeeDetails(patient);
        const serviceCharges = getServiceChargesDetails(patient);
        
        return {
          'Patient Name': patient.name,
          'UH ID': patient.uhId || 'N/A',
          'Doctor': patient.assignedDoctor?.name || 'Not Assigned',
          'Visit': getVisitNumber(patient),
          'Status': status,
          'Consultation Amount (₹)': consultationFee?.amount || 0,
          'Consultation Status': consultationFee?.status || 'N/A',
          'Registration Amount (₹)': registrationFee?.amount || 0,
          'Registration Status': registrationFee?.status || 'N/A',
          'Service Amount (₹)': serviceCharges.reduce((sum, s) => sum + s.amount, 0),
          'Service Count': serviceCharges.length,
          'Total Amount (₹)': (consultationFee?.amount || 0) + (registrationFee?.amount || 0) + serviceCharges.reduce((sum, s) => sum + s.amount, 0),
          'Phone': patient.phone || 'N/A',
          'Email': patient.email || 'N/A',
          'Registration Date': new Date(patient.createdAt).toLocaleDateString(),
          'Payment Method': consultationFee?.paymentMethod || registrationFee?.paymentMethod || 'N/A'
        };
      });

      // Create CSV content
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
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
      link.setAttribute('download', `patient_billing_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel report downloaded successfully');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel report');
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
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

  const getVisitNumber = (patient) => {
    // Calculate visit number based on visitCount and revisitHistory
    const baseVisits = patient.visitCount || 0;
    const revisitCount = patient.revisitHistory?.length || 0;
    const totalVisits = baseVisits + revisitCount;
    
    // If no visits recorded, consider it as 1st visit
    if (totalVisits === 0) {
      return '1st Visit';
    }
    
    // Return appropriate visit number
    const visitNumber = totalVisits + 1; // +1 because we're showing current visit
    if (visitNumber === 1) return '1st Visit';
    if (visitNumber === 2) return '2nd Visit';
    if (visitNumber === 3) return '3rd Visit';
    return `${visitNumber}th Visit`;
  };

  const getStats = () => {
    const totalPatients = patients.length;
    
    // Count patients by status
    const statusCounts = patients.reduce((acc, patient) => {
      const status = getPatientStatus(patient);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const needsConsultationFee = (statusCounts['Consultation Fee Required'] || 0) + 
                                (statusCounts['Consultation Fee Pending'] || 0) +
                                (statusCounts['Service Charges Pending'] || 0) +
                                (statusCounts['Registration Fee Required'] || 0);
    
    const paidConsultationFee = statusCounts['All Paid'] || 0;
    const noPayments = statusCounts['No Payments'] || 0;
    
    
    return { totalPatients, needsConsultationFee, paidConsultationFee, noPayments };
  };

  const stats = getStats();

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

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
              <h1 className="text-md font-bold text-slate-800 mb-2">
                Patient Billing Management - Center Admin View
              </h1>
              <p className="text-slate-600 text-sm">
                View, manage, and download invoices for all patients in your center
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={filteredPatients.length === 0}
              >
                <FileDown className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={fetchCenterPatients}
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
                        ⚠️ Please collect consultation fee and service charges for the new doctor assignment.
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                <p className="text-md font-bold text-slate-800">{stats.totalPatients}</p>
                <p className="text-xs text-slate-500">All patients</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Pending Payments</p>
                <p className="text-md font-bold text-slate-800">{stats.needsConsultationFee}</p>
                <p className="text-xs text-slate-500">Need attention</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Fully Paid</p>
                <p className="text-md font-bold text-slate-800">{stats.paidConsultationFee}</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">No Payments</p>
                <p className="text-md font-bold text-slate-800">{stats.noPayments}</p>
                <p className="text-xs text-slate-500">New patients</p>
              </div>
              <UserPlus className="h-8 w-8 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Current View</p>
                <p className="text-md font-bold text-slate-800">{filteredPatients.length}</p>
                <p className="text-xs text-slate-500">Filtered results</p>
              </div>
              <Filter className="h-8 w-8 text-purple-500" />
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
                    placeholder="Search patients by name, email, phone, UH ID, assigned doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  >
                    <option value="all">All Payment Status</option>
                    <option value="All Paid">All Paid</option>
                    <option value="Consultation Fee Pending">Consultation Fee Pending</option>
                    <option value="Service Charges Pending">Service Charges Pending</option>
                    <option value="Registration Fee Required">Registration Fee Required</option>
                    <option value="Consultation Fee Required">Consultation Fee Required</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No patients found</h3>
              <p className="text-slate-600 text-sm mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters'
                  : 'No patients found in your center'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentPatients.map((patient) => {
                  const status = getPatientStatus(patient);
                  const consultationFee = getConsultationFeeDetails(patient);
                  const registrationFee = getRegistrationFeeDetails(patient);
                  const serviceCharges = getServiceChargesDetails(patient);

                  const isReassignedEntry = patient.isReassignedEntry || false;
                  
                  // Use unique key for each entry (original vs reassigned)
                  const uniqueKey = isReassignedEntry ? `${patient._id}_reassigned` : patient._id;
                  
                  return (
                    <tr key={uniqueKey} className={`hover:bg-slate-50 ${isReassignedEntry ? 'bg-orange-50 border-l-4 border-orange-400' : ''}`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isReassignedEntry ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                              <User className={`h-5 w-5 ${isReassignedEntry ? 'text-orange-600' : 'text-blue-600'}`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                              {isReassignedEntry && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Reassigned
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">{patient.uhId || 'N/A'}</div>
                            <div className="text-xs text-slate-400">
                              {new Date(patient.createdAt).toLocaleDateString()} {new Date(patient.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{patient.assignedDoctor?.name || 'Not Assigned'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-green-600">{getVisitNumber(patient).split(' ')[0]}</span>
                            </div>
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-slate-900">{getVisitNumber(patient)}</div>
                            {patient.revisitHistory && patient.revisitHistory.length > 0 && (
                              <div className="text-xs text-slate-500">
                                Last: {new Date(patient.revisitHistory[patient.revisitHistory.length - 1].revisitDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-600 space-y-1">
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
                            <span className="text-xs text-slate-400">No payments</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => navigate(`/dashboard/centeradmin/patients/viewprofile/${patient._id}`)}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Only show invoice button for patients with billing records */}
                          {!isReassignedEntry && (
                            <button
                              onClick={() => handleGenerateInvoice(patient)}
                              className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
                              title="Generate Invoice"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Show different message for reassigned patients */}
                          {isReassignedEntry && (
                            <span 
                              className="text-orange-600 p-1 rounded transition-colors cursor-help"
                              title="No billing records yet - collect consultation fee first"
                            >
                              <FileText className="h-4 w-4 opacity-50" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Enhanced Pagination */}
          <div className="bg-white px-4 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 sm:px-6 gap-4">
            {/* Pagination Info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredPatients.length)}</span> of{' '}
                <span className="font-medium">{filteredPatients.length}</span> results
              </div>
              
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Show:</label>
                <select
                  value={patientsPerPage}
                  onChange={(e) => {
                    setPatientsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Pagination Controls */}
          {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  ««
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  ‹
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {/* Show first few pages */}
                  {currentPage > 3 && (
                    <>
                    <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-50"
                    >
                        1
                    </button>
                      {currentPage > 4 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPage;
                    const isNearCurrentPage = Math.abs(pageNumber - currentPage) <= 2;
                    
                    if (!isNearCurrentPage && pageNumber !== 1 && pageNumber !== totalPages) {
                      return null;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 border text-xs font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {/* Show last few pages */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                    >
                  ›
                    </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-slate-300 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  »»
                </button>
                </div>
            )}

            {/* Quick Jump */}
            {totalPages > 5 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Go to:</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Number(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-slate-600">of {totalPages}</span>
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
                  Export Patient Data
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
                  Choose the format to export {filteredPatients.length} patient records:
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={exportToPDF}
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
                    onClick={exportToExcel}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterAdminConsultationFeeBilling;
