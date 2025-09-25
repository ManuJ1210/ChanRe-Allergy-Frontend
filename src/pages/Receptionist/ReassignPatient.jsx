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
  Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../services/api';

export default function ReassignPatient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, loading } = useSelector((state) => state.receptionist);
  const { user } = useSelector((state) => state.auth);

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [serviceData, setServiceData] = useState({
    services: [{ name: '', amount: '', description: '', details: '' }],
    paymentMethod: 'cash',
    notes: ''
  });
  const [reassignData, setReassignData] = useState({
    newDoctorId: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchReceptionistPatients());
    fetchAvailableDoctors();
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

  const handleCreateConsultationBill = (patient) => {
    setSelectedPatient(patient);
    setPaymentData({
      amount: '500', // Default consultation fee
      paymentMethod: 'cash',
      notes: `Doctor consultation fee for ${patient.name} (reassigned patient)`
    });
    setShowPaymentModal(true);
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

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

    try {
      const billData = {
        patientId: selectedPatient._id,
        doctorId: selectedPatient.currentDoctor?._id || selectedPatient.currentDoctor,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`
      };

      const response = await API.post('/reassigned-invoices/consultation-fee', billData);
      
      if (response.status === 201) {
        toast.success('Consultation fee payment recorded successfully!');
        
        // Update the patient data in the local state with the updated billing information
        if (response.data.patient) {
          const updatedPatient = response.data.patient;
          // Update the patient in the patients array
          const updatedPatients = patients.map(p => 
            p._id === updatedPatient._id ? updatedPatient : p
          );
          
          // Update the Redux state with the new patient data
          dispatch({
            type: 'receptionist/fetchReceptionistPatients/fulfilled',
            payload: updatedPatients
          });
        }
        
        setShowPaymentModal(false);
        setSelectedPatient(null);
        
        // Also refresh the full patient list to ensure consistency
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to record payment. Please try again.');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment. Please try again.');
    }
  };

  const handleServiceChargesSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) return;

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
        doctorId: selectedPatient.currentDoctor?._id || selectedPatient.currentDoctor,
        services: validServices,
        paymentMethod: serviceData.paymentMethod,
        notes: serviceData.notes,
        isReassignedEntry: true,
        reassignedEntryId: `${selectedPatient._id}_reassigned`
      };

      const response = await API.post('/reassigned-invoices/service-charges', billData);
      
      if (response.status === 201) {
        toast.success('Service charges payment recorded successfully!');
        
        // Update the patient data in the local state with the updated billing information
        if (response.data.patient) {
          const updatedPatient = response.data.patient;
          // Update the patient in the patients array
          const updatedPatients = patients.map(p => 
            p._id === updatedPatient._id ? updatedPatient : p
          );
          
          // Update the Redux state with the new patient data
          dispatch({
            type: 'receptionist/fetchReceptionistPatients/fulfilled',
            payload: updatedPatients
          });
        }
        
        setShowServiceModal(false);
        setSelectedPatient(null);
        
        // Also refresh the full patient list to ensure consistency
        await dispatch(fetchReceptionistPatients());
      } else {
        toast.error('Failed to record service charges. Please try again.');
      }
    } catch (error) {
      console.error('Error recording service charges:', error);
      toast.error('Failed to record service charges. Please try again.');
    }
  };

  const handleGenerateInvoice = async (patient) => {
    try {
      const invoicePayload = {
        patientId: patient._id,
        isReassignedEntry: true,
        reassignedEntryId: `${patient._id}_reassigned`,
        currentDoctorId: patient.currentDoctor?._id || patient.currentDoctor
      };

      const response = await API.post('/reassigned-invoices/generate-invoice', invoicePayload);
      
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

  // Helper function to check if reassigned patient has paid consultation fee
  const hasPaidConsultationFee = (patient) => {
    console.log('🔍 Checking consultation fee for patient:', {
      patientId: patient._id,
      patientName: patient.name,
      isReassigned: patient.isReassigned,
      reassignedBilling: patient.reassignedBilling,
      currentDoctor: patient.currentDoctor
    });
    
    if (!patient.isReassigned) {
      console.log('❌ Not a reassigned patient');
      return false;
    }
    
    if (!patient.reassignedBilling || patient.reassignedBilling.length === 0) {
      console.log('❌ No reassigned billing records');
      return false;
    }
    
    const currentDoctorId = patient.currentDoctor?._id || patient.currentDoctor;
    if (!currentDoctorId) {
      console.log('❌ No current doctor ID');
      return false;
    }
    
    // Check if there's ANY consultation fee payment (regardless of doctor matching for now)
    const hasConsultationFee = patient.reassignedBilling.some(bill => {
      const isConsultation = bill.type === 'consultation' || 
                            bill.description?.toLowerCase().includes('consultation');
      
      console.log('🔍 Checking bill:', {
        billId: bill._id,
        type: bill.type,
        description: bill.description,
        status: bill.status,
        isConsultation
      });
      
      return isConsultation;
    });
    
    console.log('✅ Has consultation fee:', hasConsultationFee);
    return hasConsultationFee;
  };

  // Helper function to get consultation fee details for debugging
  const getConsultationFeeDetails = (patient) => {
    if (!patient.isReassigned || !patient.reassignedBilling) {
      return null;
    }
    
    const currentDoctorId = patient.currentDoctor?._id || patient.currentDoctor;
    if (!currentDoctorId) {
      return null;
    }
    
    return patient.reassignedBilling.find(bill => 
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
      reassignedBilling: patient.reassignedBilling,
      reassignmentHistory: patient.reassignmentHistory
    });
  };

  const getStats = () => {
    const totalPatients = patients.length;
    const patientsWithDoctors = patients.filter(p => p.assignedDoctor).length;
    const patientsWithoutDoctors = patients.filter(p => !p.assignedDoctor).length;
    
    return { totalPatients, patientsWithDoctors, patientsWithoutDoctors };
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
                  Patient Reassignment
                </h1>
                <p className="text-slate-600 text-sm">
                  Reassign patients to different doctors and manage doctor assignments
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
                  <p className="text-slate-600 text-xs font-medium">With Doctors</p>
                  <p className="text-md font-bold text-slate-800">{stats.patientsWithDoctors}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-xs font-medium">Without Doctors</p>
                  <p className="text-md font-bold text-slate-800">{stats.patientsWithoutDoctors}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
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
                All Patients - Doctor Assignment Status
              </h2>
              <p className="text-slate-600 mt-1 text-xs">
                {finalFilteredPatients.length} patients total ({stats.patientsWithDoctors} with doctors, {stats.patientsWithoutDoctors} without doctors)
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Consultation Fee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {currentPatients.map((patient) => {
                        const hasDoctor = !!patient.assignedDoctor;
                        const isReassigned = !!patient.isReassigned;
                        const currentDoctor = patient.currentDoctor || patient.assignedDoctor;
                        const consultationFeeDetails = getConsultationFeeDetails(patient);
                        
                        // Debug logging for each patient
                        console.log('🔍 Patient details:', {
                          name: patient.name,
                          isReassigned,
                          currentDoctor: currentDoctor?.name,
                          reassignedBilling: patient.reassignedBilling,
                          consultationFeeDetails,
                          hasPaidConsultationFee: hasPaidConsultationFee(patient)
                        });
                        
                        // Full debug for reassigned patients
                        if (isReassigned) {
                          debugPatientData(patient);
                        }
                        
                        let statusColor, statusIcon, statusText;
                        
                        if (isReassigned) {
                          statusColor = 'text-blue-600 bg-blue-100';
                          statusIcon = <UserPlus className="h-4 w-4" />;
                          statusText = 'Reassigned';
                        } else if (hasDoctor) {
                          statusColor = 'text-green-600 bg-green-100';
                          statusIcon = <CheckCircle className="h-4 w-4" />;
                          statusText = 'Assigned';
                        } else {
                          statusColor = 'text-orange-600 bg-orange-100';
                          statusIcon = <AlertCircle className="h-4 w-4" />;
                          statusText = 'Unassigned';
                        }
                        
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
                              {isReassigned ? (
                                hasPaidConsultationFee(patient) ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit text-green-600 bg-green-100">
                                    <CheckCircle className="h-3 w-3" />
                                    Paid
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit text-orange-600 bg-orange-100">
                                    <AlertCircle className="h-3 w-3" />
                                    Required
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit text-slate-600 bg-slate-100">
                                  <Clock className="h-3 w-3" />
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusColor}`}>
                                {statusIcon}
                                {statusText}
                              </span>
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
                                  onClick={() => handleReassignPatient(patient)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                  title="Reassign Patient"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  Reassign
                                </button>
                                
                                {isReassigned && !hasPaidConsultationFee(patient) && (
                                  <button
                                    onClick={() => handleCreateConsultationBill(patient)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                    title="Collect Consultation Fee"
                                  >
                                    <DollarSign className="h-3 w-3" />
                                    Consult
                                  </button>
                                )}
                                
                                {isReassigned && (
                                  <>
                                    <button
                                      onClick={() => handleCreateServiceCharges(patient)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                                      title="Add Service Charges"
                                    >
                                      <Settings className="h-3 w-3" />
                                      Services
                                    </button>
                                    
                                    <button
                                      onClick={() => handleGenerateInvoice(patient)}
                                      className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
                                      title="Generate Invoice"
                                    >
                                      <FileText className="h-4 w-4" />
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
                  <UserPlus className="h-4 w-4" />
                  Reassign Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Fee Payment Modal */}
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
              <p className="text-sm text-slate-600 mb-2">
                <strong>Current Doctor:</strong> {selectedPatient.currentDoctor?.name || 'Not Assigned'}
              </p>
              <p className="text-sm text-slate-600">
                <strong>UH ID:</strong> {selectedPatient.uhId || 'N/A'}
              </p>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" />
                  <strong>Reassigned Patient:</strong> This patient has been reassigned to a new doctor. 
                  No registration fee required - only consultation fee for the new doctor.
                </p>
              </div>
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
              <p className="text-sm text-slate-600 mb-2">
                <strong>Current Doctor:</strong> {selectedPatient.currentDoctor?.name || 'Not Assigned'}
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
                Reassigned Patient Invoice
              </h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
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
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 flex items-center gap-1">
                        <UserPlus className="h-3 w-3 inline mr-1" />
                        <strong>Reassigned Patient:</strong> This patient has been reassigned to a new doctor
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Invoice Details</h4>
                    <p><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
                    <p><strong>Date:</strong> {new Date(invoiceData.generatedAt).toLocaleDateString()}</p>
                    <p><strong>Doctor:</strong> {invoiceData.doctor}</p>
                    <p><strong>Generated By:</strong> {invoiceData.generatedBy}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      <UserPlus className="h-3 w-3 inline mr-1" />
                      Reassigned Patient Invoice
                    </p>
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
    </ReceptionistLayout>
  );
}
