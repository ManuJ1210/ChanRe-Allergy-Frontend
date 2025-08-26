import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ReceptionistLayout from './ReceptionistLayout';
import { fetchReceptionistBillingRequests, generateReceptionistBill, markReceptionistBillPaid } from '../../features/receptionist/receptionistThunks';
import { Search, Filter, Plus, CheckCircle, FileText, IndianRupee, Hash, X, CreditCard, Receipt, Upload } from 'lucide-react';

const currencySymbol = '₹';

export default function ReceptionistBilling() {
  const dispatch = useDispatch();
  const { billingRequests, loading, error } = useSelector((s) => s.receptionist);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([{ name: '', code: '', quantity: 1, unitPrice: 0 }]);
  const [taxes, setTaxes] = useState(0);
  const [discounts, setDiscounts] = useState(0);
  const [notes, setNotes] = useState('');
  
  // ✅ NEW: Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    transactionId: '',
    receiptUpload: '',
    paymentNotes: ''
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState(null);

  useEffect(() => {
    dispatch(fetchReceptionistBillingRequests());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (billingRequests || [])
      .filter(r => {
        if (status === 'all') return true;
        if (status === 'payment_received') {
          return r.status === 'Billing_Generated' && r.billing?.status === 'payment_received';
        }
        return r.status === status;
      })
      .filter(r => !term || 
        `${r.patientName || ''} ${r.doctorName || ''} ${r.testType || ''}`.toLowerCase().includes(term));
  }, [billingRequests, search, status]);

  const subTotal = items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  const grandTotal = Math.max(0, subTotal + Number(taxes || 0) - Number(discounts || 0));

  const openBillModal = (req) => {
    setSelected(req);
    if (req.billing?.items?.length) {
      setItems(req.billing.items.map(it => ({ name: it.name, code: it.code, quantity: it.quantity, unitPrice: it.unitPrice })));
      setTaxes(req.billing.taxes || 0);
      setDiscounts(req.billing.discounts || 0);
      setNotes(req.billing.notes || '');
    } else {
      setItems([{ name: req.testType || '', code: '', quantity: 1, unitPrice: 0 }]);
      setTaxes(0);
      setDiscounts(0);
      setNotes('');
    }
  };

  const closeBillModal = () => {
    setSelected(null);
  };

  // ✅ NEW: Open payment modal
  const openPaymentModal = (req) => {
    setSelectedForPayment(req);
    setPaymentDetails({
      paymentMethod: '',
      transactionId: '',
      receiptUpload: '',
      paymentNotes: ''
    });
    setShowPaymentModal(true);
  };

  // ✅ NEW: Close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedForPayment(null);
    setPaymentDetails({
      paymentMethod: '',
      transactionId: '',
      receiptUpload: '',
      paymentNotes: ''
    });
  };

  const updateItem = (idx, patch) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const addItem = () => setItems(prev => [...prev, { name: '', code: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleGenerate = async () => {
    if (!selected) return;
    
    // Validate required fields
    const hasValidItems = items.some(item => item.name && item.unitPrice > 0);
    if (!hasValidItems) {
      toast.error('Please add at least one item with a name and price');
      return;
    }
    
    const payload = { items, taxes: Number(taxes || 0), discounts: Number(discounts || 0), currency: 'INR', notes };
    try {
      await dispatch(generateReceptionistBill({ requestId: selected._id, payload })).unwrap();
      toast.success('Bill generated successfully');
      closeBillModal();
      dispatch(fetchReceptionistBillingRequests());
    } catch (e) {
      toast.error(e || 'Failed to generate bill');
    }
  };

  // ✅ NEW: Enhanced mark paid with payment details
  const handleMarkPaid = async () => {
    if (!selectedForPayment) return;
    
    // Validate payment details
    if (!paymentDetails.paymentMethod || !paymentDetails.transactionId) {
      toast.error('Payment method and transaction ID are required');
      return;
    }
    
    try {
      await dispatch(markReceptionistBillPaid({ 
        requestId: selectedForPayment._id, 
        paymentNotes: paymentDetails.paymentNotes,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
        receiptUpload: paymentDetails.receiptUpload
      })).unwrap();
      toast.success('Payment recorded successfully. Status changed to Payment Received.');
      closePaymentModal();
      dispatch(fetchReceptionistBillingRequests());
    } catch (e) {
      toast.error(e || 'Failed to record payment');
    }
  };

  // ✅ NEW: Handle file upload for receipt
  const handleReceiptUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // For now, we'll store the filename. In a real app, you'd upload to cloud storage
      setPaymentDetails(prev => ({ ...prev, receiptUpload: file.name }));
    }
  };

  return (
    <ReceptionistLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800">Billing Management</h1>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg" placeholder="Search patient, doctor or test" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="px-3 py-2 border border-slate-300 rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="Billing_Pending">Billing Pending</option>
                <option value="Billing_Generated">Billing Generated</option>
                <option value="payment_received">Payment Received</option>
                <option value="Billing_Paid">Billing Paid & Verified</option>
              </select>
              <button 
                onClick={() => dispatch(fetchReceptionistBillingRequests())}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading billing requests...</p>
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Test</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map(req => (
                      <tr key={req._id}>
                        <td className="px-4 py-3 text-sm">{req.patientName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{req.patientPhone || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          {req.patientAddress || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">{req.doctorName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{req.testType || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs border ${
                            req.status === 'Billing_Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            req.status === 'Billing_Generated' && req.billing?.status === 'payment_received' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            req.status === 'Billing_Generated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            req.status === 'Billing_Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {req.status === 'Billing_Generated' && req.billing?.status === 'payment_received' 
                              ? 'Payment Received' 
                              : req.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {typeof req.billing?.amount === 'number' ? (
                            <span className="font-medium text-slate-800">
                              {currencySymbol}{req.billing.amount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          {req.status === 'Billing_Pending' && (
                            <button onClick={() => openBillModal(req)} className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-xs">
                              <Plus className="h-3 w-3 mr-1" /> Generate Bill
                            </button>
                          )}
                          {req.status === 'Billing_Generated' && req.billing?.status !== 'payment_received' && (
                            <>
                              <button onClick={() => openBillModal(req)} className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs">
                                <FileText className="h-3 w-3 mr-1" /> View/Edit Bill
                              </button>
                              <button onClick={() => openPaymentModal(req)} className="inline-flex items-center px-3 py-1 bg-emerald-600 text-white rounded-md text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" /> Record Payment
                              </button>
                            </>
                          )}
                          {req.status === 'Billing_Generated' && req.billing?.status === 'payment_received' && (
                            <span className="inline-flex items-center text-orange-700 text-xs">
                              <CheckCircle className="h-4 w-4 mr-1" /> Payment Received
                            </span>
                          )}
                          {req.status === 'Billing_Paid' && (
                            <span className="inline-flex items-center text-emerald-700 text-xs">
                              <CheckCircle className="h-4 w-4 mr-1" /> Paid & Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-slate-400 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-slate-600 mb-2">No billing requests found</p>
                <p className="text-slate-500 text-sm">
                  Billing requests will appear here when doctors create test requests. 
                  <br />
                  As a receptionist, your role is to handle billing for test requests and record payments.
                  <br />
                  <span className="text-blue-600 font-medium">Enhanced Workflow:</span> Pending → Generate Bill → Payment Received → Center Admin Verification → Lab Processing
                </p>
              </div>
            )}
          </div>

          {/* Bill Generation Modal */}
          {selected && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Generate Invoice</div>
                    <div className="font-semibold text-slate-800">{selected.patientName || 'N/A'} - {selected.testType || 'N/A'}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Doctor: {selected.doctorName || 'N/A'} | Center: {selected.centerName || 'N/A'}
                    </div>
                  </div>
                  <button onClick={closeBillModal} className="p-1 rounded hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="text-left text-xs text-slate-500">
                          <th className="py-2">Item</th>
                          <th className="py-2">Code</th>
                          <th className="py-2">Qty</th>
                          <th className="py-2">Unit Price</th>
                          <th className="py-2">Total</th>
                          <th className="py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, idx) => (
                          <tr key={idx} className="text-sm">
                            <td className="py-2 pr-2">
                              <input 
                                className={`w-full border px-2 py-1 rounded ${!it.name ? 'border-red-300' : ''}`} 
                                value={it.name} 
                                onChange={(e) => updateItem(idx, { name: e.target.value })} 
                                placeholder="Item name *" 
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                className="w-full border px-2 py-1 rounded" 
                                value={it.code} 
                                onChange={(e) => updateItem(idx, { code: e.target.value })} 
                                placeholder="Code (optional)" 
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="number" 
                                className="w-20 border px-2 py-1 rounded" 
                                value={it.quantity} 
                                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} 
                                min={1} 
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="number" 
                                className={`w-28 border px-2 py-1 rounded ${!it.unitPrice || it.unitPrice <= 0 ? 'border-red-300' : ''}`} 
                                value={it.unitPrice} 
                                onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} 
                                min={0} 
                                step="0.01" 
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-2 pr-2 font-medium">{currencySymbol}{(Number(it.quantity || 0) * Number(it.unitPrice || 0)).toFixed(2)}</td>
                            <td className="py-2">
                              <button 
                                onClick={() => removeItem(idx)} 
                                className="text-red-600 text-xs hover:text-red-800"
                                disabled={items.length === 1}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={addItem} className="mt-2 inline-flex items-center px-3 py-1 bg-slate-100 rounded text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Taxes</label>
                      <input type="number" className="w-full border px-2 py-1 rounded" value={taxes} onChange={(e) => setTaxes(Number(e.target.value))} min={0} step="0.01" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Discounts</label>
                      <input type="number" className="w-full border px-2 py-1 rounded" value={discounts} onChange={(e) => setDiscounts(Number(e.target.value))} min={0} step="0.01" />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full bg-slate-50 border rounded px-3 py-2 text-sm font-medium">Grand Total: {currencySymbol}{grandTotal.toFixed(2)}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500">Notes</label>
                    <textarea className="w-full border px-2 py-1 rounded" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for the invoice" />
                    <p className="text-xs text-slate-500 mt-1">
                      After generating the bill, the test request will be ready for payment recording. Once payment is recorded, it will await center admin verification before proceeding to lab processing.
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <p>• Bill will be generated with a unique invoice number</p>
                    <p>• Test request status will change to "Billing Generated"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={closeBillModal} className="px-3 py-2 text-sm rounded bg-slate-100 hover:bg-slate-200">Cancel</button>
                    <button onClick={handleGenerate} disabled={loading} className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save Bill</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Payment Recording Modal */}
          {showPaymentModal && selectedForPayment && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Record Payment</div>
                    <div className="font-semibold text-slate-800">{selectedForPayment.patientName || 'N/A'} - {selectedForPayment.testType || 'N/A'}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Amount: {currencySymbol}{selectedForPayment.billing?.amount?.toFixed(2) || '0.00'} | Center: {selectedForPayment.centerName || 'N/A'}
                    </div>
                  </div>
                  <button onClick={closePaymentModal} className="p-1 rounded hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={paymentDetails.paymentMethod}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        required
                      >
                        <option value="">Select payment method</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card (Credit/Debit)</option>
                        <option value="UPI">UPI</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Transaction ID <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter transaction ID or reference number"
                        value={paymentDetails.transactionId}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Receipt Upload (Optional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="receipt-upload"
                        onChange={handleReceiptUpload}
                      />
                      <label 
                        htmlFor="receipt-upload"
                        className="flex items-center px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                      {paymentDetails.receiptUpload && (
                        <span className="text-sm text-slate-600 flex items-center">
                          <Receipt className="h-4 w-4 mr-1" />
                          {paymentDetails.receiptUpload}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Supported formats: PDF, JPG, JPEG, PNG
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Payment Notes (Optional)
                    </label>
                    <textarea 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes about the payment..."
                      value={paymentDetails.paymentNotes}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentNotes: e.target.value }))}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Payment Workflow</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>1. Record payment details (you are here)</p>
                          <p>2. Payment will be marked as received</p>
                          <p>3. Center admin will verify the payment</p>
                          <p>4. Once verified, test request proceeds to lab</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <p>• Payment will be recorded and status changed to "Payment Received"</p>
                    <p>• Center admin must verify before proceeding to lab</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={closePaymentModal} className="px-3 py-2 text-sm rounded bg-slate-100 hover:bg-slate-200">Cancel</button>
                    <button 
                      onClick={handleMarkPaid} 
                      disabled={!paymentDetails.paymentMethod || !paymentDetails.transactionId}
                      className="px-3 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReceptionistLayout>
  );
}



