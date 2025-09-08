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
      startDate: showCustomRange ? customDateRange.startDate : null,
      endDate: showCustomRange ? customDateRange.endDate : null
    };

    dispatch(fetchCenterBillingReports(params));
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    console.log('🔄 Center Period changed to:', period);
    setSelectedPeriod(period);
    setShowCustomRange(period === 'custom');
    // Clear previous data when changing periods
    dispatch(clearReportsData());
    if (period !== 'custom') {
      fetchReports();
    }
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Center Billing Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive billing analysis for your center</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Report Filters
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={fetchReports}
                disabled={reportsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${reportsLoading ? 'animate-spin' : ''}`} />
                {reportsLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleExportReports}
                disabled={!reportsData || reportsLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleCustomDateRange}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {reportsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reports...</span>
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

            {/* Report Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{reportsData.stats.totalBills}</div>
                  <div className="text-sm text-gray-600">Total Bills Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{reportsData.stats.paidBills}</div>
                  <div className="text-sm text-gray-600">Bills Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{reportsData.stats.pendingBills}</div>
                  <div className="text-sm text-gray-600">Bills Pending</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">₹{reportsData.stats.totalAmount.toLocaleString()}</div>
                  <div className="text-lg text-gray-600">Total Revenue</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Period: {selectedPeriod === 'custom' ? `${customDateRange.startDate} to ${customDateRange.endDate}` : selectedPeriod}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!reportsLoading && !reportsData && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Available</h3>
            <p className="text-gray-600 mb-4">No billing data found for the selected period.</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Reports
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterAdminBillingReports;
