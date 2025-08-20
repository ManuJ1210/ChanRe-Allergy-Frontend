import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCenterInfo } from '../../../features/superadmin/superadminThunks';
import {
  MapPin, Mail, Phone, UserCheck, Building2, User, Users, 
  FlaskConical, ArrowLeft, AlertCircle
} from 'lucide-react';

export default function ViewCenterInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { center, centerLoading, centerError } = useSelector((state) => state.superadmin);

  useEffect(() => {
    if (id) {
      dispatch(fetchCenterInfo(id));
    }
  }, [dispatch, id]);

  if (centerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">Loading center information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (centerError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{centerError}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!center) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Patients</p>
                <p className="text-sm font-bold text-slate-800">{center.patientCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Total Doctors</p>
                <p className="text-sm font-bold text-slate-800">{center.doctorCount || 0}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Receptionists</p>
                <p className="text-sm font-bold text-slate-800">{center.receptionistCount || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-xs font-medium">Lab Staff</p>
                <p className="text-sm font-bold text-slate-800">{center.labCount || 0}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-orange-500" />
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