import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addReceptionistAllergicRhinitis, resetReceptionistState } from '../../../../features/receptionist/receptionistThunks';
import { 
  ArrowLeft, 
  AlertCircle,
  Activity,
  Save
} from 'lucide-react';

const AddAllergicRhinitis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    nasalSymptoms: {
      sneezing: 0,
      runningNose: 0,
      congestion: 0,
      itchyNose: 0,
      postNasalDrop: 0
    },
    nonNasalSymptoms: {
      eyeSymptoms: 0,
      throatSymptoms: 0,
      coughWheezeFever: 0,
      earSymptoms: 0,
      headache: 0,
      mentalFunction: 0
    },
    qualityOfLife: 0,
    medications: {
      nonNasal: '',
      nasal: '',
      antihistamine: '',
      other: ''
    },
    entExamination: '',
    systematicExamination: {
      cns: '',
      cvs: '',
      rs: '',
      pa: '',
      drugAdverseNotion: '',
      drugCompliance: '',
      followUpAdvice: ''
    }
  });

  const { loading, error, addAllergicRhinitisSuccess } = useSelector(state => state.receptionist);

  useEffect(() => {
    if (addAllergicRhinitisSuccess) {
      dispatch(resetReceptionistState());
      navigate(`/dashboard/receptionist/profile/${patientId}`);
    }
  }, [addAllergicRhinitisSuccess, dispatch, navigate, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSliderChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: parseInt(value)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      patientId
    };
    dispatch(addReceptionistAllergicRhinitis(payload));
  };

  const calculateTotal = (symptoms) => {
    return Object.values(symptoms).reduce((sum, value) => sum + parseInt(value || 0), 0);
  };

  const nasalTotal = calculateTotal(formData.nasalSymptoms);
  const nonNasalTotal = calculateTotal(formData.nonNasalSymptoms);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">ALLERGIC RHINITIS</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nasal Symptom Severity */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Allergic Rhinitis</h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Nasal Symptom Severity</h4>
                <div className="mb-2">
                  <label className="text-sm font-medium text-gray-600">Score(0-7)</label>
                </div>
                
                {Object.entries(formData.nasalSymptoms).map(([symptom, value]) => (
                  <div key={symptom} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {symptom.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <span className="text-sm text-gray-500">Value: {value}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={value}
                      onChange={(e) => handleSliderChange('nasalSymptoms', symptom, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Nasal Symptoms
                  </label>
                  <input
                    type="text"
                    value={nasalTotal}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Non Nasal Symptom Severity */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Non Nasal Symptom Severity</h4>
                <div className="mb-2">
                  <label className="text-sm font-medium text-gray-600">Score(0-7)</label>
                </div>
                
                {Object.entries(formData.nonNasalSymptoms).map(([symptom, value]) => (
                  <div key={symptom} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {symptom.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <span className="text-sm text-gray-500">Value: {value}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={value}
                      onChange={(e) => handleSliderChange('nonNasalSymptoms', symptom, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <input
                    type="text"
                    value={nonNasalTotal}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Quality of Life Assessment */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Quality of life assessment of rhinitis Severity</h4>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Severity Score</label>
                  <span className="text-sm text-gray-500">Value: {formData.qualityOfLife}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.qualityOfLife}
                  onChange={(e) => handleChange({ target: { name: 'qualityOfLife', value: e.target.value } })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Medication Section */}
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-4">Medication</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication for Non-Nasal Symptom
                  </label>
                  <input
                    type="text"
                    name="medications.nonNasal"
                    value={formData.medications.nonNasal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication for Nasal Symptom
                  </label>
                  <input
                    type="text"
                    name="medications.nasal"
                    value={formData.medications.nasal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No of Antihistamines consumed
                  </label>
                  <input
                    type="text"
                    name="medications.antihistamine"
                    value={formData.medications.antihistamine}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Medication, If any?
                  </label>
                  <input
                    type="text"
                    name="medications.other"
                    value={formData.medications.other}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* GPE Section */}
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-4">GPE (General Physical Examination)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    name="gpe.weight"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pulse</label>
                  <input
                    type="text"
                    name="gpe.pulse"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temp</label>
                  <input
                    type="text"
                    name="gpe.temp"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SPO2%</label>
                  <input
                    type="text"
                    name="gpe.spo2"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bp</label>
                  <input
                    type="text"
                    name="gpe.bp"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RR</label>
                  <input
                    type="text"
                    name="gpe.rr"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ENT Examination</label>
                <textarea
                  name="entExamination"
                  value={formData.entExamination}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Systematic Examination */}
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-4">Systematic Examination</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNS</label>
                  <input
                    type="text"
                    name="systematicExamination.cns"
                    value={formData.systematicExamination.cns}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVS</label>
                  <input
                    type="text"
                    name="systematicExamination.cvs"
                    value={formData.systematicExamination.cvs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RS</label>
                  <input
                    type="text"
                    name="systematicExamination.rs"
                    value={formData.systematicExamination.rs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">P/A</label>
                  <input
                    type="text"
                    name="systematicExamination.pa"
                    value={formData.systematicExamination.pa}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drug Adverse Notion</label>
                  <input
                    type="text"
                    name="systematicExamination.drugAdverseNotion"
                    value={formData.systematicExamination.drugAdverseNotion}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drug Compliance</label>
                  <input
                    type="text"
                    name="systematicExamination.drugCompliance"
                    value={formData.systematicExamination.drugCompliance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advise to be followed up till next visit</label>
                <textarea
                  name="systematicExamination.followUpAdvice"
                  value={formData.systematicExamination.followUpAdvice}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AddAllergicRhinitis; 