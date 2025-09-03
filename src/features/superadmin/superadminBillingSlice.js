import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllBillingData,
  fetchBillingDataByCenter,
  fetchBillingDataByStatus,
  fetchBillingDataByDateRange,
  fetchBillingStats,
  updateBillingStatus,
  generateInvoice,
  downloadInvoice,
  verifyPayment,
  exportBillingData
} from './superadminBillingThunks';

const initialState = {
  // Billing data
  billingData: [],
  filteredBillingData: [],
  
  // Centers for filtering
  centers: [],
  
  // Statistics
  billingStats: {
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  },
  
  // Loading states
  loading: false,
  statsLoading: false,
  centersLoading: false,
  actionLoading: false,
  
  // Error states
  error: null,
  statsError: null,
  centersError: null,
  actionError: null,
  
  // Success states
  success: false,
  actionSuccess: false,
  
  // Filters
  filters: {
    searchTerm: '',
    statusFilter: 'all',
    centerFilter: 'all',
    dateFilter: 'all',
    startDate: null,
    endDate: null
  },
  
  // Selected billing for modal
  selectedBilling: null,
  showBillingModal: false,
  
  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0
  }
};

const superadminBillingSlice = createSlice({
  name: 'superadminBilling',
  initialState,
  reducers: {
    // Reset states
    resetBillingState: (state) => {
      state.success = false;
      state.actionSuccess = false;
      state.error = null;
      state.actionError = null;
    },
    
    // Clear errors
    clearBillingError: (state) => {
      state.error = null;
      state.statsError = null;
      state.centersError = null;
      state.actionError = null;
    },
    
    // Update filters
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Set selected billing
    setSelectedBilling: (state, action) => {
      state.selectedBilling = action.payload;
    },
    
    // Toggle billing modal
    toggleBillingModal: (state, action) => {
      state.showBillingModal = action.payload;
    },
    
    // Update pagination
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Apply client-side filtering
    applyFilters: (state) => {
      let filtered = state.billingData;
      
      // Search filter
      if (state.filters.searchTerm) {
        const searchTerm = state.filters.searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
          item.patientName?.toLowerCase().includes(searchTerm) ||
          item.doctorName?.toLowerCase().includes(searchTerm) ||
          item.centerName?.toLowerCase().includes(searchTerm) ||
          item.testType?.toLowerCase().includes(searchTerm) ||
          item.billing?.invoiceNumber?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Status filter
      if (state.filters.statusFilter !== 'all') {
        filtered = filtered.filter(item => item.billing?.status === state.filters.statusFilter);
      }
      
      // Center filter
      if (state.filters.centerFilter !== 'all') {
        filtered = filtered.filter(item => item.centerId === state.filters.centerFilter);
      }
      
      // Date filter
      if (state.filters.dateFilter !== 'all') {
        const today = new Date();
        const filterDate = new Date();
        
        switch (state.filters.dateFilter) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt);
              return itemDate >= filterDate;
            });
            break;
          case 'week':
            filterDate.setDate(today.getDate() - 7);
            filtered = filtered.filter(item => {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt);
              return itemDate >= filterDate;
            });
            break;
          case 'month':
            filterDate.setMonth(today.getMonth() - 1);
            filtered = filtered.filter(item => {
              const itemDate = new Date(item.billing?.generatedAt || item.createdAt);
              return itemDate >= filterDate;
            });
            break;
          default:
            break;
        }
      }
      
      state.filteredBillingData = filtered;
      state.pagination.totalItems = filtered.length;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all billing data
      .addCase(fetchAllBillingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBillingData.fulfilled, (state, action) => {
        state.loading = false;
        state.billingData = action.payload.billingRequests || action.payload || [];
        state.success = true;
        // Apply filters to new data
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchAllBillingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.billingData = [];
      })
      
      // Fetch billing data by center
      .addCase(fetchBillingDataByCenter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingDataByCenter.fulfilled, (state, action) => {
        state.loading = false;
        state.billingData = action.payload.billingRequests || action.payload || [];
        state.success = true;
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchBillingDataByCenter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.billingData = [];
      })
      
      // Fetch billing data by status
      .addCase(fetchBillingDataByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingDataByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.billingData = action.payload.billingRequests || action.payload || [];
        state.success = true;
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchBillingDataByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.billingData = [];
      })
      
      // Fetch billing data by date range
      .addCase(fetchBillingDataByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingDataByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.billingData = action.payload.billingRequests || action.payload || [];
        state.success = true;
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchBillingDataByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.billingData = [];
      })
      
      // Fetch billing stats
      .addCase(fetchBillingStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchBillingStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.billingStats = action.payload;
      })
      .addCase(fetchBillingStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Update billing status
      .addCase(updateBillingStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateBillingStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update the billing item in the list
        const index = state.billingData.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.billingData[index] = { ...state.billingData[index], ...action.payload };
        }
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(updateBillingStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update the billing item in the list
        const index = state.billingData.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.billingData[index] = { ...state.billingData[index], ...action.payload };
        }
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // Download invoice
      .addCase(downloadInvoice.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(downloadInvoice.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = true;
      })
      .addCase(downloadInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update the billing item in the list
        const index = state.billingData.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.billingData[index] = { ...state.billingData[index], ...action.payload };
        }
        superadminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // Export billing data
      .addCase(exportBillingData.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(exportBillingData.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = true;
      })
      .addCase(exportBillingData.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
});

export const {
  resetBillingState,
  clearBillingError,
  updateFilters,
  resetFilters,
  setSelectedBilling,
  toggleBillingModal,
  updatePagination,
  applyFilters
} = superadminBillingSlice.actions;

export default superadminBillingSlice.reducer;
