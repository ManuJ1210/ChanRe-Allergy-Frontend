import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';

const SuperadminConsultationFeeBilling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [patients, setPatients] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('all');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage, setPatientsPerPage] = useState(10);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    fetchAllPatients();
    fetchAllCenters();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter, centerFilter]);

  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      const response = await API.get('/patients/all');
      if (response.data.success && response.data.patients) {
        // Show all patients (including those without billing for reassigned patients)
        setPatients(response.data.patients);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCenters = async () => {
    try {
      const response = await API.get('/centers');
      if (response.data && Array.isArray(response.data)) {
        setCenters(response.data);
      } else {
        console.error('Invalid centers response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
      // Don't show error toast for centers as it's not critical
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.uhId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const status = getPatientStatus(patient);
        return status === statusFilter;
      });
    }

    // Center filter
    if (centerFilter !== 'all') {
      filtered = filtered.filter(patient => 
        patient.centerId?._id === centerFilter || patient.centerId === centerFilter
      );
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  };

  const getPatientStatus = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return 'No Payments';
    }

    const consultationFee = patient.billing.find(bill => 
      bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
    );
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    const serviceCharges = patient.billing.filter(bill => bill.type === 'service');

    const hasConsultationFee = !!consultationFee;
    const hasRegistrationFee = !!registrationFee;
    const hasServiceCharges = serviceCharges.length > 0;

    const paidConsultationFee = hasConsultationFee && (consultationFee.status === 'paid' || consultationFee.status === 'completed');
    const paidRegistrationFee = hasRegistrationFee && (registrationFee.status === 'paid' || registrationFee.status === 'completed');
    const paidServiceCharges = hasServiceCharges && serviceCharges.every(bill => bill.status === 'paid' || bill.status === 'completed');

    const isNewPatient = isPatientNew(patient);

    if (isNewPatient && !hasRegistrationFee) {
      return 'Registration Fee Required';
    }

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

    const consultationFee = patient.billing.find(bill => 
      bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
    );

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

  const getStats = () => {
    const totalPatients = patients.length;
    const needsConsultationFee = patients.filter(p => {
      const status = getPatientStatus(p);
      return status === 'Consultation Fee Required' || status === 'Consultation Fee Pending' || status === 'Registration Fee Required';
    }).length;
    const paidConsultationFee = patients.filter(p => {
      const status = getPatientStatus(p);
      return status === 'All Paid';
    }).length;
    
    return { totalPatients, needsConsultationFee, paidConsultationFee };
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

  const handlePatientsPerPageChange = (newPerPage) => {
    setPatientsPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-md font-bold text-slate-800 mb-2">
                Patient Invoice Management - Superadmin View
              </h1>
              <p className="text-slate-600 text-sm">
                View and manage invoices for all patients across all centers, including reassigned patients
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchAllPatients();
                  fetchAllCenters();
                }}
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
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Pending Payments</p>
                <p className="text-md font-bold text-slate-800">{stats.needsConsultationFee}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Fully Paid</p>
                <p className="text-md font-bold text-slate-800">{stats.paidConsultationFee}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-500" />
                  <select
                    value={centerFilter}
                    onChange={(e) => setCenterFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  >
                    <option value="all">All Centers</option>
                    {centers.map((center) => (
                      <option key={center._id} value={center._id}>
                        {center.name} ({center.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Center</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
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

                  return (
                    <tr key={patient._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{patient.name}</div>
                            <div className="text-sm text-slate-500">{patient.uhId || 'N/A'}</div>
                            <div className="text-xs text-slate-400">
                              {new Date(patient.createdAt).toLocaleDateString()} {new Date(patient.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{patient.centerId?.name || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{patient.centerId?.code || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{patient.assignedDoctor?.name || 'Not Assigned'}</div>
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
                            onClick={() => navigate(`/dashboard/superadmin/followups/PatientProfile/${patient._id}`)}
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Show per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Show per page:</span>
                <select
                  value={patientsPerPage}
                  onChange={(e) => handlePatientsPerPageChange(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              {/* Results count */}
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredPatients.length)}</span> of{' '}
                <span className="font-medium">{filteredPatients.length}</span> results
              </div>
            </div>

            {/* Page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm bg-blue-50 border border-blue-200 rounded font-medium text-blue-700">
                  {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

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

export default SuperadminConsultationFeeBilling;
