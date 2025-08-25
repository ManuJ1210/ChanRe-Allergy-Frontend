import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import API from '../../../../services/api';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Activity, 
  Save
} from 'lucide-react';

export default function AddFollowUp() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    followUpType: '',
    scheduledDate: '',
    notes: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);

  const followUpTypes = [
    { value: 'allergic-rhinitis', label: 'Allergic Rhinitis', icon: '🤧' },
    { value: 'allergic-conjunctivitis', label: 'Allergic Conjunctivitis', icon: '👁️' },
    { value: 'allergic-bronchitis', label: 'Allergic Bronchitis', icon: '🫁' },
    { value: 'atopic-dermatitis', label: 'Atopic Dermatitis', icon: '🦠' },
    { value: 'gpe', label: 'GPE', icon: '🏥' },
    { value: 'general', label: 'General Follow-up', icon: '📋' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'overdue', label: 'Overdue', color: 'text-red-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.followUpType || !formData.scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const followUpData = {
        ...formData,
        patientId: patientId,
        doctorId: user._id || user.id
      };

      await API.post('/followups', followUpData);
      
      toast.success('Follow-up scheduled successfully!');
      
      // Navigate back to patient profile
      setTimeout(() => {
        navigate(`/dashboard/doctor/patients/profile/${patientId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/dashboard/doctor/patients/profile/${patientId}`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient
          </button>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Schedule Follow-up
          </h1>
          <p className="text-slate-600">
            Schedule a follow-up appointment for the patient
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Follow-up Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Activity className="h-4 w-4 inline mr-2" />
                Follow-up Type *
              </label>
              <select
                name="followUpType"
                value={formData.followUpType}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select follow-up type</option>
                {followUpTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Scheduled Date *
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about the follow-up..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling Follow-up...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Schedule Follow-up
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