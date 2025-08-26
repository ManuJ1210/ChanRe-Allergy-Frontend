import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import API from "../../../services/api";
import { Pill, Save, ArrowLeft } from "lucide-react";

export default function AddMedications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    drugName: "",
    dose: "",
    frequency: "",
    duration: "",
    prescribedBy: "",
    prescribedDate: new Date().toISOString().split('T')[0],
    instructions: "",
    patientId: id,
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, patientId: id }));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.drugName || !formData.dose || !formData.frequency) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const medicationData = {
        ...formData,
        prescribedBy: user.name || 'Dr. ' + user.name
      };

      await API.post('/medications', medicationData);
      
      toast.success('Medication added successfully!');
      
      // Navigate back to patient profile
      setTimeout(() => {
        navigate(`/dashboard/doctor/patients/profile/${id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error(error.response?.data?.message || 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/dashboard/doctor/patients`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient
          </button>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Add Medication
          </h1>
          <p className="text-slate-600">
            Prescribe medication for the patient
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Medication Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Pill className="h-4 w-4 inline mr-2" />
                  Drug Name *
                </label>
                <input
                  type="text"
                  name="drugName"
                  value={formData.drugName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter drug name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dose *
                </label>
                <input
                  type="text"
                  name="dose"
                  value={formData.dose}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500mg, 10ml"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frequency *
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Twice daily, Every 8 hours"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 7 days, 2 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prescribed Date
                </label>
                <input
                  type="date"
                  name="prescribedDate"
                  value={formData.prescribedDate}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prescribed By
                </label>
                <input
                  type="text"
                  name="prescribedBy"
                  value={formData.prescribedBy}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doctor's name"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="4"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Special instructions for the patient..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Medication...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Medication
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
