import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addPatientMedication } from "../../../../features/centerAdmin/centerAdminThunks";
import { resetCenterAdminState } from "../../../../features/centerAdmin/centerAdminSlice";
import { Pill, Save, ArrowLeft, CheckCircle } from "lucide-react";

export default function AddMedications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, addMedicationSuccess } = useSelector((state) => state.centerAdmin);
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    drugName: "",
    dose: "",
    frequency: "",
    duration: "",
    prescribedBy: user?.name || "",
    prescribedDate: new Date().toISOString().split('T')[0],
    instructions: "",
    patientId: id,
  });

  React.useEffect(() => {
    if (addMedicationSuccess) {
      setTimeout(() => {
        dispatch(resetCenterAdminState());
        navigate('/dashboard/CenterAdmin/patients/PatientList');
      }, 1500);
    }
  }, [addMedicationSuccess, dispatch, navigate]);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, patientId: id }));
  }, [id]);

  React.useEffect(() => {
    if (user?.name && !formData.prescribedBy) {
      setFormData(prev => ({ ...prev, prescribedBy: user.name }));
    }
  }, [user?.name, formData.prescribedBy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(addPatientMedication(formData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
                              onClick={() => navigate(`/dashboard/CenterAdmin/patients/profile/ViewProfile/${id}`)}
              className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </button>
            <h1 className="text-md font-bold text-slate-800 mb-2">
              Add Medication
            </h1>
            <p className="text-slate-600 text-xs">
              Prescribe medication for the patient
            </p>
          </div>

          {/* Alert Messages */}
          {addMedicationSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-700 text-xs">Medication added successfully!</span>
            </div>
          )}
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
                <Pill className="h-5 w-5 mr-2 text-blue-500" />
                Medication Information
              </h2>
              <p className="text-slate-600 mt-1 text-xs">
                Fill in the medication details below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    name="drugName"
                    value={formData.drugName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="Enter medication name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dose"
                    value={formData.dose}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Frequency *
                  </label>
                  <input
                    type="text"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="e.g., Twice daily"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                    placeholder="e.g., 7 days"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Prescribed By *
                  </label>
                  <input
                    type="text"
                    name="prescribedBy"
                    value={formData.prescribedBy}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 text-xs cursor-not-allowed"
                    placeholder="Auto-filled with logged-in user"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Prescribed Date *
                  </label>
                  <input
                    type="date"
                    name="prescribedDate"
                    value={formData.prescribedDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Enter medication instructions"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/CenterAdmin/patients/profile/ViewProfile/${id}`)}
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
                      Adding Medication...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
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