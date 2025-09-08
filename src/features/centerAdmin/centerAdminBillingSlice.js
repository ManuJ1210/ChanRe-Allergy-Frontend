import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCenterBillingData,
  fetchCenterBillingReports,
  verifyCenterPayment,
  downloadCenterInvoice
} from './centerAdminBillingThunks';

const initialState = {
  // Billing data
  billingData: [],
  filteredBillingData: [],
  
  // Reports data
  reportsData: null,
  
  // Statistics
  billingStats: {
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    paymentReceivedBills: 0,
    paymentReceivedAmount: 0
  },
  
  // Loading states
  loading: false,
  reportsLoading: false,
  actionLoading: false,
  
  // Error states
  error: null,
  reportsError: null,
  actionError: null,
  
  // Success states
  success: false,
  actionSuccess: false,
  
  // Filters
  filters: {
    searchTerm: '',
    statusFilter: 'all',
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

const centerAdminBillingSlice = createSlice({
  name: 'centerAdminBilling',
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
      state.reportsError = null;
      state.actionError = null;
    },
    
    // Clear reports data
    clearReportsData: (state) => {
      state.reportsData = null;
      state.reportsError = null;
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
          item.testType?.toLowerCase().includes(searchTerm) ||
          item.billing?.invoiceNumber?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Status filter
      if (state.filters.statusFilter !== 'all') {
        filtered = filtered.filter(item => item.billing?.status === state.filters.statusFilter);
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
      // Fetch center billing data
      .addCase(fetchCenterBillingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCenterBillingData.fulfilled, (state, action) => {
        state.loading = false;
        state.billingData = action.payload.billingRequests || action.payload || [];
        state.success = true;
        // Apply filters to new data
        centerAdminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchCenterBillingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.billingData = [];
      })
      
      // Fetch center billing reports
      .addCase(fetchCenterBillingReports.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
        state.reportsData = null; // Clear old data when starting new fetch
      })
      .addCase(fetchCenterBillingReports.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.reportsData = action.payload;
        state.billingStats = action.payload.stats || state.billingStats;
      })
      .addCase(fetchCenterBillingReports.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      // Verify center payment
      .addCase(verifyCenterPayment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(verifyCenterPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update the billing item in the list
        const index = state.billingData.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.billingData[index] = { ...state.billingData[index], ...action.payload };
        }
        centerAdminBillingSlice.caseReducers.applyFilters(state);
      })
      .addCase(verifyCenterPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })
      
      // Download center invoice
      .addCase(downloadCenterInvoice.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(downloadCenterInvoice.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = true;
      })
      .addCase(downloadCenterInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
});

export const {
  resetBillingState,
  clearBillingError,
  clearReportsData,
  updateFilters,
  resetFilters,
  setSelectedBilling,
  toggleBillingModal,
  updatePagination,
  applyFilters
} = centerAdminBillingSlice.actions;

export default centerAdminBillingSlice.reducer;
