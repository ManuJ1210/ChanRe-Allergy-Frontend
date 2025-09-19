import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updatePatientHistory, fetchHistory } from "../../../../features/centerAdmin/centerAdminThunks";
import { FileText, Save, ArrowLeft, CheckCircle, Upload } from "lucide-react";
import API from "../../../../services/api";

export default function EditHistory() {
  const { id, historyId } = useParams();
  const patientId = id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, addHistorySuccess, history, historyLoading, historyError } = useSelector((state) => state.centerAdmin);
  
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
    gpAttendances: "",
    aeAttendances: "",
    ituAdmissions: "",
    coughWheezeFrequency: "",
    intervalSymptoms: "",
    nightCoughFrequency: "",
    earlyMorningCough: "",
    exerciseInducedSymptoms: "",
    familySmoking: "",
    petsAtHome: "",
    
    // Triggers
    triggersUrtis: false,
    triggersColdWeather: false,
    triggersPollen: false,
    triggersSmoke: false,
    triggersExercise: false,
    triggersPets: false,
    triggersOthers: "",
    
    // Allergic Rhinitis
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
    
    // Skin Allergy
    skinAllergyType: "",
    skinHeavesPresent: "",
    skinHeavesDistribution: "",
    skinEczemaPresent: "",
    skinEczemaDistribution: "",
    skinUlcerPresent: "",
    skinUlcerDistribution: "",
    skinPapuloSquamousRashesPresent: "",
    skinPapuloSquamousRashesDistribution: "",
    skinItchingNoRashesPresent: "",
    skinItchingNoRashesDistribution: "",
    
    // Medical History
    hypertension: "",
    diabetes: "",
    epilepsy: "",
    ihd: "",
    
    // Drug Allergies
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
    
    // Additional Notes
    additionalNotes: "",
    
    // File
    reportFile: null,
    existingReportFile: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing history data
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const response = await API.get(`/history/single/${historyId}`);
        const historyData = response.data;
        
        // Populate form with existing data
        setFormData(prevData => ({
          ...prevData,
          ...historyData,
          existingReportFile: historyData.reportFile || "",
          reportFile: null // Reset file input
        }));
      } catch (error) {
        console.error('Error fetching history data:', error);
      }
    };

    if (historyId) {
      fetchHistoryData();
    }
  }, [historyId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      reportFile: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(updatePatientHistory({
        historyId,
        historyData: {
          ...formData,
          patientId
        }
      })).unwrap();

      // Navigate back to view history
      navigate(`/dashboard/centeradmin/patients/viewhistory/${patientId}`);
    } catch (error) {
      console.error('Error updating history:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">Loading history data...</p>
            </div>
          </div>
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
            onClick={() => navigate(`/dashboard/centeradmin/patients/viewhistory/${patientId}`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Edit Medical History
          </h1>
          <p className="text-slate-600 text-xs">
            Update patient's medical history and examination records
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Medical Conditions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                Medical Conditions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Hay Fever</label>
                  <input
                    type="text"
                    name="hayFever"
                    value={formData.hayFever}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Hay Fever Duration (months)</label>
                  <input
                    type="number"
                    name="hayFeverDuration"
                    value={formData.hayFeverDuration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Asthma</label>
                  <input
                    type="text"
                    name="asthma"
                    value={formData.asthma}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Asthma Duration (months)</label>
                  <input
                    type="number"
                    name="asthmaDuration"
                    value={formData.asthmaDuration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Breathing Problems</label>
                  <input
                    type="text"
                    name="breathingProblems"
                    value={formData.breathingProblems}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Breathing Problems Duration (months)</label>
                  <input
                    type="number"
                    name="breathingProblemsDuration"
                    value={formData.breathingProblemsDuration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Hay Fever Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                Hay Fever Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Fever Grade</label>
                  <input
                    type="text"
                    name="feverGrade"
                    value={formData.feverGrade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Itching/Sore Throat</label>
                  <input
                    type="text"
                    name="itchingSoreThroat"
                    value={formData.itchingSoreThroat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Specific Day Exposure</label>
                  <input
                    type="text"
                    name="specificDayExposure"
                    value={formData.specificDayExposure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Asthma Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                Asthma Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Asthma Type</label>
                  <input
                    type="text"
                    name="asthmaType"
                    value={formData.asthmaType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Exacerbations Frequency</label>
                  <input
                    type="text"
                    name="exacerbationsFrequency"
                    value={formData.exacerbationsFrequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                Triggers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="triggersUrtis"
                    checked={formData.triggersUrtis}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-xs text-slate-700">URTIs</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="triggersColdWeather"
                    checked={formData.triggersColdWeather}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-xs text-slate-700">Cold Weather</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="triggersPollen"
                    checked={formData.triggersPollen}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-xs text-slate-700">Pollen</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="triggersSmoke"
                    checked={formData.triggersSmoke}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-xs text-slate-700">Smoke</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="triggersExercise"
                    checked={formData.triggersExercise}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-xs text-slate-700">Exercise</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="triggersPets"
                    checked={formData.triggersPets}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-xs text-slate-700">Pets</label>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Other Triggers</label>
                <input
                  type="text"
                  name="triggersOthers"
                  value={formData.triggersOthers}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                Additional Notes
              </h3>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                placeholder="Enter any additional notes or observations..."
              />
            </div>

            {/* Report File */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                Report File
              </h3>
              {formData.existingReportFile && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Current file: {formData.existingReportFile}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-xs">
                  <Upload className="h-4 w-4" />
                  Choose File
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                {formData.reportFile && (
                  <span className="text-xs text-slate-600">
                    Selected: {formData.reportFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/centeradmin/patients/viewhistory/${patientId}`)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update History
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
