import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceptionistPatients, fetchReceptionistBillingRequests } from '../features/receptionist/receptionistThunks';
import { 
  AlertCircle, 
  X, 
  DollarSign, 
  UserPlus, 
  Clock,
  Phone,
  User,
  CheckCircle,
  FileText,
  CreditCard
} from 'lucide-react';

export default function PendingBillsNotification({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { patients, loading, billingRequests, billingLoading } = useSelector((state) => state.receptionist);
  const [pendingBills, setPendingBills] = useState([]);
  const [followUpBills, setFollowUpBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      console.log('🔍 Opening notification, fetching data...');
      // Fetch both consultation billing patients and billing requests
      Promise.all([
        dispatch(fetchReceptionistPatients()),
        dispatch(fetchReceptionistBillingRequests())
      ]).then((results) => {
        console.log('🔍 Fetch results:', {
          patients: results[0],
          billingRequests: results[1]
        });
        console.log('🔍 Billing requests from API:', results[1]);
        console.log('🔍 Billing requests length from API:', results[1]?.length);
      }).catch((error) => {
        console.error('🔍 Error fetching data:', error);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (patients.length > 0) {
      const pending = patients.filter(patient => {
        const status = getPatientStatus(patient);
        console.log('Consultation Patient:', patient.name, 'Status:', status, 'Billing:', patient.billing);
        return status !== 'All Paid';
      });
      console.log('Pending consultation bills:', pending);
      setPendingBills(pending);
    } else {
      setPendingBills([]);
    }
  }, [patients]);

  useEffect(() => {
    console.log('🔍 Billing Requests Data:', billingRequests);
    console.log('🔍 Billing Requests Length:', billingRequests?.length);
    console.log('🔍 Billing Requests Type:', typeof billingRequests);
    console.log('🔍 Billing Requests Is Array:', Array.isArray(billingRequests));
    
    if (billingRequests && billingRequests.length > 0) {
      const followUpPending = billingRequests.filter(request => {
        console.log('🔍 Processing Request:', {
          id: request._id,
          patientName: request.patient?.name,
          billing: request.billing,
          status: request.status,
          total: request.total,
          paid: request.paid,
          remaining: request.remaining
        });
        
        // Check if billing is an array, if not, treat it as a single object or check other properties
        let hasUnpaidBills = false;
        
        if (Array.isArray(request.billing)) {
          hasUnpaidBills = request.billing.some(bill => 
            bill.status === 'No payments' || 
            bill.status === 'no payments' || 
            bill.status === 'pending' ||
            (bill.remaining && bill.remaining > 0)
          );
        } else if (request.billing) {
          // If billing is a single object, check its properties
          const bill = request.billing;
          hasUnpaidBills = bill.status === 'No payments' || 
            bill.status === 'no payments' || 
            bill.status === 'pending' ||
            (bill.remaining && bill.remaining > 0);
        } else {
          // Check if the request itself has unpaid status
          // Updated to match actual data structure from billing management page
          hasUnpaidBills = request.status === 'No payments' || 
            request.status === 'no payments' || 
            request.status === 'pending' ||
            request.status === 'Billing Generated' ||  // ✅ Added: Bills that are generated but not paid
            request.status === 'Billing_Pending' ||     // ✅ Added: Bills pending generation
            request.status === 'Billing_Generated' ||   // ✅ Added: Alternative naming
            (request.remaining && request.remaining > 0) ||
            (request.total && request.paid && request.total > request.paid);
        }
        
        console.log('🔍 Billing Request Result:', request.patient?.name || 'Unknown', 'Has unpaid bills:', hasUnpaidBills, 'Billing:', request.billing, 'Request status:', request.status);
        return hasUnpaidBills;
      });
      console.log('🔍 Pending follow-up bills:', followUpPending);
      
      // If no unpaid bills found, show ALL billing requests for debugging
      if (followUpPending.length === 0 && billingRequests.length > 0) {
        console.log('🔍 No unpaid bills found, showing ALL billing requests for debugging:');
        console.log('🔍 All billing requests:', billingRequests);
        // Temporarily show all requests to debug the issue
        setFollowUpBills(billingRequests);
      } else {
        setFollowUpBills(followUpPending);
      }
    } else {
      console.log('🔍 No billing requests found or empty array');
      setFollowUpBills([]);
    }
  }, [billingRequests]);

  const getPatientStatus = (patient) => {
    if (!patient.billing || patient.billing.length === 0) {
      return 'Consultation Fee Required';
    }

    // Check for consultation fee for the current doctor
    const currentDoctorId = patient.assignedDoctor?._id || patient.assignedDoctor;
    
    const consultationFee = patient.billing.find(bill => {
      const isConsultationFee = bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation');
      return isConsultationFee && (
        !bill.doctorId || 
        bill.doctorId.toString() === currentDoctorId?.toString()
      );
    });
    
    const registrationFee = patient.billing.find(bill => bill.type === 'registration');
    
    // Check ALL service charges, not just current doctor's
    const serviceCharges = patient.billing.filter(bill => bill.type === 'service');
    
    // Check for any unpaid bills (consultation, registration, or service)
    const unpaidBills = patient.billing.filter(bill => 
      bill.status !== 'paid' && bill.status !== 'completed'
    );

    const hasConsultationFee = !!consultationFee;
    const hasRegistrationFee = !!registrationFee;
    const hasServiceCharges = serviceCharges.length > 0;
    const hasUnpaidBills = unpaidBills.length > 0;

    const paidConsultationFee = hasConsultationFee && (consultationFee.status === 'paid' || consultationFee.status === 'completed');
    const paidRegistrationFee = hasRegistrationFee && (registrationFee.status === 'paid' || registrationFee.status === 'completed');
    const paidServiceCharges = hasServiceCharges && serviceCharges.every(bill => bill.status === 'paid' || bill.status === 'completed');

    // Determine if patient is new (within 24 hours)
    const isNewPatient = isPatientNew(patient);

    // Check for any unpaid bills first
    if (hasUnpaidBills) {
      const unpaidConsultation = unpaidBills.find(bill => 
        bill.type === 'consultation' || bill.description?.toLowerCase().includes('consultation')
      );
      const unpaidRegistration = unpaidBills.find(bill => bill.type === 'registration');
      const unpaidServices = unpaidBills.filter(bill => bill.type === 'service');

      if (unpaidConsultation) {
        return 'Consultation Fee Pending';
      }
      if (unpaidRegistration) {
        return 'Registration Fee Pending';
      }
      if (unpaidServices.length > 0) {
        return 'Service Charges Pending';
      }
    }

    // Check for bills with "No payments" status (like in follow-up page)
    const noPaymentBills = patient.billing.filter(bill => 
      bill.status === 'No payments' || bill.status === 'no payments' || bill.status === 'pending'
    );
    
    console.log('Patient:', patient.name, 'No payment bills:', noPaymentBills);
    
    if (noPaymentBills.length > 0) {
      return 'No Payments';
    }

    // Check for bills with remaining amounts > 0 (like the ₹20,000 remaining case)
    const billsWithRemaining = patient.billing.filter(bill => {
      const remaining = bill.remaining || 0;
      return remaining > 0;
    });
    
    console.log('Patient:', patient.name, 'Bills with remaining amounts:', billsWithRemaining);
    
    if (billsWithRemaining.length > 0) {
      return 'Service Charges Pending';
    }

    // Priority order: Registration Fee > Consultation Fee > Service Charges
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'All Paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Consultation Fee Pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Service Charges Pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Registration Fee Pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'Consultation Fee Required': return <DollarSign className="h-4 w-4 text-red-500" />;
      case 'Registration Fee Required': return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'No Payments': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'All Paid': return 'text-green-600 bg-green-100';
      case 'Consultation Fee Pending': return 'text-orange-600 bg-orange-100';
      case 'Service Charges Pending': return 'text-orange-600 bg-orange-100';
      case 'Registration Fee Pending': return 'text-orange-600 bg-orange-100';
      case 'Consultation Fee Required': return 'text-red-600 bg-red-100';
      case 'Registration Fee Required': return 'text-purple-600 bg-purple-100';
      case 'No Payments': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pending Bills Notification</h2>
              <p className="text-sm text-slate-600">Patients requiring payment collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading pending bills...</p>
            <p className="text-xs text-slate-500 mt-2">Fetching patient data...</p>
          </div>
        ) : (pendingBills.length === 0 && followUpBills.length === 0) ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">All Clear!</h3>
            <p className="text-slate-600">No pending bills at the moment.</p>
            <p className="text-xs text-slate-500 mt-2">Total patients checked: {patients.length + (billingRequests?.length || 0)}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">
                  {(pendingBills.length + followUpBills.length)} Patient{(pendingBills.length + followUpBills.length) !== 1 ? 's' : ''} Require{(pendingBills.length + followUpBills.length) === 1 ? 's' : ''} Payment
                </h3>
              </div>
              <p className="text-sm text-orange-700">
                Please collect the following pending payments from patients.
              </p>
              <div className="text-xs text-orange-600 mt-2">
                Debug: Consultation: {pendingBills.length}, Follow-up: {followUpBills.length}, Total: {pendingBills.length + followUpBills.length}
              </div>
            </div>

            {/* Consultation Fee Pending Bills */}
            {pendingBills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Consultation Fee Pending ({pendingBills.length})</h4>
                </div>
                <div className="grid gap-3">
                  {pendingBills.map((patient) => {
                    const status = getPatientStatus(patient);
                    const statusIcon = getStatusIcon(status);
                    const statusColor = getStatusColor(status);
                    
                    return (
                      <div key={patient._id} className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{patient.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {patient.phone || 'No phone'}
                                  </div>
                                  <div>
                                    UH ID: {patient.uhId || 'Not assigned'}
                                  </div>
                                  <div>
                                    Doctor: {patient.assignedDoctor?.name || 'Not assigned'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusColor}`}>
                                {statusIcon}
                                {status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-slate-600">
                            <div>{patient.age} years, {patient.gender}</div>
                            <div className="text-xs text-slate-500">
                              {patient.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Follow-up Bills */}
            {followUpBills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Follow-up Bills Pending ({followUpBills.length})</h4>
                </div>
                <div className="grid gap-3">
                  {followUpBills.map((request) => {
                    // Handle different billing data structures
                    let unpaidBills = [];
                    
                    if (Array.isArray(request.billing)) {
                      unpaidBills = request.billing.filter(bill => 
                        bill.status === 'No payments' || 
                        bill.status === 'no payments' || 
                        bill.status === 'pending' ||
                        (bill.remaining && bill.remaining > 0)
                      );
                    } else if (request.billing) {
                      // If billing is a single object, add it to array if it's unpaid
                      const bill = request.billing;
                      if (bill.status === 'No payments' || 
                          bill.status === 'no payments' || 
                          bill.status === 'pending' ||
                          (bill.remaining && bill.remaining > 0)) {
                        unpaidBills = [bill];
                      }
                    } else {
                      // If no billing object, create a bill from request properties
                      // Updated to match actual data structure from billing management page
                      unpaidBills = [{
                        description: request.testType || 'Service Charge',
                        amount: request.total || 0,
                        remaining: request.remaining || (request.total && request.paid ? request.total - request.paid : 0),
                        status: request.status || 'No payments'
                      }];
                    }
                    
                    // Use direct fields from TestRequest document since populate might not be working
                    console.log('🔍 Request data structure:', {
                      id: request._id,
                      patient: request.patient,
                      patientName: request.patientName,
                      patientPhone: request.patientPhone,
                      patientAddress: request.patientAddress,
                      doctor: request.doctor,
                      doctorName: request.doctorName,
                      testType: request.testType,
                      status: request.status,
                      total: request.total,
                      remaining: request.remaining
                    });
                    
                    const patientName = request.patient?.name || request.patientName || 'Unknown Patient';
                    const patientPhone = request.patient?.phone || request.patientPhone || 'No phone';
                    const patientAddress = request.patient?.address || request.patientAddress || 'No address';
                    const patientAge = request.patient?.age || 'N/A';
                    const patientGender = request.patient?.gender || 'N/A';
                    const patientUhId = request.patient?.uhId || 'Not assigned';
                    const doctorName = request.doctor?.name || request.doctorName || 'Not assigned';
                    
                    return (
                      <div key={request._id} className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{patientName}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {patientPhone}
                                  </div>
                                  <div>
                                    UH ID: {patientUhId}
                                  </div>
                                  <div>
                                    Address: {patientAddress}
                                  </div>
                                  <div>
                                    Doctor: {doctorName}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {unpaidBills.map((bill, index) => (
                                <div key={index} className="bg-purple-50 border border-purple-200 rounded p-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-3 w-3 text-purple-600" />
                                      <span className="font-medium">{bill.description || request.testType || 'Service Charge'}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">₹{bill.amount || bill.total || 0}</div>
                                      {bill.remaining > 0 && (
                                        <div className="text-xs text-red-600">Remaining: ₹{bill.remaining}</div>
                                      )}
                                      <div className="text-xs text-gray-500">
                                        Status: {bill.status || 'No payments'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right text-sm text-slate-600">
                            <div>{patientAge} years, {patientGender}</div>
                            <div className="text-xs text-slate-500">
                              Test: {request.testType || 'Unknown'}
                            </div>
                            <div className="text-xs text-purple-600 mt-1">
                              Bill #{request._id?.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Next Steps</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Navigate to Consultation Billing page to collect payments</li>
                <li>• Contact patients via phone to schedule payment collection</li>
                <li>• Update patient records after payment collection</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Got it, Let's Collect Payments
          </button>
        </div>
      </div>
    </div>
  );
}
