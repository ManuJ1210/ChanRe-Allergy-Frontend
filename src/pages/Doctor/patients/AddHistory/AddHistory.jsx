import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import API from "../../../../services/api";
import { FileText, Save, ArrowLeft } from "lucide-react";

export default function AddHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    // Medical Conditions
    hayFever: "",
    hayFeverDuration: "",
    asthma: "",
    asthmaDuration: "",
    breathingProblems: "",
    breathingProblemsDuration: "",
    hivesSwelling: "",
    hivesSwellingDuration: "",
    sinusTrouble: "",
    sinusTroubleDuration: "",
    eczemaRashes: "",
    eczemaRashesDuration: "",
    foodAllergies: "",
    foodAllergiesDuration: "",
    arthriticDiseases: "",
    arthriticDiseasesDuration: "",
    immuneDefect: "",
    immuneDefectDuration: "",
    drugAllergy: "",
    drugAllergyDuration: "",
    beeStingHypersensitivity: "",
    beeStingHypersensitivityDuration: "",
    
    // Hay Fever Details
    feverGrade: "",
    itchingSoreThroat: "",
    specificDayExposure: "",
    
    // Asthma Details
    asthmaType: "",
    exacerbationsFrequency: "",
    
    // Medical Events
    hospitalAdmission: "",
    hospitalAdmissionDuration: "",
    gpAttendances: "",
    gpAttendancesDuration: "",
    aeAttendances: "",
    aeAttendancesDuration: "",
    ituAdmissions: "",
    ituAdmissionsDuration: "",
    coughWheezeFrequency: "",
    coughWheezeFrequencyDuration: "",
    intervalSymptoms: "",
    intervalSymptomsDuration: "",
    nightCoughFrequency: "",
    nightCoughFrequencyDuration: "",
    earlyMorningCough: "",
    earlyMorningCoughDuration: "",
    exerciseInducedSymptoms: "",
    exerciseInducedSymptomsDuration: "",
    familySmoking: "",
    familySmokingDuration: "",
    petsAtHome: "",
    petsAtHomeDuration: "",
    
    // Triggers (flattened)
    triggersUrtis: false,
    triggersColdWeather: false,
    triggersPollen: false,
    triggersSmoke: false,
    triggersExercise: false,
    triggersPets: false,
    triggersOthers: "",
    
    // Allergic Rhinitis (flattened)
    allergicRhinitisType: "",
    rhinitisSneezing: "",
    rhinitisNasalCongestion: "",
    rhinitisRunningNose: "",
    rhinitisItchingNose: "",
    rhinitisItchingEyes: "",
    rhinitisCoughing: "",
    rhinitisWheezing: "",
    rhinitisCoughingWheezing: "",
    rhinitisWithExercise: "",
    rhinitisHeadaches: "",
    rhinitisPostNasalDrip: "",
    
    // Skin Allergy (flattened)
    skinAllergyType: "",
    skinHeavesPresent: "",
    skinHeavesDuration: "",
    skinHeavesDistribution: "",
    skinEczemaPresent: "",
    skinEczemaDuration: "",
    skinEczemaDistribution: "",
    skinUlcerPresent: "",
    skinUlcerDuration: "",
    skinUlcerDistribution: "",
    skinPapuloSquamousRashesPresent: "",
    skinPapuloSquamousRashesDuration: "",
    skinPapuloSquamousRashesDistribution: "",
    skinItchingNoRashesPresent: "",
    skinItchingNoRashesDuration: "",
    skinItchingNoRashesDistribution: "",
    
    // Medical History
    hypertension: "",
    hypertensionDuration: "",
    diabetes: "",
    diabetesDuration: "",
    epilepsy: "",
    epilepsyDuration: "",
    ihd: "",
    ihdDuration: "",
    
    // New Drugs
    drugAllergyKnown: "",
    probable: "",
    definite: "",
    
    // Occupation and Exposure
    occupation: "",
    probableChemicalExposure: "",
    location: "",
    familyHistory: "",
    
    // Examination
    oralCavity: "",
    skin: "",
    ent: "",
    eye: "",
    respiratorySystem: "",
    cvs: "",
    cns: "",
    abdomen: "",
    otherFindings: "",
    
    // Report File
    reportFile: null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Add patientId to the form data
      const historyDataWithPatientId = {
        ...formData,
        patientId: patientId
      };
      
      await API.post('/history', { formData: JSON.stringify(historyDataWithPatientId) });
      
      toast.success('Medical history saved successfully!');
      
      // Navigate back to patient profile
      setTimeout(() => {
        navigate(`/dashboard/doctor/patients/profile/${patientId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving history:', error);
      toast.error(error.response?.data?.message || 'Failed to save history');
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
            onClick={() => navigate(`/dashboard/doctor/patients/profile/${patientId}`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient
          </button>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Add Medical History
          </h1>
          <p className="text-slate-600">
            Record comprehensive medical history for the patient
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Medical Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Medical Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'hayFever', label: 'Hay Fever' },
                  { key: 'asthma', label: 'Asthma' },
                  { key: 'breathingProblems', label: 'Breathing Problems' },
                  { key: 'hivesSwelling', label: 'Hives/Swelling' },
                  { key: 'sinusTrouble', label: 'Sinus Trouble' },
                  { key: 'eczemaRashes', label: 'Eczema/Rashes' },
                  { key: 'foodAllergies', label: 'Food Allergies' },
                  { key: 'arthriticDiseases', label: 'Arthritic Diseases' },
                  { key: 'immuneDefect', label: 'Immune Defect' },
                  { key: 'drugAllergy', label: 'Drug Allergy' },
                  { key: 'beeStingHypersensitivity', label: 'Bee Sting Hypersensitivity' }
                ].map((condition) => (
                  <div key={condition.key} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {condition.label}
                    </label>
                    <select
                      name={condition.key}
                      value={formData[condition.key]}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    {formData[condition.key] === 'yes' && (
                      <input
                        type="text"
                        name={`${condition.key}Duration`}
                        value={formData[`${condition.key}Duration`]}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Duration (e.g., 2 years)"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Triggers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'triggersUrtis', label: 'URTIs' },
                  { key: 'triggersColdWeather', label: 'Cold Weather' },
                  { key: 'triggersPollen', label: 'Pollen' },
                  { key: 'triggersSmoke', label: 'Smoke' },
                  { key: 'triggersExercise', label: 'Exercise' },
                  { key: 'triggersPets', label: 'Pets' }
                ].map((trigger) => (
                  <div key={trigger.key} className="flex items-center">
                    <input
                      type="checkbox"
                      name={trigger.key}
                      checked={formData[trigger.key]}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label className="ml-2 text-sm text-slate-700">{trigger.label}</label>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="triggersOthers"
                    value={formData.triggersOthers}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Other triggers..."
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Medical History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'hypertension', label: 'Hypertension' },
                  { key: 'diabetes', label: 'Diabetes' },
                  { key: 'epilepsy', label: 'Epilepsy' },
                  { key: 'ihd', label: 'IHD' }
                ].map((condition) => (
                  <div key={condition.key} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {condition.label}
                    </label>
                    <select
                      name={condition.key}
                      value={formData[condition.key]}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    {formData[condition.key] === 'yes' && (
                      <input
                        type="text"
                        name={`${condition.key}Duration`}
                        value={formData[`${condition.key}Duration`]}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Duration"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Occupation and Exposure */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Occupation and Exposure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Patient's occupation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chemical Exposure</label>
                  <input
                    type="text"
                    name="probableChemicalExposure"
                    value={formData.probableChemicalExposure}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any chemical exposure"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Geographic location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Family History</label>
                  <input
                    type="text"
                    name="familyHistory"
                    value={formData.familyHistory}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Family medical history"
                  />
                </div>
              </div>
            </div>

            {/* Examination Findings */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Examination Findings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'oralCavity', label: 'Oral Cavity' },
                  { key: 'skin', label: 'Skin' },
                  { key: 'ent', label: 'ENT' },
                  { key: 'eye', label: 'Eye' },
                  { key: 'respiratorySystem', label: 'Respiratory System' },
                  { key: 'cvs', label: 'CVS' },
                  { key: 'cns', label: 'CNS' },
                  { key: 'abdomen', label: 'Abdomen' }
                ].map((system) => (
                  <div key={system.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {system.label}
                    </label>
                    <textarea
                      name={system.key}
                      value={formData[system.key]}
                      onChange={handleChange}
                      rows="2"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`${system.label} examination findings...`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Other Findings</label>
                <textarea
                  name="otherFindings"
                  value={formData.otherFindings}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any other examination findings..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving History...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Medical History
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