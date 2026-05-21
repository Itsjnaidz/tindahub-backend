require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const cartRoutes = require('./routes/cart.routes');
const categoryRoutes = require('./routes/category.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const notificationRoutes = require('./routes/notification.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const productRoutes = require('./routes/product.routes');
const storeRoutes = require('./routes/store.routes');
const walletRoutes = require('./routes/wallet.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TindaHub Backend is running',
    availableRoutes: ['/health', '/api/auth', '/api/product', '/api/cart', '/api/order'],
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/category', authMiddleware, categoryRoutes);
app.use('/api/delivery', authMiddleware, deliveryRoutes);
app.use('/api/notification', authMiddleware, notificationRoutes);
app.use('/api/order', authMiddleware, orderRoutes);
app.use('/api/payment', authMiddleware, paymentRoutes);
app.use('/api/product', authMiddleware, productRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);

// Not Found Handler — respond directly to avoid noisy error stacks for common 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handling Middleware (must be last)
app.use(errorHandler);

// Start Server with error handling for EADDRINUSE (port in use)
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`TindaHub Backend Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} in use, retrying on port ${nextPort}...`);
      // attempt to close and restart on next port
      server.close(() => startServer(nextPort));
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);

module.exports = app;
