import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, UserCheck, Trash2, Eye, Edit, Plus, Search } from 'lucide-react';
import { fetchCenters, deleteCenter } from '../../../features/center/centerThunks';

export default function CentersList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { centers, loading, deletingId, error } = useSelector((state) => state.center);

  useEffect(() => {
    dispatch(fetchCenters());
  }, [dispatch]);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this center?');
    if (confirmDelete) {
      dispatch(deleteCenter(id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Healthcare Centers Management
          </h1>
          <p className="text-slate-600 text-xs">
            Manage and monitor all registered healthcare centers
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="p-6 border-b border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                  Registered Centers
                </h2>
                <p className="text-slate-600 mt-1 text-xs">
                  Total: {centers.length} centers
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/Superadmin/Centers/AddCenter')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-xs"
              >
                <Plus className="h-4 w-4" />
                Add New Center
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">Loading centers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        {/* Centers Grid */}
        {!loading && !error && (
          <>
            {centers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-slate-600 mb-2">No Centers Found</h3>
                  <p className="text-slate-500 mb-4 text-xs">Get started by adding your first healthcare center.</p>
                  <button
                    onClick={() => navigate('/dashboard/Superadmin/Centers/AddCenter')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto text-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Add Center
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {centers.map((center) => (
                  <div
                    key={center._id}
                    className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      {/* Center Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            {center.centername}
                          </h3>
                          <p className="text-xs text-slate-500">Code: {center.centerCode || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Center Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{center.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <UserCheck className="h-4 w-4 text-blue-500" />
                          <span>{center.centerAdminName || 'No admin assigned'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/Superadmin/Centers/ViewCenterInfo/${center._id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/Superadmin/Centers/EditCenter/${center._id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(center._id)}
                          disabled={deletingId === center._id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === center._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
