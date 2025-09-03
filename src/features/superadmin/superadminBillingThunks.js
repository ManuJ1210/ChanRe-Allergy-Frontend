import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Fetch all billing data for superadmin
export const fetchAllBillingData = createAsyncThunk(
  'superadmin/fetchAllBillingData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/billing/all');
      return res.data;
    } catch (error) {
      console.error('Billing data fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing data');
    }
  }
);

// Fetch billing data by center
export const fetchBillingDataByCenter = createAsyncThunk(
  'superadmin/fetchBillingDataByCenter',
  async (centerId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/center/${centerId}`);
      return res.data;
    } catch (error) {
      console.error('Center billing data fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing data');
    }
  }
);

// Fetch billing data by status
export const fetchBillingDataByStatus = createAsyncThunk(
  'superadmin/fetchBillingDataByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/status/${status}`);
      return res.data;
    } catch (error) {
      console.error('Status billing data fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing data by status');
    }
  }
);

// Fetch billing data by date range
export const fetchBillingDataByDateRange = createAsyncThunk(
  'superadmin/fetchBillingDataByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/date-range?startDate=${startDate}&endDate=${endDate}`);
      return res.data;
    } catch (error) {
      console.error('Date range billing data fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing data by date range');
    }
  }
);

// Fetch billing statistics
export const fetchBillingStats = createAsyncThunk(
  'superadmin/fetchBillingStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/billing/stats');
      return res.data;
    } catch (error) {
      console.error('Billing stats fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing statistics');
    }
  }
);

// Update billing status
export const updateBillingStatus = createAsyncThunk(
  'superadmin/updateBillingStatus',
  async ({ billingId, status, notes }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/billing/${billingId}/status`, { status, notes });
      return res.data;
    } catch (error) {
      console.error('Billing status update error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update billing status');
    }
  }
);

// Generate invoice
export const generateInvoice = createAsyncThunk(
  'superadmin/generateInvoice',
  async (billingId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/billing/${billingId}/generate-invoice`);
      return res.data;
    } catch (error) {
      console.error('Invoice generation error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to generate invoice');
    }
  }
);

// Download invoice
export const downloadInvoice = createAsyncThunk(
  'superadmin/downloadInvoice',
  async (billingId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/billing/${billingId}/download-invoice`, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error('Invoice download error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice');
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  'superadmin/verifyPayment',
  async ({ billingId, verificationData }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/billing/${billingId}/verify-payment`, verificationData);
      return res.data;
    } catch (error) {
      console.error('Payment verification error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

// Export billing data
export const exportBillingData = createAsyncThunk(
  'superadmin/exportBillingData',
  async ({ format, filters }, { rejectWithValue }) => {
    try {
      const res = await API.post('/billing/export', { format, filters }, {
        responseType: 'blob'
      });
      return res.data;
    } catch (error) {
      console.error('Billing export error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to export billing data');
    }
  }
);
