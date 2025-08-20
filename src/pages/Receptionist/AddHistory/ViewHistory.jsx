import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, User, CheckCircle, AlertCircle, Download } from "lucide-react";
import api from "../../../services/api";

const ViewHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        console.log('Fetching history with ID:', patientId);
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        console.log('Auth check - Token exists:', !!token, 'User exists:', !!user);
        
        // First, try to get the history directly by ID
        try {
          const response = await api.get(`/history/single/${patientId}`);
          console.log('History response:', response.data);
          setHistory(response.data);
          setError(null);
          return;
        } catch (directError) {
          console.log('Direct fetch failed:', directError.response?.status, directError.response?.data);
          
          if (directError.response?.status === 404) {
            setError('History record not found. The record may have been deleted or the ID is invalid.');
          } else if (directError.response?.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (directError.response?.status === 403) {
            setError('You do not have permission to view this history record.');
          } else {
            setError(`Failed to load history details: ${directError.response?.data?.message || directError.message}`);
          }
        }
        
      } catch (err) {
        console.error('Error fetching history:', err);
        console.error('Error response:', err.response?.data);
        setError(`Failed to load history details: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
    fetchHistory();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading history details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient Profile
            </button>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Medical History Details
            </h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-semibold text-red-800">History Not Found</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Possible reasons:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• The history record may have been deleted</li>
                <li>• The history ID may be invalid or corrupted</li>
                <li>• You may not have permission to view this record</li>
                <li>• The record may not exist in the database</li>
              </ul>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">History not found</p>
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
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient Profile
          </button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Medical History Details
          </h1>
          <p className="text-slate-600">
            Complete medical history and examination records
          </p>
        </div>

        {/* History Details */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                History Information
              </h2>
              <div className="flex items-center gap-2 text-sm text-blue-500 mt-2">
                <Calendar className="h-4 w-4" />
                {history.createdAt ? new Date(history.createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Medical Conditions */}
            {(history.hayFever || history.asthma || history.breathingProblems || history.hivesSwelling || 
              history.sinusTrouble || history.eczemaRashes || history.foodAllergies || history.arthriticDiseases || 
              history.immuneDefect || history.drugAllergy || history.beeStingHypersensitivity) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Medical Conditions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.hayFever && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Hay Fever:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.hayFever}</span>
                      </div>
                      {history.hayFeverDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.hayFeverDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.asthma && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Asthma:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.asthma}</span>
                      </div>
                      {history.asthmaDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.asthmaDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.breathingProblems && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Breathing Problems:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.breathingProblems}</span>
                      </div>
                      {history.breathingProblemsDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.breathingProblemsDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.hivesSwelling && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Hives/Swelling:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.hivesSwelling}</span>
                      </div>
                      {history.hivesSwellingDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.hivesSwellingDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.sinusTrouble && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Sinus Trouble:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.sinusTrouble}</span>
                      </div>
                      {history.sinusTroubleDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.sinusTroubleDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.eczemaRashes && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Eczema/Rashes:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.eczemaRashes}</span>
                      </div>
                      {history.eczemaRashesDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.eczemaRashesDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.foodAllergies && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Food Allergies:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.foodAllergies}</span>
                      </div>
                      {history.foodAllergiesDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.foodAllergiesDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.drugAllergy && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Drug Allergy:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.drugAllergy}</span>
                      </div>
                      {history.drugAllergyDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.drugAllergyDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.arthriticDiseases && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Arthritic Diseases:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.arthriticDiseases}</span>
                      </div>
                      {history.arthriticDiseasesDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.arthriticDiseasesDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.immuneDefect && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Immune Defect:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.immuneDefect}</span>
                      </div>
                      {history.immuneDefectDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.immuneDefectDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.beeStingHypersensitivity && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Bee Sting Hypersensitivity:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.beeStingHypersensitivity}</span>
                      </div>
                      {history.beeStingHypersensitivityDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.beeStingHypersensitivityDuration} months
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hay Fever Details */}
            {(history.feverGrade || history.itchingSoreThroat || history.specificDayExposure) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Hay Fever Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {history.feverGrade && (
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Fever Grade:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.feverGrade}</span>
                    </div>
                  )}
                  {history.itchingSoreThroat && (
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Itching/Sore Throat:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.itchingSoreThroat}</span>
                    </div>
                  )}
                  {history.specificDayExposure && (
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Specific Day Exposure:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.specificDayExposure}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Asthma Details */}
            {(history.asthmaType || history.exacerbationsFrequency) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Asthma Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {history.asthmaType && (
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Asthma Type:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.asthmaType}</span>
                    </div>
                  )}
                  {history.exacerbationsFrequency && (
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Exacerbations Frequency:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.exacerbationsFrequency}</span>
                    </div>
        )}
      </div>
              </div>
            )}

            {/* Medical Events */}
            {(history.hospitalAdmission || history.gpAttendances || history.aeAttendances || history.ituAdmissions || 
              history.coughWheezeFrequency || history.intervalSymptoms || history.nightCoughFrequency || 
              history.earlyMorningCough || history.exerciseInducedSymptoms || history.familySmoking || history.petsAtHome) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Medical Events & Symptoms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.hospitalAdmission && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Hospital Admission:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.hospitalAdmission}</span>
                      </div>
                      {history.hospitalAdmissionDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.hospitalAdmissionDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.gpAttendances && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">GP Attendances:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.gpAttendances}</span>
                      </div>
                      {history.gpAttendancesDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.gpAttendancesDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.aeAttendances && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">AE Attendances:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.aeAttendances}</span>
                      </div>
                      {history.aeAttendancesDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.aeAttendancesDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.ituAdmissions && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">ITU Admissions:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.ituAdmissions}</span>
                      </div>
                      {history.ituAdmissionsDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.ituAdmissionsDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.coughWheezeFrequency && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Cough/Wheeze Frequency:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.coughWheezeFrequency}</span>
                      </div>
                      {history.coughWheezeFrequencyDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.coughWheezeFrequencyDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.intervalSymptoms && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Interval Symptoms:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.intervalSymptoms}</span>
                      </div>
                      {history.intervalSymptomsDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.intervalSymptomsDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.nightCoughFrequency && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Night Cough Frequency:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.nightCoughFrequency}</span>
                      </div>
                      {history.nightCoughFrequencyDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.nightCoughFrequencyDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.earlyMorningCough && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Early Morning Cough:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.earlyMorningCough}</span>
                      </div>
                      {history.earlyMorningCoughDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.earlyMorningCoughDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.exerciseInducedSymptoms && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Exercise Induced Symptoms:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.exerciseInducedSymptoms}</span>
                      </div>
                      {history.exerciseInducedSymptomsDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.exerciseInducedSymptomsDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.familySmoking && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Family Smoking:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.familySmoking}</span>
                      </div>
                      {history.familySmokingDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.familySmokingDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.petsAtHome && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Pets at Home:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.petsAtHome}</span>
                      </div>
                      {history.petsAtHomeDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.petsAtHomeDuration} months
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Triggers */}
            {(history.triggersUrtis !== undefined || history.triggersColdWeather !== undefined || 
              history.triggersPollen !== undefined || history.triggersSmoke !== undefined || 
              history.triggersExercise !== undefined || history.triggersPets !== undefined || history.triggersOthers) && (
                <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Triggers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.triggersUrtis !== undefined && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">URTIs:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersUrtis ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {history.triggersColdWeather !== undefined && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Cold Weather:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersColdWeather ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {history.triggersPollen !== undefined && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Pollen:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersPollen ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {history.triggersSmoke !== undefined && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Smoke:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersSmoke ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {history.triggersExercise !== undefined && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Exercise:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersExercise ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {history.triggersPets !== undefined && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Pets:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersPets ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {history.triggersOthers && (
                    <div className="flex justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Others:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.triggersOthers}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Allergic Rhinitis */}
            {(history.allergicRhinitisType || history.rhinitisSneezing || history.rhinitisNasalCongestion || 
              history.rhinitisRunningNose || history.rhinitisItchingNose || history.rhinitisItchingEyes || 
              history.rhinitisCoughing || history.rhinitisWheezing || history.rhinitisCoughingWheezing || 
              history.rhinitisWithExercise || history.rhinitisHeadaches || history.rhinitisPostNasalDrip) && (
                <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Allergic Rhinitis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.allergicRhinitisType && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Type:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.allergicRhinitisType}</span>
                    </div>
                  )}
                  {history.rhinitisSneezing && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Sneezing:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisSneezing}</span>
                    </div>
                  )}
                  {history.rhinitisNasalCongestion && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Nasal Congestion:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisNasalCongestion}</span>
                    </div>
                  )}
                  {history.rhinitisRunningNose && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Running Nose:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisRunningNose}</span>
                    </div>
                  )}
                  {history.rhinitisItchingNose && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Itching Nose:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisItchingNose}</span>
                    </div>
                  )}
                  {history.rhinitisItchingEyes && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Itching Eyes:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisItchingEyes}</span>
                    </div>
                  )}
                  {history.rhinitisCoughing && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Coughing:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisCoughing}</span>
                    </div>
                  )}
                  {history.rhinitisWheezing && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Wheezing:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisWheezing}</span>
                    </div>
                  )}
                  {history.rhinitisCoughingWheezing && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Coughing/Wheezing:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisCoughingWheezing}</span>
                    </div>
                  )}
                  {history.rhinitisWithExercise && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">With Exercise:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisWithExercise}</span>
                    </div>
                  )}
                  {history.rhinitisHeadaches && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Headaches:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisHeadaches}</span>
                    </div>
                  )}
                  {history.rhinitisPostNasalDrip && (
                    <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Post Nasal Drip:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.rhinitisPostNasalDrip}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skin Allergy */}
            {(history.skinAllergyType || history.skinHeavesPresent || history.skinHeavesDistribution || 
              history.skinEczemaPresent || history.skinEczemaDistribution || history.skinUlcerPresent || 
              history.skinUlcerDistribution || history.skinPapuloSquamousRashesPresent || 
              history.skinPapuloSquamousRashesDistribution || history.skinItchingNoRashesPresent || 
              history.skinItchingNoRashesDistribution) && (
                <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Skin Allergy
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.skinAllergyType && (
                    <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Type:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.skinAllergyType}</span>
                    </div>
                  )}
                  {history.skinHeavesPresent && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Heaves Present:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.skinHeavesPresent}</span>
                      </div>
                      {history.skinHeavesDuration && (
                        <div className="text-xs text-slate-500 mb-1">
                          Duration: {history.skinHeavesDuration} months
                        </div>
                      )}
                      {history.skinHeavesDistribution && (
                        <div className="text-xs text-slate-500">
                          Distribution: {history.skinHeavesDistribution}
                        </div>
                      )}
                    </div>
                  )}
                  {history.skinEczemaPresent && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Eczema Present:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.skinEczemaPresent}</span>
                      </div>
                      {history.skinEczemaDuration && (
                        <div className="text-xs text-slate-500 mb-1">
                          Duration: {history.skinEczemaDuration} months
                        </div>
                      )}
                      {history.skinEczemaDistribution && (
                        <div className="text-xs text-slate-500">
                          Distribution: {history.skinEczemaDistribution}
                        </div>
                      )}
                    </div>
                  )}
                  {history.skinUlcerPresent && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Ulcer Present:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.skinUlcerPresent}</span>
                      </div>
                      {history.skinUlcerDuration && (
                        <div className="text-xs text-slate-500 mb-1">
                          Duration: {history.skinUlcerDuration} months
                        </div>
                      )}
                      {history.skinUlcerDistribution && (
                        <div className="text-xs text-slate-500">
                          Distribution: {history.skinUlcerDistribution}
                        </div>
                      )}
                    </div>
                  )}
                  {history.skinPapuloSquamousRashesPresent && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Papulo-Squamous Rashes:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.skinPapuloSquamousRashesPresent}</span>
                      </div>
                      {history.skinPapuloSquamousRashesDuration && (
                        <div className="text-xs text-slate-500 mb-1">
                          Duration: {history.skinPapuloSquamousRashesDuration} months
                        </div>
                      )}
                      {history.skinPapuloSquamousRashesDistribution && (
                        <div className="text-xs text-slate-500">
                          Distribution: {history.skinPapuloSquamousRashesDistribution}
                        </div>
                      )}
                    </div>
                  )}
                  {history.skinItchingNoRashesPresent && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Itching (No Rashes):</span>
                        <span className="text-sm text-slate-800 font-medium">{history.skinItchingNoRashesPresent}</span>
                      </div>
                      {history.skinItchingNoRashesDuration && (
                        <div className="text-xs text-slate-500 mb-1">
                          Duration: {history.skinItchingNoRashesDuration} months
                        </div>
                      )}
                      {history.skinItchingNoRashesDistribution && (
                        <div className="text-xs text-slate-500">
                          Distribution: {history.skinItchingNoRashesDistribution}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical History */}
            {(history.hypertension || history.diabetes || history.epilepsy || history.ihd) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Medical History
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {history.hypertension && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Hypertension:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.hypertension}</span>
                      </div>
                      {history.hypertensionDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.hypertensionDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.diabetes && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Diabetes:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.diabetes}</span>
                      </div>
                      {history.diabetesDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.diabetesDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.epilepsy && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">Epilepsy:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.epilepsy}</span>
                      </div>
                      {history.epilepsyDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.epilepsyDuration} months
                        </div>
                      )}
                    </div>
                  )}
                  {history.ihd && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-600">IHD:</span>
                        <span className="text-sm text-slate-800 font-medium">{history.ihd}</span>
                      </div>
                      {history.ihdDuration && (
                        <div className="text-xs text-slate-500">
                          Duration: {history.ihdDuration} months
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Drug Allergies */}
            {(history.drugAllergyKnown || history.probable || history.definite) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Drug Allergies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {history.drugAllergyKnown && (
                    <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Known Allergies:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.drugAllergyKnown}</span>
                    </div>
                  )}
                  {history.probable && (
                    <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Probable:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.probable}</span>
                    </div>
                  )}
                  {history.definite && (
                    <div className="flex justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Definite:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.definite}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Occupation and Exposure */}
            {(history.occupation || history.probableChemicalExposure || history.location || history.familyHistory) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Occupation and Exposure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {history.occupation && (
                    <div className="flex justify-between p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Occupation:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.occupation}</span>
                    </div>
                  )}
                  {history.probableChemicalExposure && (
                    <div className="flex justify-between p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Chemical Exposure:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.probableChemicalExposure}</span>
                    </div>
                  )}
                  {history.location && (
                    <div className="flex justify-between p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Location:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.location}</span>
                    </div>
                  )}
                  {history.familyHistory && (
                    <div className="flex justify-between p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Family History:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.familyHistory}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Examination */}
            {(history.oralCavity || history.skin || history.ent || history.eye || history.respiratorySystem || 
              history.cvs || history.cns || history.abdomen || history.otherFindings) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Examination Findings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.oralCavity && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Oral Cavity:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.oralCavity}</span>
                    </div>
                  )}
                  {history.skin && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Skin:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.skin}</span>
                    </div>
                  )}
                  {history.ent && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">ENT:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.ent}</span>
                    </div>
                  )}
                  {history.eye && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Eye:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.eye}</span>
                    </div>
                  )}
                  {history.respiratorySystem && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Respiratory System:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.respiratorySystem}</span>
                    </div>
                  )}
                  {history.cvs && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">CVS:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.cvs}</span>
                    </div>
                  )}
                  {history.cns && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">CNS:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.cns}</span>
                    </div>
                  )}
                  {history.abdomen && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Abdomen:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.abdomen}</span>
                    </div>
                  )}
                  {history.otherFindings && (
                    <div className="flex justify-between p-3 bg-cyan-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Other Findings:</span>
                      <span className="text-sm text-slate-800 font-medium">{history.otherFindings}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {history.additionalNotes && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Additional Notes
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700">{history.additionalNotes}</p>
                </div>
              </div>
            )}

            {/* Report File */}
            {history.reportFile && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Report File
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                <div>
                        <p className="text-sm font-medium text-slate-700">Report File</p>
                        <p className="text-xs text-slate-500">{history.reportFile}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const fileUrl = `http://localhost:5000/uploads/${history.reportFile}`;
                        window.open(fileUrl, '_blank');
                      }}
                      className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4 group-hover:animate-bounce" />
                      View File
                    </button>
                  </div>
                </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHistory; 