import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaChartBar, 
  FaChartLine, 
  FaDownload, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaFileAlt,
  FaFilter
} from 'react-icons/fa';
import { getFinancialReports } from '../../services/api';

const AccountantReports = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getFinancialReports({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          type: reportType !== 'all' ? reportType : undefined
        });
        
        // Transform the API response to match our component structure
        const transformedReports = response.reports?.map(report => ({
          id: report._id,
          title: report.title || 'Financial Report',
          type: report.type || 'revenue',
          period: report.period || 'Current Period',
          totalAmount: report.totalAmount || 0,
          status: report.status || 'completed',
          generatedDate: report.createdAt || new Date().toISOString(),
          description: report.description || 'Financial report generated'
        })) || [];
        
        setReports(transformedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user, dateRange, reportType]);

  // Since we're now filtering on the server side, we don't need client-side filtering
  const filteredReports = reports;

  const getReportIcon = (type) => {
    switch (type) {
      case 'revenue':
        return FaMoneyBillWave;
      case 'payments':
        return FaChartLine;
      case 'outstanding':
        return FaFileAlt;
      case 'services':
        return FaChartBar;
      default:
        return FaFileAlt;
    }
  };

  const getReportColor = (type) => {
    switch (type) {
      case 'revenue':
        return 'bg-green-100 text-green-600';
      case 'payments':
        return 'bg-blue-100 text-blue-600';
      case 'outstanding':
        return 'bg-red-100 text-red-600';
      case 'services':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReport = async (type) => {
    try {
      const response = await generateFinancialReport({ 
        type, 
        startDate: dateRange.startDate,
        endDate: dateRange.endDate 
      });
      
      // Refresh the reports list after generating a new report
      const updatedResponse = await getFinancialReports({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType !== 'all' ? reportType : undefined
      });
      
      const transformedReports = updatedResponse.reports?.map(report => ({
        id: report._id,
        title: report.title || 'Financial Report',
        type: report.type || 'revenue',
        period: report.period || 'Current Period',
        totalAmount: report.totalAmount || 0,
        status: report.status || 'completed',
        generatedDate: report.createdAt || new Date().toISOString(),
        description: report.description || 'Financial report generated'
      })) || [];
      
      setReports(transformedReports);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-2">
          Generate and view financial reports for your center.
        </p>
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="revenue">Revenue Report</option>
              <option value="payments">Payment Analysis</option>
              <option value="outstanding">Outstanding Invoices</option>
              <option value="services">Service-wise Revenue</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={() => generateReport(reportType)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaChartBar className="mr-2" />
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Quick Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => generateReport('revenue')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FaMoneyBillWave className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Revenue</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Report</h3>
          <p className="text-sm text-gray-600">Generate monthly revenue breakdown</p>
        </div>

        <div
          onClick={() => generateReport('payments')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartLine className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Payments</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Analysis</h3>
          <p className="text-sm text-gray-600">Analyze payment trends and patterns</p>
        </div>

        <div
          onClick={() => generateReport('outstanding')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <FaFileAlt className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Outstanding</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Outstanding Invoices</h3>
          <p className="text-sm text-gray-600">List of unpaid invoices</p>
        </div>

        <div
          onClick={() => generateReport('services')}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartBar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Services</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Revenue</h3>
          <p className="text-sm text-gray-600">Revenue by service type</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generated Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => {
            const IconComponent = getReportIcon(report.type);
            return (
              <div key={report.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${getReportColor(report.type)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          <FaCalendarAlt className="inline mr-1" />
                          {report.period}
                        </span>
                        <span className="text-sm text-gray-500">
                          Generated: {new Date(report.generatedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{(report.totalAmount || 0).toLocaleString()}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <FaDownload className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {reportType !== 'all' 
                ? 'Try adjusting your filter criteria.'
                : 'No reports have been generated yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantReports;
