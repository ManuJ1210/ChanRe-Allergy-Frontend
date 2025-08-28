import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createTestRequest } from "../../../features/doctor/doctorThunks";
import { FileText, ArrowLeft, Save, FlaskConical, CheckCircle } from 'lucide-react';

const testFields = [
  "CBC", "Hb", "TC", "DC", "Neutrophils", "Eosinophil", "Lymphocytes",
  "Monocytes", "Platelets", "ESR", "Serum Creatinine", "Serum IgE Levels",
  "C3, C4 Levels", "ANA (IF)", "Urine Routine", "Allergy Panel"
];

const AddTest = () => {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [reports, setReports] = useState({});

  const { loading, error } = useSelector((state) => state.doctor);

  const handleChange = (testName, value) => {
    setReports((prev) => ({ ...prev, [testName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedTests = Object.fromEntries(
      Object.entries(reports).filter(([_, val]) => val === true)
    );

    if (Object.keys(selectedTests).length === 0) {
      alert("Please select at least one test to request.");
      return;
    }

    try {
      // Create test request with the selected tests
      await dispatch(createTestRequest({
        patientId,
        testType: "Laboratory Tests",
        requestedTests: Object.keys(selectedTests),
        notes: `Test request for: ${Object.keys(selectedTests).join(", ")}`,
        priority: "Normal",
        status: "Pending"
      })).unwrap();
      
      // Navigate back to patient profile
      navigate(`/dashboard/Doctor/patients/profile/ViewProfile/${patientId}`);
    } catch (error) {
      console.error('Failed to create test request:', error);
    }
  };

  // Remove the useEffect since we handle navigation in handleSubmit

  // Simple fallback to test if component is rendering
  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-md font-bold text-red-800 mb-2">Error: No Patient ID</h1>
          <p className="text-red-600 text-xs">Patient ID is missing from URL parameters.</p>
          <button
            onClick={() => navigate('/dashboard/Doctor/patients/PatientList')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-xs"
          >
            Back to Patients List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/dashboard/Doctor/patients/profile/ViewProfile/${patientId}`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient Profile
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Create Test Request
          </h1>
          <p className="text-slate-600 text-xs">
            Request laboratory tests for patient ID: {patientId}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
              Test Request
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Select the tests to be requested. Check the boxes for tests that need to be performed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testFields.map((testName) => (
                <div key={testName} className="flex items-center">
                  <input
                    type="checkbox"
                    id={testName}
                    checked={reports[testName] || false}
                    onChange={(e) => handleChange(testName, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor={testName} className="ml-2 text-xs font-medium text-slate-700">
                    {testName}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/Doctor/patients/profile/ViewProfile/${patientId}`)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Test Request...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Test Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTest;
