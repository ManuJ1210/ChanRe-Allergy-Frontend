const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json());

// Test endpoint
app.get('/api/auth/me', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    status: 'success',
    user: { id: 1, name: 'Test User' }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple test login
  if (email === 'test@example.com' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'test-token-123',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test backend server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/health`);
});
