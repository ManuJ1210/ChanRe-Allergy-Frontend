import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaMoneyBillWave,
  FaUser,
  FaFileInvoiceDollar,
  FaExclamationTriangle,
  FaPrint,
  FaTimes,
  FaBuilding
} from 'react-icons/fa';
import { getBillingData } from '../../services/api';
import { toast } from 'react-toastify';

const AccountantBilling = () => {
  const { user } = useSelector((state) => state.auth);
  const [billingData, setBillingData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBillType, setFilterBillType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 50
  });
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0,
    totalTransactions: 0
  });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchBillingData();
  }, [currentPage, filterStatus, filterBillType, dateRange]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await getBillingData({
        page: currentPage,
        limit: pagination.limit,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        billType: filterBillType !== 'all' ? filterBillType : undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      });
      
      console.log('📊 Billing data received:', response);
      
      setBillingData(response.bills || []);
      setTransactions(response.transactions || []);
      setPagination(response.pagination || {});
      setSummary(response.summary || {});
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to fetch billing data');
      setBillingData([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = billingData.filter(bill => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      bill.patientName?.toLowerCase().includes(searchLower) ||
      bill.uhId?.toLowerCase().includes(searchLower) ||
      bill.invoiceNumber?.toLowerCase().includes(searchLower) ||
      bill.doctor?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Consultation':
        return 'bg-blue-100 text-blue-800';
      case 'Reassignment':
        return 'bg-orange-100 text-orange-800';
      case 'Lab/Test':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredData.map((invoice, index) => ({
        'S.No': index + 1,
        'Invoice Number': invoice.invoiceNumber || invoice.billNo || 'N/A',
        'Patient Name': invoice.patientName,
        'UH ID': invoice.uhId,
        'Bill Type': invoice.billType,
        'Doctor': invoice.doctor,
        'Total Amount': invoice.amount || 0,
        'Paid Amount': invoice.paidAmount || 0,
        'Balance': invoice.balance || 0,
        'Status': invoice.status,
        'Payment Method': invoice.paymentMethod || 'N/A',
        'Date': new Date(invoice.date).toLocaleDateString(),
        'Services': invoice.services?.map(s => s.serviceName || s.name).join(', ') || 'N/A'
      }));

      // Convert to CSV
      const headers = Object.keys(excelData[0] || {});
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = row[header]?.toString() || '';
            // Escape commas and quotes
            return value.includes(',') || value.includes('"') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `billing_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Billing data exported to Excel successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleExportPDF = () => {
    try {
      // Create printable PDF content
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Billing Report - ${new Date().toLocaleDateString()}</title>
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
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              color: #666;
              font-size: 11px;
            }
            .summary-card p {
              margin: 0;
              font-size: 20px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              font-size: 11px;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHANRE HOSPITAL</h1>
            <p>Billing & Transactions Report</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Amount</h3>
              <p>₹${summary.totalAmount?.toLocaleString() || 0}</p>
            </div>
            <div class="summary-card">
              <h3>Total Paid</h3>
              <p>₹${summary.totalPaid?.toLocaleString() || 0}</p>
            </div>
            <div class="summary-card">
              <h3>Balance Due</h3>
              <p>₹${summary.totalBalance?.toLocaleString() || 0}</p>
            </div>
            <div class="summary-card">
              <h3>Total Invoices</h3>
              <p>${pagination.totalRecords || 0}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Invoice</th>
                <th>Patient</th>
                <th>UH ID</th>
                <th>Type</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((invoice, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${invoice.invoiceNumber || invoice.billNo || 'N/A'}</td>
                  <td>${invoice.patientName}</td>
                  <td>${invoice.uhId}</td>
                  <td>${invoice.billType}</td>
                  <td>${invoice.doctor}</td>
                  <td>₹${(invoice.amount || 0).toLocaleString()}</td>
                  <td>₹${(invoice.paidAmount || 0).toLocaleString()}</td>
                  <td>₹${(invoice.balance || 0).toLocaleString()}</td>
                  <td>${invoice.status}</td>
                  <td>${new Date(invoice.date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This is a computer-generated report from Chanre Hospital</p>
            <p>Allergy & Immunology Center | Rajajinagar, Bengaluru</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window and print
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

  const handleExport = () => {
    // Show export options
    const exportChoice = window.confirm('Click OK for Excel export, Cancel for PDF export');
    if (exportChoice) {
      handleExportExcel();
    } else {
      handleExportPDF();
    }
  };

  const handleViewInvoice = (invoice) => {
    console.log('Viewing invoice:', invoice);
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handlePrintInvoice = (invoice, shouldPrint = false) => {
    // Set the invoice to print
    setSelectedInvoice(invoice);
    
    // Open modal
    setShowInvoiceModal(true);
    
    // Only print if requested (from table row)
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  const handleDirectPrint = () => {
    // Print from within the modal
    window.print();
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
        <h1 className="text-3xl font-bold text-gray-900">Billing & Transactions</h1>
        <p className="text-gray-600 mt-2">View all invoices and transactions for your center</p>
        {user?.centerId && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <FaBuilding className="mr-1" />
              {user?.centerId?.name || 'Center'}
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Total Amount Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Amount</p>
              <p className="text-[10px] text-blue-600 mt-0.5">Active Bills Only</p>
            </div>
            <div className="p-2 bg-blue-200 rounded-lg">
              <FaMoneyBillWave className="h-4 w-4 text-blue-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-900">₹{summary.totalAmount?.toLocaleString() || 0}</p>
        </div>

        {/* Total Paid Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-4 border border-green-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Paid</p>
              <p className="text-[10px] text-green-600 mt-0.5">Received Amount</p>
            </div>
            <div className="p-2 bg-green-200 rounded-lg">
              <FaMoneyBillWave className="h-4 w-4 text-green-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-900">₹{summary.totalPaid?.toLocaleString() || 0}</p>
        </div>

        {/* Balance Due Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Balance Due</p>
              <p className="text-[10px] text-orange-600 mt-0.5">Outstanding</p>
            </div>
            <div className="p-2 bg-orange-200 rounded-lg">
              <FaExclamationTriangle className="h-4 w-4 text-orange-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-900">₹{summary.totalBalance?.toLocaleString() || 0}</p>
        </div>

        {/* Active Invoices Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Active Invoices</p>
              <p className="text-[10px] text-indigo-600 mt-0.5">Paid & Pending</p>
            </div>
            <div className="p-2 bg-indigo-200 rounded-lg">
              <FaFileInvoiceDollar className="h-4 w-4 text-indigo-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-900">{summary.activeInvoicesCount || 0}</p>
        </div>

        {/* Cancelled Bills Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Cancelled</p>
              <p className="text-[10px] text-red-600 mt-0.5">{summary.cancelledCount || 0} Bills</p>
            </div>
            <div className="p-2 bg-red-200 rounded-lg">
              <FaExclamationTriangle className="h-4 w-4 text-red-700" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-900">₹{summary.cancelledAmount?.toLocaleString() || 0}</p>
        </div>

        {/* Refunded Bills Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Refunded</p>
              <p className="text-[10px] text-purple-600 mt-0.5">{summary.refundedCount || 0} Bills</p>
            </div>
            <div className="p-2 bg-purple-200 rounded-lg">
              <FaMoneyBillWave className="h-4 w-4 text-purple-700" />
            </div>
          </div>
          <p className="text-xl font-bold text-purple-900">₹{summary.refundedAmount?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient, UH ID, invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filterBillType}
            onChange={(e) => setFilterBillType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="reassignment">Reassignment</option>
            <option value="lab">Lab/Test</option>
          </select>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-4 flex gap-4">
          <button 
            onClick={() => fetchBillingData()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaFilter className="mr-2" />
            Apply Filters
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber || invoice.billNo || 'N/A'}</div>
                    {invoice.services && invoice.services.length > 0 && (
                      <div className="text-xs text-gray-500">{invoice.services.length} services</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <FaUser className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.patientName}</div>
                        <div className="text-sm text-gray-500">{invoice.uhId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(invoice.billType)}`}>
                      {invoice.billType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{invoice.doctor || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">₹{(invoice.amount || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      // Process refunded bills correctly
                      const isRefunded = invoice.status === 'refunded';
                      const isPartiallyRefunded = invoice.status === 'partially_refunded';
                      
                      if (isRefunded || isPartiallyRefunded) {
                        // For refunded bills, calculate the refunded amount
                        const totalAmount = invoice.amount || 0;
                        const remainingAmount = invoice.paidAmount || 0;
                        const refundedAmount = totalAmount - remainingAmount;
                        
                        return (
                          <div className="text-sm font-medium text-purple-600">
                            Refunded: ₹{refundedAmount.toLocaleString()}
                          </div>
                        );
                      } else {
                        // For non-refunded bills, show paid amount
                        return (
                          <div className="text-sm font-medium text-green-600">
                            ₹{(invoice.paidAmount || 0).toLocaleString()}
                          </div>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      // Process balance correctly for refunded bills
                      const isRefunded = invoice.status === 'refunded';
                      const isPartiallyRefunded = invoice.status === 'partially_refunded';
                      
                      if (isRefunded || isPartiallyRefunded) {
                        // For refunded bills, balance is the remaining amount (penalty)
                        const remainingAmount = invoice.paidAmount || 0;
                        return (
                          <div className="text-sm font-medium text-orange-600">
                            ₹{remainingAmount.toLocaleString()}
                          </div>
                        );
                      } else {
                        // For non-refunded bills, use the original balance
                        return (
                          <div className="text-sm font-medium text-orange-600">
                            ₹{(invoice.balance || 0).toLocaleString()}
                          </div>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(invoice, true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <FaPrint className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterBillType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No billing data available for your center.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} results
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <button className="px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white border border-blue-600">
                  {pagination.currentPage}
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-center justify-center p-4" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Hidden on print */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 print:hidden">
              <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Invoice Content - Printable */}
            <div className="p-8 print:p-12" id="invoice-content">
              {/* Hospital Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Chanre Hospital</h1>
                <p className="text-sm text-gray-600">Rajajinagar, Bengaluru</p>
                <p className="text-xs text-gray-600">PH: 08040810611 | Fax: 080-42516600</p>
                <p className="text-xs text-gray-600">Website: www.chanreallergy.com</p>
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {selectedInvoice.billType === 'Reassignment' ? 'IN PATIENT BILL' : 'OUTPATIENT BILL'}
                </h2>
              </div>

              {/* Patient and Bill Details */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-6 text-sm">
                <div>
                  <p><strong>Name:</strong> {selectedInvoice.patientName}</p>
                  <p><strong>Date:</strong> {new Date(selectedInvoice.date).toLocaleString('en-IN')}</p>
                  <p><strong>Bill No:</strong> {selectedInvoice.invoiceNumber || selectedInvoice.billNo}</p>
                  <p><strong>File No:</strong> {selectedInvoice.uhId}</p>
                  <p><strong>Sex:</strong> {selectedInvoice.patientGender || 'N/A'}</p>
                  <p><strong>Age:</strong> {selectedInvoice.patientAge || 'N/A'}Y</p>
                </div>
                <div>
                  <p><strong>Consultant Name:</strong> {selectedInvoice.doctor}</p>
                  <p><strong>Department:</strong> MD (Physiology), Immunology</p>
                  <p><strong>User Name / Lab ID:</strong> {selectedInvoice.uhId}</p>
                  <p><strong>Password:</strong> {selectedInvoice.uhId}m</p>
                  <p><strong>Ref: Doctor:</strong></p>
                </div>
              </div>

              {/* Services Table */}
              <table className="w-full border-collapse border border-gray-400 mb-6 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-4 py-2">S.NO</th>
                    <th className="border border-gray-400 px-4 py-2">SERVICE NAME</th>
                    <th className="border border-gray-400 px-4 py-2">QUANTITY</th>
                    <th className="border border-gray-400 px-4 py-2">CHARGES</th>
                    <th className="border border-gray-400 px-4 py-2">PAID</th>
                    <th className="border border-gray-400 px-4 py-2">BALANCE</th>
                    <th className="border border-gray-400 px-4 py-2">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.services && selectedInvoice.services.length > 0 ? (
                    selectedInvoice.services.map((service, index) => (
                      <tr key={index}>
                        <td className="border border-gray-400 px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-400 px-4 py-2">{service.name || service.serviceName}</td>
                        <td className="border border-gray-400 px-4 py-2 text-center">{service.quantity || 1}</td>
                        <td className="border border-gray-400 px-4 py-2 text-right">{(service.amount || service.charges || 0).toFixed(2)}</td>
                        <td className="border border-gray-400 px-4 py-2 text-right">{(service.paidAmount || service.paid || 0).toFixed(2)}</td>
                        <td className="border border-gray-400 px-4 py-2 text-right">{((service.amount || service.charges || 0) - (service.paidAmount || service.paid || 0)).toFixed(2)}</td>
                        <td className="border border-gray-400 px-4 py-2 text-center">{service.status || selectedInvoice.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-gray-400 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-400 px-4 py-2">{selectedInvoice.billType} Fee</td>
                      <td className="border border-gray-400 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-400 px-4 py-2 text-right">{(selectedInvoice.amount || 0).toFixed(2)}</td>
                      <td className="border border-gray-400 px-4 py-2 text-right">{(selectedInvoice.paidAmount || 0).toFixed(2)}</td>
                      <td className="border border-gray-400 px-4 py-2 text-right">{(selectedInvoice.balance || 0).toFixed(2)}</td>
                      <td className="border border-gray-400 px-4 py-2 text-center">{selectedInvoice.status}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mb-6">
                <div className="w-96 text-sm">
                  <div className="flex justify-between py-1">
                    <span>Total Amount:</span>
                    <span className="font-semibold">₹{(selectedInvoice.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Discount(-):</span>
                    <span>₹{(selectedInvoice.discount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Tax Amount:</span>
                    <span>₹{(selectedInvoice.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-b border-gray-400 font-bold">
                    <span>Grand Total:</span>
                    <span>₹{(selectedInvoice.amount || 0).toFixed(2)}</span>
                  </div>
                  {(() => {
                    const isRefunded = selectedInvoice.status === 'refunded';
                    const isPartiallyRefunded = selectedInvoice.status === 'partially_refunded';
                    
                    if (isRefunded || isPartiallyRefunded) {
                      const totalAmount = selectedInvoice.amount || 0;
                      const remainingAmount = selectedInvoice.paidAmount || 0;
                      const refundedAmount = totalAmount - remainingAmount;
                      
                      return (
                        <>
                          <div className="flex justify-between py-1">
                            <span>Amount Paid:</span>
                            <span className="text-green-600 font-semibold">₹{totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Amount Refunded:</span>
                            <span className="text-purple-600 font-semibold">₹{refundedAmount.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <div className="flex justify-between py-1">
                          <span>Amount Paid:</span>
                          <span className="text-green-600 font-semibold">₹{(selectedInvoice.paidAmount || 0).toFixed(2)}</span>
                        </div>
                      );
                    }
                  })()}
                  <div className="flex justify-between py-1">
                    <span>Status:</span>
                    <span className="font-bold uppercase">{selectedInvoice.status}</span>
                  </div>
                </div>
              </div>

              {/* Bill Status */}
              <div className="mb-6 text-sm">
                <p><strong>Bill Status:</strong> {selectedInvoice.status?.toUpperCase()}</p>
                {selectedInvoice.refundedAmount > 0 && (
                  <p className="text-red-600">* Refund has been processed: ₹{selectedInvoice.refundedAmount.toFixed(2)}</p>
                )}
              </div>

              {/* Payment History */}
              {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Payment History</h3>
                  <table className="w-full border-collapse border border-gray-400 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 px-4 py-2">DATE</th>
                        <th className="border border-gray-400 px-4 py-2">SERVICE</th>
                        <th className="border border-gray-400 px-4 py-2">AMOUNT</th>
                        <th className="border border-gray-400 px-4 py-2">PAID</th>
                        <th className="border border-gray-400 px-4 py-2">PAYMENT METHOD</th>
                        <th className="border border-gray-400 px-4 py-2">REFUNDED</th>
                        <th className="border border-gray-400 px-4 py-2">BALANCE</th>
                        <th className="border border-gray-400 px-4 py-2">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.paymentHistory.map((payment, index) => (
                        <tr key={index}>
                          <td className="border border-gray-400 px-4 py-2">{new Date(payment.date || payment.paidAt).toLocaleDateString('en-IN')}</td>
                          <td className="border border-gray-400 px-4 py-2">{payment.description || payment.service || 'Payment'}</td>
                          <td className="border border-gray-400 px-4 py-2 text-right">₹{(payment.totalAmount || payment.amount || 0).toFixed(2)}</td>
                          <td className="border border-gray-400 px-4 py-2 text-right">₹{(payment.amount || 0).toFixed(2)}</td>
                          <td className="border border-gray-400 px-4 py-2 text-center">{payment.method || payment.paymentMethod || 'Cash'}</td>
                          <td className="border border-gray-400 px-4 py-2 text-right">₹0.00</td>
                          <td className="border border-gray-400 px-4 py-2 text-right">₹{(payment.balance || 0).toFixed(2)}</td>
                          <td className="border border-gray-400 px-4 py-2 text-center">{payment.status || selectedInvoice.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border border-gray-400 mb-6">
                <div className="bg-gray-100 px-4 py-2 font-bold text-sm">Payment Summary</div>
                <div className="p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Total Bill Amount:</span>
                    <span className="font-semibold">₹{(selectedInvoice.amount || 0).toFixed(2)}</span>
                  </div>
                  {(() => {
                    const isRefunded = selectedInvoice.status === 'refunded';
                    const isPartiallyRefunded = selectedInvoice.status === 'partially_refunded';
                    
                    if (isRefunded || isPartiallyRefunded) {
                      const totalAmount = selectedInvoice.amount || 0;
                      const remainingAmount = selectedInvoice.paidAmount || 0;
                      const refundedAmount = totalAmount - remainingAmount;
                      
                      return (
                        <>
                          <div className="flex justify-between mb-2">
                            <span>Amount Paid:</span>
                            <span className="font-semibold text-green-600">₹{totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>Amount Refunded:</span>
                            <span className="font-semibold text-purple-600">₹{refundedAmount.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <div className="flex justify-between mb-2">
                          <span>Amount Paid:</span>
                          <span className="font-semibold text-green-600">₹{(selectedInvoice.paidAmount || 0).toFixed(2)}</span>
                        </div>
                      );
                    }
                  })()}
                  <div className="flex justify-between">
                    <span>Bill Status:</span>
                    <span className="font-bold">{selectedInvoice.status?.toUpperCase()}</span>
                  </div>
                  {selectedInvoice.refundedAmount > 0 && (
                    <div className="flex justify-between mt-2 text-red-600">
                      <span>* Refund has been processed</span>
                      <span className="font-bold">₹{selectedInvoice.refundedAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="grid grid-cols-2 gap-12 text-xs mb-6">
                <div>
                  <p><strong>Generated By:</strong> {selectedInvoice.generatedBy || 'System'}</p>
                  <p><strong>Date:</strong> {new Date(selectedInvoice.generatedAt || selectedInvoice.date).toLocaleString('en-IN')}</p>
                  <p><strong>Time:</strong> {new Date(selectedInvoice.generatedAt || selectedInvoice.date).toLocaleTimeString('en-IN')}</p>
                </div>
                <div className="border border-gray-400 p-3">
                  <p className="font-bold mb-2">Invoice Terms</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Original invoice document</li>
                    <li>Payment due upon receipt</li>
                    <li>Keep for your records</li>
                    <li>No refunds after 7 days</li>
                  </ul>
                  <p className="mt-3 text-right">Signature:</p>
                  <p className="text-right text-xs mt-1">For Chanre Hospital</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-4">
                <p className="font-semibold">"For Home Sample Collection"</p>
                <p>Miss Call: 080-42516666|Mobile: 9686197153</p>
              </div>
            </div>

            {/* Modal Actions - Hidden on print */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDirectPrint}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPrint className="mr-2" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          /* Hide all buttons, filters, and navigation elements */
          .print\\:hidden,
          button:not(#invoice-content button),
          nav,
          header,
          .shadow-md:not(#invoice-content .shadow-md),
          input,
          select {
            display: none !important;
          }
          
          /* Remove modal positioning for print */
          .fixed {
            position: static !important;
            background: white !important;
            padding: 0 !important;
          }
          
          /* Make invoice content full width */
          .fixed > div {
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          /* Ensure invoice content prints correctly */
          #invoice-content {
            padding: 20px !important;
          }
          
          /* Page break settings */
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default AccountantBilling;
