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
  Building,
  Filter,
  Search,
  Eye,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Activity,
  Target,
  Award
} from 'lucide-react';

// Import Redux actions
import { fetchBillingReports } from '../../features/superadmin/superadminBillingThunks';
import { fetchCenters } from '../../features/superadmin/superadminThunks';
import { clearBillingError, resetBillingState, clearReportsData } from '../../features/superadmin/superadminBillingSlice';

// Import chart components
import {
  DailyRevenueChart,
  MonthlyRevenueChart,
  CenterPerformanceChart,
  PaymentStatusChart,
  RevenueSummaryCards
} from '../../components/BillingCharts';

const SuperadminBillingReports = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const { user } = useSelector(state => state.auth);
  const {
    reportsData,
    reportsLoading,
    reportsError,
    actionSuccess
  } = useSelector(state => state.superadminBilling);
  
  // Get centers from superadmin slice (same fix as Billing page)
  const { centers } = useSelector(state => state.superadmin);

  // Local state
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [isChangingCenter, setIsChangingCenter] = useState(false);
  
  // Pagination state
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentPartialPage, setCurrentPartialPage] = useState(1);
  const [transactionRecordsPerPage, setTransactionRecordsPerPage] = useState(4);
  const [partialRecordsPerPage, setPartialRecordsPerPage] = useState(4);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCenters());
    // Don't fetch reports immediately - wait for centers to load
  }, [dispatch]);


  // Handle success messages
  useEffect(() => {
    if (actionSuccess) {
      toast.success('Reports updated successfully');
      dispatch(resetBillingState());
    }
  }, [actionSuccess, dispatch]);

  // Reset center changing state when new data arrives
  useEffect(() => {
    if (reportsData) {
      setIsChangingCenter(false);
    }
  }, [reportsData]);

  // Fetch initial reports when centers are loaded
  useEffect(() => {
    if (centers && centers.length > 0 && !reportsData) {
      if (selectedCenter === 'all') {
        fetchReports();
      } else {
        fetchReportsForCenter(selectedCenter);
      }
    }
  }, [centers]);


  // Note: Center change is now handled directly in handleCenterChange function
  // to avoid duplicate API calls and ensure immediate data fetching

  // Handle error messages
  useEffect(() => {
    if (reportsError) {
      toast.error(reportsError);
      dispatch(clearBillingError());
    }
  }, [reportsError, dispatch]);

  // Fetch reports based on current filters
  const fetchReports = (overridePeriod = null) => {
    const periodToUse = overridePeriod || selectedPeriod;
    const params = {
      period: showCustomRange ? null : periodToUse,
      centerId: selectedCenter,
      startDate: showCustomRange ? customDateRange.startDate : null,
      endDate: showCustomRange ? customDateRange.endDate : null,
      // Add timestamp to prevent caching
      _t: Date.now()
    };

    dispatch(fetchBillingReports(params));
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setShowCustomRange(period === 'custom');
    // Clear previous data when changing periods
    dispatch(clearReportsData());
    // Force refresh immediately with the new period
    if (period !== 'custom') {
      console.log('🔄 Fetching with new period:', period);
      fetchReports(period);
    }
  };

  // Handle center change
  const handleCenterChange = (centerId) => {
    console.log('🏥 Center changed to:', centerId);
    console.log('🏥 Center name:', centers.find(c => c._id === centerId)?.centername || centers.find(c => c._id === centerId)?.name || 'All Centers');
    console.log('🏥 Center ID type:', typeof centerId);
    console.log('🏥 Center ID length:', centerId?.length);
    console.log('🏥 Previous center was:', selectedCenter);
    console.log('🏥 Center ID === "all":', centerId === 'all');
    console.log('🏥 Center ID !== "all":', centerId !== 'all');
    
    // Set loading state to prevent showing old data
    setIsChangingCenter(true);
    
    // Clear previous data immediately when changing centers
    dispatch(clearReportsData());
    
    // Update the selected center state
    setSelectedCenter(centerId);
    console.log('🏥 State updated to:', centerId);
    
    // Add a small delay to ensure state is updated and data is cleared
    setTimeout(() => {
      console.log('🔄 Fetching data for new center after delay:', centerId);
      console.log('🔄 Current selectedCenter state:', selectedCenter);
      console.log('🔄 About to call fetchReportsForCenter with centerId:', centerId);
      fetchReportsForCenter(centerId);
    }, 100);
  };

  // Fetch reports for specific center
  const fetchReportsForCenter = (centerId) => {
    const params = {
      period: showCustomRange ? null : selectedPeriod,
      centerId: centerId, // Use the passed centerId instead of state
      startDate: showCustomRange ? customDateRange.startDate : null,
      endDate: showCustomRange ? customDateRange.endDate : null,
      // Add timestamp and random number to prevent caching
      _t: Date.now(),
      _r: Math.random().toString(36).substr(2, 9) // Random string for cache busting
    };

    console.log('🔍 Fetching reports for center with params:', params);
    console.log('🔍 Center ID being used:', centerId);
    console.log('🔍 Center ID type:', typeof centerId);
    console.log('🔍 Center ID length:', centerId?.length);
    console.log('🔍 Period being used:', showCustomRange ? 'custom' : selectedPeriod);
    console.log('🔍 Center name:', centers.find(c => c._id === centerId)?.centername || centers.find(c => c._id === centerId)?.name || 'All Centers');
    console.log('🔍 API URL will be: /billing/reports?period=' + params.period + '&centerId=' + params.centerId + '&_t=' + params._t + '&_r=' + params._r);
    console.log('🔍 Current selectedCenter state:', selectedCenter);
    console.log('🔍 Are they different?', centerId !== selectedCenter);
    
    dispatch(fetchBillingReports(params));
  };

  // Handle custom date range
  const handleCustomDateRange = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    fetchReports();
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
      'Center': item.centerName || '',
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
    link.download = `billing-reports-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Reports exported successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Compact Header */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Financial Analytics
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Billing insights and revenue intelligence
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="text-base sm:text-lg font-bold text-blue-600 mb-1">
                    {reportsData ? `₹${reportsData.stats?.totalAmount?.toLocaleString() || '0'}` : '₹0'}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">Total Revenue</div>
                  <div className="text-xs text-blue-600 mt-1">
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

        {/* Compact Filters Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Filters</h3>
                <p className="text-xs sm:text-sm text-gray-600">Configure reporting parameters</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={fetchReports}
                disabled={reportsLoading}
                className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center text-xs sm:text-sm font-medium"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
                {reportsLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleExportReports}
                disabled={!reportsData || reportsLoading}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-xs sm:text-sm font-medium"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Time Period Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-md">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Time Period</h4>
                  <p className="text-xs text-gray-600">Select timeframe</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePeriodChange('daily')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span className="hidden sm:inline">Today</span>
                    <span className="sm:hidden">Today</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span className="hidden sm:inline">7 Days</span>
                    <span className="sm:hidden">7D</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <BarChart3 className="w-3 h-3" />
                    <span className="hidden sm:inline">30 Days</span>
                    <span className="sm:hidden">30D</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('yearly')}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="hidden sm:inline">1 Year</span>
                    <span className="sm:hidden">1Y</span>
                  </div>
                </button>
              </div>
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedPeriod === 'custom'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Custom Range</span>
                </div>
              </button>
            </div>

            {/* Center Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-md">
                  <Building className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Center Filter</h4>
                  <p className="text-xs text-gray-600">Select center</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedCenter}
                  onChange={(e) => {
                    console.log('🔍 Dropdown changed to:', e.target.value);
                    console.log('🔍 Selected option text:', e.target.options[e.target.selectedIndex].text);
                    handleCenterChange(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm text-gray-900 transition-colors"
                >
                  <option value="all">🏥 All Centers ({centers?.length || 0})</option>
                  {centers?.map(center => (
                    <option key={center._id} value={center._id}>
                      🏢 {center.centername || center.name} {center.centerCode && `(${center.centerCode})`}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCenter !== 'all' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-green-100 rounded-md">
                      <Building className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-green-800">
                        {centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}
                      </span>
                      <div className="text-xs text-green-600">Active filter</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Date Range */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">Custom Range</h4>
                  <p className="text-xs text-gray-600">Set specific date boundaries</p>
                </div>
              </div>
              {showCustomRange ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">End Date</label>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-gray-300 text-sm"
                      />
                      <button
                        onClick={handleCustomDateRange}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center">
                  <div className="p-3 sm:p-4 bg-purple-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2 text-sm sm:text-base">Custom Date Range</p>
                  <p className="text-xs text-gray-500">Select "Custom Range" to set specific dates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Loading State */}
        {(reportsLoading || isChangingCenter) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-6 sm:mb-8">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-100"></div>
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-sm sm:text-md font-bold text-gray-900 mb-3">Processing Analytics</h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Generating comprehensive financial insights...</p>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-blue-600">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  <span className="font-semibold text-sm sm:text-base">Analyzing Data</span>
                </div>
                <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse hidden sm:block"></div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  <span className="font-semibold text-sm sm:text-base">Calculating Metrics</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Content */}
        {!reportsLoading && !isChangingCenter && reportsData && (
          <>
            {/* Professional Data Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 mb-6 sm:mb-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-md font-bold text-gray-900 mb-2">Data Overview</h3>
                    <p className="text-gray-600 font-medium text-sm sm:text-base">
                      Analyzing <span className="font-bold text-emerald-600">{reportsData.billingData?.length || 0}</span> billing records
                      {selectedPeriod !== 'custom' && ` for the last ${selectedPeriod === 'daily' ? '24 hours' : selectedPeriod === 'weekly' ? '7 days' : selectedPeriod === 'monthly' ? '30 days' : '365 days'}`}
                      {selectedPeriod === 'custom' && ` from ${customDateRange.startDate} to ${customDateRange.endDate}`}
                      {selectedCenter !== 'all' && ` • Center: ${centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected'}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 sm:p-6 border border-emerald-200">
                    <div className="text-sm sm:text-md font-bold text-emerald-600 mb-1">₹{reportsData.stats?.totalAmount?.toLocaleString() || '0'}</div>
                    <div className="text-xs font-semibold text-emerald-700">Total Revenue</div>
                    <div className="text-xs text-emerald-600 mt-1">
                      {selectedCenter === 'all' 
                        ? 'All Centers Combined' 
                        : `Center: ${centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

           
          
           

            {/* Professional Billing Data Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-6 sm:mb-10 overflow-hidden">
              <div className="p-4 sm:p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-md font-bold text-gray-900 mb-2">Transaction Records</h3>
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">Complete billing history with detailed analytics</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="text-center">
                      <div className="text-sm sm:text-md font-bold text-blue-600 mb-1">{reportsData.billingData?.length || 0}</div>
                      <div className="text-xs font-semibold text-gray-600">Total Records</div>
                    </div>
                    <button
                      onClick={handleExportReports}
                      className="group px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold text-xs sm:text-sm">Export Data</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="space-y-4">
                  {getCurrentTransactionData().map((item, index) => {
                    const globalIndex = (currentTransactionPage - 1) * transactionRecordsPerPage + index;
                    return (
                      <div key={item._id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-3 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                        {/* Card Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {item.billing?.invoiceNumber || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">#{globalIndex + 1}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">₹{item.billing?.amount?.toLocaleString() || '0'}</div>
                            <div className="text-xs text-gray-500">Amount</div>
                          </div>
                        </div>

                        {/* Patient & Center Info */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-md">
                              <Users className="w-3 h-3 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900">{item.patientName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.patient?.phone || ''}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-br from-green-100 to-green-200 rounded-md">
                              <Building className="w-3 h-3 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900">{item.centerName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.centerCode || ''}</div>
                            </div>
                          </div>
                        </div>

                        {/* Doctor & Test Info */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md">
                              <Users className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900">{item.doctorName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.doctor?.email || ''}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full border border-purple-300">
                              {item.testType || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-white rounded-lg p-3 space-y-2">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Payment Status:</div>
                          {(() => {
                            // Simple function to get partial payment data from localStorage
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
                              actualPaidAmount = totalPaidFromStorage;
                            } else if (isFullyPaidByStatus && backendPaidAmount === 0) {
                              actualPaidAmount = totalAmount;
                            } else {
                              actualPaidAmount = backendPaidAmount;
                            }
                            
                            // Determine the actual payment status
                            let statusText = '';
                            let statusClass = '';
                            let statusIcon = null;
                            
                            // Check for cancelled or refunded status first - these take priority
                            if (item.billing?.status === 'cancelled') {
                              statusText = 'Bill Cancelled';
                              statusClass = 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
                              statusIcon = <AlertCircle className="w-3 h-3 mr-1" />;
                            } else if (item.billing?.status === 'refunded') {
                              statusText = 'Bill Refunded';
                              statusClass = 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300';
                              statusIcon = <DollarSign className="w-3 h-3 mr-1" />;
                            } else {
                              // Check if this bill was paid in multiple installments
                              const hasMultiplePayments = partialData.paymentCount > 1;
                              
                              if (actualPaidAmount >= totalAmount && totalAmount > 0) {
                                if (hasMultiplePayments) {
                                  statusText = 'Partially Fully Paid';
                                  statusClass = 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
                                  statusIcon = <CheckCircle className="w-3 h-3 mr-1" />;
                                } else {
                                  statusText = 'Fully Paid';
                                  statusClass = 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300';
                                  statusIcon = <CheckCircle className="w-3 h-3 mr-1" />;
                                }
                              } else if (actualPaidAmount > 0 && actualPaidAmount < totalAmount) {
                                statusText = 'Partially Paid';
                                statusClass = 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300';
                                statusIcon = <Clock className="w-3 h-3 mr-1" />;
                              } else {
                                statusText = item.billing?.status || 'Generated';
                                statusClass = 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
                                statusIcon = <Clock className="w-3 h-3 mr-1" />;
                              }
                            }

                            return (
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${statusClass}`}>
                                {statusIcon}{statusText}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                          <div>
                            <div className="font-semibold text-gray-900">Generated:</div>
                            <div>{item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}</div>
                            <div>{item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleTimeString() : ''}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Payment:</div>
                            <div>{item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleDateString() : 'N/A'}</div>
                            <div>{item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleTimeString() : ''}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
                    <tr>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice Details</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient Information</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Medical Center</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Test Type</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Status</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Generated Date</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {getCurrentTransactionData().map((item, index) => {
                      const globalIndex = (currentTransactionPage - 1) * transactionRecordsPerPage + index;
                      return (
                      <tr key={item._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">
                                {item.billing?.invoiceNumber || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">#{globalIndex + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.patientName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-medium">{item.patient?.phone || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                              <Building className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.centerName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-medium">{item.centerCode || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{item.doctorName || 'N/A'}</div>
                              <div className="text-xs text-gray-500 font-medium">{item.doctor?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <span className="px-2 sm:px-4 py-1 sm:py-2 text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full border border-purple-300">
                            {item.testType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="text-right">
                            <div className="text-sm sm:text-base font-bold text-gray-900">₹{item.billing?.amount?.toLocaleString() || '0'}</div>
                            <div className="text-xs text-gray-500 font-medium">Amount</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          {(() => {
                            // Simple function to get partial payment data from localStorage
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
                            
                            // Determine the actual payment status
                            let statusText = '';
                            let statusClass = '';
                            let statusIcon = null;
                            
                            // Check for cancelled or refunded status first - these take priority
                            if (item.billing?.status === 'cancelled') {
                              statusText = 'Bill Cancelled';
                              statusClass = 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
                              statusIcon = <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />;
                            } else if (item.billing?.status === 'refunded') {
                              statusText = 'Bill Refunded';
                              statusClass = 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300';
                              statusIcon = <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />;
                            } else {
                              // Check if this bill was paid in multiple installments
                              const hasMultiplePayments = partialData.paymentCount > 1;
                              
                              if (actualPaidAmount >= totalAmount && totalAmount > 0) {
                                if (hasMultiplePayments) {
                                  statusText = 'Partially Fully Paid';
                                  statusClass = 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
                                  statusIcon = <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />;
                                } else {
                                  statusText = 'Fully Paid';
                                  statusClass = 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300';
                                  statusIcon = <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />;
                                }
                              } else if (actualPaidAmount > 0 && actualPaidAmount < totalAmount) {
                                statusText = 'Partially Paid';
                                statusClass = 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300';
                                statusIcon = <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />;
                              } else {
                                statusText = item.billing?.status || 'Generated';
                                statusClass = 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300';
                                statusIcon = <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />;
                              }
                            }

                            return (
                              <span className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 text-xs font-bold rounded-full border ${statusClass}`}>
                                {statusIcon}{statusText}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="text-xs font-semibold text-gray-900">
                            {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleTimeString() : ''}
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
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
              <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Showing {((currentTransactionPage - 1) * transactionRecordsPerPage) + 1} to {Math.min(currentTransactionPage * transactionRecordsPerPage, reportsData.billingData?.length || 0)} of {reportsData.billingData?.length || 0} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-600">Show:</span>
                      <select
                        value={transactionRecordsPerPage}
                        onChange={(e) => handleTransactionRecordsPerPageChange(e.target.value)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                      <span className="text-xs sm:text-sm text-gray-600">per page</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                      Page {currentTransactionPage} of {getTotalTransactionPages()}
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="text-xs sm:text-sm text-gray-600 sm:hidden">
                        Page {currentTransactionPage} of {getTotalTransactionPages()}
                      </div>
                      <button
                        onClick={() => handleTransactionPageChange(currentTransactionPage - 1)}
                        disabled={currentTransactionPage === 1}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-300"
                      >
                        Previous
                      </button>
                      
                      <button
                        onClick={() => handleTransactionPageChange(currentTransactionPage)}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium bg-purple-600 text-white rounded-lg"
                      >
                        {currentTransactionPage}
                      </button>
                      
                      <button
                        onClick={() => handleTransactionPageChange(currentTransactionPage + 1)}
                        disabled={currentTransactionPage === getTotalTransactionPages()}
                        className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Professional Report Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-10">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg mr-4 sm:mr-6">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-md font-bold text-gray-900 mb-2">Financial Performance Summary</h3>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Comprehensive analytics and key performance indicators</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-10">
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
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-md">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-base sm:text-lg font-bold text-blue-600 mb-1 sm:mb-2">{totalBills}</div>
                        <div className="text-xs sm:text-sm font-bold text-blue-800 mb-1">Total Bills</div>
                        <div className="text-xs text-blue-600 font-semibold">Generated</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-md">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-base sm:text-lg font-bold text-emerald-600 mb-1 sm:mb-2">{paidBills}</div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-800 mb-1">Paid Bills</div>
                        <div className="text-xs text-emerald-600 font-semibold">
                          {totalBills > 0 ? 
                            `${Math.round((paidBills / totalBills) * 100)}%` : 
                            '0%'
                          } Success Rate
                        </div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-md">
                          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-base sm:text-lg font-bold text-yellow-600 mb-1 sm:mb-2">{pendingBills}</div>
                        <div className="text-xs sm:text-sm font-bold text-yellow-800 mb-1">Pending Bills</div>
                        <div className="text-xs text-yellow-600 font-semibold">Awaiting Payment</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-md">
                          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-base sm:text-lg font-bold text-orange-600 mb-1 sm:mb-2">{partialBills}</div>
                        <div className="text-xs sm:text-sm font-bold text-orange-800 mb-1">Partial Bills</div>
                        <div className="text-xs text-orange-600 font-semibold">Partially Paid</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-md">
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-base sm:text-lg font-bold text-purple-600 mb-1 sm:mb-2">₹{totalRevenue.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm font-bold text-purple-800 mb-1">Total Revenue</div>
                        <div className="text-xs text-purple-600 font-semibold">All Centers</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Partial Payment Details Section */}
              {(() => {
                // Simple approach: Get partial payment data from localStorage
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

                // Get all partial payment keys from localStorage
                const partialPaymentKeys = Object.keys(localStorage).filter(key => key.startsWith('partial_payment_'));
                
                
                // Get all bills that have partial payments in localStorage
                const partialBills = reportsData.billingData?.filter(item => {
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
                }) || [];


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
                <div className="mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4 sm:p-6">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg mr-3 sm:mr-4">
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Partial Payment History</h4>
                        <p className="text-xs sm:text-sm text-slate-600">Patients who made multiple payments - includes both outstanding and fully paid bills</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
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
                            <div key={item._id} className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                  <div className="p-2 bg-slate-100 rounded-lg">
                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <div className="text-xs sm:text-sm font-bold text-gray-900">
                                      {item.billing?.invoiceNumber || `Bill #${globalIndex + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-600">{item.patientName || 'N/A'}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-xs sm:text-sm font-bold ${isFullyPaid ? 'text-emerald-600' : 'text-slate-600'}`}>
                                    {isFullyPaid && hasMultiplePayments ? 'Partially Fully Paid' : 
                                     isFullyPaid ? '100% Paid' : 
                                     `${paymentPercentage}% Paid`}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item.centerName || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3">
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                  <div className="text-xs sm:text-sm font-bold text-slate-600">₹{totalAmount.toLocaleString()}</div>
                                  <div className="text-xs text-slate-700">Total Amount</div>
                                </div>
                                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                                  <div className="text-xs sm:text-sm font-bold text-emerald-600">₹{paidAmount.toLocaleString()}</div>
                                  <div className="text-xs text-emerald-700">Paid Amount</div>
                                </div>
                                <div className="text-center p-2 bg-amber-50 rounded-lg">
                                  <div className="text-xs sm:text-sm font-bold text-amber-600">₹{remainingAmount.toLocaleString()}</div>
                                  <div className="text-xs text-amber-700">
                                    {isFullyPaid && hasMultiplePayments ? 'Partially Fully Paid' : 
                                     isFullyPaid ? 'Fully Paid' : 
                                     'Remaining'}
                                  </div>
                                </div>
                              </div>

                              {/* Payment Timeline */}
                              {partialPayments.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-semibold text-gray-700 mb-2">Payment Timeline:</div>
                                  <div className="space-y-2">
                                    {partialPayments.map((payment, paymentIndex) => (
                                      <div key={paymentIndex} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                                          <div className="flex items-center space-x-2 sm:space-x-3">
                                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center">
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
                                          Payment #{paymentIndex + 1}
                                                </div>
                                            </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Fallback for bills without detailed payment history */}
                              {partialPayments.length === 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-semibold text-gray-700 mb-2">Payment Information:</div>
                                  <div className="bg-slate-50 rounded-lg p-2">
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
                              
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-600 gap-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                                  <span>
                                    <strong>Generated:</strong> {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                                  </span>
                                  <span>
                                    <strong>Status:</strong> {item.billing?.status || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${isFullyPaid ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                                  <span className={`font-semibold ${isFullyPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {isFullyPaid && hasMultiplePayments ? 'Partially Fully Paid' : 
                                     isFullyPaid ? 'Fully Paid' : 
                                     'Outstanding Balance'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      
                      {/* Pagination Controls for Partial Payment History */}
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="text-xs sm:text-sm text-slate-600">
                              Showing {((currentPartialPage - 1) * partialRecordsPerPage) + 1} to {Math.min(currentPartialPage * partialRecordsPerPage, enhancedPartialBills.length)} of {enhancedPartialBills.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm text-slate-600">Show:</span>
                              <select
                                value={partialRecordsPerPage}
                                onChange={(e) => handlePartialRecordsPerPageChange(e.target.value)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                              >
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                              </select>
                              <span className="text-xs sm:text-sm text-slate-600">per page</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-xs sm:text-sm text-slate-600 hidden sm:block">
                              Page {currentPartialPage} of {Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <div className="text-xs sm:text-sm text-slate-600 sm:hidden">
                                Page {currentPartialPage} of {Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                              </div>
                              <button
                                onClick={() => handlePartialPageChange(currentPartialPage - 1)}
                                disabled={currentPartialPage === 1}
                                className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-300"
                              >
                                Previous
                              </button>
                              
                              <button
                                onClick={() => handlePartialPageChange(currentPartialPage)}
                                className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium bg-slate-600 text-white rounded-lg"
                              >
                                {currentPartialPage}
                              </button>
                              
                              <button
                                onClick={() => handlePartialPageChange(currentPartialPage + 1)}
                                disabled={currentPartialPage === Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                                className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-300"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg mr-4">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-700 mb-1">Multiple Payment History</h4>
                          <p className="text-sm text-slate-600">No multiple payment records found for the selected period</p>
                        </div>
                      </div>
                      <div className="text-center py-8">
                        <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-600 font-medium">All patients have made single payments or haven't made any payments yet</p>
                        <p className="text-sm text-slate-500 mt-2">No multiple payment records found</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2" />
                    <span className="text-sm sm:text-base font-semibold text-gray-800">Report Period</span>
                  </div>
                  <div className="text-sm sm:text-md font-bold text-gray-900 mb-2">
                    {selectedPeriod === 'custom' 
                      ? `${customDateRange.startDate} to ${customDateRange.endDate}` 
                      : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                    }
                  </div>
                  {selectedCenter !== 'all' && (
                    <div className="flex items-center justify-center mt-2 sm:mt-3">
                      <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-2" />
                      <span className="text-xs text-gray-700">
                        Filtered by: <strong>{centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Professional No Data State */}
        {!reportsLoading && !isChangingCenter && !reportsData && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6 sm:mb-8 shadow-lg">
                <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-gray-500" />
              </div>
              <h3 className="text-sm sm:text-md font-bold text-gray-900 mb-4">No Data Available</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-lg text-sm sm:text-base font-medium">
                No billing records found for the selected time period and center filters. 
                Try adjusting your filters or check back later for new data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
                <button
                  onClick={fetchReports}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-bold text-sm sm:text-base">Refresh Data</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedPeriod('monthly');
                    setSelectedCenter('all');
                    setShowCustomRange(false);
                    fetchReports();
                  }}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Filter className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-bold text-sm sm:text-base">Reset Filters</span>
                </button>
              </div>
              <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
                  <span className="text-sm font-bold text-blue-800">Current Filter Settings</span>
                </div>
                <div className="text-blue-700 font-medium text-sm sm:text-base">
                  <div className="mb-2">Period: <strong className="text-blue-900">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</strong></div>
                  <div>Center: <strong className="text-blue-900">{selectedCenter === 'all' ? 'All Centers' : centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminBillingReports;