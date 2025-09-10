import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCenterDetailedInfo } from '../../../features/superadmin/superadminThunks';
import {
  MapPin, Mail, Phone, UserCheck, Building2, User, Users, 
  ArrowLeft, AlertCircle, ChevronDown, ChevronUp,
  Calendar, Clock, FileText, Activity
} from 'lucide-react';

export default function ViewCenterInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [expandedSections, setExpandedSections] = useState({
    patients: false,
    doctors: false,
    receptionists: false
  });

  const { 
    centerDetailedInfo, 
    centerDetailedLoading, 
    centerDetailedError 
  } = useSelector((state) => state.superadmin);

  const center = centerDetailedInfo?.center;

  useEffect(() => {
    if (id) {
      dispatch(fetchCenterDetailedInfo(id));
    }
  }, [dispatch, id]);

  // Debug logging
  useEffect(() => {
    if (centerDetailedInfo) {
      console.log('🔍 Center Detailed Info:', centerDetailedInfo);
      console.log('🔍 Patients:', centerDetailedInfo.patients);
      console.log('🔍 Doctors:', centerDetailedInfo.doctors);
      console.log('🔍 Receptionists:', centerDetailedInfo.receptionists);
      
      // Debug patient fields
      if (centerDetailedInfo.patients && centerDetailedInfo.patients.length > 0) {
        console.log('🔍 First Patient Fields:', Object.keys(centerDetailedInfo.patients[0]));
        console.log('🔍 First Patient Data:', centerDetailedInfo.patients[0]);
      }
    }
  }, [centerDetailedInfo]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (centerDetailedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">Loading detailed center information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (centerDetailedError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{centerDetailedError}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!center) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Centers
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Center Information
          </h1>
          <p className="text-slate-600 text-xs">
            Detailed view of healthcare center and its statistics
          </p>
        </div>

        {/* Center Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              {center.name || 'Unnamed Center'}
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Center Code: {center.code || 'N/A'}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {center.address && (
                  <div className="flex items-start gap-3 text-slate-700">
                    <MapPin className="h-4 w-4 text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Address</p>
                      <p className="text-xs">{center.address}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {center.email && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Email</p>
                      <p className="text-xs">{center.email}</p>
                    </div>
                  </div>
                )}
                {center.phone && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Phone</p>
                      <p className="text-xs">{center.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                <p className="text-sm font-bold text-slate-800">{centerDetailedInfo?.patients?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Doctors</p>
                <p className="text-sm font-bold text-slate-800">{centerDetailedInfo?.doctors?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Receptionists</p>
                <p className="text-sm font-bold text-slate-800">{centerDetailedInfo?.receptionists?.length || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Admin Information */}
        {center.admin && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
            <div className="p-6 border-b border-blue-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                Center Administrator
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <User className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Name</p>
                      <p className="text-xs">{center.admin.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {center.admin.email && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Email</p>
                        <p className="text-xs">{center.admin.email}</p>
                      </div>
                    </div>
                  )}
                  {center.admin.phone && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">Phone</p>
                        <p className="text-xs">{center.admin.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Information Sections */}
        
        {/* Patients Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div 
            className="p-6 border-b border-blue-100 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleSection('patients')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Patients ({centerDetailedInfo?.patients?.length || 0})
              </h2>
              {expandedSections.patients ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
          {expandedSections.patients && (
            <div className="p-6">
              {centerDetailedInfo?.patients?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {centerDetailedInfo.patients.map((patient) => (
                    <div key={patient._id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-800">{patient.name}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-600">
                          <Calendar className="h-3 w-3 mr-2" />
                          Age: {String(patient.age) || 'N/A'}
                        </div>
                        <div className="flex items-center text-xs text-slate-600">
                          <User className="h-3 w-3 mr-2" />
                          Gender: {String(patient.gender) || 'N/A'}
                        </div>
                        <div className="flex items-center text-xs text-slate-600">
                          <Phone className="h-3 w-3 mr-2" />
                          {String(patient.phone || patient.contact || patient.mobile) || 'N/A'}
                        </div>
                        {patient.email && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Mail className="h-3 w-3 mr-2" />
                            {String(patient.email)}
                          </div>
                        )}
                        {patient.address && (
                          <div className="flex items-center text-xs text-slate-600">
                            <MapPin className="h-3 w-3 mr-2" />
                            {String(patient.address)}
                          </div>
                        )}
                        {patient.assignedDoctor && (
                          <div className="flex items-center text-xs text-slate-600">
                            <User className="h-3 w-3 mr-2" />
                            Dr. {typeof patient.assignedDoctor === 'object' ? patient.assignedDoctor.name : patient.assignedDoctor}
                          </div>
                        )}
                        {patient.centerCode && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Building2 className="h-3 w-3 mr-2" />
                            Center Code: {String(patient.centerCode)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-8">No patients found</p>
              )}
            </div>
          )}
        </div>

        {/* Doctors Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div 
            className="p-6 border-b border-blue-100 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleSection('doctors')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                Doctors ({centerDetailedInfo?.doctors?.length || 0})
              </h2>
              {expandedSections.doctors ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
          {expandedSections.doctors && (
            <div className="p-6">
              {centerDetailedInfo?.doctors?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {centerDetailedInfo.doctors.map((doctor) => (
                    <div key={doctor._id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-800">Dr. {doctor.name}</h3>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {doctor.role || 'Doctor'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-600">
                          <Mail className="h-3 w-3 mr-2" />
                          {doctor.email}
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Phone className="h-3 w-3 mr-2" />
                            {doctor.phone}
                          </div>
                        )}
                        {doctor.username && (
                          <div className="flex items-center text-xs text-slate-600">
                            <User className="h-3 w-3 mr-2" />
                            @{doctor.username}
                          </div>
                        )}
                        {doctor.qualification && (
                          <div className="flex items-center text-xs text-slate-600">
                            <FileText className="h-3 w-3 mr-2" />
                            {doctor.qualification}
                          </div>
                        )}
                        {doctor.designation && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Activity className="h-3 w-3 mr-2" />
                            {doctor.designation}
                          </div>
                        )}
                        {doctor.kmcNumber && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Activity className="h-3 w-3 mr-2" />
                            KMC: {doctor.kmcNumber}
                          </div>
                        )}
                        {doctor.hospitalName && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Building2 className="h-3 w-3 mr-2" />
                            {doctor.hospitalName}
                          </div>
                        )}
                        {doctor.experience && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Clock className="h-3 w-3 mr-2" />
                            Experience: {doctor.experience}
                          </div>
                        )}
                        {doctor.specializations && doctor.specializations.length > 0 && (
                          <div className="flex items-center text-xs text-slate-600">
                            <FileText className="h-3 w-3 mr-2" />
                            Specializations: {doctor.specializations.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-8">No doctors found</p>
              )}
            </div>
          )}
        </div>

        {/* Receptionists Section */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div 
            className="p-6 border-b border-blue-100 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleSection('receptionists')}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-purple-500" />
                Receptionists ({centerDetailedInfo?.receptionists?.length || 0})
              </h2>
              {expandedSections.receptionists ? (
                <ChevronUp className="h-5 w-5 text-slate-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-500" />
              )}
            </div>
          </div>
          {expandedSections.receptionists && (
            <div className="p-6">
              {centerDetailedInfo?.receptionists?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {centerDetailedInfo.receptionists.map((receptionist) => (
                    <div key={receptionist._id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-800">{receptionist.name}</h3>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {receptionist.role || 'Receptionist'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-600">
                          <Mail className="h-3 w-3 mr-2" />
                          {receptionist.email}
                        </div>
                        {receptionist.phone && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Phone className="h-3 w-3 mr-2" />
                            {receptionist.phone}
                          </div>
                        )}
                        {receptionist.mobile && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Phone className="h-3 w-3 mr-2" />
                            Mobile: {receptionist.mobile}
                          </div>
                        )}
                        {receptionist.username && (
                          <div className="flex items-center text-xs text-slate-600">
                            <User className="h-3 w-3 mr-2" />
                            @{receptionist.username}
                          </div>
                        )}
                        {receptionist.address && (
                          <div className="flex items-center text-xs text-slate-600">
                            <MapPin className="h-3 w-3 mr-2" />
                            {receptionist.address}
                          </div>
                        )}
                        {receptionist.emergencyContact && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Phone className="h-3 w-3 mr-2" />
                            Emergency: {receptionist.emergencyContact}
                          </div>
                        )}
                        {receptionist.emergencyContactName && (
                          <div className="flex items-center text-xs text-slate-600">
                            <User className="h-3 w-3 mr-2" />
                            Emergency Contact: {receptionist.emergencyContactName}
                          </div>
                        )}
                        {receptionist.status && (
                          <div className="flex items-center text-xs text-slate-600">
                            <Activity className="h-3 w-3 mr-2" />
                            Status: {receptionist.status}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-8">No receptionists found</p>
              )}
            </div>
          )}
        </div>


        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              Center Actions
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Manage this healthcare center
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenter/${id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <Building2 className="h-4 w-4" />
                Edit Center
              </button>
              <button
                onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenterAdmin/${id}`)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <UserCheck className="h-4 w-4" />
                Manage Admin
              </button>
              <button
                onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
                className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Centers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}