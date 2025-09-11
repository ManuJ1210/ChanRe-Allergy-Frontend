import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Async thunks
export const fetchCenterAdminDoctors = createAsyncThunk(
  'centerAdminDoctors/fetchCenterAdminDoctors',
  async ({ page = 1, limit = 5, search = '', status = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await API.get(`/doctors?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchCenterAdminDoctorById = createAsyncThunk(
  'centerAdminDoctors/fetchCenterAdminDoctorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

export const addCenterAdminDoctor = createAsyncThunk(
  'centerAdminDoctors/addCenterAdminDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await API.post('/doctors', doctorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add doctor');
    }
  }
);

export const updateCenterAdminDoctor = createAsyncThunk(
  'centerAdminDoctors/updateCenterAdminDoctor',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/doctors/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update doctor');
    }
  }
);

export const deleteCenterAdminDoctor = createAsyncThunk(
  'centerAdminDoctors/deleteCenterAdminDoctor',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/doctors/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete doctor');
    }
  }
);

export const toggleCenterAdminDoctorStatus = createAsyncThunk(
  'centerAdminDoctors/toggleCenterAdminDoctorStatus',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Get current doctor from state to check current status
      const state = getState();
      const currentDoctor = state.centerAdminDoctors.doctors.find(d => d._id === id);
      
      if (!currentDoctor) {
        return rejectWithValue('Doctor not found');
      }

      // Toggle the isDeleted status
      const newIsDeletedStatus = !currentDoctor.isDeleted;
      
      const response = await API.put(`/doctors/${id}`, {
        isDeleted: newIsDeletedStatus
      });
      
      return { ...response.data, isDeleted: newIsDeletedStatus };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle doctor status');
    }
  }
);

export const fetchCenterAdminDoctorStats = createAsyncThunk(
  'centerAdminDoctors/fetchCenterAdminDoctorStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/doctors/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor stats');
    }
  }
);

const initialState = {
  doctors: [],
  currentDoctor: null,
  loading: false,
  error: null,
  success: false,
  message: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  },
  filters: {
    search: '',
    status: ''
  },
  stats: {
    total: 0,
    active: 0,
    inactive: 0
  }
};

const centerAdminDoctorSlice = createSlice({
  name: 'centerAdminDoctors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    setPaginationLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when limit changes
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: ''
      };
      state.pagination.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors
      .addCase(fetchCenterAdminDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterAdminDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.doctors || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchCenterAdminDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch doctor by ID
      .addCase(fetchCenterAdminDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterAdminDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(fetchCenterAdminDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add doctor
      .addCase(addCenterAdminDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addCenterAdminDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Doctor added successfully';
        state.doctors.unshift(action.payload);
      })
      .addCase(addCenterAdminDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update doctor
      .addCase(updateCenterAdminDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCenterAdminDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Doctor updated successfully';
        const index = state.doctors.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
        if (state.currentDoctor && state.currentDoctor._id === action.payload._id) {
          state.currentDoctor = action.payload;
        }
      })
      .addCase(updateCenterAdminDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete doctor
      .addCase(deleteCenterAdminDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCenterAdminDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = 'Doctor deleted successfully';
        state.doctors = state.doctors.filter(d => d._id !== action.payload);
        if (state.currentDoctor && state.currentDoctor._id === action.payload) {
          state.currentDoctor = null;
        }
      })
      .addCase(deleteCenterAdminDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Toggle status
      .addCase(toggleCenterAdminDoctorStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(toggleCenterAdminDoctorStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Check if the doctor was activated or deactivated
        const wasDeleted = action.payload.isDeleted;
        state.message = wasDeleted ? 'Doctor deactivated successfully' : 'Doctor activated successfully';
        const index = state.doctors.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
        if (state.currentDoctor && state.currentDoctor._id === action.payload._id) {
          state.currentDoctor = action.payload;
        }
      })
      .addCase(toggleCenterAdminDoctorStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch stats
      .addCase(fetchCenterAdminDoctorStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterAdminDoctorStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCenterAdminDoctorStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setFilters,
  setPaginationLimit,
  clearFilters
} = centerAdminDoctorSlice.actions;

export default centerAdminDoctorSlice.reducer; 