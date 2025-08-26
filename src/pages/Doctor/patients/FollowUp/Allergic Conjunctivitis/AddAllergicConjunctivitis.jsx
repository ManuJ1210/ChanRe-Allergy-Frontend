import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addAllergicConjunctivitis } from '../../../../../features/centerAdmin/centerAdminThunks';
import { resetCenterAdminState } from '../../../../../features/centerAdmin/centerAdminSlice';

const SYMPTOM_OPTIONS = ['Itching', 'Tearing', 'Redness', 'Discomfort', 'Discharge', 'Photophobia'];
const TYPE_OPTIONS = [
  'Seasonal',
  'Perennial',
  'Intermittent (< 4 days per week or < 4 consecutive week)',
  'Persistent (< 4 days per week or < 4 consecutive week)'
];
const GRADING_CRITERIA = [
  'Signs & Symptoms being bothersome',
  'Effects on vision',
  'Interference in School/Work',
  'Able to perform daily activities'
];
const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Mild (0)', score: 0 },
  { value: 'moderate', label: 'Moderate (1-3)', score: 1 },
  { value: 'severe', label: 'Severe (4)', score: 4 }
];

export default function AddAllergicConjunctivitis() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    symptoms: {
      Itching: '',
      Tearing: '',
      Redness: '',
      Discomfort: '',
      Discharge: '',
      Photophobia: ''
    },
    type: '',
    grading: {
      'Signs & Symptoms being bothersome': '',
      'Effects on vision': '',
      'Interference in School/Work': '',
      'Able to perform daily activities': ''
    }
  });
  
  const params = useParams();
  const navigate = useNavigate();

  const handleSymptomChange = (symptom, value) => {
    setForm(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: value
      }
    }));
  };

  const handleGradingChange = (criterion, value) => {
    setForm(prev => ({
      ...prev,
      grading: {
        ...prev.grading,
        [criterion]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!form.type) {
      toast.error("Please select a type for the allergic conjunctivitis.");
      return;
    }
    
    // Check if at least one symptom is selected
    const hasSymptoms = Object.values(form.symptoms).some(value => value === 'yes');
    if (!hasSymptoms) {
      toast.error("Please select at least one symptom.");
      return;
    }
    
    // Check if grading is complete
    const hasGrading = Object.values(form.grading).some(value => value !== '');
    if (!hasGrading) {
      toast.error("Please complete the grading section.");
      return;
    }
    
    try {
      // Prepare the data
      const formData = {
        patientId: params.patientId,
        symptoms: form.symptoms,
        type: form.type,
        grading: form.grading
      };
      
      // Use Redux thunk
      await dispatch(addAllergicConjunctivitis(formData));
      
      toast.success("Submitted successfully!");
      navigate(`/dashboard/CenterAdmin/patients/ViewProfile/${params.patientId}`);
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(`Failed to submit. Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Main Title */}
          <h1 className="text-md font-bold text-gray-800 text-center mb-8">ALLERGIC CONJUNCTIVITIS</h1>
          
          {/* Symptoms Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Symptoms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - Symptoms */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {SYMPTOM_OPTIONS.slice(0, 4).map(symptom => (
                    <div key={symptom} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`symptom-${symptom}`}
                        value="yes"
                        checked={form.symptoms[symptom] === 'yes'}
                        onChange={() => handleSymptomChange(symptom, 'yes')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{symptom}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SYMPTOM_OPTIONS.slice(4).map(symptom => (
                    <div key={symptom} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`symptom-${symptom}`}
                        value="yes"
                        checked={form.symptoms[symptom] === 'yes'}
                        onChange={() => handleSymptomChange(symptom, 'yes')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right side - Type */}
              <div className="space-y-4">
                <label className="block text-xs font-medium text-gray-700 mb-3">Type</label>
                <div className="space-y-3">
                  {TYPE_OPTIONS.map(type => (
                    <div key={type} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={form.type === type}
                        onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grading Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Grading</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700">Grading</th>
                    {SEVERITY_LEVELS.map(level => (
                      <th key={level.value} className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-700">
                        {level.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GRADING_CRITERIA.map(criterion => (
                    <tr key={criterion} className="border-b border-gray-300">
                      <td className="border border-gray-300 px-4 py-3 text-xs font-medium text-gray-700">
                        {criterion}
                      </td>
                      {SEVERITY_LEVELS.map(level => (
                        <td key={level.value} className="border border-gray-300 px-4 py-3 text-center">
                          <input
                            type="radio"
                            name={`grading-${criterion}`}
                            value={level.value}
                            checked={form.grading[criterion] === level.value}
                            onChange={() => handleGradingChange(criterion, level.value)}
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

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-xs"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 