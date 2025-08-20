import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/center-admins';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Fetch all center admins
export const fetchAdmins = createAsyncThunk(
  'admin/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: getAuthHeaders(),
      });
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
      await axios.delete(`${BASE_URL}/${adminId}`, {
        headers: getAuthHeaders(),
      });
      return adminId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete admin");
    }
  }
);
