/**
 * Global error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
};
