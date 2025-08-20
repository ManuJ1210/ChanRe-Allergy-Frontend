import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../../services/api";
import { ArrowLeft, Save, Plus, Pill, CheckCircle, AlertCircle, X } from 'lucide-react';

const AddPrescription = ({ patientId: propPatientId, onSuccess, onCancel }) => {
  const params = useParams();
  const navigate = useNavigate();
  const patientId = params.patientId || propPatientId || params.id;
  const [visit, setVisit] = useState("");
  const [medications, setMedications] = useState([
    { medicationName: "", dosage: "", duration: "", instructions: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleMedicationChange = (idx, field, value) => {
    setMedications(meds => meds.map((med, i) => i === idx ? { ...med, [field]: value } : med));
  };

  const addMedicationRow = () => {
    setMedications(meds => [...meds, { medicationName: "", dosage: "", duration: "", instructions: "" }]);
  };

  const removeMedicationRow = (idx) => {
    if (medications.length > 1) {
      setMedications(meds => meds.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || patientId === 'undefined') {
      alert('No valid patientId! Please check the URL and navigation.');
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/prescriptions",
        { patientId, visit, medications }
      );
      setSuccess(true);
      setTimeout(() => {
        navigate(`/dashboard/receptionist/followup/prescription/list/${patientId}`);
      }, 1000);
    } catch (err) {
      setError("Failed to add prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
                            onClick={() => navigate(`/dashboard/receptionist/followup/prescription/list/${patientId}`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prescriptions
          </button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Add Prescription
          </h1>
          <p className="text-slate-600">
            Create a new prescription for the patient
          </p>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700">Prescription added successfully!</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <Pill className="h-5 w-5 mr-2 text-blue-500" />
              Prescription Information
            </h2>
            <p className="text-slate-600 mt-1">
              Enter visit details and medication information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Visit Information */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visit Type *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={visit}
                onChange={e => setVisit(e.target.value)}
                placeholder="e.g., Initial Consultation, Follow-up, Emergency"
                required
              />
            </div>

            {/* Medications Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Medications</h3>
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  onClick={addMedicationRow}
                >
                  <Plus className="h-4 w-4" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((med, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-slate-700">Medication #{idx + 1}</h4>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 transition-colors"
                          onClick={() => removeMedicationRow(idx)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Medication Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                          placeholder="Enter drug name"
                          value={med.medicationName}
                          onChange={e => handleMedicationChange(idx, "medicationName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Dosage *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                          placeholder="e.g., 500mg"
                          value={med.dosage}
                          onChange={e => handleMedicationChange(idx, "dosage", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Duration *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                          placeholder="e.g., 7 days"
                          value={med.duration}
                          onChange={e => handleMedicationChange(idx, "duration", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Instructions</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                          placeholder="e.g., Take with food"
                          value={med.instructions}
                          onChange={e => handleMedicationChange(idx, "instructions", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding Prescription...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Add Prescription
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

export default AddPrescription; 