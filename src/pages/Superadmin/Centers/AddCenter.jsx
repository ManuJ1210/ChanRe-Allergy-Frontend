// src/pages/superadmin/AddCenterWithAdmin.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCenterWithAdmin } from "../../../features/center/centerThunks";
import { resetStatus } from "../../../features/center/centerSlice";
import { useNavigate } from "react-router-dom";
import {
  Building2, MapPin, Mail, Phone, Plus, User, GraduationCap, 
  Badge, Hash, Eye, EyeOff, Save, ArrowLeft, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

export default function AddCenterWithAdmin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, success, error } = useSelector((state) => state.center);

  const [center, setCenter] = useState({
    centername: "", location: "", fulladdress: "", email: "", phone: "", code: ""
  });

  const [admin, setAdmin] = useState({
    name: "", qualification: "", designation: "", kmcNumber: "", hospitalName: "",
    phone: "", email: "", username: "", password: "", userType: "centeradmin",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleCenterChange = (e) => {
    const { name, value } = e.target;
    setCenter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createCenterWithAdmin({ center, admin }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Successfully added center and admin!");
      setCenter({ centername: "", location: "", fulladdress: "", email: "", phone: "", code: "" });
      setAdmin({
        name: "", qualification: "", designation: "", kmcNumber: "", hospitalName: "",
        phone: "", email: "", username: "", password: "", userType: "centeradmin",
      });

      setTimeout(() => {
        dispatch(resetStatus());
        navigate("/dashboard/Superadmin/Centers/CentersList");
      }, 1500);
    }
  }, [success, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/Superadmin/Centers/CentersList')}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-3 sm:mb-4 transition-colors text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Centers
          </button>
          <h1 className="text-md font-bold text-slate-800 mb-2">
            Add Healthcare Center & Admin
          </h1>
          <p className="text-xs text-slate-600">
            Create a new healthcare center with its administrator
          </p>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700 text-xs">Successfully added center and admin!</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 text-xs">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Center Information Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                Center Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <Input 
                  label="Center Name" 
                  name="centername" 
                  value={center.centername} 
                  onChange={handleCenterChange} 
                  icon={<Building2 className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Location (City)" 
                  name="location" 
                  value={center.location} 
                  onChange={handleCenterChange} 
                  icon={<MapPin className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Center Code" 
                  name="code" 
                  value={center.code} 
                  onChange={handleCenterChange} 
                  icon={<Hash className="h-4 w-4 text-blue-500" />} 
                />
                <div className="sm:col-span-2">
                  <TextArea 
                    label="Full Address" 
                    name="fulladdress" 
                    value={center.fulladdress} 
                    onChange={handleCenterChange} 
                    icon={<MapPin className="h-4 w-4 text-blue-500" />} 
                  />
                </div>
                <Input 
                  label="Email" 
                  name="email" 
                  type="email" 
                  value={center.email} 
                  onChange={handleCenterChange} 
                  icon={<Mail className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Phone" 
                  name="phone" 
                  value={center.phone} 
                  onChange={handleCenterChange} 
                  icon={<Phone className="h-4 w-4 text-blue-500" />} 
                />
              </div>
            </div>

            {/* Admin Information Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Administrator Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <Input 
                  label="Full Name" 
                  name="name" 
                  value={admin.name} 
                  onChange={handleAdminChange} 
                  icon={<User className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Qualification" 
                  name="qualification" 
                  value={admin.qualification} 
                  onChange={handleAdminChange} 
                  icon={<GraduationCap className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Designation" 
                  name="designation" 
                  value={admin.designation} 
                  onChange={handleAdminChange} 
                  icon={<Badge className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="KMC Number" 
                  name="kmcNumber" 
                  value={admin.kmcNumber} 
                  onChange={handleAdminChange} 
                  icon={<Badge className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Hospital Name" 
                  name="hospitalName" 
                  value={admin.hospitalName} 
                  onChange={handleAdminChange} 
                  icon={<Building2 className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Phone" 
                  name="phone" 
                  value={admin.phone} 
                  onChange={handleAdminChange} 
                  icon={<Phone className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Email" 
                  name="email" 
                  type="email" 
                  value={admin.email} 
                  onChange={handleAdminChange} 
                  icon={<Mail className="h-4 w-4 text-blue-500" />} 
                />
                <Input 
                  label="Username" 
                  name="username" 
                  value={admin.username} 
                  onChange={handleAdminChange} 
                  icon={<User className="h-4 w-4 text-blue-500" />} 
                />

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Badge className="h-4 w-4 text-blue-500" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={admin.password}
                      onChange={handleAdminChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 sm:top-3 text-slate-400 hover:text-blue-500 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* User Type */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    User Type *
                  </label>
                  <select
                    name="userType"
                    value={admin.userType}
                    onChange={handleAdminChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
                  >
                    <option value="centeradmin">Center Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Center & Admin...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Center & Admin
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

const Input = ({ label, name, value, onChange, type = "text", icon }) => (
  <div>
    <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
      {icon}
      {label} *
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-xs"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const TextArea = ({ label, name, value, onChange, icon }) => (
  <div>
    <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
      {icon}
      {label} *
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required
      rows={3}
      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-xs"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);
