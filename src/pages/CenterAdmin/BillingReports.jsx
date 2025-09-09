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
  Filter
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
      console.error('Error in fetchReports:', error);
      toast.error('Failed to fetch reports. Please try again.');
    }
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    console.log('🔄 Center Period changed to:', period);
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
        console.error('Error fetching reports for period:', period, error);
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
      console.error('Error fetching custom date range reports:', error);
      toast.error('Failed to fetch reports for the selected date range. Please try again.');
    }
  };

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
            {/* Revenue Summary Cards */}
            <RevenueSummaryCards stats={reportsData.stats} period={selectedPeriod} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Revenue Chart */}
              <DailyRevenueChart data={reportsData.dailyStats} />

              {/* Monthly Revenue Chart */}
              <MonthlyRevenueChart data={reportsData.monthlyStats} />
            </div>

            {/* Doctor Performance Chart */}
            <div className="mb-8">
              <DoctorPerformanceChart data={reportsData.doctorStats} />
            </div>

            {/* Payment Status Chart */}
            <div className="mb-8">
              <PaymentStatusChart stats={reportsData.stats} />
            </div>

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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-blue-600 mb-3">{reportsData.stats.totalBills}</div>
                  <div className="text-base md:text-sm font-bold text-blue-800 mb-2">Total Bills</div>
                  <div className="text-xs text-blue-600 font-semibold">Generated</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-emerald-600 mb-3">{reportsData.stats.paidBills}</div>
                  <div className="text-base md:text-sm font-bold text-emerald-800 mb-2">Paid Bills</div>
                  <div className="text-xs text-emerald-600 font-semibold">
                    {reportsData.stats.totalBills > 0 ? 
                      `${Math.round((reportsData.stats.paidBills / reportsData.stats.totalBills) * 100)}%` : 
                      '0%'
                    } Success Rate
                  </div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-yellow-600 mb-3">{reportsData.stats.pendingBills}</div>
                  <div className="text-base md:text-sm font-bold text-yellow-800 mb-2">Pending Bills</div>
                  <div className="text-xs text-yellow-600 font-semibold">Awaiting Payment</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-purple-600 mb-3">₹{reportsData.stats.totalAmount.toLocaleString()}</div>
                  <div className="text-base md:text-sm font-bold text-purple-800 mb-2">Total Revenue</div>
                  <div className="text-xs text-purple-600 font-semibold">Center Revenue</div>
                </div>
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
