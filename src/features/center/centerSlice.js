import { createSlice } from '@reduxjs/toolkit';
import { 
  createCenterWithAdmin, 
  fetchCenters, 
  deleteCenter,
  // Fix import: use getCenterById instead of fetchCenterById
  getCenterById,
  updateCenter
  // assignAdmin removed
} from './centerThunks';

const centerSlice = createSlice({
  name: 'center',
  initialState: {
    centers: [],
    currentCenter: null, // Added for ViewCenterInfo component
    loading: false,
    creating: false,
    deletingId: null,
    updateLoading: false, // Added for update operations
    updateSuccess: false, // Added for update success state
    assignAdminLoading: false, // Added for admin assignment
    error: null,
    success: false,
  },
  reducers: {
    resetStatus: (state) => {
      state.loading = false;
      state.creating = false;
      state.error = null;
      state.success = false;
      state.updateSuccess = false;
      state.deletingId = null;
    },
    // Added new reducers
    clearCurrentCenter: (state) => {
      state.currentCenter = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create center with admin (existing)
      .addCase(createCenterWithAdmin.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCenterWithAdmin.fulfilled, (state) => {
        state.creating = false;
        state.success = true;
      })
      .addCase(createCenterWithAdmin.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Fetch centers (existing)
      .addCase(fetchCenters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenters.fulfilled, (state, action) => {
        state.loading = false;
        state.centers = action.payload;
      })
      .addCase(fetchCenters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete center (existing)
      .addCase(deleteCenter.pending, (state, action) => {
        state.deletingId = action.meta.arg;
      })
      .addCase(deleteCenter.fulfilled, (state, action) => {
        state.deletingId = null;
        state.centers = state.centers.filter((c) => c._id !== action.payload);
        // Clear currentCenter if it was deleted
        if (state.currentCenter?._id === action.payload) {
          state.currentCenter = null;
        }
      })
      .addCase(deleteCenter.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      })
      
      // FIX: Fetch center by ID (use getCenterById)
      .addCase(getCenterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCenterById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCenter = action.payload;
      })
      .addCase(getCenterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update center
      .addCase(updateCenter.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateCenter.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.currentCenter = action.payload;
        // Update in centers array if it exists
        const index = state.centers.findIndex(center => center._id === action.payload._id);
        if (index !== -1) {
          state.centers[index] = action.payload;
        }
      })
      .addCase(updateCenter.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = false;
        state.error = action.payload;
      });
      // assignAdmin cases removed
  },
});

export const { resetStatus, clearCurrentCenter, clearError } = centerSlice.actions;
export default centerSlice.reducer;