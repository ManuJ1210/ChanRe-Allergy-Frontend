// Debug utility for partial payments
export const debugPartialPayments = () => {
  console.log('🔍 Debugging Partial Payments...');
  
  // Get all partial payment keys from localStorage
  const keys = Object.keys(localStorage).filter(key => key.startsWith('partial_payment_'));
  
  console.log('📋 Found partial payment keys:', keys);
  
  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key));
    const totalPaid = data.reduce((sum, payment) => sum + payment.amount, 0);
    console.log(`💰 ${key}:`, {
      payments: data,
      totalPaid,
      count: data.length
    });
  });
  
  return keys.map(key => ({
    requestId: key.replace('partial_payment_', ''),
    payments: JSON.parse(localStorage.getItem(key)),
    totalPaid: JSON.parse(localStorage.getItem(key)).reduce((sum, payment) => sum + payment.amount, 0)
  }));
};

// Clear all partial payment data (for testing)
export const clearPartialPayments = () => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('partial_payment_'));
  keys.forEach(key => localStorage.removeItem(key));
  console.log('🗑️ Cleared all partial payment data');
};

// Add test partial payment data
export const addTestPartialPayment = (requestId, amount = 5000) => {
  const paymentKey = `partial_payment_${requestId}`;
  const existingPayments = JSON.parse(localStorage.getItem(paymentKey) || '[]');
  existingPayments.push({
    amount: amount,
    method: 'Cash',
    transactionId: `TEST_${Date.now()}`,
    timestamp: new Date().toISOString(),
    notes: 'Test payment'
  });
  localStorage.setItem(paymentKey, JSON.stringify(existingPayments));
  console.log('✅ Added test partial payment:', { requestId, amount });
};
