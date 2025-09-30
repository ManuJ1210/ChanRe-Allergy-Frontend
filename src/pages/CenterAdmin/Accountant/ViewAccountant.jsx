import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  UserCheck,
  UserX,
  Trash2,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../../services/api';

const ViewAccountant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [accountant, setAccountant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchAccountant();
  }, [id]);

  const fetchAccountant = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/accountants/${id}`);
      setAccountant(response.data);
    } catch (error) {
      console.error('Error fetching accountant:', error);
      toast.error('Failed to fetch accountant details', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/dashboard/centeradmin/accountant/manageaccountants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/accountants/${id}`);
      toast.success('Accountant deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/dashboard/centeradmin/accountant/manageaccountants');
    } catch (error) {
      console.error('Error deleting accountant:', error);
      toast.error('Failed to delete accountant', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setShowDeleteModal(false);
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = accountant.status === 'active' ? 'inactive' : 'active';
      await API.put(`/accountants/${id}`, { status: newStatus });
      setAccountant(prev => ({ ...prev, status: newStatus }));
      toast.success(`Accountant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium text-sm">Loading accountant details...</p>
              <p className="text-slate-500 text-xs mt-1">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!accountant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Accountant Not Found</h3>
            <p className="text-slate-500 mb-6">The accountant you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/dashboard/centeradmin/accountant/manageaccountants')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Accountants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/dashboard/centeradmin/accountant/manageaccountants')}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accountants
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-md font-bold text-slate-800 mb-2 text-center sm:text-left">
                Accountant Details
              </h1>
              <p className="text-slate-600 text-xs text-center sm:text-left">
                View and manage accountant information
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/dashboard/centeradmin/accountant/editaccountant/${id}`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleToggleStatus}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors text-xs ${
                  accountant.status === 'active'
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {accountant.status === 'active' ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Accountant Information */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">
                {accountant.name ? accountant.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-2">{accountant.name}</h2>
              <p className="text-slate-600 text-sm mb-2">{accountant.email}</p>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                accountant.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {accountant.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <User className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="text-sm font-medium text-slate-800">{accountant.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Email Address</p>
                    <p className="text-sm font-medium text-slate-800">{accountant.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <User className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Username</p>
                    <p className="text-sm font-medium text-slate-800">@{accountant.username}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Mobile Number</p>
                    <p className="text-sm font-medium text-slate-800">{accountant.mobile || 'Not provided'}</p>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Address Information */}
            {accountant.address && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>
                
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-800">{accountant.address}</p>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Created At</p>
                    <p className="text-sm font-medium text-slate-800">{formatDate(accountant.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Last Updated</p>
                    <p className="text-sm font-medium text-slate-800">{formatDate(accountant.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 mb-6 text-xs">
              Are you sure you want to delete <strong>{accountant.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAccountant;
