import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import API from "../../services/api";
import ReceptionistLayout from './ReceptionistLayout';
import { Download, ArrowLeft, FileText, User, Calendar, Phone, Mail, MapPin, AlertCircle } from "lucide-react";

const ShowTests = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchPatientAndTests();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchPatientAndTests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/patients/${id}/show-tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatient(res.data.patient);
      setTests(res.data.tests);
    } catch (err) {
      setError("Failed to fetch patient or tests");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Patient-${patient?.name}-Tests`,
  });

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <button
                  onClick={() => navigate("/dashboard/receptionist/patients")}
                  className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patients
                </button>
                <h1 className="text-xl font-bold text-slate-800 mb-2">
                  Patient Test Reports
                </h1>
                <p className="text-slate-600">
                  View and download patient test results
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading patient data...</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <div ref={componentRef} className="bg-white rounded-xl shadow-sm border border-blue-100">
              {/* Patient Information */}
              {patient && (
                <div className="p-6 border-b border-blue-100">
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center mb-4">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Patient Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4 text-blue-500" />
                      <span><strong>Name:</strong> {patient.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span><strong>Age:</strong> {patient.age} years</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4 text-blue-500" />
                      <span><strong>Gender:</strong> {patient.gender}</span>
                    </div>
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span><strong>Phone:</strong> {patient.phone}</span>
                      </div>
                    )}
                    {patient.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span><strong>Email:</strong> {patient.email}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center gap-2 text-slate-600 md:col-span-2 lg:col-span-3">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span><strong>Address:</strong> {patient.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Reports */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center mb-4">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Test Reports
                </h3>
                {!tests.length ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No test reports found for this patient.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          {Object.keys(tests[0])
                            .filter((key) => key !== "_id" && key !== "date" && key !== "patient" && key !== "__v")
                            .map((key, idx) => (
                              <th key={idx} className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tests.map((test, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-800">
                              {test.date ? new Date(test.date).toLocaleDateString() : ""}
                            </td>
                            {Object.keys(test)
                              .filter((key) => key !== "_id" && key !== "date" && key !== "patient" && key !== "__v")
                              .map((key, i) => (
                                <td key={i} className="px-6 py-4 text-sm text-slate-600">
                                  {test[key]}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ReceptionistLayout>
  );
};

export default ShowTests;
