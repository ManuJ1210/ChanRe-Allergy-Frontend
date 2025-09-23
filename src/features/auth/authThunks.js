import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ emailOrUsername, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await API.post('/auth/login', { emailOrUsername, password });
      
      // Session is already created on the backend during login
      // No need to create another session here
      
      toast.success('Login successful!');
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
