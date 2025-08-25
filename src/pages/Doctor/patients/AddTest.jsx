import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitPatientTests } from "../../../features/patient/patientThunks";
import { resetPatientState } from "../../../features/patient/patientSlice";
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

  const {
    testSubmitting,
    testSubmitSuccess,
    testSubmitError,
  } = useSelector((state) => state.patient);

  const handleChange = (testName, value) => {
    setReports((prev) => ({ ...prev, [testName]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const filledReports = Object.fromEntries(
      Object.entries(reports).filter(([_, val]) => val && val.trim() !== "")
    );

    if (Object.keys(filledReports).length === 0) {
      alert("Please fill in at least one test report.");
      return;
    }

    dispatch(submitPatientTests({ patientId, testData: filledReports }));
  };

  useEffect(() => {
    if (testSubmitSuccess) {
              setTimeout(() => {
          dispatch(resetPatientState());
          navigate("/dashboard/doctor/patients");
        }, 1500);
    }
  }, [testSubmitSuccess, dispatch, navigate]);

  // Simple fallback to test if component is rendering
  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-md font-bold text-red-800 mb-2">Error: No Patient ID</h1>
          <p className="text-red-600 text-xs">Patient ID is missing from URL parameters.</p>
          <button
            onClick={() => navigate('/dashboard/doctor/patients')}
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
            onClick={() => navigate('/dashboard/doctor/patients')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients List
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Add Test Reports
          </h1>
          <p className="text-slate-600 text-xs">
            Enter test results for patient ID: {patientId}
          </p>
        </div>

        {/* Alert Messages */}
        {testSubmitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-xs">Test reports submitted successfully!</span>
          </div>
        )}
        {testSubmitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{testSubmitError}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
              Test Results
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Fill in the test results below. Leave empty fields for tests not performed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testFields.map((testName) => (
                <div key={testName}>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    {testName}
                  </label>
                  <input
                    type="text"
                    value={reports[testName] || ""}
                    onChange={(e) => handleChange(testName, e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder={`Enter ${testName} result`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/doctor/patients')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={testSubmitting}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-xs"
              >
                {testSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting Tests...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Submit Test Reports
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
