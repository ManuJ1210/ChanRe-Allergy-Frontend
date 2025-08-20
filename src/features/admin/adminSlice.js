import { createSlice } from '@reduxjs/toolkit';
import { fetchAdmins, deleteAdmin } from './adminThunks';

const initialState = {
  admins: [],
  loading: false,
  error: null,
  deletingId: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch admins';
      })

      .addCase(deleteAdmin.pending, (state, action) => {
        state.deletingId = action.meta.arg;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.deletingId = null;
        state.admins = state.admins.filter((admin) => admin._id !== action.payload);
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload || action.error?.message || 'Failed to delete admin';
      });
  },
});

export const { resetAdminError } = adminSlice.actions;
export default adminSlice.reducer;
