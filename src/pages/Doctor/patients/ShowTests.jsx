import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSinglePatient,
  fetchPatientTests,
} from "../../../features/patient/patientThunks";

const ShowTests = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log('ShowTests component rendered, id:', id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-md font-bold text-red-800 mb-2">TEST - Show Tests</h1>
        <p className="text-xs text-slate-600 mb-4">Patient ID: {id}</p>
        <button 
          onClick={() => navigate('/CenterAdmin/patients/PatientList')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-xs"
        >
          Back to Patients List
        </button>
      </div>
    </div>
  );
};

export default ShowTests; 