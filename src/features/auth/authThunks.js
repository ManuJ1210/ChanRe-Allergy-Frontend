import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';
import { createSession, getDeviceInfo } from '../session/sessionThunks';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ emailOrUsername, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await API.post('/auth/login', { emailOrUsername, password });
      
      // Create session after successful login
      if (res.data.user && res.data.token) {
        const deviceInfo = getDeviceInfo();
        const sessionData = {
          userId: res.data.user._id,
          userRole: res.data.user.role,
          userType: res.data.user.userType,
          centerId: res.data.user.centerId,
          deviceInfo: deviceInfo
        };
        
        // Dispatch session creation (don't wait for it to complete)
        dispatch(createSession(sessionData));
      }
      
      toast.success('Login successful!');
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
