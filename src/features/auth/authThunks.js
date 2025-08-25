import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ emailOrUsername, password }, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/login', { emailOrUsername, password });
      
      // Check if the response contains an error message (even with 200 status)
      if (res.data.message && res.data.message.includes('Invalid')) {
        toast.error(res.data.message);
        return rejectWithValue(res.data.message);
      }
      
      // Check if login was successful (you might need to adjust this based on your backend response)
      if (res.data.token || res.data.user) {
        toast.success('Login successful!');
        return res.data;
      } else {
        // Handle unexpected response format
        toast.error('Unexpected response from server');
        return rejectWithValue('Unexpected response from server');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
