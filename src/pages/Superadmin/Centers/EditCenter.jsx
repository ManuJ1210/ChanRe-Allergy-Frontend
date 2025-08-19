import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCenterById, updateCenter } from "../../../features/center/centerThunks";
import { resetStatus } from "../../../features/center/centerSlice";
import { Building2, MapPin, Mail, Phone, Hash, Save, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function EditCenter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentCenter, loading, error, updateLoading, updateSuccess } = useSelector((state) => state.center);

  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    email: "",
    phone: "",
    code: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(getCenterById(id));
    }
    return () => {
      dispatch(resetStatus());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentCenter) {
      setForm({
        name: currentCenter.name || currentCenter.centername || "",
        location: currentCenter.location || "",
        address: currentCenter.address || currentCenter.fulladdress || "",
        email: currentCenter.email || "",
        phone: currentCenter.phone || "",
        code: currentCenter.code || currentCenter.centerCode || "",
      });
    }
  }, [currentCenter]);

  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => {
        dispatch(resetStatus());
        navigate("/dashboard/Superadmin/Centers/CentersList");
      }, 1500);
    }
  }, [updateSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateCenter({ id, data: form }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-xs">Loading center details...</p>
            </div>
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
            onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Centers
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Edit Healthcare Center
          </h1>
          <p className="text-slate-600 text-xs">
            Update center information and details
          </p>
        </div>

        {/* Alert Messages */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-xs">Center updated successfully!</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              Center Information
            </h2>
            <p className="text-slate-600 mt-1 text-xs">
              Update the center details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Center Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="ChanRe Allergy Center"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  City *
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Bangalore"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  Center Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="Unique Center Code"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Full Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="123 Main St, Area, City, State, Pincode"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="center@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={updateLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs"
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
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
