import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';

// Create new session (called during login)
export const createSession = createAsyncThunk(
  'session/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await API.post('/sessions', sessionData);
      return response.data.session;
    } catch (error) {
      console.error('Error creating session:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
  }
);

// Get active sessions for current user
export const getUserSessions = createAsyncThunk(
  'session/getUserSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/sessions/my-sessions');
      return response.data.sessions;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user sessions');
    }
  }
);

// Get all active sessions (Superadmin only)
export const getAllSessions = createAsyncThunk(
  'session/getAllSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/sessions/all');
      return response.data.sessions;
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all sessions');
    }
  }
);

// Get sessions by center
export const getSessionsByCenter = createAsyncThunk(
  'session/getSessionsByCenter',
  async (centerId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/sessions/center/${centerId}`);
      return response.data.sessions;
    } catch (error) {
      console.error('Error fetching center sessions:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center sessions');
    }
  }
);

// Get session statistics
export const getSessionStats = createAsyncThunk(
  'session/getSessionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/sessions/stats');
      return response.data.stats;
    } catch (error) {
      console.error('Error fetching session stats:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session statistics');
    }
  }
);

// Update session activity
export const updateSessionActivity = createAsyncThunk(
  'session/updateSessionActivity',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await API.put(`/sessions/${sessionId}/activity`);
      return response.data;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update session activity');
    }
  }
);

// Logout specific session
export const logoutSession = createAsyncThunk(
  'session/logoutSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await API.put(`/sessions/${sessionId}/logout`);
      toast.success('Session logged out successfully');
      return { sessionId, ...response.data };
    } catch (error) {
      console.error('Error logging out session:', error);
      toast.error('Failed to logout session');
      return rejectWithValue(error.response?.data?.message || 'Failed to logout session');
    }
  }
);

// Force logout all sessions for a user (Superadmin only)
export const forceLogoutUserSessions = createAsyncThunk(
  'session/forceLogoutUserSessions',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await API.put(`/sessions/user/${userId}/force-logout`);
      toast.success(`Force logged out ${response.data.loggedOutSessions} sessions`);
      return response.data;
    } catch (error) {
      console.error('Error force logging out user sessions:', error);
      toast.error('Failed to force logout sessions');
      return rejectWithValue(error.response?.data?.message || 'Failed to force logout sessions');
    }
  }
);

// Utility function to get device info for session creation
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Simple device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
  
  let deviceType = 'Desktop';
  if (isTablet) deviceType = 'Tablet';
  else if (isMobile) deviceType = 'Mobile';
  
  // Simple browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Simple OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return {
    userAgent,
    platform: os,
    browser,
    os,
    device: deviceType
  };
};
