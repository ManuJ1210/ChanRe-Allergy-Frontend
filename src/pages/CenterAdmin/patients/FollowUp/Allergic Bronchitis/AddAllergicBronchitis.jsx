import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addAllergicBronchitis } from '../../../../../features/centerAdmin/centerAdminThunks';
import { resetCenterAdminState } from '../../../../../features/centerAdmin/centerAdminSlice';
import { 
  ArrowLeft, 
  AlertCircle,
  Activity,
  Save,
  FileText,
  User,
  Info
} from 'lucide-react';

const GINA_QUESTIONS = [
  "Day time symptoms",
  "Limitation of activities",
  "Nocturnal Symptoms / Awakening",
  "Need for relax/ rescue treatment",
  "Lung Function(PEF or FEV1)",
  "Exacerbations"
];

const GINA_OPTIONS = [
  { label: "Controlled", value: "Controlled" },
  { label: "Partially Controlled", value: "Partially Controlled" },
  { label: "Uncontrolled", value: "Uncontrolled" }
];

const PFT_GRADES = [
  { label: "Mild", value: "Mild", description: "FEV1 < 80%" },
  { label: "Moderate", value: "Moderate", description: "FEV1 < 50-80%" },
  { label: "Severe", value: "Severe", description: "FEV1 < 30-50%" },
  { label: "Very Severe", value: "Very Severe", description: "Extremely difficult to breathe" }
];

const HABITS = ["Smoker", "Non Smoker"];

const AddAllergicBronchitis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    symptoms: '',
    type: '',
    ginaGrading: {},
    pftGrading: '',
    habits: ''
  });

  const [showLungFunctionDetails, setShowLungFunctionDetails] = useState(false);

  const { loading, error, addAllergicBronchitisSuccess } = useSelector(state => state.centerAdmin);

  useEffect(() => {
    if (addAllergicBronchitisSuccess) {
      dispatch(resetCenterAdminState());
      navigate(`/dashboard/CenterAdmin/patients/ViewProfile/${patientId}`);
    }
  }, [addAllergicBronchitisSuccess, dispatch, navigate, patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGinaChange = (question, value) => {
    setFormData(prev => ({
      ...prev,
      ginaGrading: {
        ...prev.ginaGrading,
        [question]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      patientId
    };
    dispatch(addAllergicBronchitis(payload));
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
              <h1 className="text-md font-bold text-gray-800">Add Allergic Bronchitis Record</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Title */}
            <h1 className="text-md font-bold text-gray-800 text-center mb-8">ALLERGIC BRONCHITIS</h1>
            
            {/* Allergic Bronchitis Section */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Allergic Bronchitis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Symptoms</label>
                  <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Enter symptoms..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-3">Type</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="Acute"
                        checked={formData.type === "Acute"}
                        onChange={handleChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-xs">Acute</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="Chronic"
                        checked={formData.type === "Chronic"}
                        onChange={handleChange}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-xs">Chronic</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* GINA Grading Section */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                GINA Grading of Asthma
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700">Characteristics</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-700">Controlled</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-700">Partially Controlled</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-700">Uncontrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GINA_QUESTIONS.map(question => (
                        <tr key={question} className="border-b border-gray-300">
                          <td className="border border-gray-300 px-4 py-3 text-xs font-medium text-gray-700">
                            <div className="flex items-center">
                              {question}
                              {question === "Lung Function(PEF or FEV1)" && (
                                <button
                                  type="button"
                                  onClick={() => setShowLungFunctionDetails(!showLungFunctionDetails)}
                                  className="ml-2 text-blue-600 hover:text-blue-700"
                                >
                                  <Info size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                          {GINA_OPTIONS.map(option => (
                            <td key={option.value} className="border border-gray-300 px-4 py-3 text-center">
                              <input
                                type="radio"
                                name={question}
                                value={option.value}
                                checked={formData.ginaGrading[question] === option.value}
                                onChange={() => handleGinaChange(question, option.value)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Lung Function Details */}
              {showLungFunctionDetails && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3">Lung Function (PEF) Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium text-gray-700">Intermediate:</span>
                      <span className="ml-2 text-gray-600">PEF &lt; 20%</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium text-gray-700">Mild:</span>
                      <span className="ml-2 text-gray-600">PEF 20-30%</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium text-gray-700">Moderate:</span>
                      <span className="ml-2 text-gray-600">PEF &gt; 30%</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="font-medium text-gray-700">Severe:</span>
                      <span className="ml-2 text-gray-600">PEF &gt; 30%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PFT Grading Section */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Grading based on PFT
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PFT_GRADES.map(grade => (
                    <label key={grade.value} className="flex items-center p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="pftGrading"
                        value={grade.value}
                        checked={formData.pftGrading === grade.value}
                        onChange={handleChange}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-800 text-xs">{grade.label}</div>
                        <div className="text-xs text-gray-600">{grade.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Habits Section */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Habits</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex space-x-6">
                  {HABITS.map(habit => (
                    <label key={habit} className="flex items-center p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="habits"
                        value={habit}
                        checked={formData.habits === habit}
                        onChange={handleChange}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-800 text-xs">{habit}</span>
                    </label>
                  ))}
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

export default AddAllergicBronchitis; 