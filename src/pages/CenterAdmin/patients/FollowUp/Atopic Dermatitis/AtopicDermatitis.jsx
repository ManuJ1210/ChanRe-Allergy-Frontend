import React, { useState } from "react";
import API from "../../../../../services/api";
import { useParams, useNavigate } from "react-router-dom";

const INTENSITY_OPTIONS = ["None", "Mild", "Moderate", "Severe"];
const DRYNESS_OPTIONS = ["No", "Slight", "Moderate", "Very Dry"];
const ECZEMA_OPTIONS = ["No", "Slight", "Moderate", "Severe"];

export default function AtopicDermatitisFollowUp() {
  const [form, setForm] = useState({
    symptoms: "",
    affectedAreas: "",
    intensity: {
      Erythema: "",
      Oedema: "",
      Swelling: "",
      Oozing: "",
      Crusting: "",
      Excoriation: "",
      Lichenification: "",
    },
    drynessWithoutEczema: "",
    redness: "",
    swelling: "",
    oozing: "",
    scratching: "",
    thickenedSkin: "",
    itching: 0,
    sleepDisturbance: 0,
    presentMedications: "",
    localApplications: "",
    otherMedications: "",
  });
  const params = useParams();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleIntensityChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      intensity: { ...prev.intensity, [key]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/atopic-dermatitis",
        {
          patientId: params.patientId,
          ...form
        }
      );
      alert("Submitted successfully!");
      navigate(`/Receptionist/profile/${params.patientId}`);
    } catch (err) {
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Main Title */}
          <h1 className="text-md font-bold text-gray-800 text-center mb-8">ATOPIC DERMATITIS</h1>
          
          {/* Symptoms Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Atopic Dermatitis</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Symptoms</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  rows="3"
                  value={form.symptoms}
                  onChange={e => handleChange("symptoms", e.target.value)}
                  placeholder="Enter Symptoms.."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Affected Areas/Surface of the body</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  rows="3"
                  value={form.affectedAreas}
                  onChange={e => handleChange("affectedAreas", e.target.value)}
                  placeholder="Enter Affected Areas/Surface of the body"
                />
              </div>
            </div>
          </div>

          {/* Intensity Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Intensity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(form.intensity).map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-700 mb-1">{key}</label>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    value={form.intensity[key]}
                    onChange={e => handleIntensityChange(key, e.target.value)}
                  >
                    <option value="">Select</option>
                    {INTENSITY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* On skin without eczema Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">On skin without eczema</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Dryness</label>
                <div className="flex space-x-6">
                  {DRYNESS_OPTIONS.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="drynessWithoutEczema"
                        value={option}
                        checked={form.drynessWithoutEczema === option}
                        onChange={e => handleChange("drynessWithoutEczema", e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* On skin with eczema Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">On skin with eczema</h2>
            <div className="space-y-4">
              {[
                { key: "redness", label: "Redness" },
                { key: "swelling", label: "Swelling" },
                { key: "oozing", label: "Oozing" },
                { key: "scratching", label: "Traces of scratching" },
                { key: "thickenedSkin", label: "Thickened Skin" }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-3">{label}</label>
                  <div className="flex space-x-6">
                    {ECZEMA_OPTIONS.map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={key}
                          value={option}
                          checked={form[key] === option}
                          onChange={e => handleChange(key, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Sliders Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Severity Assessment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Severity of Itching</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={form.itching}
                  onChange={e => handleChange("itching", Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-blue-600 mt-1">Value: {form.itching}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-3">Severity of Sleep Disturbance</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={form.sleepDisturbance}
                  onChange={e => handleChange("sleepDisturbance", Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-blue-600 mt-1">Value: {form.sleepDisturbance}</div>
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">Medications/Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Present Medications</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  rows="4"
                  value={form.presentMedications}
                  onChange={e => handleChange("presentMedications", e.target.value)}
                  placeholder="Enter present medications..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Local Applications</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  rows="4"
                  value={form.localApplications}
                  onChange={e => handleChange("localApplications", e.target.value)}
                  placeholder="Enter local applications..."
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Other Medications</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                rows="4"
                value={form.otherMedications}
                onChange={e => handleChange("otherMedications", e.target.value)}
                placeholder="Enter other medications..."
              />
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

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1d4ed8;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1d4ed8;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
} 