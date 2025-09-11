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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    Financial Analytics
                  </h1>
                  <p className="text-sm text-gray-600">
                    Billing insights and revenue intelligence
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-lg font-bold text-blue-600 mb-1">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Filters</h3>
                <p className="text-sm text-gray-600">Configure reporting parameters</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchReports}
                disabled={reportsLoading}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
                {reportsLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleExportReports}
                disabled={!reportsData || reportsLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center text-sm font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Today</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>7 Days</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>30 Days</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('yearly')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>1 Year</span>
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
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-base md:text-sm font-bold text-gray-900">Custom Range</h4>
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">End Date</label>
                    <div className="flex space-x-3">
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium transition-all duration-200 hover:border-gray-300"
                      />
                      <button
                        onClick={handleCustomDateRange}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">Custom Date Range</p>
                  <p className="text-xs text-gray-500">Select "Custom Range" to set specific dates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Loading State */}
        {(reportsLoading || isChangingCenter) && (
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
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Analyzing Data</span>
                </div>
                <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Calculating Metrics</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Content */}
        {!reportsLoading && !isChangingCenter && reportsData && (
          <>
            {/* Professional Data Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-md md:text-md font-bold text-gray-900 mb-2">Data Overview</h3>
                    <p className="text-gray-600 font-medium text-base md:text-sm">
                      Analyzing <span className="font-bold text-emerald-600">{reportsData.billingData?.length || 0}</span> billing records
                      {selectedPeriod !== 'custom' && ` for the last ${selectedPeriod === 'daily' ? '24 hours' : selectedPeriod === 'weekly' ? '7 days' : selectedPeriod === 'monthly' ? '30 days' : '365 days'}`}
                      {selectedPeriod === 'custom' && ` from ${customDateRange.startDate} to ${customDateRange.endDate}`}
                      {selectedCenter !== 'all' && ` • Center: ${centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected'}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                    <div className="text-md md:text-md font-bold text-emerald-600 mb-1">₹{reportsData.stats?.totalAmount?.toLocaleString() || '0'}</div>
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

            {/* Revenue Summary Cards */}
            <RevenueSummaryCards stats={reportsData.stats} period={selectedPeriod} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Revenue Chart */}
              <DailyRevenueChart data={reportsData.dailyStats} />

              {/* Monthly Revenue Chart */}
              <MonthlyRevenueChart data={reportsData.monthlyStats} />
            </div>

            {/* Center Performance Chart */}
            <div className="mb-8">
              <CenterPerformanceChart data={reportsData.centerStats} />
            </div>

            {/* Payment Status Chart */}
            <div className="mb-8">
              <PaymentStatusChart stats={reportsData.stats} />
            </div>

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
                              <Users className="w-4 h-4 text-emerald-600" />
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
                              <Building className="w-4 h-4 text-green-600" />
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
                              <Users className="w-4 h-4 text-blue-600" />
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
                          <span className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-full border ${
                            item.billing?.status === 'paid' || item.billing?.status === 'verified'
                              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                              : item.billing?.status === 'generated'
                              ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                              : item.billing?.status === 'cancelled'
                              ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
                          }`}>
                            {item.billing?.status === 'paid' || item.billing?.status === 'verified' ? (
                              <><CheckCircle className="w-4 h-4 mr-2" />Paid</>
                            ) : item.billing?.status === 'generated' ? (
                              <><Clock className="w-4 h-4 mr-2" />Pending</>
                            ) : item.billing?.status === 'cancelled' ? (
                              <><AlertCircle className="w-4 h-4 mr-2" />Cancelled</>
                            ) : (
                              'Generated'
                            )}
                          </span>
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

            {/* Professional Report Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-10">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg mr-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-md md:text-md font-bold text-gray-900 mb-2">Financial Performance Summary</h3>
                  <p className="text-base md:text-sm text-gray-600 font-medium">Comprehensive analytics and key performance indicators</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-blue-600 mb-2">{reportsData.stats.totalBills}</div>
                  <div className="text-sm font-bold text-blue-800 mb-1">Total Bills</div>
                  <div className="text-xs text-blue-600 font-semibold">Generated</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-md">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-emerald-600 mb-2">{reportsData.stats.paidBills}</div>
                  <div className="text-sm font-bold text-emerald-800 mb-1">Paid Bills</div>
                  <div className="text-xs text-emerald-600 font-semibold">
                    {reportsData.stats.totalBills > 0 ? 
                      `${Math.round((reportsData.stats.paidBills / reportsData.stats.totalBills) * 100)}%` : 
                      '0%'
                    } Success Rate
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-yellow-600 mb-2">{reportsData.stats.pendingBills}</div>
                  <div className="text-sm font-bold text-yellow-800 mb-1">Pending Bills</div>
                  <div className="text-xs text-yellow-600 font-semibold">Awaiting Payment</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-md">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-orange-600 mb-2">
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

                      // Count bills that have partial payments in localStorage (excluding fully paid)
                      const localStoragePartialCount = reportsData.billingData?.filter(item => {
                        const partialData = getPartialPaymentData(item._id);
                        const totalAmount = item.billing?.amount || 0;
                        const backendPaidAmount = item.billing?.paidAmount || 0;
                        const status = item.billing?.status;
                        
                        const actualPaidAmount = partialData.totalPaid > 0 ? partialData.totalPaid : backendPaidAmount;
                        
                        return actualPaidAmount > 0 && 
                               (actualPaidAmount < totalAmount || partialData.totalPaid > 0);
                      }).length || 0;

                      // If no localStorage partial payments, check for status-based partial payments (excluding fully paid)
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
                      
                      return finalCount;
                    })()}
                  </div>
                  <div className="text-sm font-bold text-orange-800 mb-1">Partial Bills</div>
                  <div className="text-xs text-orange-600 font-semibold">Partially Paid</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-purple-600 mb-2">₹{reportsData.stats.totalAmount.toLocaleString()}</div>
                  <div className="text-sm font-bold text-purple-800 mb-1">Total Revenue</div>
                  <div className="text-xs text-purple-600 font-semibold">All Centers</div>
                </div>
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
                  const status = item.billing?.status;
                  
                  // Calculate actual paid amount (use localStorage if available, otherwise backend)
                  const actualPaidAmount = partialData.totalPaid > 0 ? partialData.totalPaid : backendPaidAmount;
                  
                  
                  // Show bills that have partial payments (paid some amount)
                  // Include both outstanding and completed partial payments for superadmin visibility
                  return actualPaidAmount > 0 && 
                         (actualPaidAmount < totalAmount || partialData.totalPaid > 0);
                }) || [];


                // If no partial bills found in localStorage, try a different approach
                // Check if there are bills with status that might indicate partial payment
                const statusBasedPartial = reportsData.billingData?.filter(item => {
                  const status = item.billing?.status;
                  const paidAmount = item.billing?.paidAmount || 0;
                  const totalAmount = item.billing?.amount || 0;
                  
                  
                  // Check for status that might indicate partial payment
                  // Include bills with partial payments (both outstanding and completed)
                  return (status === 'payment_received' || 
                          status === 'generated' || 
                          status === 'paid' ||
                          status === 'verified' ||
                          (paidAmount > 0 && paidAmount < totalAmount));
                }) || [];


                // Use status-based partial bills if localStorage doesn't have any
                const finalPartialBills = partialBills.length > 0 ? partialBills : statusBasedPartial;

                // Enhance the partial bills with localStorage data
                const enhancedPartialBills = finalPartialBills.map(item => {
                  const partialData = getPartialPaymentData(item._id);
                  const totalAmount = item.billing?.amount || 0;
                  const backendPaidAmount = item.billing?.paidAmount || 0;
                  
                  // Use localStorage data if available, otherwise use backend data
                  const actualPaidAmount = partialData.totalPaid > 0 ? partialData.totalPaid : backendPaidAmount;
                  
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
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-4">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-orange-800 mb-1">Partial Payment History</h4>
                        <p className="text-sm text-orange-700">Patients who made partial payments - complete payment timeline</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {getCurrentPartialData(enhancedPartialBills).map((item, index) => {
                        const globalIndex = (currentPartialPage - 1) * partialRecordsPerPage + index;
                          const paidAmount = item.billing?.paidAmount || 0;
                          const totalAmount = item.billing?.amount || 0;
                          const remainingAmount = item.billing?.remainingAmount || (totalAmount - paidAmount);
                          const paymentPercentage = Math.round((paidAmount / totalAmount) * 100);
                          const partialPayments = item.billing?.partialPayments || [];
                          const isFullyPaid = remainingAmount <= 0;
                          
                          return (
                            <div key={item._id} className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-orange-100 rounded-lg">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900">
                                      {item.billing?.invoiceNumber || `Bill #${globalIndex + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-600">{item.patientName || 'N/A'}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-bold ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isFullyPaid ? '100% Paid' : `${paymentPercentage}% Paid`}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item.centerName || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                  <div className="text-sm font-bold text-blue-600">₹{totalAmount.toLocaleString()}</div>
                                  <div className="text-xs text-blue-700">Total Amount</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                  <div className="text-sm font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
                                  <div className="text-xs text-green-700">Paid Amount</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded-lg">
                                  <div className="text-sm font-bold text-red-600">₹{remainingAmount.toLocaleString()}</div>
                                  <div className="text-xs text-red-700">{isFullyPaid ? 'Fully Paid' : 'Remaining'}</div>
                                </div>
                              </div>

                              {/* Payment Timeline */}
                              {partialPayments.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-semibold text-gray-700 mb-2">Payment Timeline:</div>
                                  <div className="space-y-2">
                                    {partialPayments.map((payment, paymentIndex) => (
                                      <div key={paymentIndex} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-green-600">{paymentIndex + 1}</span>
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
                                  <div className="bg-gray-50 rounded-lg p-2">
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
                              
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center space-x-4">
                                  <span>
                                    <strong>Generated:</strong> {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                                  </span>
                                  <span>
                                    <strong>Status:</strong> {item.billing?.status || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${isFullyPaid ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                                  <span className={`font-semibold ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isFullyPaid ? 'Fully Paid' : 'Outstanding Balance'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      
                      {/* Pagination Controls for Partial Payment History */}
                      <div className="pt-4 border-t border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-orange-600">
                              Showing {((currentPartialPage - 1) * partialRecordsPerPage) + 1} to {Math.min(currentPartialPage * partialRecordsPerPage, enhancedPartialBills.length)} of {enhancedPartialBills.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-orange-600">Show:</span>
                              <select
                                value={partialRecordsPerPage}
                                onChange={(e) => handlePartialRecordsPerPageChange(e.target.value)}
                                className="px-3 py-1 text-sm border border-orange-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              >
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                              </select>
                              <span className="text-sm text-orange-600">per page</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-orange-600">
                              Page {currentPartialPage} of {Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePartialPageChange(currentPartialPage - 1)}
                                disabled={currentPartialPage === 1}
                                className="px-3 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-orange-300"
                              >
                                Previous
                              </button>
                              
                              <button
                                onClick={() => handlePartialPageChange(currentPartialPage)}
                                className="px-3 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg"
                              >
                                {currentPartialPage}
                              </button>
                              
                              <button
                                onClick={() => handlePartialPageChange(currentPartialPage + 1)}
                                disabled={currentPartialPage === Math.ceil(enhancedPartialBills.length / partialRecordsPerPage)}
                                className="px-3 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-orange-300"
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
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg mr-4">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-700 mb-1">Outstanding Partial Payments</h4>
                          <p className="text-sm text-gray-600">No outstanding partial payments found for the selected period</p>
                        </div>
                      </div>
                      <div className="text-center py-8">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-600 font-medium">All patients have either paid in full or haven't made any payments yet</p>
                        <p className="text-sm text-gray-500 mt-2">No outstanding partial payment balances</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-gray-600 mr-2" />
                    <span className="text-base md:text-sm font-semibold text-gray-800">Report Period</span>
                  </div>
                  <div className="text-md md:text-md font-bold text-gray-900 mb-2">
                    {selectedPeriod === 'custom' 
                      ? `${customDateRange.startDate} to ${customDateRange.endDate}` 
                      : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                    }
                  </div>
                  {selectedCenter !== 'all' && (
                    <div className="flex items-center justify-center mt-3">
                      <Building className="w-4 h-4 text-gray-600 mr-2" />
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-8 shadow-lg">
                <Calendar className="w-20 h-20 text-gray-500" />
              </div>
              <h3 className="text-md md:text-md font-bold text-gray-900 mb-4">No Data Available</h3>
              <p className="text-gray-600 mb-8 max-w-lg text-base md:text-sm font-medium">
                No billing records found for the selected time period and center filters. 
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
                    setSelectedCenter('all');
                    setShowCustomRange(false);
                    fetchReports();
                  }}
                  className="group px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Filter className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-bold text-base md:text-sm">Reset Filters</span>
                </button>
              </div>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-sm font-bold text-blue-800">Current Filter Settings</span>
                </div>
                <div className="text-blue-700 font-medium">
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
