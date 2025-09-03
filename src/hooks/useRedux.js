// src/hooks/useRedux.js
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllBillingData,
  fetchBillingStats,
  updateBillingStatus,
  generateInvoice,
  downloadInvoice,
  verifyPayment,
  exportBillingData
} from '../features/superadmin/superadminBillingThunks';

import {
  updateFilters,
  resetFilters,
  setSelectedBilling,
  toggleBillingModal,
  clearBillingError,
  resetBillingState
} from '../features/superadmin/superadminBillingSlice';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hook to get user from either auth state
export const useAuth = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { userInfo } = useSelector((state) => state.user);
  
  // Return whichever user is available
  return authUser || userInfo;
};

// Custom hook for billing state management
export const useBilling = () => {
  const billingState = useSelector((state) => state.superadminBilling);
  const dispatch = useDispatch();
  
  return {
    ...billingState,
    dispatch
  };
};

// Custom hook for billing actions
export const useBillingActions = () => {
  const dispatch = useDispatch();
  
  return {
    fetchAllBillingData: () => dispatch(fetchAllBillingData()),
    fetchBillingStats: () => dispatch(fetchBillingStats()),
    updateBillingStatus: (data) => dispatch(updateBillingStatus(data)),
    generateInvoice: (id) => dispatch(generateInvoice(id)),
    downloadInvoice: (id) => dispatch(downloadInvoice(id)),
    verifyPayment: (data) => dispatch(verifyPayment(data)),
    exportBillingData: (data) => dispatch(exportBillingData(data)),
    updateFilters: (filters) => dispatch(updateFilters(filters)),
    resetFilters: () => dispatch(resetFilters()),
    setSelectedBilling: (billing) => dispatch(setSelectedBilling(billing)),
    toggleBillingModal: (show) => dispatch(toggleBillingModal(show)),
    clearBillingError: () => dispatch(clearBillingError()),
    resetBillingState: () => dispatch(resetBillingState())
  };
};
