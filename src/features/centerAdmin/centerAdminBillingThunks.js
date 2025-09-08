import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Fetch billing data for center admin
export const fetchCenterBillingData = createAsyncThunk(
  'centerAdmin/fetchCenterBillingData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/billing/center');
      return res.data;
    } catch (error) {
      console.error('Center billing data fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing data');
    }
  }
);

// Fetch billing reports for center admin (daily, weekly, monthly, yearly)
export const fetchCenterBillingReports = createAsyncThunk(
  'centerAdmin/fetchCenterBillingReports',
  async ({ period, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      // Add timestamp to prevent caching
      params.append('_t', Date.now().toString());
      
      const res = await API.get(`/billing/center/reports?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.error('Center billing reports fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch center billing reports');
    }
  }
);

// Verify payment for center admin
export const verifyCenterPayment = createAsyncThunk(
  'centerAdmin/verifyCenterPayment',
  async ({ testRequestId, verificationNotes }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/billing/test-requests/${testRequestId}/mark-paid`, {
        verificationNotes
      });
      return res.data;
    } catch (error) {
      console.error('Center payment verification error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

// Download invoice for center admin
export const downloadCenterInvoice = createAsyncThunk(
  'centerAdmin/downloadCenterInvoice',
  async (testRequestId, { rejectWithValue }) => {
    try {
      console.log('🚀 downloadCenterInvoice thunk called with testRequestId:', testRequestId);
      
      const res = await API.get(`/billing/test-requests/${testRequestId}/invoice`, {
        responseType: 'blob'
      });
      
      console.log('✅ downloadCenterInvoice response received:', {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        dataType: typeof res.data,
        dataSize: res.data?.size,
        isBlob: res.data instanceof Blob
      });
      
      return res.data;
    } catch (error) {
      console.error('❌ Center invoice download error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice');
    }
  }
);
