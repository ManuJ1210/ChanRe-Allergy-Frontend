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
  Receipt
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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [finalFilteredPatients, setFinalFilteredPatients] = useState([]);
  const [subSearchTerm, setSubSearchTerm] = useState('');
  const [showSubSearch, setShowSubSearch] = useState(false);
  const [searchField, setSearchField] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);

  // Patient selection and reassignment states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [reassignData, setReassignData] = useState({
    newDoctorId: '',
    reason: '',
    notes: ''
  });

  // Billing workflow states - Same as ConsultationBilling
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showInvoicePreviewModal, setShowInvoicePreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelBillModal, setShowCancelBillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  const [invoiceFormData, setInvoiceFormData] = useState({
    registrationFee: 0,
    consultationFee: 850,
    serviceCharges: [{ name: '', amount: '', description: '' }],
    taxPercentage: 0,
    discountPercentage: 0,
    notes: '',
    consultationType: 'OP'
  });
  
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    receiptNumber: '',
    paymentMethod: 'cash',
    paymentType: 'full',
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

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
    fetchAvailableDoctors();
    fetchCenterInfo();
  }, [dispatch]);

  // Function to get center ID
  const getCenterId = () => {
    if (!user) return null;
    
    if (user.centerId) {
      if (typeof user.centerId === 'object' && user.centerId._id) {
        return user.centerId._id;
      }
      return user.centerId;
    }
    
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
      }
    }
  };

  const fetchAvailableDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const response = await API.get('/doctors');
      const allDoctors = response.data || [];
      
      const filtered = allDoctors.filter(doctor => {
        if (selectedPatient?.assignedDoctor?._id === doctor._id) {
          return false;
        }
        return true;
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

  // Primary search filter - Only show patients who completed first consultation
  useEffect(() => {
    let filtered = patients.filter(patient => {
      // Only show patients who have completed their first consultation (have billing records)
      const hasCompletedFirstConsultation = patient.billing && patient.billing.length > 0;
      
      if (!hasCompletedFirstConsultation) {
        return false;
      }
      
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

  // Check if patient is eligible for free reassignment (within 7 days of first consultation)
  const isEligibleForFreeReassignment = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return false;
    }

    // Check if patient has already been reassigned
    if (patient.isReassigned || patient.reassignmentHistory?.length > 0) {
      return false;
    }

    // Get the first consultation date
    const firstConsultationDate = new Date(patient.billing[0]?.createdAt || patient.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - firstConsultationDate) / (1000 * 60 * 60 * 24));

    return daysDifference <= 7;
  };

  // Get consultation fee based on reassignment eligibility
  const getConsultationFee = (patient, consultationType) => {
    if (isEligibleForFreeReassignment(patient)) {
      return 0; // Free for first reassignment within 7 days
    }
    
    if (consultationType === 'IP') {
      return 1050;
    }
    
    return 850; // Default OP consultation fee
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

  // Create invoice for reassigned patient
  const handleCreateInvoice = (patient) => {
    setSelectedPatient(patient);
    
    // Check if eligible for free reassignment
    const isFree = isEligibleForFreeReassignment(patient);
    
    // Determine default consultation type and fee
    let defaultConsultationType = 'OP';
    let defaultConsultationFee = getConsultationFee(patient, 'OP');
    
    setInvoiceFormData({
      registrationFee: 0, // Reassigned patients don't pay registration fee again
      consultationFee: defaultConsultationFee,
      serviceCharges: [{ name: '', amount: '', description: '' }],
      taxPercentage: 0,
      discountPercentage: 0,
      notes: isFree ? `Free reassignment for ${patient.name} (within 7 days)` : `Invoice for reassigned patient: ${patient.name}`,
      consultationType: defaultConsultationType
    });
    
    setShowCreateInvoiceModal(true);
  };

  // Get reassignment status for patient
  const getReassignmentStatus = (patient) => {
    const hasReassignmentBilling = patient.billing?.some(bill => bill.isReassignedEntry);
    const isReassigned = patient.isReassigned || patient.reassignmentHistory?.length > 0;
    
    if (!isReassigned) {
      return { status: 'Not Reassigned', color: 'text-slate-600 bg-slate-100', icon: <Clock className="h-4 w-4" /> };
    }

    if (!hasReassignmentBilling) {
      const isFree = isEligibleForFreeReassignment(patient);
      if (isFree) {
        return { status: 'Free Reassignment Available', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-4 w-4" /> };
      } else {
      return { status: 'No Invoice', color: 'text-orange-600 bg-orange-100', icon: <AlertCircle className="h-4 w-4" /> };
    }
    }

    // Check billing status for reassigned entries
    const reassignmentBills = patient.billing.filter(bill => bill.isReassignedEntry);
    const totalAmount = reassignmentBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const totalPaid = reassignmentBills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
    
    if (totalAmount === 0) {
      return { status: 'Free Consultation', color: 'text-blue-600 bg-blue-100', icon: <CheckCircle className="h-4 w-4" /> };
    } else if (totalPaid === 0) {
      return { status: 'Pending Payment', color: 'text-orange-600 bg-orange-100', icon: <AlertCircle className="h-4 w-4" /> };
    } else if (totalPaid < totalAmount) {
      return { status: 'Partial Payment', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-4 w-4" /> };
    } else {
      return { status: 'Fully Paid', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-4 w-4" /> };
    }
  };

  const getStats = () => {
    const totalPatients = finalFilteredPatients.length;
    const eligibleForFree = finalFilteredPatients.filter(p => isEligibleForFreeReassignment(p)).length;
    const alreadyReassigned = finalFilteredPatients.filter(p => p.isReassigned || p.reassignmentHistory?.length > 0).length;
    const pendingBilling = finalFilteredPatients.filter(p => {
      const status = getReassignmentStatus(p);
      return status.status === 'No Invoice' || status.status === 'Pending Payment';
    }).length;
    
    return { 
      totalPatients, 
      eligibleForFree,
      alreadyReassigned, 
      pendingBilling
    };
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
                  Patient Reassignment & Billing
                </h1>
                <p className="text-slate-600 text-sm">
                  Reassign patients who have completed their first consultation. First reassignment within 7 days is free.
                </p>
              </div>
              <div className="flex items-center gap-3">
                    <button
                  onClick={() => dispatch(fetchReceptionistPatients())} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                  <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-xl shadow-sm border border-blue-100">
            <div className="p-4 sm:p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-blue-500" /> Patient Reassignment & Billing
              </h2>
              <p className="text-slate-600 mt-1 text-xs">
                {finalFilteredPatients.length} patients available for reassignment
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
                    {searchTerm || subSearchTerm ? 'No patients match your search criteria.' : 'No patients with completed consultations found.'}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">First Consultation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reassignment Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {currentPatients.map((patient) => {
                        const statusInfo = getReassignmentStatus(patient);
                        const firstConsultationDate = patient.billing?.[0]?.createdAt ? new Date(patient.billing[0].createdAt) : null;
                        const isFree = isEligibleForFreeReassignment(patient);
                        const hasReassignmentBilling = patient.billing?.some(bill => bill.isReassignedEntry);
                        
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
                              <div className="text-xs">
                                {firstConsultationDate ? (
                                  <>
                                    <div className="text-slate-900 font-medium">
                                      {firstConsultationDate.toLocaleDateString('en-GB')}
                                    </div>
                                    <div className="text-slate-500">
                                      {firstConsultationDate.toLocaleTimeString('en-GB', { 
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </div>
                                    {isFree && (
                                      <div className="text-xs text-green-600 font-medium mt-1">
                                        Free reassignment available
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-400">No consultation date</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.icon}
                                  {statusInfo.status}
                                </span>
                            </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-xs flex flex-col gap-1">
                                  {/* Reassign Button */}
                                  <button
                                    onClick={() => handleReassignPatient(patient)}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 border border-blue-200"
                                  >
                                    <UserPlus className="h-3 w-3" /> Reassign
                                  </button>

                                  {/* Create Bill / View Bill button */}
                                  {!hasReassignmentBilling ? (
                                    <button
                                      onClick={() => handleCreateInvoice(patient)}
                                      className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center gap-1 border border-green-200"
                                    >
                                      <Calculator className="h-3 w-3" /> Create Bill
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

                                  {/* Cancel Bill button */}
                                  {hasReassignmentBilling && (
                                    <button
                                      onClick={() => {
                                        setSelectedPatient(patient);
                                        setShowCancelBillModal(true);
                                      }}
                                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-1 border border-red-200"
                                    >
                                      <Ban className="h-3 w-3" /> Cancel Bill
                                    </button>
                                  )}

                                  {/* Refund button */}
                                  {hasReassignmentBilling && patient.billing?.some(bill => bill.isReassignedEntry && bill.totals?.paid > 0) && (
                                    <button
                                      onClick={() => {
                                        setSelectedPatient(patient);
                                        setShowRefundModal(true);
                                      }}
                                      className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors flex items-center justify-center gap-1 border border-orange-200"
                                    >
                                      <RotateCcw className="h-3 w-3" /> Refund
                                    </button>
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
                Reassigning patient <span className="font-semibold text-blue-600">{selectedPatient.name}</span> (UH ID: {selectedPatient.uhId}) from Dr. {selectedPatient.assignedDoctor?.name || 'Not Assigned'}.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await API.post('/patients/reassign', {
                    patientId: selectedPatient._id,
                    newDoctorId: reassignData.newDoctorId,
                    reason: reassignData.reason,
                    notes: reassignData.notes,
                    centerId: getCenterId()
                  });
                  
                  if (response.data.success) {
                    toast.success('Patient reassigned successfully');
                    dispatch(fetchReceptionistPatients());
                    setShowReassignModal(false);
                    setReassignData({ newDoctorId: '', reason: '', notes: '' });
                  } else {
                    toast.error(response.data.message || 'Failed to reassign patient');
                  }
                } catch (error) {
                  console.error('Reassignment error:', error);
                  toast.error(error.response?.data?.message || 'Failed to reassign patient');
                }
              }} className="space-y-4">
                {/* Current Doctor */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Current Doctor
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{selectedPatient.assignedDoctor?.name || 'Not Assigned'}</p>
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

      {/* Invoice Preview Modal */}
      {showInvoicePreviewModal && selectedPatient && generatedInvoice && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 z-50 overflow-y-auto" onClick={() => setShowInvoicePreviewModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInvoicePreviewModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" /> Invoice Preview
              </h2>
              
              {/* Invoice Header */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{centerInfo.name}</h3>
                    <p className="text-sm text-slate-600">{centerInfo.address}</p>
                    <p className="text-sm text-slate-600">Phone: {centerInfo.phone}</p>
                    <p className="text-sm text-slate-600">Email: {centerInfo.email}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-slate-800">Invoice #{generatedInvoice.invoiceNumber}</h3>
                    <p className="text-sm text-slate-600">Date: {new Date(generatedInvoice.createdAt).toLocaleDateString('en-GB')}</p>
                    <p className="text-sm text-slate-600">Patient: {selectedPatient.name}</p>
                    <p className="text-sm text-slate-600">UH ID: {selectedPatient.uhId}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {generatedInvoice.consultationType} Consultation
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right">
                          ₹{(generatedInvoice.consultationFee || 0).toFixed(2)}
                        </td>
                      </tr>
                      {generatedInvoice.serviceCharges?.map((service, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-slate-900">{service.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right">
                            ₹{(parseFloat(service.amount) || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {generatedInvoice.totals?.taxAmount > 0 && (
                        <tr>
                          <td className="px-4 py-3 text-sm text-slate-900">Tax ({generatedInvoice.taxPercentage}%)</td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right">
                            ₹{(generatedInvoice.totals.taxAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {generatedInvoice.totals?.discountAmount > 0 && (
                        <tr>
                          <td className="px-4 py-3 text-sm text-slate-900">Discount ({generatedInvoice.discountPercentage}%)</td>
                          <td className="px-4 py-3 text-sm text-slate-900 text-right text-red-600">
                            -₹{(generatedInvoice.totals.discountAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">Total</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                          ₹{(generatedInvoice.totals?.total || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-slate-600">Paid</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">
                          ₹{(generatedInvoice.totals?.paid || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">Amount Due</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                          ₹{(generatedInvoice.totals?.due || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {generatedInvoice.notes && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{generatedInvoice.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowInvoicePreviewModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowInvoicePreviewModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Process Payment
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement invoice download
                    toast.info('Invoice download functionality will be implemented');
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
              </div>
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
                Doctor: <span className="font-semibold text-blue-600">{selectedPatient.assignedDoctor?.name || 'Not Assigned'}</span>
                {isEligibleForFreeReassignment(selectedPatient) && (
                  <span className="text-green-600 font-medium ml-2">- Free reassignment within 7 days</span>
                )}
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  // Calculate totals
                  const serviceTotal = invoiceFormData.serviceCharges.reduce((sum, service) => 
                    sum + (parseFloat(service.amount) || 0), 0
                  );
                  const subtotal = (parseFloat(invoiceFormData.consultationFee) || 0) + serviceTotal;
                  const taxAmount = (subtotal * (parseFloat(invoiceFormData.taxPercentage) || 0)) / 100;
                  const discountAmount = (subtotal * (parseFloat(invoiceFormData.discountPercentage) || 0)) / 100;
                  const total = subtotal + taxAmount - discountAmount;

                  const invoiceData = {
                    patientId: selectedPatient._id,
                    doctorId: selectedPatient.assignedDoctor?._id,
                    centerId: getCenterId(),
                    consultationType: invoiceFormData.consultationType,
                    consultationFee: parseFloat(invoiceFormData.consultationFee) || 0,
                    serviceCharges: invoiceFormData.serviceCharges.filter(s => s.name && s.amount),
                    taxPercentage: parseFloat(invoiceFormData.taxPercentage) || 0,
                    discountPercentage: parseFloat(invoiceFormData.discountPercentage) || 0,
                    notes: invoiceFormData.notes,
                    isReassignedEntry: true,
                    totals: {
                      subtotal,
                      taxAmount,
                      discountAmount,
                      total,
                      paid: 0,
                      due: total
                    }
                  };

                  const response = await API.post('/billing/create-invoice', invoiceData);
                  
                  if (response.data.success) {
                    setGeneratedInvoice(response.data.invoice);
                    setShowCreateInvoiceModal(false);
                    setShowInvoicePreviewModal(true);
                    toast.success('Invoice created successfully');
                  } else {
                    toast.error(response.data.message || 'Failed to create invoice');
                  }
                } catch (error) {
                  console.error('Invoice creation error:', error);
                  toast.error(error.response?.data?.message || 'Failed to create invoice');
                }
              }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                
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
                          consultationFee: newFee
                        }));
                      }}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="OP">OP Consultation (₹850)</option>
                      <option value="IP">IP Consultation (₹1050)</option>
                      {isEligibleForFreeReassignment(selectedPatient) && (
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
                          onChange={(e) => {
                            const newServiceCharges = [...invoiceFormData.serviceCharges];
                            newServiceCharges[index] = { ...newServiceCharges[index], name: e.target.value };
                            setInvoiceFormData(prev => ({ ...prev, serviceCharges: newServiceCharges }));
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          placeholder="e.g., Injection, Dressings"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                        <input
                          type="number"
                          value={service.amount}
                          onChange={(e) => {
                            const newServiceCharges = [...invoiceFormData.serviceCharges];
                            newServiceCharges[index] = { ...newServiceCharges[index], amount: e.target.value };
                            setInvoiceFormData(prev => ({ ...prev, serviceCharges: newServiceCharges }));
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                          placeholder="0.00"
                        />
                      </div>
                      {invoiceFormData.serviceCharges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newServiceCharges = invoiceFormData.serviceCharges.filter((_, i) => i !== index);
                            setInvoiceFormData(prev => ({ ...prev, serviceCharges: newServiceCharges }));
                          }}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceFormData(prev => ({
                        ...prev,
                        serviceCharges: [...prev.serviceCharges, { name: '', amount: '', description: '' }]
                      }));
                    }}
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

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const paymentDataToSubmit = {
                    invoiceId: generatedInvoice._id,
                    patientId: selectedPatient._id,
                    amount: parseFloat(paymentData.amount),
                    paymentMethod: paymentData.paymentMethod,
                    notes: paymentData.notes,
                    appointmentTime: paymentData.appointmentTime || null,
                    centerId: getCenterId()
                  };

                  const response = await API.post('/billing/process-payment', paymentDataToSubmit);
                  
                  if (response.data.success) {
                    toast.success('Payment processed successfully');
                    dispatch(fetchReceptionistPatients());
                    setShowPaymentModal(false);
                    setPaymentData({ amount: '', paymentMethod: 'cash', notes: '', appointmentTime: '' });
                    
                    // If appointment was scheduled, show success message
                    if (paymentData.appointmentTime) {
                      toast.info('Appointment scheduled successfully');
                    }
                  } else {
                    toast.error(response.data.message || 'Failed to process payment');
                  }
                } catch (error) {
                  console.error('Payment processing error:', error);
                  toast.error(error.response?.data?.message || 'Failed to process payment');
                }
              }} className="space-y-4">
                
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

                <div>
                  <label htmlFor="appointmentTime" className="block text-sm font-medium text-slate-700 mb-2">
                    Schedule Appointment (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="appointmentTime"
                    value={paymentData.appointmentTime}
                    onChange={(e) => setPaymentData({...paymentData, appointmentTime: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will schedule the patient's appointment after payment is processed
                  </p>
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
              
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Ban className="h-6 w-6 text-red-500" /> Cancel Bill
              </h2>
              
              <p className="text-sm text-slate-600 mb-4">
                Patient: <span className="font-semibold text-blue-600">{selectedPatient.name}</span>
              </p>

              <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                <p className="text-xs font-medium text-red-700">⚠️ This action will cancel the bill and make it non-billable.</p>
                <p className="text-xs text-red-600 mt-1">If payments were made, you may need to process a refund.</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await API.post('/billing/cancel-bill', {
                    patientId: selectedPatient._id,
                    reason: cancelReason,
                    centerId: getCenterId()
                  });
                  
                  if (response.data.success) {
                    toast.success('Bill cancelled successfully');
                    dispatch(fetchReceptionistPatients());
                    setShowCancelBillModal(false);
                    setCancelReason('');
                  } else {
                    toast.error(response.data.message || 'Failed to cancel bill');
                  }
                } catch (error) {
                  console.error('Bill cancellation error:', error);
                  toast.error(error.response?.data?.message || 'Failed to cancel bill');
                }
              }} className="space-y-4">
                
                <div>
                  <label htmlFor="cancelReason" className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for Cancellation *
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="e.g., Patient requested cancellation, Doctor unavailable, etc."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCancelBillModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Keep Bill
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Ban className="h-5 w-5" />
                    Cancel Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
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
              
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <RotateCcw className="h-6 w-6 text-orange-500" /> Process Refund
              </h2>
              
              <p className="text-sm text-slate-600 mb-4">
                Patient: <span className="font-semibold text-blue-600">{selectedPatient.name}</span>
              </p>

              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mb-4">
                <p className="text-xs font-medium text-orange-700">💰 Refund will be processed for the paid amount.</p>
                <p className="text-xs text-orange-600 mt-1">This action cannot be undone.</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await API.post('/billing/process-refund', {
                    patientId: selectedPatient._id,
                    amount: parseFloat(refundData.amount),
                    method: refundData.method,
                    reason: refundData.reason,
                    notes: refundData.notes,
                    centerId: getCenterId()
                  });
                  
                  if (response.data.success) {
                    toast.success('Refund processed successfully');
                    dispatch(fetchReceptionistPatients());
                    setShowRefundModal(false);
                    setRefundData({ amount: '', method: 'cash', reason: '', notes: '' });
                  } else {
                    toast.error(response.data.message || 'Failed to process refund');
                  }
                } catch (error) {
                  console.error('Refund processing error:', error);
                  toast.error(error.response?.data?.message || 'Failed to process refund');
                }
              }} className="space-y-4">
                
                <div>
                  <label htmlFor="refundAmount" className="block text-sm font-medium text-slate-700 mb-2">
                    Refund Amount *
                  </label>
                  <input
                    id="refundAmount"
                    type="number"
                    value={refundData.amount}
                    onChange={(e) => setRefundData({...refundData, amount: e.target.value})}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="e.g., 850.00"
                  />
                </div>

                <div>
                  <label htmlFor="refundMethod" className="block text-sm font-medium text-slate-700 mb-2">
                    Refund Method *
                  </label>
                  <select
                    id="refundMethod"
                    value={refundData.method}
                    onChange={(e) => setRefundData({...refundData, method: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card Refund</option>
                    <option value="upi">UPI/Online Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="refundReason" className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for Refund *
                  </label>
                  <textarea
                    id="refundReason"
                    value={refundData.reason}
                    onChange={(e) => setRefundData({...refundData, reason: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="e.g., Service not provided, Patient cancellation, etc."
                  />
                </div>

                <div>
                  <label htmlFor="refundNotes" className="block text-sm font-medium text-slate-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    id="refundNotes"
                    value={refundData.notes}
                    onChange={(e) => setRefundData({...refundData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="e.g., Refund processed by Riya, Reference: REF123"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Process Refund
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ReceptionistLayout>
  );
}
