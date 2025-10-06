import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaChartBar, 
  FaChartLine, 
  FaDownload, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaChartPie,
  FaBuilding
} from 'react-icons/fa';
import { getFinancialReports } from '../../services/api';
import { toast } from 'react-toastify';

const AccountantReports = () => {
  const { user } = useSelector((state) => state.auth);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('daily');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        reportType,
        ...(reportType === 'custom' && customDateRange.startDate && customDateRange.endDate
          ? { startDate: customDateRange.startDate, endDate: customDateRange.endDate }
          : {})
      };
      
      const response = await getFinancialReports(params);
      console.log('📈 Financial report received:', response);
      setReportData(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch financial reports');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomReport = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    fetchReports();
  };

  const handleExportExcel = () => {
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    try {
      // Prepare detailed transaction data for Excel
      const transactions = reportData.transactions || [];
      
      const excelData = [
        // Header section
        {
          'CHANRE HOSPITAL - FINANCIAL REPORT': '',
          'col2': '',
          'col3': '',
          'col4': '',
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {
          'Report Type': getReportTypeLabel(reportData.reportType),
          'Period': formatDateRange(reportData.dateRange),
          'Generated On': new Date().toLocaleString(),
          'col4': '',
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {}, // Empty row
        // Summary section
        {
          'SUMMARY': '',
          'col2': '',
          'col3': '',
          'col4': '',
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {
          'Category': 'Total Revenue',
          'Amount (₹)': reportData.summary?.totalRevenue || 0,
          'Transactions': reportData.summary?.totalTransactions || 0,
          'Percentage': '100%',
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {
          'Category': 'Consultation',
          'Amount (₹)': reportData.summary?.consultationRevenue || 0,
          'Transactions': reportData.summary?.consultationCount || 0,
          'Percentage': `${reportData.breakdown?.consultation?.percentage || 0}%`,
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {
          'Category': 'Reassignment',
          'Amount (₹)': reportData.summary?.reassignmentRevenue || 0,
          'Transactions': reportData.summary?.reassignmentCount || 0,
          'Percentage': `${reportData.breakdown?.reassignment?.percentage || 0}%`,
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {
          'Category': 'Lab/Test',
          'Amount (₹)': reportData.summary?.labRevenue || 0,
          'Transactions': reportData.summary?.labCount || 0,
          'Percentage': `${reportData.breakdown?.lab?.percentage || 0}%`,
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {}, // Empty row
        {}, // Empty row
        // Detailed transactions header
        {
          'DETAILED TRANSACTIONS': '',
          'col2': '',
          'col3': '',
          'col4': '',
          'col5': '',
          'col6': '',
          'col7': ''
        },
        {
          'Date': 'Date',
          'Invoice': 'Invoice',
          'Patient': 'Patient',
          'UH ID': 'UH ID',
          'Age': 'Age',
          'Gender': 'Gender',
          'Bill Type': 'Bill Type',
          'Service': 'Service',
          'Doctor': 'Doctor',
          'Amount (₹)': 'Amount (₹)',
          'Paid (₹)': 'Paid (₹)',
          'Balance (₹)': 'Balance (₹)',
          'Status': 'Status',
          'Payment Method': 'Payment Method'
        },
        // Transaction records
        ...transactions.map(tx => ({
          'Date': new Date(tx.date).toLocaleDateString(),
          'Invoice': tx.invoiceNumber,
          'Patient': tx.patientName,
          'UH ID': tx.uhId,
          'Age': tx.age || 'N/A',
          'Gender': tx.gender || 'N/A',
          'Bill Type': tx.billType,
          'Service': tx.service,
          'Doctor': tx.doctor,
          'Amount (₹)': tx.amount,
          'Paid (₹)': tx.paidAmount,
          'Balance (₹)': tx.balance,
          'Status': tx.status,
          'Payment Method': tx.paymentMethod
        }))
      ];

      // Convert to CSV
      const maxColumns = Math.max(...excelData.map(row => Object.keys(row).length));
      const headers = Object.keys(excelData.find(row => Object.keys(row).length === maxColumns) || {});
      
      const csvContent = excelData.map(row => 
        headers.map(header => {
          const value = row[header]?.toString() || '';
          return value.includes(',') || value.includes('"') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      ).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported to Excel with all transaction details!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const handleExportPDF = () => {
    if (!reportData) {
      toast.error('No report data to export');
      return;
    }

    try {
      const transactions = reportData.transactions || [];
      
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Financial Report - ${getReportTypeLabel(reportData.reportType)}</title>
          <style>
            @page { margin: 1cm; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              color: white;
            }
            .summary-card.blue {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            }
            .summary-card.green {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            .summary-card.orange {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }
            .summary-card.purple {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 11px;
              opacity: 0.9;
            }
            .summary-card p {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .breakdown-section {
              margin: 30px 0;
            }
            .breakdown-item {
              margin-bottom: 20px;
            }
            .progress-bar {
              height: 30px;
              background: #e5e7eb;
              border-radius: 4px;
              overflow: hidden;
              margin-top: 5px;
            }
            .progress-fill {
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .progress-fill.blue { background: #3b82f6; }
            .progress-fill.orange { background: #f59e0b; }
            .progress-fill.purple { background: #8b5cf6; }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 10px;
              border-top: 2px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHANRE HOSPITAL</h1>
            <p>Allergy & Immunology Center</p>
            <h2>${getReportTypeLabel(reportData.reportType)}</h2>
            <p>Period: ${formatDateRange(reportData.dateRange)}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary-grid">
            <div class="summary-card blue">
              <h3>Total Revenue</h3>
              <p>${formatCurrency(reportData.summary?.totalRevenue)}</p>
            </div>
            <div class="summary-card green">
              <h3>Consultation</h3>
              <p>${formatCurrency(reportData.summary?.consultationRevenue)}</p>
            </div>
            <div class="summary-card orange">
              <h3>Reassignment</h3>
              <p>${formatCurrency(reportData.summary?.reassignmentRevenue)}</p>
            </div>
            <div class="summary-card purple">
              <h3>Lab/Tests</h3>
              <p>${formatCurrency(reportData.summary?.labRevenue)}</p>
            </div>
          </div>

          <div class="breakdown-section">
            <h3 style="font-size: 18px; margin-bottom: 20px;">Revenue Breakdown</h3>
            
            <div class="breakdown-item">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span><strong>Consultation Revenue</strong></span>
                <span>${formatCurrency(reportData.breakdown?.consultation?.revenue)} (${reportData.breakdown?.consultation?.percentage}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill blue" style="width: ${reportData.breakdown?.consultation?.percentage}%">
                  ${reportData.summary?.consultationCount || 0} transactions
                </div>
              </div>
            </div>

            <div class="breakdown-item">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span><strong>Reassignment Revenue</strong></span>
                <span>${formatCurrency(reportData.breakdown?.reassignment?.revenue)} (${reportData.breakdown?.reassignment?.percentage}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill orange" style="width: ${reportData.breakdown?.reassignment?.percentage}%">
                  ${reportData.summary?.reassignmentCount || 0} transactions
                </div>
              </div>
            </div>

            <div class="breakdown-item">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span><strong>Lab/Test Revenue</strong></span>
                <span>${formatCurrency(reportData.breakdown?.lab?.revenue)} (${reportData.breakdown?.lab?.percentage}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill purple" style="width: ${reportData.breakdown?.lab?.percentage}%">
                  ${reportData.summary?.labCount || 0} transactions
                </div>
              </div>
            </div>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="font-size: 16px; margin-bottom: 15px;">Summary Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Revenue</th>
                  <th>Transaction Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Consultation</td>
                  <td>${formatCurrency(reportData.breakdown?.consultation?.revenue)}</td>
                  <td>${reportData.summary?.consultationCount || 0}</td>
                  <td>${reportData.breakdown?.consultation?.percentage}%</td>
                </tr>
                <tr>
                  <td>Reassignment</td>
                  <td>${formatCurrency(reportData.breakdown?.reassignment?.revenue)}</td>
                  <td>${reportData.summary?.reassignmentCount || 0}</td>
                  <td>${reportData.breakdown?.reassignment?.percentage}%</td>
                </tr>
                <tr>
                  <td>Lab/Test</td>
                  <td>${formatCurrency(reportData.breakdown?.lab?.revenue)}</td>
                  <td>${reportData.summary?.labCount || 0}</td>
                  <td>${reportData.breakdown?.lab?.percentage}%</td>
                </tr>
                <tr style="background: #f8f9fa; font-weight: bold;">
                  <td>TOTAL</td>
                  <td>${formatCurrency(reportData.summary?.totalRevenue)}</td>
                  <td>${reportData.summary?.totalTransactions || 0}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin: 40px 0;">
            <h3 style="font-size: 16px; margin-bottom: 15px;">Detailed Transaction Records (${transactions.length} records)</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice</th>
                  <th>Patient</th>
                  <th>UH ID</th>
                  <th>Type</th>
                  <th>Service</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(tx => `
                  <tr>
                    <td>${new Date(tx.date).toLocaleDateString()}</td>
                    <td>${tx.invoiceNumber}</td>
                    <td>${tx.patientName}</td>
                    <td>${tx.uhId}</td>
                    <td>${tx.billType}</td>
                    <td>${tx.service}</td>
                    <td>${tx.doctor}</td>
                    <td>₹${(tx.amount || 0).toLocaleString()}</td>
                    <td>₹${(tx.paidAmount || 0).toLocaleString()}</td>
                    <td>₹${(tx.balance || 0).toLocaleString()}</td>
                    <td>${tx.status}</td>
                    <td>${tx.paymentMethod}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p><strong>Chanre Hospital - Financial Report</strong></p>
            <p>Allergy & Immunology Center | Rajajinagar, Bengaluru</p>
            <p>This is a computer-generated report</p>
            <p>Total Records: ${transactions.length} | Generated: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '', 'height=800,width=1000');
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success('PDF export initiated - Use "Save as PDF" in print dialog');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleDownloadReport = () => {
    const exportChoice = window.confirm('Click OK for Excel export, Cancel for PDF export');
    if (exportChoice) {
      handleExportExcel();
    } else {
      handleExportPDF();
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'daily': return 'Daily Report';
      case 'weekly': return 'Weekly Report';
      case 'monthly': return 'Monthly Report';
      case 'yearly': return 'Yearly Report';
      case 'custom': return 'Custom Report';
      default: return 'Report';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange || (!dateRange.$gte && !dateRange.$lte)) return 'All Time';
    const start = dateRange.$gte ? new Date(dateRange.$gte).toLocaleDateString() : '';
    const end = dateRange.$lte ? new Date(dateRange.$lte).toLocaleDateString() : '';
    return `${start} - ${end}`;
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
          Generate and view daily, weekly, monthly, and yearly financial reports
        </p>
        {user?.centerId && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <FaBuilding className="mr-1" />
              {user?.centerId?.name || 'Center'}
            </span>
          </div>
        )}
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setReportType('daily')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              reportType === 'daily'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FaCalendarAlt className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Daily</p>
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              reportType === 'weekly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FaChartLine className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Weekly</p>
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              reportType === 'monthly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FaChartBar className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Monthly</p>
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              reportType === 'yearly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FaFileAlt className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Yearly</p>
          </button>
          <button
            onClick={() => setReportType('custom')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              reportType === 'custom'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FaChartPie className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Custom</p>
          </button>
        </div>

        {/* Custom Date Range */}
        {reportType === 'custom' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateCustomReport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Summary */}
      {reportData && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getReportTypeLabel(reportData.reportType)}</h2>
                <p className="text-gray-600 mt-1">
                  Period: {formatDateRange(reportData.dateRange)}
                </p>
              </div>
              <button
                onClick={handleDownloadReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary?.totalRevenue)}</p>
                  </div>
                  <FaMoneyBillWave className="h-12 w-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Consultation</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary?.consultationRevenue)}</p>
                  </div>
                  <FaFileAlt className="h-12 w-12 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Reassignment</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary?.reassignmentRevenue)}</p>
                  </div>
                  <FaChartBar className="h-12 w-12 text-orange-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Lab/Tests</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(reportData.summary?.labRevenue)}</p>
                  </div>
                  <FaChartLine className="h-12 w-12 text-purple-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Transaction Count */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Count</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consultation</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.summary?.consultationCount || 0}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {reportData.breakdown?.consultation?.percentage || 0}% of total
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reassignment</p>
                    <p className="text-2xl font-bold text-orange-600">{reportData.summary?.reassignmentCount || 0}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {reportData.breakdown?.reassignment?.percentage || 0}% of total
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lab/Tests</p>
                    <p className="text-2xl font-bold text-purple-600">{reportData.summary?.labCount || 0}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {reportData.breakdown?.lab?.percentage || 0}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Consultation Revenue</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatCurrency(reportData.breakdown?.consultation?.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${reportData.breakdown?.consultation?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Reassignment Revenue</span>
                    <span className="text-sm font-medium text-orange-600">
                      {formatCurrency(reportData.breakdown?.reassignment?.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-600 h-3 rounded-full"
                      style={{ width: `${reportData.breakdown?.reassignment?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Lab/Test Revenue</span>
                    <span className="text-sm font-medium text-purple-600">
                      {formatCurrency(reportData.breakdown?.lab?.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: `${reportData.breakdown?.lab?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Total Transactions</h3>
              <span className="text-3xl font-bold text-gray-900">
                {reportData.summary?.totalTransactions || 0}
              </span>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaFileAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-600">
            Select a report type to generate financial reports
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountantReports;
