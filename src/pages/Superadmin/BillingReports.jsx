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

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCenters());
    // Don't fetch reports immediately - wait for centers to load
  }, [dispatch]);

  // Debug centers data
  useEffect(() => {
    if (centers && centers.length > 0) {
      console.log('🏥 Available centers:', centers.map(c => ({
        id: c._id,
        name: c.centername || c.name,
        code: c.centerCode
      })));
      console.log('🏥 Currently selected center:', selectedCenter);
      console.log('🏥 Selected center details:', centers.find(c => c._id === selectedCenter));
    }
  }, [centers, selectedCenter]);

  // Handle success messages
  useEffect(() => {
    if (actionSuccess) {
      toast.success('Reports updated successfully');
      dispatch(resetBillingState());
    }
  }, [actionSuccess, dispatch]);

  // Debug reports data
  useEffect(() => {
    if (reportsData) {
      console.log('📊 Reports data received:', {
        period: selectedPeriod,
        centerId: selectedCenter,
        centerName: centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'All Centers',
        totalBills: reportsData.billingData?.length || 0,
        stats: reportsData.stats,
        sampleData: reportsData.billingData?.slice(0, 3).map(item => ({
          id: item._id,
          centerId: item.centerId,
          centerName: item.centerName,
          generatedAt: item.billing?.generatedAt,
          createdAt: item.createdAt,
          status: item.billing?.status
        }))
      });
    }
  }, [reportsData, selectedPeriod, selectedCenter, centers]);

  // Fetch initial reports when centers are loaded
  useEffect(() => {
    if (centers && centers.length > 0 && !reportsData) {
      console.log('🔄 Initial fetch after centers loaded');
      fetchReports();
    }
  }, [centers]);

  // Fetch reports when selectedCenter changes
  useEffect(() => {
    if (selectedCenter && centers && centers.length > 0) {
      console.log('🔄 Center changed, fetching reports for:', selectedCenter);
      fetchReports();
    }
  }, [selectedCenter, centers]);

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

    console.log('🔍 Fetching reports with params:', params);
    console.log('🔍 Period being used:', periodToUse);
    console.log('🔍 Override period:', overridePeriod);
    console.log('🔍 Selected period state:', selectedPeriod);
    console.log('🔍 Selected center ID:', selectedCenter);
    console.log('🔍 Selected center ID type:', typeof selectedCenter);
    console.log('🔍 Selected center ID length:', selectedCenter?.length);
    console.log('🔍 Selected center name:', centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'All Centers');
    dispatch(fetchBillingReports(params));
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    console.log('🔄 Period changed to:', period);
    console.log('🔄 Previous period was:', selectedPeriod);
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
    setSelectedCenter(centerId);
    // Clear previous data when changing centers
    dispatch(clearReportsData());
  };

  // Handle custom date range
  const handleCustomDateRange = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    fetchReports();
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
                      Financial Analytics
                    </h1>
                    <p className="text-sm md:text-md text-blue-100 mb-4 font-light">
                      Advanced billing insights and revenue intelligence
                    </p>
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-blue-100">
                          {centers?.length || 0} Medical Centers
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
                          AI-Powered Insights
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
                    <div className="text-blue-100 text-xs font-medium mb-2">Total Revenue</div>
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
                <p className="text-gray-600 font-medium">Configure your financial reporting parameters</p>
                {/* Current Filter Status */}
                <div className="flex items-center mt-3 space-x-3">
                  <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-blue-800">
                      {selectedPeriod === 'custom' ? 'Custom Range' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                    </span>
                  </div>
                  {selectedCenter !== 'all' && (
                    <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-green-800">
                        {centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected'}
                      </span>
                    </div>
                  )}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Time Period Selection */}
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePeriodChange('daily')}
                  className={`group px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedPeriod === 'daily'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Today</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`group px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedPeriod === 'weekly'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>7 Days</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`group px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedPeriod === 'monthly'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>30 Days</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePeriodChange('yearly')}
                  className={`group px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedPeriod === 'yearly'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>1 Year</span>
                  </div>
                </button>
              </div>
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
                  selectedPeriod === 'custom'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Custom Range</span>
                </div>
              </button>
            </div>

            {/* Center Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Building className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base md:text-sm font-bold text-gray-900">Center Filter</h4>
                  <p className="text-xs text-gray-600">Select specific center or all</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCenter}
                  onChange={(e) => handleCenterChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm text-gray-900 font-medium transition-all duration-200 hover:border-gray-300"
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
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Building className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-800">
                        Active Filter: {centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}
                      </span>
                      <div className="text-xs text-emerald-600 mt-1">Showing data for this center only</div>
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
        {!reportsLoading && reportsData && (
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
                    <div className="text-xs text-emerald-600 mt-1">All Centers Combined</div>
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
                    {reportsData.billingData?.slice(0, 10).map((item, index) => (
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
                              <div className="text-xs text-gray-500 font-medium">#{index + 1}</div>
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
                    ))}
                  </tbody>
                </table>
              </div>
              
              {reportsData.billingData?.length > 10 && (
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200 text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <p className="text-xs font-semibold text-gray-600">
                      Showing 10 of <span className="font-bold text-blue-600">{reportsData.billingData.length}</span> records
                    </p>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <button 
                      onClick={handleExportReports}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs transition-colors duration-200 hover:underline"
                    >
                      Export All Data
                    </button>
                  </div>
                </div>
              )}
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-blue-600 mb-3">{reportsData.stats.totalBills}</div>
                  <div className="text-base md:text-sm font-bold text-blue-800 mb-2">Total Bills</div>
                  <div className="text-xs text-blue-600 font-semibold">Generated</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
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
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-yellow-600 mb-3">{reportsData.stats.pendingBills}</div>
                  <div className="text-base md:text-sm font-bold text-yellow-800 mb-2">Pending Bills</div>
                  <div className="text-xs text-yellow-600 font-semibold">Awaiting Payment</div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-md md:text-md font-bold text-purple-600 mb-3">₹{reportsData.stats.totalAmount.toLocaleString()}</div>
                  <div className="text-base md:text-sm font-bold text-purple-800 mb-2">Total Revenue</div>
                  <div className="text-xs text-purple-600 font-semibold">All Centers</div>
                </div>
              </div>
              
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
        {!reportsLoading && !reportsData && (
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
