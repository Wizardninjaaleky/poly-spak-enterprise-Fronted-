const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth');
const products = require('./routes/products');
const orders = require('./routes/orders');
const payments = require('./routes/payments');
const admin = require('./routes/admin');

// Security middleware
const securityMiddleware = require('./middleware/security');

const app = express();

// Apply security middleware
securityMiddleware(app);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/payments', payments);
app.use('/api/admin', admin);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Polyspak Backend is running successfully 🚀'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Polyspack API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

module.exports = app;
