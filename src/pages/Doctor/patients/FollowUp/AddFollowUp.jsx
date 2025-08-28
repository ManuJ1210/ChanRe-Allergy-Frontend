import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addFollowUp } from '../../../../features/centerAdmin/centerAdminThunks';
import { resetCenterAdminState } from '../../../../features/centerAdmin/centerAdminSlice';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AddFollowUp = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    followUpType: '',
    scheduledDate: '',
    notes: '',
    status: 'pending'
  });

  const { loading, error, addFollowUpSuccess } = useSelector(state => state.centerAdmin);

  useEffect(() => {
    if (addFollowUpSuccess) {
      dispatch(resetCenterAdminState());
      navigate(`/dashboard/CenterAdmin/patients/FollowUp`);
    }
  }, [addFollowUpSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      patientId
    };
    dispatch(addFollowUp(payload));
  };

  const followUpTypes = [
    { value: 'allergic-rhinitis', label: 'Allergic Rhinitis', icon: '🤧' },
    { value: 'allergic-conjunctivitis', label: 'Allergic Conjunctivitis', icon: '👁️' },
    { value: 'allergic-bronchitis', label: 'Allergic Bronchitis', icon: '🫁' },
    { value: 'atopic-dermatitis', label: 'Atopic Dermatitis', icon: '🦠' },
    { value: 'gpe', label: 'GPE', icon: '🏥' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'overdue', label: 'Overdue', color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-md font-bold text-gray-800">Add Follow-up</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Follow-up Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-3">
                Follow-up Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {followUpTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.followUpType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="followUpType"
                      value={type.value}
                      checked={formData.followUpType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                      required
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{type.icon}</span>
                      <span className="font-medium text-gray-900 text-xs">{type.label}</span>
                    </div>
                    {formData.followUpType === type.value && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any additional notes or instructions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-xs">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-xs"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    <span>Add Follow-up</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFollowUp; 