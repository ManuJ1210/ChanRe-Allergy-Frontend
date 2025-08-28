import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSinglePrescription } from '../../../../../features/doctor/doctorThunks';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { 
  Eye, 
  ArrowLeft, 
  Download, 
  Printer, 
  AlertCircle,
  Activity,
  FileText,
  User,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';

// Add print-specific styles
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    .print-area {
      margin: 0 !important;
      padding: 20px !important;
      background: white !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      max-width: none !important;
      width: 100% !important;
    }
    .print-area .bg-gray-50 {
      background: white !important;
    }
    .print-area .bg-blue-50 {
      background: #eff6ff !important;
    }
    .print-area .bg-white {
      background: white !important;
    }
    .print-area .shadow-lg {
      box-shadow: none !important;
    }
    .print-area .rounded-lg {
      border-radius: 0 !important;
    }
    .print-area .border {
      border: 1px solid #d1d5db !important;
    }
    .print-area .border-l-4 {
      border-left: 4px solid #3b82f6 !important;
    }
    .print-area .border-t {
      border-top: 1px solid #d1d5db !important;
    }
    .print-area .text-gray-500 {
      color: #6b7280 !important;
    }
    .print-area .text-gray-600 {
      color: #4b5563 !important;
    }
    .print-area .text-gray-800 {
      color: #1f2937 !important;
    }
    .print-area .text-blue-600 {
      color: #2563eb !important;
    }
    .print-area .text-green-600 {
      color: #16a34a !important;
    }
    .print-area .text-purple-600 {
      color: #9333ea !important;
    }
    .print-area .bg-blue-100 {
      background: #dbeafe !important;
    }
    .print-area .bg-green-100 {
      background: #dcfce7 !important;
    }
    .print-area .bg-purple-100 {
      background: #f3e8ff !important;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }
    .min-h-screen {
      min-height: auto !important;
    }
    .max-w-5xl {
      max-width: none !important;
    }
    .p-6 {
      padding: 0 !important;
    }
  }
`;

const ViewPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { singlePrescription: prescription, loading, error } = useSelector(state => state.doctor);

  useEffect(() => {
    if (id) {
      dispatch(fetchSinglePrescription(id));
    }
  }, [dispatch, id]);

  const generatePDF = () => {
    if (!latestRecord) return;

    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Prescription - ${latestRecord.patientId?.name || 'Patient'}`,
      subject: 'Medical Prescription',
      author: latestRecord.updatedBy?.name || 'Medical Professional',
      creator: 'Chenre Allergy Clinic'
    });

    let yPos = 20;

    // Simple header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CHENRE ALLERGY CLINIC', 105, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(14);
    doc.text('Medical Prescription', 105, yPos, { align: 'center' });
    
    yPos += 20;

    // Patient Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information:', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Name: ${String(latestRecord.patientId?.name || 'N/A')}`, 20, yPos);
    yPos += 10;
    
    doc.text(`Age: ${String(latestRecord.patientId?.age || 'N/A')} years`, 20, yPos);
    yPos += 10;
    
    doc.text(`Phone: ${String(latestRecord.patientId?.phone || 'N/A')}`, 20, yPos);
    yPos += 10;
    
    doc.text(`Visit: ${String(latestRecord.visit || 'N/A')}`, 20, yPos);
    yPos += 10;
    
    doc.text(`Date: ${latestRecord.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}`, 20, yPos);
    yPos += 10;
    
    doc.text(`Center Code: ${String(latestRecord.patientId?.centerCode || 'N/A')}`, 20, yPos);
    
    yPos += 20;

    // Medications
    if (latestRecord.medications && latestRecord.medications.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescribed Medications:', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      latestRecord.medications.forEach((med, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}. ${String(med.medicationName)}`, 20, yPos);
        yPos += 8;
        
        doc.text(`   Dosage: ${String(med.dosage)}`, 25, yPos);
        yPos += 8;
        
        doc.text(`   Duration: ${String(med.duration)} days`, 25, yPos);
        yPos += 8;
        
        if (med.instructions && med.instructions.trim() !== '') {
          doc.text(`   Instructions: ${String(med.instructions)}`, 25, yPos);
          yPos += 8;
        }
        
        yPos += 5;
      });
    }

    // Signature section
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Generated on:', 20, yPos);
    doc.text('Prescribed by:', 120, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(String(new Date().toLocaleDateString()), 20, yPos);
    doc.text(String(latestRecord.updatedBy?.name || 'Medical Professional'), 120, yPos);
    
    yPos += 10;
    doc.text(`Center Code: ${String(latestRecord.patientId?.centerCode || 'N/A')}`, 120, yPos);

    return doc;
  };

  const handlePrint = () => {
    const doc = generatePDF();
    if (doc) {
      // Open PDF in new tab for viewing/printing
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDownload = () => {
    const doc = generatePDF();
    if (doc) {
      // Download PDF directly
      doc.save(`prescription-${latestRecord.patientId?.name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  // Handle array response from backend - get the most recent record
  const getLatestRecord = () => {
    if (!prescription) return null;
    
    // If it's an array, get the most recent one
    if (Array.isArray(prescription)) {
      return prescription.length > 0 ? prescription[0] : null; // Already sorted by createdAt desc
    }
    
    // If it's a single object, return it
    return prescription;
  };

  const latestRecord = getLatestRecord();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-md font-semibold text-gray-800 mb-2">Error Loading Prescription</h2>
              <p className="text-gray-600 mb-4 text-xs">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!latestRecord) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-md font-semibold text-gray-800 mb-2">No Prescription Found</h2>
              <p className="text-gray-600 mb-4 text-xs">No prescription record found for this ID.</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>

      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </button>
                <h1 className="text-md font-bold text-gray-800">Prescription Medical Record</h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-xs"
                >
                  <Eye size={16} />
                  <span>View PDF</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-xs"
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

        {/* Main Content */}
        {!latestRecord ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-md font-semibold text-gray-800 mb-2">No Prescription Data</h2>
              <p className="text-gray-600 mb-4 text-xs">Loading prescription data...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">


            {/* Record Header */}
            <div className="text-center mb-8">
              <h1 className="text-md font-bold text-gray-800 mb-2">MEDICAL PRESCRIPTION</h1>
              <p className="text-gray-600 text-xs">Prescription ID: {latestRecord._id}</p>
            </div>
          
          {/* Patient Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Name</label>
                <p className="text-gray-900 font-medium text-xs">{latestRecord?.patientId?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Age</label>
                <p className="text-gray-900 font-medium text-xs">{latestRecord?.patientId?.age || 'N/A'} years</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Patient Phone</label>
                <p className="text-gray-900 font-medium text-xs">{latestRecord?.patientId?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Visit Number</label>
                <p className="text-gray-900 font-medium text-xs">Visit {latestRecord?.visit || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Prescription Date</label>
                <p className="text-gray-900 font-medium text-xs">
                  {latestRecord?.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Center Code</label>
                <p className="text-gray-900 font-medium text-xs">{latestRecord?.patientId?.centerCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-8">
            {/* Diagnosis */}
            {latestRecord.diagnosis && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  Clinical Diagnosis
                </h2>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800 text-xs">{latestRecord.diagnosis}</p>
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Prescribed Medications
              </h2>
              {latestRecord.medications && latestRecord.medications.length > 0 ? (
                <div className="space-y-4">
                  {latestRecord.medications.map((med, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-l-4 border-blue-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">{med.medicationName}</h3>
                          <p className="text-gray-600 text-xs">Dosage: {med.dosage}</p>
                        </div>
                        <div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-500">Duration:</span>
                              <span className="text-gray-800 ml-2 text-xs">{med.duration} days</span>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Instructions:</span>
                              <span className="text-gray-800 ml-2 text-xs">{med.instructions || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-l-4 border-gray-300">
                  <p className="text-gray-500 italic text-xs">No medications prescribed</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            {latestRecord.instructions && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Additional Instructions</h2>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800 text-xs">{latestRecord.instructions}</p>
                </div>
              </div>
            )}

            {/* Follow-up */}
            {latestRecord.followUp && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">Follow-up Instructions</h2>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-gray-800 text-xs">{latestRecord.followUp}</p>
                </div>
              </div>
            )}

            {/* Clinical Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Prescription Summary</h2>
              <div className="bg-white rounded-lg p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Medications</h3>
                    <p className="text-xs text-gray-500">
                      {latestRecord.medications ? latestRecord.medications.length : 0} prescribed
                    </p>
                  </div>
                  
                  <div>
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Prescribed By</h3>
                    <p className="text-xs text-gray-500">{latestRecord.updatedBy?.name || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-1 text-xs">Prescription Date</h3>
                    <p className="text-xs text-gray-500">
                      {latestRecord.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Record Metadata */}
          <div className="border-t pt-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Record Created:</span>
                <span className="text-gray-900">
                  {latestRecord.createdAt ? new Date(latestRecord.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Last Updated:</span>
                <span className="text-gray-900">
                  {latestRecord.updatedAt ? new Date(latestRecord.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Signature */}
          <div className="border-t pt-6 mt-8">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                <p>Generated on: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800 text-xs">{latestRecord.updatedBy?.name || 'Doctor'}</p>
                <p className="text-xs text-gray-600">Medical Professional</p>
                <p className="text-xs text-gray-600">Center Code: {latestRecord.patientId?.centerCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ViewPrescription; 