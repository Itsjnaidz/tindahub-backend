require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not configured. Authentication endpoints require this secret.');
}

// Import controllers
const authController = require('./controllers/auth.controller');
const analyticsController = require('./controllers/analytics.controller');
const cartController = require('./controllers/cart.controller');
const categoryController = require('./controllers/category.controller');
const deliveryController = require('./controllers/delivery.controller');
const notificationController = require('./controllers/notification.controller');
const orderController = require('./controllers/order.controller');
const paymentController = require('./controllers/payment.controller');
const productController = require('./controllers/product.controller');
const storeController = require('./controllers/store.controller');
const walletController = require('./controllers/wallet.controller');

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
app.get('/api/auth', (req, res) => {
  res.status(200).json({
    message: 'Auth service is running',
    availableRoutes: ['/generate-otp', '/verify-otp', '/logout'],
    method: 'POST',
  });
});
app.post('/api/auth/generate-otp', authController.generateOTP);
app.post('/api/auth/verify-otp', authController.verifyOTP);
app.post('/api/auth/logout', authMiddleware, authController.logout);

app.get('/api/analytics/merchant', authMiddleware, analyticsController.getMerchantAnalytics);
app.get('/api/analytics/orders', authMiddleware, analyticsController.getOrderAnalytics);

app.post('/api/cart/add', authMiddleware, cartController.addToCart);
app.get('/api/cart', authMiddleware, cartController.getCart);
app.put('/api/cart/:cartItemId', authMiddleware, cartController.updateCartItem);
app.delete('/api/cart/:cartItemId', authMiddleware, cartController.removeFromCart);
app.delete('/api/cart', authMiddleware, cartController.clearCart);

app.post('/api/category', authMiddleware, categoryController.createCategory);
app.get('/api/category', authMiddleware, categoryController.getCategories);
app.put('/api/category/:categoryId', authMiddleware, categoryController.updateCategory);
app.delete('/api/category/:categoryId', authMiddleware, categoryController.deleteCategory);

app.post('/api/delivery/tracking', authMiddleware, deliveryController.setTrackingInfo);
app.get('/api/delivery/tracking/:orderId', authMiddleware, deliveryController.getTrackingInfo);
app.put('/api/delivery/:orderId/status', authMiddleware, deliveryController.updateDeliveryStatus);

app.post('/api/notification/sms', authMiddleware, notificationController.sendSMSNotification);
app.post('/api/notification/whatsapp', authMiddleware, notificationController.sendWhatsAppNotification);
app.get('/api/notification/history', authMiddleware, notificationController.getNotificationHistory);

app.post('/api/order', authMiddleware, orderController.createOrder);
app.get('/api/order', authMiddleware, orderController.getUserOrders);
app.get('/api/order/:orderId', authMiddleware, orderController.getOrderById);
app.put('/api/order/:orderId/status', authMiddleware, orderController.updateOrderStatus);
app.put('/api/order/:orderId/cancel', authMiddleware, orderController.cancelOrder);

app.post('/api/payment/gcash', authMiddleware, paymentController.processGCashPayment);
app.post('/api/payment/maya', authMiddleware, paymentController.processMayaPayment);
app.get('/api/payment/transactions/:orderId', authMiddleware, paymentController.getTransactionHistory);

app.post('/api/product', authMiddleware, productController.createProduct);
app.get('/api/product', authMiddleware, productController.getMerchantProducts);
app.get('/api/product/:productId', authMiddleware, productController.getProductById);
app.put('/api/product/:productId', authMiddleware, productController.updateProduct);
app.delete('/api/product/:productId', authMiddleware, productController.deleteProduct);
app.put('/api/product/:productId/inventory', authMiddleware, productController.updateInventory);

app.post('/api/store/register', authMiddleware, storeController.registerStore);
app.get('/api/store/:storeId', authMiddleware, storeController.getStoreInfo);
app.put('/api/store/:storeId', authMiddleware, storeController.updateStore);

app.get('/api/wallet/balance', authMiddleware, walletController.getWalletBalance);
app.get('/api/wallet/transactions', authMiddleware, walletController.getWalletTransactions);
app.post('/api/wallet/withdraw', authMiddleware, walletController.withdrawFunds);

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
