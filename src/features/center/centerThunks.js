// src/features/center/centerThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';

// Create center with admin
export const createCenterWithAdmin = createAsyncThunk(
  'center/createCenterWithAdmin',
  async ({ center, admin }, { rejectWithValue }) => {
    try {
      const res = await API.post('/centers/create-with-admin', { center, admin });
      toast.success('Center created successfully!');
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Fetch all centers
export const fetchCenters = createAsyncThunk(
  'center/fetchCenters',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/centers');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch centers");
    }
  }
);

// Delete a center
export const deleteCenter = createAsyncThunk(
  'center/deleteCenter',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/centers/${id}`);
      toast.success('Center deleted successfully!');
      return id; // return deleted ID so we can remove it from Redux state
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete center";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Get a specific center by ID
export const getCenterById = createAsyncThunk(
  'center/getCenterById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/centers/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch center");
    }
  }
);

// Update a center
export const updateCenter = createAsyncThunk(
  'center/updateCenter',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/centers/${id}`, data);
      toast.success('Center updated successfully!');
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Update failed";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
