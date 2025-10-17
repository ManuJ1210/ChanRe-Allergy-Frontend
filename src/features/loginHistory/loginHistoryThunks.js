import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import API from '../../services/api';

// Delete login history record
export const deleteLoginHistory = createAsyncThunk(
  'loginHistory/deleteLoginHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.delete(`/login-history/${id}`);
      toast.success('Login history record deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting login history:', error);
      toast.error('Failed to delete login history record');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete login history record');
    }
  }
);

// Bulk delete login history records
export const bulkDeleteLoginHistory = createAsyncThunk(
  'loginHistory/bulkDeleteLoginHistory',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await API.delete('/login-history/bulk', { data: { ids } });
      toast.success(`Deleted ${response.data.deletedCount} login history records`);
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting login history:', error);
      toast.error('Failed to bulk delete login history records');
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk delete login history records');
    }
  }
);

// Delete all login history records
export const deleteAllLoginHistory = createAsyncThunk(
  'loginHistory/deleteAllLoginHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.delete('/login-history/all');
      toast.success(`Deleted all ${response.data.deletedCount} login history records`);
      return response.data;
    } catch (error) {
      console.error('Error deleting all login history:', error);
      toast.error('Failed to delete all login history records');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete all login history records');
    }
  }
);