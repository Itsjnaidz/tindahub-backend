/**
 * Global error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Only log server errors (500+) to avoid noisy logs for client errors (404/400)
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  } else {
    console.warn('Client Error:', err.message || err);
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
};
