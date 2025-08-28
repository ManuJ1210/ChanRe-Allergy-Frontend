import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addGPE } from '../../../../../features/doctor/doctorThunks';

import { 
  ArrowLeft, 
  AlertCircle,
  Stethoscope,
  Save,
  Activity
} from 'lucide-react';

const AddGPE = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    weight: '',
    pulse: '',
    bp: '',
    rr: '',
    temp: '',
    spo2: '',
    entExamination: '',
    cns: '',
    cvs: '',
    rs: '',
    pa: '',
    drugAdverseNotion: '',
    drugCompliance: '',
    adviseFollowUp: '',
    eyeMedication: ''
  });

  const { loading, error, addGPESuccess } = useSelector(state => state.doctor);

  useEffect(() => {
    if (addGPESuccess) {
      navigate(`/dashboard/Doctor/patients/profile/ViewProfile/${patientId}`);
    }
  }, [addGPESuccess, dispatch, navigate, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      patientId
    };
    dispatch(addGPE(payload));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
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
              <h1 className="text-md font-bold text-gray-800">Add GPE Record</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Title */}
            <h1 className="text-md font-bold text-gray-800 text-center mb-8">GPE</h1>
            
            {/* GPE Section */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">GPE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Row */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Enter weight"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Pulse</label>
                  <input
                    type="text"
                    name="pulse"
                    value={formData.pulse}
                    onChange={handleChange}
                    placeholder="Enter pulse"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Bp</label>
                  <input
                    type="text"
                    name="bp"
                    value={formData.bp}
                    onChange={handleChange}
                    placeholder="Enter blood pressure"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">RR</label>
                  <input
                    type="text"
                    name="rr"
                    value={formData.rr}
                    onChange={handleChange}
                    placeholder="Enter respiratory rate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Temp</label>
                  <input
                    type="text"
                    name="temp"
                    value={formData.temp}
                    onChange={handleChange}
                    placeholder="Enter temperature"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">SPO2%</label>
                  <input
                    type="text"
                    name="spo2"
                    value={formData.spo2}
                    onChange={handleChange}
                    placeholder="Enter SPO2%"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-3">ENT Examination</label>
                  <input
                    type="text"
                    name="entExamination"
                    value={formData.entExamination}
                    onChange={handleChange}
                    placeholder="Enter ENT examination findings"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Systematic Examination Section */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Systematic Examination
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Row */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">CNS</label>
                  <input
                    type="text"
                    name="cns"
                    value={formData.cns}
                    onChange={handleChange}
                    placeholder="Enter CNS findings"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">CVS</label>
                  <input
                    type="text"
                    name="cvs"
                    value={formData.cvs}
                    onChange={handleChange}
                    placeholder="Enter CVS findings"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">RS</label>
                  <input
                    type="text"
                    name="rs"
                    value={formData.rs}
                    onChange={handleChange}
                    placeholder="Enter RS findings"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">P/A</label>
                  <input
                    type="text"
                    name="pa"
                    value={formData.pa}
                    onChange={handleChange}
                    placeholder="Enter P/A findings"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Drug Adverse Notion</label>
                  <input
                    type="text"
                    name="drugAdverseNotion"
                    value={formData.drugAdverseNotion}
                    onChange={handleChange}
                    placeholder="Enter drug adverse notion"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Drug Compliance</label>
                  <input
                    type="text"
                    name="drugCompliance"
                    value={formData.drugCompliance}
                    onChange={handleChange}
                    placeholder="Enter drug compliance"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Advise to be followed up till next visit</label>
                  <input
                    type="text"
                    name="adviseFollowUp"
                    value={formData.adviseFollowUp}
                    onChange={handleChange}
                    placeholder="Enter follow-up advice"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Eye Medication</label>
                  <input
                    type="text"
                    name="eyeMedication"
                    value={formData.eyeMedication}
                    onChange={handleChange}
                    placeholder="Enter eye medication"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-xs">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-center pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-xs"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Submit</span>
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

export default AddGPE; 