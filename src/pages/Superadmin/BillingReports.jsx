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
    fetchReports();
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
    const params = {
      period: showCustomRange ? null : selectedPeriod,
      centerId: selectedCenter,
      startDate: showCustomRange ? customDateRange.startDate : null,
      endDate: showCustomRange ? customDateRange.endDate : null
    };

    console.log('🔍 Fetching reports with params:', params);
    dispatch(fetchBillingReports(params));
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    console.log('🔄 Period changed to:', period);
    setSelectedPeriod(period);
    setShowCustomRange(period === 'custom');
    // Clear previous data when changing periods
    dispatch(clearReportsData());
    if (period !== 'custom') {
      fetchReports();
    }
  };

  // Handle center change
  const handleCenterChange = (centerId) => {
    setSelectedCenter(centerId);
    fetchReports();
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 bg-white bg-opacity-20 rounded-2xl mr-6">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Billing Analytics Dashboard</h1>
                  <p className="text-blue-100 text-lg">Comprehensive financial insights across all medical centers</p>
                  <div className="flex items-center mt-3 space-x-6">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">{centers?.length || 0} Centers</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Real-time Data</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Advanced Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">
                  {reportsData ? `₹${reportsData.stats?.totalAmount?.toLocaleString() || '0'}` : '₹0'}
                </div>
                <div className="text-blue-100 text-sm">Total Revenue</div>
                <div className="text-xs text-blue-200 mt-1">
                  {selectedPeriod === 'custom' 
                    ? `${customDateRange.startDate} to ${customDateRange.endDate}` 
                    : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Advanced Report Filters</h3>
                <p className="text-sm text-gray-600 mt-1">Customize your billing analytics view</p>
                {/* Current Filter Status */}
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Period: {selectedPeriod === 'custom' ? 'Custom Range' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                  </span>
                  {selectedCenter !== 'all' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Center: {centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchReports}
                disabled={reportsLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
                {reportsLoading ? 'Loading...' : 'Refresh Data'}
              </button>
              <button
                onClick={handleExportReports}
                disabled={!reportsData || reportsLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Time Period Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Time Period Analysis
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePeriodChange('daily')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'daily'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handlePeriodChange('weekly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'weekly'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handlePeriodChange('monthly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'monthly'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handlePeriodChange('yearly')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'yearly'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Last Year
                </button>
              </div>
              <button
                onClick={() => handlePeriodChange('custom')}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === 'custom'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom Range
              </button>
            </div>

            {/* Center Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Building className="w-4 h-4 mr-2 text-green-600" />
                Center Performance
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedCenter}
                  onChange={(e) => handleCenterChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
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
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Filtering by: {centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Date Range */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                Custom Date Range
              </label>
              {showCustomRange ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={handleCustomDateRange}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Select "Custom Range" to set specific dates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {reportsLoading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Loading Analytics Data</h3>
              <p className="text-gray-600 mb-4">Fetching billing reports and generating insights...</p>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Processing center-wise data</span>
              </div>
            </div>
          </div>
        )}

        {/* Reports Content */}
        {!reportsLoading && reportsData && (
          <>
            {/* Data Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Data Summary</h3>
                    <p className="text-sm text-gray-600">
                      Showing {reportsData.billingData?.length || 0} billing records
                      {selectedPeriod !== 'custom' && ` for the last ${selectedPeriod === 'daily' ? '24 hours' : selectedPeriod === 'weekly' ? '7 days' : selectedPeriod === 'monthly' ? '30 days' : '365 days'}`}
                      {selectedPeriod === 'custom' && ` from ${customDateRange.startDate} to ${customDateRange.endDate}`}
                      {selectedCenter !== 'all' && ` • Center: ${centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected'}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{reportsData.stats?.totalAmount?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
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

            {/* Detailed Billing Data Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Detailed Billing Records</h3>
                      <p className="text-sm text-gray-600">Complete transaction history with center-wise breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total Records</div>
                      <div className="text-2xl font-bold text-blue-600">{reportsData.billingData?.length || 0}</div>
                    </div>
                    <button
                      onClick={handleExportReports}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Center</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Generated</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportsData.billingData?.slice(0, 10).map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.billing?.invoiceNumber || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">#{index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.patientName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{item.patient?.phone || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-green-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.centerName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.centerCode || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.doctorName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{item.doctor?.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {item.testType || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">₹{item.billing?.amount?.toLocaleString() || '0'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            item.billing?.status === 'paid' || item.billing?.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : item.billing?.status === 'generated'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.billing?.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.billing?.status === 'paid' || item.billing?.status === 'verified' ? (
                              <><CheckCircle className="w-3 h-3 inline mr-1" />Paid</>
                            ) : item.billing?.status === 'generated' ? (
                              <><Clock className="w-3 h-3 inline mr-1" />Pending</>
                            ) : item.billing?.status === 'cancelled' ? (
                              <><AlertCircle className="w-3 h-3 inline mr-1" />Cancelled</>
                            ) : (
                              'Generated'
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.billing?.generatedAt ? new Date(item.billing.generatedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.billing?.paidAt ? new Date(item.billing.paidAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {reportsData.billingData?.length > 10 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Showing 10 of {reportsData.billingData.length} records. 
                    <button 
                      onClick={handleExportReports}
                      className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                    >
                      Export all data
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Report Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Financial Performance Summary</h3>
                  <p className="text-sm text-gray-600 mt-1">Key metrics and insights for the selected period</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{reportsData.stats.totalBills}</div>
                  <div className="text-sm font-medium text-blue-800">Total Bills</div>
                  <div className="text-xs text-blue-600 mt-1">Generated</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{reportsData.stats.paidBills}</div>
                  <div className="text-sm font-medium text-green-800">Paid Bills</div>
                  <div className="text-xs text-green-600 mt-1">
                    {reportsData.stats.totalBills > 0 ? 
                      `${Math.round((reportsData.stats.paidBills / reportsData.stats.totalBills) * 100)}%` : 
                      '0%'
                    } Success Rate
                  </div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{reportsData.stats.pendingBills}</div>
                  <div className="text-sm font-medium text-yellow-800">Pending Bills</div>
                  <div className="text-xs text-yellow-600 mt-1">Awaiting Payment</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">₹{reportsData.stats.totalAmount.toLocaleString()}</div>
                  <div className="text-sm font-medium text-purple-800">Total Revenue</div>
                  <div className="text-xs text-purple-600 mt-1">All Centers</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-gray-600 mr-2" />
                    <span className="text-lg font-semibold text-gray-800">Report Period</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPeriod === 'custom' 
                      ? `${customDateRange.startDate} to ${customDateRange.endDate}` 
                      : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                    }
                  </div>
                  {selectedCenter !== 'all' && (
                    <div className="flex items-center justify-center mt-3">
                      <Building className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-sm text-gray-700">
                        Filtered by: <strong>{centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enhanced No Data State */}
        {!reportsLoading && !reportsData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-6 bg-gray-100 rounded-full mb-6">
                <Calendar className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Billing Data Available</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                No billing records found for the selected time period and center filters. 
                Try adjusting your filters or check back later for new data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={fetchReports}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Data
                </button>
                <button
                  onClick={() => {
                    setSelectedPeriod('monthly');
                    setSelectedCenter('all');
                    setShowCustomRange(false);
                    fetchReports();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center transition-all duration-200"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Reset Filters
                </button>
              </div>
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Current Filter Settings</span>
                </div>
                <div className="text-sm text-blue-700">
                  <div>Period: <strong>{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</strong></div>
                  <div>Center: <strong>{selectedCenter === 'all' ? 'All Centers' : centers.find(c => c._id === selectedCenter)?.centername || centers.find(c => c._id === selectedCenter)?.name || 'Selected Center'}</strong></div>
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
