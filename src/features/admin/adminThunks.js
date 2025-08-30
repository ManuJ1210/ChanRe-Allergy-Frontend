import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Fetch all center admins
export const fetchAdmins = createAsyncThunk(
  'admin/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/center-admins');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admins");
    }
  }
);

// Delete a center admin by ID
export const deleteAdmin = createAsyncThunk(
  'admin/deleteAdmin',
  async (adminId, { rejectWithValue }) => {
    try {
      await API.delete(`/center-admins/${adminId}`);
      return adminId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete admin");
    }
  }
);
