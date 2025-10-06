import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart,
  User,
  Filter,
  FileText,
  DollarSign
} from 'lucide-react';

// Import Redux actions
import { fetchCenterBillingReports } from '../../features/centerAdmin/centerAdminBillingThunks';
import { clearBillingError, resetBillingState, clearReportsData } from '../../features/centerAdmin/centerAdminBillingSlice';

// Import chart components
import {
  DailyRevenueChart,
  MonthlyRevenueChart,
  DoctorPerformanceChart,
  PaymentStatusChart,
  RevenueSummaryCards
} from '../../components/BillingCharts';

const CenterAdminBillingReports = () => {
  const dispatch = useDispatch();

  // Helper function to get partial payment data from localStorage (same as Superadmin)
  const getPartialPaymentData = (requestId) => {
    try {
      const paymentKey = `partial_payment_${requestId}`;
      const payments = JSON.parse(localStorage.getItem(paymentKey) || '[]');
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        payments: payments,
        totalPaid: totalPaid,
        paymentCount: payments.length
      };
    } catch (error) {
      return { payments: [], totalPaid: 0, paymentCount: 0 };
    }
  };
  
  // Redux selectors
  const { user } = useSelector(state => state.auth);
  const {
    reportsData,
    reportsLoading,
    reportsError,
    actionSuccess
  } = useSelector(state => state.centerAdminBilling);

  // Local state
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  
  // Pagination state
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentPartialPage, setCurrentPartialPage] = useState(1);
  const [transactionRecordsPerPage, setTransactionRecordsPerPage] = useState(4);
  const [partialRecordsPerPage, setPartialRecordsPerPage] = useState(4);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch initial data with default period (monthly)
    const params = {
      period: selectedPeriod,
      startDate: null,
      endDate: null
    };
    dispatch(fetchCenterBillingReports(params));
  }, [dispatch]);

  // Handle success messages
  useEffect(() => {
    if (actionSuccess) {
      toast.success('Reports updated successfully');
      dispatch(resetBillingState());
    }
  }, [actionSuccess, dispatch]);

  // Handle error messages
  useEffect(() => {
    if (reportsError) {
      toast.error(reportsError);
      dispatch(clearBillingError());
    }
  }, [reportsError, dispatch]);

  // Fetch reports based on current filters
  const fetchReports = () => {
    try {
      if (showCustomRange) {
        // For custom range, validate dates first
        if (!customDateRange.startDate || !customDateRange.endDate) {
          toast.error('Please select both start and end dates for custom range');
          return;
        }
        
        const startDate = new Date(customDateRange.startDate);
        const endDate = new Date(customDateRange.endDate);
        
        if (startDate > endDate) {
          toast.error('Start date cannot be after end date');
          return;
        }
        
        // Check if date range is too large (more than 2 years)
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (daysDiff > 730) {
          toast.error('Date range cannot exceed 2 years. Please select a smaller range.');
          return;
        }
      }
      
      const params = {
        period: showCustomRange ? null : selectedPeriod,
        startDate: showCustomRange ? customDateRange.startDate : null,
        endDate: showCustomRange ? customDateRange.endDate : null
      };

      dispatch(fetchCenterBillingReports(params));
    } catch (error) {
      toast.error('Failed to fetch reports. Please try again.');
    }
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setShowCustomRange(period === 'custom');
    // Clear previous data when changing periods
    dispatch(clearReportsData());
    
    // Immediately fetch data for non-custom periods
    if (period !== 'custom') {
      try {
        const params = {
          period: period,
          startDate: null,
          endDate: null
        };
        dispatch(fetchCenterBillingReports(params));
      } catch (error) {
        toast.error('Failed to fetch reports. Please try again.');
      }
    }
  };

  // Handle custom date range
  const handleCustomDateRange = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    // Validate date range
    const startDate = new Date(customDateRange.startDate);
    const endDate = new Date(customDateRange.endDate);
    
    if (startDate > endDate) {
      toast.error('Start date cannot be after end date');
      return;
    }
    
    // Check if date range is too large (more than 2 years)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 730) {
      toast.error('Date range cannot exceed 2 years. Please select a smaller range.');
      return;
    }
    
    try {
      // Clear previous data and fetch with custom dates
      dispatch(clearReportsData());
      const params = {
        period: null,
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      };
      dispatch(fetchCenterBillingReports(params));
    } catch (error) {
      toast.error('Failed to fetch reports for the selected date range. Please try again.');
    }
  };

  // Pagination functions
  const getTotalTransactionPages = () => {
    return Math.ceil((reportsData?.billingData?.length || 0) / transactionRecordsPerPage);
  };

  const getTotalPartialPages = () => {
    return Math.ceil((reportsData?.billingData?.length || 0) / partialRecordsPerPage);
  };

  const getCurrentTransactionData = () => {
    if (!reportsData?.billingData) return [];
    const startIndex = (currentTransactionPage - 1) * transactionRecordsPerPage;
    const endIndex = startIndex + transactionRecordsPerPage;
    return reportsData.billingData.slice(startIndex, endIndex);
  };

  const getCurrentPartialData = (partialBills) => {
    if (!partialBills) return [];
    const startIndex = (currentPartialPage - 1) * partialRecordsPerPage;
    const endIndex = startIndex + partialRecordsPerPage;
    return partialBills.slice(startIndex, endIndex);
  };

  const handleTransactionPageChange = (page) => {
    setCurrentTransactionPage(page);
  };

  const handlePartialPageChange = (page) => {
    setCurrentPartialPage(page);
  };

  const handleTransactionRecordsPerPageChange = (value) => {
    setTransactionRecordsPerPage(parseInt(value));
    setCurrentTransactionPage(1); // Reset to first page
  };

  const handlePartialRecordsPerPageChange = (value) => {
    setPartialRecordsPerPage(parseInt(value));
    setCurrentPartialPage(1); // Reset to first page
  };

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentTransactionPage(1);
    setCurrentPartialPage(1);
  }, [reportsData]);

  // Export reports
  const handleExportReports = () => {
    if (!reportsData) {
      toast.error('No data to export');
      return;
    }

    const csvData = reportsData.billingData.map(item => ({
      'Invoice Number': item.billing?.invoiceNumber || '',
      'Patient Name': item.patientName || '',
      'Test Type': item.testType || '',
      'Doctor': item.doctorName || '',
      'Amount': item.billing?.amount || 0,
      'Status': item.billing?.status || '',
      'Generated Date': item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : '',
      'Paid Date': item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleDateString() : ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `center-billing-reports-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Reports exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="mb-10">
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-md md:text-md font-bold text-white mb-3 tracking-tight">
                      Center Analytics
                    </h1>
                    <p className="text-sm md:text-md text-blue-100 mb-4 font-light">
                      Comprehensive billing insights for your medical center
                    </p>
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-100">
                          Center-Specific Data
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-100">
                          Real-time Analytics
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-100">
                          Performance Insights
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-md md:text-md font-bold text-white mb-2">
                      {reportsData ? `₹${reportsData.stats?.totalAmount?.toLocaleString() || '0'}` : '₹0'}
                    </div>
                    <div className="text-blue-100 text-xs font-medium mb-2">Center Revenue</div>
                    <div className="text-xs text-blue-200 bg-white/10 rounded-lg px-3 py-1 inline-block">
                      {selectedPeriod === 'custom' 
                        ? `${customDateRange.startDate} to ${customDateRange.endDate}` 
                        : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Filters Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-md md:text-md font-bold text-gray-900 mb-2">Analytics Controls</h3>
                <p className="text-gray-600 font-medium">Configure your center's financial reporting parameters</p>
                {/* Current Filter Status */}
                <div className="flex items-center mt-3 space-x-3">
                  <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-blue-800">
                      {selectedPeriod === 'custom' ? 'Custom Range' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchReports}
                disabled={reportsLoading}
                className="group px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-900 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <RefreshCw className={`w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500 ${reportsLoading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{reportsLoading ? 'Processing...' : 'Refresh Data'}</span>
              </button>
              <button
                onClick={handleExportReports}
                disabled={!reportsData || reportsLoading}
                className="group px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">Export Data</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Period Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base md:text-sm font-bold text-gray-900">Time Period</h4>
                  <p className="text-xs text-gray-600">Select analysis timeframe</p>
                </div>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                disabled={reportsLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-900 font-medium transition-all duration-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="daily">Today</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="yearly">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {showCustomRange && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-sm font-bold text-gray-900">Start Date</h4>
                      <p className="text-xs text-gray-600">Select start date</p>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    disabled={reportsLoading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-sm font-bold text-gray-900">End Date</h4>
                      <p className="text-xs text-gray-600">Select end date</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      disabled={reportsLoading}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleCustomDateRange}
                      disabled={reportsLoading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {reportsLoading ? 'Loading...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Professional Loading State */}
        {reportsLoading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100"></div>
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-md md:text-md font-bold text-gray-900 mb-3">Processing Analytics</h3>
              <p className="text-gray-600 mb-6 text-base md:text-sm">Generating comprehensive financial insights...</p>
              <div className="flex items-center space-x-4 text-blue-600">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Analyzing Data</span>
                </div>
                <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Calculating Metrics</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Content */}
        {!reportsLoading && reportsData && (
          <>
           
           

           
         

           
            {/* Professional Billing Data Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-10 overflow-hidden">
              <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-md md:text-md font-bold text-gray-900 mb-2">Transaction Records</h3>
                      <p className="text-gray-600 font-medium">Complete billing history with detailed analytics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-md md:text-md font-bold text-blue-600 mb-1">{reportsData.billingData?.length || 0}</div>
                      <div className="text-xs font-semibold text-gray-600">Total Records</div>
                    </div>
                    <button
                      onClick={handleExportReports}
                      className="group px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">Export Data</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice Details</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient Information</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Medical Center</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Doctor</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Test Type</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Status</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Generated Date</th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {getCurrentTransactionData().map((item, index) => {
                      const globalIndex = (currentTransactionPage - 1) * transactionRecordsPerPage + index;
                      return (
                      <tr key={item._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">
                                {item.billing?.invoiceNumber || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">#{globalIndex + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                              <User className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.patientName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-medium">{item.patient?.phone || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.centerName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-medium">{item.centerCode || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.doctorName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-medium">{item.doctor?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full border border-purple-300">
                            {item.testType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-right">
                            <div className="text-base md:text-sm font-bold text-gray-900">₹{item.billing?.amount?.toLocaleString() || '0'}</div>
                            <div className="text-xs text-gray-500 font-medium">Amount</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {(() => {
                            // Calculate actual payment status based on amounts (same logic as main Billing page)
                            const partialData = getPartialPaymentData(item._id);
                            const totalPaidFromStorage = partialData.totalPaid;
                            const backendPaidAmount = item.billing?.paidAmount || 0;
                            const totalAmount = item.billing?.amount || 0;
                            const status = item.billing?.status;
                            
                            // Check if bill is fully paid by status
                            const isFullyPaidByStatus = status === 'paid' || status === 'verified';
                            
                            // Calculate actual paid amount - prioritize localStorage data over backend status
                            let actualPaidAmount;
                            if (totalPaidFromStorage > 0) {
                              // If there are partial payments in localStorage, use that amount
                              actualPaidAmount = totalPaidFromStorage;
                            } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                              // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
                              actualPaidAmount = totalAmount;
                            } else {
                              // Use backend amount as fallback
                              actualPaidAmount = backendPaidAmount;
                            }
                            
                            // Check if this bill was paid in multiple installments
                            const hasMultiplePayments = partialData.paymentCount > 1;
                            
                            // Check for cancelled or refunded status first - these take priority
                            if (status === 'cancelled') {
                              return (
                                <span className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300">
                                  Bill Cancelled
                                </span>
                              );
                            } else if (status === 'refunded') {
                              return (
                                <span className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300">
                                  Bill Refunded
                                </span>
                              );
                            }
                            
                            // Determine payment status
                            if (totalAmount > 0) {
                              if (actualPaidAmount >= totalAmount) {
                                if (hasMultiplePayments) {
                                  return (
                                    <span className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                                      Partially Fully Paid
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                                      Fully Paid
                                    </span>
                                  );
                                }
                              } else if (actualPaidAmount > 0) {
                                return (
                                  <span className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                                    Partially Paid
                                  </span>
                                );
                              }
                            }
                            
                            // Fallback to original status logic
                            return (
                              <span className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border ${
                                status === 'paid' || status === 'verified'
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                  : status === 'generated'
                                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                  : status === 'cancelled'
                                  ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                  : status === 'refunded'
                                  ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300'
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
                              }`}>
                                {status === 'paid' || status === 'verified' ? (
                                  <>Paid</>
                                ) : status === 'generated' ? (
                                  <>Generated</>
                                ) : status === 'cancelled' ? (
                                  <>Bill Cancelled</>
                                ) : status === 'refunded' ? (
                                  <>Bill Refunded</>
                                ) : (
                                  'Generated'
                                )}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-xs font-semibold text-gray-900">
                            {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleTimeString() : ''}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-xs font-semibold text-gray-900">
                            {item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleTimeString() : ''}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentTransactionPage - 1) * transactionRecordsPerPage) + 1} to {Math.min(currentTransactionPage * transactionRecordsPerPage, reportsData.billingData?.length || 0)} of {reportsData.billingData?.length || 0} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={transactionRecordsPerPage}
                        onChange={(e) => handleTransactionRecordsPerPageChange(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Page {currentTransactionPage} of {getTotalTransactionPages()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTransactionPageChange(currentTransactionPage - 1)}
                        disabled={currentTransactionPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-300"
                      >
                        Previous
                      </button>
                      
                      <button
                        onClick={() => handleTransactionPageChange(currentTransactionPage)}
                        className="px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg"
                      >
                        {currentTransactionPage}
                      </button>
                      
                      <button
                        onClick={() => handleTransactionPageChange(currentTransactionPage + 1)}
                        disabled={currentTransactionPage === getTotalTransactionPages()}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Partial Payment History Section */}
            {reportsData.billingData && reportsData.billingData.length > 0 && (
              <div className="mb-8">
                {(() => {
                  // Calculate partial payments count
                  const localStoragePartialCount = reportsData.billingData?.filter(item => {
                    const partialData = getPartialPaymentData(item._id);
                    const totalAmount = item.billing?.amount || 0;
                    const backendPaidAmount = item.billing?.paidAmount || 0;
                    const status = item.billing?.status;
                    
                    const actualPaidAmount = partialData.totalPaid > 0 ? partialData.totalPaid : backendPaidAmount;
                    
                    return actualPaidAmount > 0 && 
                           (actualPaidAmount < totalAmount || partialData.totalPaid > 0);
                  }).length || 0;

                  // If no localStorage partial payments, check for status-based partial payments
                  const statusBasedPartialCount = reportsData.billingData?.filter(item => {
                    const status = item.billing?.status;
                    const paidAmount = item.billing?.paidAmount || 0;
                    const totalAmount = item.billing?.amount || 0;
                    
                    return (status === 'payment_received' || 
                            status === 'generated' || 
                            status === 'paid' ||
                            status === 'verified' ||
                            (paidAmount > 0 && paidAmount < totalAmount));
                  }).length || 0;

                  // Use the higher count
                  const finalCount = Math.max(localStoragePartialCount, statusBasedPartialCount);

                  // Get all partial payment keys from localStorage
                  const partialPaymentKeys = Object.keys(localStorage).filter(key => key.startsWith('partial_payment_'));
                  

                  // Get enhanced billing data with partial payment information (same as Superadmin)
                  const enhancedBillingData = reportsData.billingData?.map(item => {
                    const partialData = getPartialPaymentData(item._id);
                    const backendPaidAmount = item.billing?.paidAmount || 0;
                    const actualPaidAmount = partialData.totalPaid > 0 ? partialData.totalPaid : backendPaidAmount;
                    
                    return {
                      ...item,
                      billing: {
                        ...item.billing,
                        paidAmount: actualPaidAmount,
                        partialPayments: partialData.payments || []
                      }
                    };
                  }) || [];

                  // Filter for bills with partial payment history (same as Superadmin)
                  let partialBills = enhancedBillingData.filter(item => {
                    const partialData = getPartialPaymentData(item._id);
                    const totalAmount = item.billing?.amount || 0;
                    const backendPaidAmount = item.billing?.paidAmount || 0;
                    const totalPaidFromStorage = partialData.totalPaid;
                    
                    
                    // Check if bill is fully paid by status
                    const isFullyPaidByStatus = item.billing?.status === 'paid' || 
                                              item.billing?.status === 'verified';
                    
                    // Calculate actual paid amount - prioritize localStorage data over backend status
                    let actualPaidAmount;
                    if (totalPaidFromStorage > 0) {
                      // If there are partial payments in localStorage, use that amount
                      actualPaidAmount = totalPaidFromStorage;
                    } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                      // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
                      actualPaidAmount = totalAmount;
                    } else {
                      // Use backend amount as fallback
                      actualPaidAmount = backendPaidAmount;
                    }
                    
                    // Show bills that have partial payments OR were paid in multiple installments
                    // This includes both outstanding partial payments AND fully paid bills that were paid in multiple installments
                    // But exclude cancelled/refunded bills
                    const shouldInclude = (partialData.paymentCount > 1 || (actualPaidAmount > 0 && actualPaidAmount < totalAmount)) && 
                                         totalAmount > 0 && 
                                         item.billing?.status !== 'cancelled' && 
                                         item.billing?.status !== 'refunded';
                    
                    return shouldInclude;
                  });


                  // If no partial bills found in localStorage, try a different approach
                  // Check if there are bills with status that might indicate partial payment
                  const statusBasedPartial = reportsData.billingData?.filter(item => {
                    const status = item.billing?.status;
                    const paidAmount = item.billing?.paidAmount || 0;
                    const totalAmount = item.billing?.amount || 0;
                    
                    
                    // Show bills that have partial payments OR were paid in multiple installments
                    // This includes both outstanding partial payments AND fully paid bills that were paid in multiple installments
                    // But exclude cancelled/refunded bills
                    return (status === 'payment_received' || 
                            status === 'generated' || 
                            status === 'paid' ||
                            status === 'verified') &&
                           status !== 'cancelled' &&
                           status !== 'refunded' &&
                           paidAmount > 0 && 
                           totalAmount > 0;
                  }) || [];


                  // Use status-based partial bills if localStorage doesn't have any
                  const finalPartialBills = partialBills.length > 0 ? partialBills : statusBasedPartial;

                  // Enhance the partial bills with localStorage data
                  const enhancedPartialBills = finalPartialBills.map(item => {
                    const partialData = getPartialPaymentData(item._id);
                    const totalAmount = item.billing?.amount || 0;
                    const backendPaidAmount = item.billing?.paidAmount || 0;
                    const totalPaidFromStorage = partialData.totalPaid;
                    
                    // Check if bill is fully paid by status
                    const isFullyPaidByStatus = item.billing?.status === 'paid' || 
                                              item.billing?.status === 'verified';
                    
                    // Calculate actual paid amount - prioritize localStorage data over backend status
                    let actualPaidAmount;
                    if (totalPaidFromStorage > 0) {
                      // If there are partial payments in localStorage, use that amount
                      actualPaidAmount = totalPaidFromStorage;
                    } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                      // Only if no localStorage payments and status is paid with 0 backend amount, assume full payment
                      actualPaidAmount = totalAmount;
                    } else {
                      // Use backend amount as fallback
                      actualPaidAmount = backendPaidAmount;
                    }
                    
                    return {
                      ...item,
                      billing: {
                        ...item.billing,
                        paidAmount: actualPaidAmount,
                        partialPayments: partialData.payments,
                        remainingAmount: totalAmount - actualPaidAmount
                      }
                    };
                  });
                  

                  return enhancedPartialBills.length > 0 ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                      <div className="flex items-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg mr-6">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">Partial Payment History</h3>
                          <p className="text-sm text-slate-600">Patients who made multiple payments - includes both outstanding and fully paid bills</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {getCurrentPartialData(enhancedPartialBills).map((item, index) => {
                          const globalIndex = (currentPartialPage - 1) * partialRecordsPerPage + index;
                          const paidAmount = item.billing?.paidAmount || 0;
                          const totalAmount = item.billing?.amount || 0;
                          const remainingAmount = item.billing?.remainingAmount || (totalAmount - paidAmount);
                          const paymentPercentage = Math.round((paidAmount / totalAmount) * 100);
                          const partialPayments = item.billing?.partialPayments || [];
                          const isFullyPaid = remainingAmount <= 0;
                          const hasMultiplePayments = partialPayments.length > 1;
                          
                          return (
                            <div key={item._id} className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="p-1.5 bg-slate-100 rounded-md">
                                    <FileText className="w-3 h-3 text-slate-600" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-gray-900">
                                      {item.billing?.invoiceNumber || `Bill #${globalIndex + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-600">{item.patientName || 'N/A'}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-xs font-bold ${isFullyPaid ? 'text-emerald-600' : 'text-slate-600'}`}>
                                    {isFullyPaid && hasMultiplePayments ? 'Partially Fully Paid' : 
                                     isFullyPaid ? '100% Paid' : 
                                     `${paymentPercentage}% Paid`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.centerName || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                <div className="text-center p-1.5 bg-slate-50 rounded-md">
                                  <div className="text-xs font-bold text-slate-600">₹{totalAmount.toLocaleString()}</div>
                                  <div className="text-xs text-slate-700">Total</div>
                                </div>
                                <div className="text-center p-1.5 bg-emerald-50 rounded-md">
                                  <div className="text-xs font-bold text-emerald-600">₹{paidAmount.toLocaleString()}</div>
                                  <div className="text-xs text-emerald-700">Paid</div>
                                </div>
                                <div className="text-center p-1.5 bg-amber-50 rounded-md">
                                  <div className="text-xs font-bold text-amber-600">₹{remainingAmount.toLocaleString()}</div>
                                  <div className="text-xs text-amber-700">
                                    {isFullyPaid && hasMultiplePayments ? 'Partially Fully Paid' : 
                                     isFullyPaid ? 'Complete' : 
                                     'Remaining'}
                                  </div>
                                </div>
                              </div>

                              {/* Payment Timeline */}
                              {partialPayments.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Payment Timeline:</div>
                                  <div className="space-y-1">
                                    {partialPayments.map((payment, paymentIndex) => (
                                      <div key={paymentIndex} className="flex items-center justify-between bg-slate-50 rounded-md p-1.5">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-600">{paymentIndex + 1}</span>
                                          </div>
                                          <div>
                                            <div className="text-xs font-bold text-gray-900">₹{payment.amount?.toLocaleString()}</div>
                                            <div className="text-xs text-gray-600">
                                              {payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : 'N/A'} at{' '}
                                              {payment.timestamp ? new Date(payment.timestamp).toLocaleTimeString() : 'N/A'}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          #{paymentIndex + 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Fallback for bills without detailed payment history */}
                              {partialPayments.length === 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Payment Info:</div>
                                  <div className="bg-slate-50 rounded-md p-1.5">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-xs font-bold text-gray-900">First Payment</div>
                                        <div className="text-xs text-gray-600">
                                          {item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleDateString() : 'N/A'} at{' '}
                                          {item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleTimeString() : 'N/A'}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {isFullyPaid ? 'Completed' : 'Partial'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                                <div className="flex items-center space-x-3">
                                  <span>
                                    <strong>Generated:</strong> {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                                  </span>
                                  <span>
                                    <strong>Status:</strong> {item.billing?.status || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${isFullyPaid ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                                  <span className={`font-semibold text-xs ${isFullyPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {isFullyPaid && hasMultiplePayments ? 'Partially Fully Paid' : 
                                     isFullyPaid ? 'Fully Paid' : 
                                     'Outstanding'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      
                        {/* Pagination Controls for Partial Payment History */}
                        <div className="pt-4 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-slate-600">
                                Showing {((currentPartialPage - 1) * partialRecordsPerPage) + 1} to {Math.min(currentPartialPage * partialRecordsPerPage, enhancedPartialBills.length)} of {enhancedPartialBills.length} results
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-600">Show:</span>
                                <select
                                  value={partialRecordsPerPage}
                                  onChange={(e) => handlePartialRecordsPerPageChange(e.target.value)}
                                  className="px-3 py-1 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                >
                                  <option value={4}>4</option>
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                </select>
                                <span className="text-sm text-slate-600">per page</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-slate-600">
                                Page {currentPartialPage} of {Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handlePartialPageChange(currentPartialPage - 1)}
                                  disabled={currentPartialPage === 1}
                                  className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                >
                                  Previous
                                </button>
                                
                                <button
                                  onClick={() => handlePartialPageChange(currentPartialPage)}
                                  className="px-3 py-2 text-sm font-medium bg-slate-600 text-white rounded-lg"
                                >
                                  {currentPartialPage}
                                </button>
                                
                                <button
                                  onClick={() => handlePartialPageChange(currentPartialPage + 1)}
                                  disabled={currentPartialPage === Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                                  className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {enhancedPartialBills.length === 0 && (
                          <div className="text-center py-8">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-gray-600 font-medium">No partial payments found for the selected period</p>
                              <p className="text-sm text-gray-500 mt-2">All patients paid in full or haven't made any payments yet</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                      <div className="flex items-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-lg mr-6">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-700 mb-1">Partial Payment History</h3>
                          <p className="text-sm text-gray-600">No partial payments found for the selected period</p>
                        </div>
                      </div>
                      <div className="text-center py-8">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <DollarSign className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-600 font-medium">All patients have either paid in full or haven't made any payments yet</p>
                        <p className="text-sm text-gray-500 mt-2">No partial payment records available</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Professional Report Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-10">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg mr-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-md md:text-md font-bold text-gray-900 mb-2">Center Performance Summary</h3>
                  <p className="text-base md:text-sm text-gray-600 font-medium">Comprehensive analytics and key performance indicators</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
                {(() => {
                  // Calculate accurate counts from the actual billing data
                  const getPartialPaymentData = (requestId) => {
                    const paymentKey = `partial_payment_${requestId}`;
                    const payments = JSON.parse(localStorage.getItem(paymentKey) || '[]');
                    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
                    
                    return {
                      payments: payments,
                      totalPaid: totalPaid,
                      paymentCount: payments.length
                    };
                  };

                  // Use Set to track unique bills to avoid double counting
                  const uniqueBills = new Set();
                  let totalBills = 0;
                  let paidBills = 0;
                  let pendingBills = 0;
                  let partialBills = 0;
                  let totalRevenue = 0;

                  reportsData.billingData?.forEach(item => {
                    // Only count each bill once (by _id)
                    if (!uniqueBills.has(item._id)) {
                      uniqueBills.add(item._id);
                      totalBills += 1;
                      
                      const amount = item.billing?.amount || 0;
                      totalRevenue += amount;
                      
                      const partialData = getPartialPaymentData(item._id);
                      const totalPaidFromStorage = partialData.totalPaid;
                      const backendPaidAmount = item.billing?.paidAmount || 0;
                      const status = item.billing?.status;
                      
                      // Check if bill is fully paid by status
                      const isFullyPaidByStatus = status === 'paid' || status === 'verified';
                      
                      // Calculate actual paid amount - prioritize localStorage data over backend status
                      let actualPaidAmount;
                      if (totalPaidFromStorage > 0) {
                        actualPaidAmount = totalPaidFromStorage;
                      } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                        actualPaidAmount = amount;
                      } else {
                        actualPaidAmount = backendPaidAmount;
                      }
                      
                      // Categorize bills - check for cancelled/refunded first
                      if (status === 'cancelled' || status === 'refunded') {
                        // Don't count cancelled/refunded bills in regular statistics
                        // They should be handled separately if needed
                      } else if (actualPaidAmount >= amount && amount > 0) {
                        paidBills += 1;
                      } else if (actualPaidAmount > 0 && actualPaidAmount < amount) {
                        pendingBills += 1;
                        partialBills += 1;
                      } else if (status === 'generated' || status === 'not_generated') {
                        pendingBills += 1;
                      }
                    }
                  });

                  return (
                    <>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-blue-600 mb-2">{totalBills}</div>
                        <div className="text-sm font-bold text-blue-800 mb-1">Total Bills</div>
                        <div className="text-xs text-blue-600 font-medium">Generated</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-emerald-600 mb-2">{paidBills}</div>
                        <div className="text-sm font-bold text-emerald-800 mb-1">Paid Bills</div>
                        <div className="text-xs text-emerald-600 font-medium">
                          {totalBills > 0 ? 
                            `${Math.round((paidBills / totalBills) * 100)}%` : 
                            '0%'
                          } Success
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-yellow-600 mb-2">{pendingBills}</div>
                        <div className="text-sm font-bold text-yellow-800 mb-1">Pending Bills</div>
                        <div className="text-xs text-yellow-600 font-medium">Awaiting Payment</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-purple-600 mb-2">₹{totalRevenue.toLocaleString()}</div>
                        <div className="text-sm font-bold text-purple-800 mb-1">Total Revenue</div>
                        <div className="text-xs text-purple-600 font-medium">Center Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-lg font-bold text-orange-600 mb-2">{partialBills}</div>
                        <div className="text-sm font-bold text-orange-800 mb-1">Partial Bills</div>
                        <div className="text-xs text-orange-600 font-medium">Partial Payments</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-gray-600 mr-2" />
                    <span className="text-base md:text-sm font-semibold text-gray-800">Report Period</span>
                  </div>
                  <div className="text-md md:text-md font-bold text-gray-900 mb-2">
                    {selectedPeriod === 'custom' 
                      ? `${customDateRange.startDate} to ${customDateRange.endDate}` 
                      : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                    }
                  </div>
                  <div className="text-xs text-gray-600 mt-2">Center-specific billing analytics</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Professional No Data State */}
        {!reportsLoading && !reportsData && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 shadow-lg">
                <Calendar className="w-20 h-20 text-gray-500" />
              </div>
              <h3 className="text-md md:text-md font-bold text-gray-900 mb-4">No Data Available</h3>
              <p className="text-gray-600 mb-8 max-w-lg text-base md:text-sm font-medium">
                No billing records found for the selected time period. 
                Try adjusting your filters or check back later for new data.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <button
                  onClick={fetchReports}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <RefreshCw className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-bold text-base md:text-sm">Refresh Data</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedPeriod('monthly');
                    setShowCustomRange(false);
                    setCustomDateRange({ startDate: '', endDate: '' });
                    dispatch(clearReportsData());
                    const params = {
                      period: 'monthly',
                      startDate: null,
                      endDate: null
                    };
                    dispatch(fetchCenterBillingReports(params));
                  }}
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Filter className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-bold text-base md:text-sm">Reset Filters</span>
                </button>
              </div>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-xs font-bold text-blue-800">Current Filter Settings</span>
                </div>
                <div className="text-blue-700 font-medium">
                  Period: {selectedPeriod === 'custom' ? 'Custom Range' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterAdminBillingReports;

