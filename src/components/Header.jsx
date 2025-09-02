import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaSignOutAlt, FaUser, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import API from '../services/api';

export default function Header({ onHamburgerClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useSelector((state) => state.auth?.user || state.user?.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [centerName, setCenterName] = useState('');
  const [isLoadingCenter, setIsLoadingCenter] = useState(false);

  // Only show center name for center-related roles
  const shouldShowCenterName = ['centeradmin', 'centerAdmin', 'receptionist', 'doctor'].includes(user?.role?.toLowerCase()) && 
                              !user?.isSuperAdminStaff; // Exclude superadmin doctors

  useEffect(() => {
    async function fetchCenterName() {
      if (!user) return;
      
      // Only fetch center data for roles that should show center name
      if (!shouldShowCenterName) {
        return;
      }

      // Check if we have a valid token before making API calls
      const token = localStorage.getItem('token');
      if (!token) {
        setCenterName('Center');
        localStorage.setItem('centerName', 'Center');
        return;
      }

      setIsLoadingCenter(true);
      
      try {
        let centerData = null;
        
        // Try to get center data based on user role
        if (user.role === 'receptionist' && user.centerId) {
          // Receptionist with centerId
          const centerId = typeof user.centerId === 'object' ? user.centerId._id || user.centerId.id : user.centerId;
          try {
            const res = await API.get(`/centers/${centerId}`);
            centerData = res.data;
          } catch (err) {
            // If API call fails (e.g., 401), use user data
            if (err.response?.status === 401) {
              const centerName = user.hospitalName || user.centerName || 'Center';
              setCenterName(centerName);
              localStorage.setItem('centerName', centerName);
              return;
            }
            // For other errors, continue to fallback logic
          }
        } else if (user.role === 'centeradmin' || user.role === 'centerAdmin') {
          // Center admin - try to find center by admin ID
          try {
            const res = await API.get(`/centers/by-admin/${user._id}`);
            centerData = res.data;
          } catch (err) {
            // If first attempt fails (e.g., 401), try fallback
            if (err.response?.status === 401) {
              // Authentication error - use fallback data
              const centerName = user.hospitalName || user.centerName || 'Center';
              setCenterName(centerName);
              localStorage.setItem('centerName', centerName);
              return;
            }
            
            // Fallback: search centers by admin ID
            try {
              const searchRes = await API.get(`/centers?adminId=${user._id}`);
              if (searchRes.data && searchRes.data.length > 0) {
                centerData = searchRes.data[0];
              }
            } catch (fallbackErr) {
              // If fallback also fails, use user data
              const centerName = user.hospitalName || user.centerName || 'Center';
              setCenterName(centerName);
              localStorage.setItem('centerName', centerName);
              return;
            }
          }
        }

        // Set center name
        if (centerData) {
          // Based on backend Center model: name is the primary field
          const name = centerData.name || centerData.centername || 'Center';
          setCenterName(name);
          localStorage.setItem('centerName', name);
        } else {
          // Try to get center name from user object if available
          if (user.centerId && typeof user.centerId === 'object') {
            // user.centerId.name comes from populated Center model
            const userCenterName = user.centerId.name;
            if (userCenterName) {
              setCenterName(userCenterName);
              localStorage.setItem('centerName', userCenterName);
            } else {
              setCenterName('Center');
              localStorage.setItem('centerName', 'Center');
            }
          } else {
            // Check if user has center info in other fields
            const centerName = user.hospitalName || user.centerName;
            if (centerName) {
              setCenterName(centerName);
              localStorage.setItem('centerName', centerName);
            } else {
              setCenterName('Center');
              localStorage.setItem('centerName', 'Center');
            }
          }
        }
        
      } catch (err) {
        // Silent error handling for center fetching
        setCenterName('Center');
        localStorage.setItem('centerName', 'Center');
      } finally {
        setIsLoadingCenter(false);
      }
    }

    fetchCenterName();
  }, [user, shouldShowCenterName]);

  // Load center name from localStorage on component mount
  useEffect(() => {
    const storedCenterName = localStorage.getItem('centerName');
    if (storedCenterName) {
      setCenterName(storedCenterName);
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('centerId');
    localStorage.removeItem('centerName');
    
    // Clear any other potential auth data
    sessionStorage.clear();
    
    // Reset center name state
    setCenterName('');
    
    // Dispatch logout action
    dispatch(logout());
    
    // Navigate to login page without page refresh
    navigate('/login', { replace: true });
  };

  const refreshCenterName = async () => {
    if (user && shouldShowCenterName) {
      // Trigger the center fetching logic again
      const event = new Event('storage');
      window.dispatchEvent(event);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    const name = user?.name || user?.fullName || user?.firstName || user?.lastName;
    if (name) return name;
    
    // If no name found, try to construct from first and last name
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    return 'Admin';
  };

  // Helper function to get user phone
  const getUserPhone = () => {
    // Based on backend User model: phone is the primary field, mobile is secondary
    return user?.phone || user?.mobile || 'N/A';
  };

  // Helper function to get hospital name
  const getHospitalName = () => {
    // Based on backend structure:
    // 1. First try user.hospitalName (direct field in User model)
    if (user?.hospitalName) {
      return user.hospitalName;
    }
    
    // 2. Try to get from the fetched center name (from API)
    if (centerName && centerName !== 'Center') {
      return centerName;
    }
    
    // 3. Try to get from user.centerId object (populated from Center model)
    if (user?.centerId && typeof user.centerId === 'object') {
      return user.centerId.name || 'N/A';
    }
    
    // 4. Check other possible fields
    if (user?.centerName) {
      return user.centerName;
    }
    
    return 'N/A';
  };

  // Helper function to get user email
  const getUserEmail = () => {
    return user?.email || user?.emailAddress || 'N/A';
  };
  const getCenterName = () => {
    return user?.centerName || 'N/A';
  };

  // Helper function to get center ID
  const getCenterId = () => {
    if (!user?.centerId) {
      return 'N/A';
    }
    
    if (typeof user.centerId === 'object') {
      const centerId = user.centerId._id || user.centerId.id || user.centerId.code;
      return centerId || 'N/A';
    }
    
    return user.centerId;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-50 to-blue-50 h-16 md:h-22 border-b border-slate-200 shadow-md flex flex-wrap items-center px-2 md:px-6 transition-all duration-300 gap-2 md:gap-0 ml-0 md:ml-[18.5rem]">
        {/* Hamburger button (sm only) */}
        <button
          className="block md:hidden bg-white border border-blue-100 rounded-full p-2 shadow-lg focus:outline-none mr-2"
          onClick={onHamburgerClick}
          aria-label="Open sidebar"
        >
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {/* Left: Center name - only for center-related roles */}
        <div className="flex items-center min-w-[100px] max-w-[160px] truncate flex-shrink-0 text-xs md:min-w-[180px] md:max-w-[220px] md:text-sm">
          {shouldShowCenterName && (
            <span className="font-bold text-blue-700 whitespace-nowrap truncate">
              {isLoadingCenter ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                getHospitalName() || 'Hospital'
              )}
            </span>
          )}
        </div>
        {/* Center: Search bar (responsive) - COMMENTED OUT */}
        {/* <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full order-3 md:order-none md:justify-center">
          <FaSearch
            className="text-slate-400 cursor-pointer hover:text-blue-400 transition"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs min-w-0 text-slate-700 placeholder-slate-400 transition"
          />
        </div> */}
        {/* Right: Profile section */}
        <div className="relative flex-shrink-0 ml-auto order-2 md:order-none">
          <button
            className="flex items-center gap-2 px-2 md:px-3 py-1 hover:bg-blue-50 rounded-xl cursor-pointer transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaUserCircle className="text-blue-500 text-lg" />
            <div className="text-left hidden sm:block max-w-[100px] md:max-w-none truncate">
              <p className="text-xs md:text-xs font-semibold text-slate-800 truncate">{getUserDisplayName()}</p>
              <p className="text-[10px] md:text-xs text-slate-500 capitalize truncate">{user?.role || "superadmin"}</p>
            </div>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
              <button
                className="flex items-center gap-2 px-4 py-2 w-full text-xs hover:bg-blue-50 text-slate-700"
                onClick={() => {
                  setShowProfile(true);
                  setDropdownOpen(false);
                }}
              >
                <FaUser /> View Profile
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 w-full text-xs text-red-600 hover:bg-blue-50"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </header>
      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 bg-black">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-lg"
            >
              <FaTimes />
            </button>
            <h2 className="text-lg font-bold mb-4 text-center text-blue-600">User Profile</h2>
            <div className="space-y-2 text-xs">
              <p><strong>Name:</strong> {getUserDisplayName()}</p>
              <p><strong>Email:</strong> {getUserEmail()}</p>
              <p><strong>Role:</strong> {user?.role || '-'}</p>
              <p><strong>Phone:</strong> {getUserPhone()}</p>
              {shouldShowCenterName && (
                <>
                  <p><strong>Hospital Name:</strong> {getHospitalName()}</p>
                  <p><strong>Center ID:</strong> {getCenterId()}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
