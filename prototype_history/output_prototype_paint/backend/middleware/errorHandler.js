'use strict';

/**
 * Global Express error handling middleware.
 * Must have 4 parameters to be recognized as error handler by Express.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ErrorHandler]', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific known error types
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'The image data exceeds the maximum allowed size of 50MB'
    });
  }

  if (err.name === 'SyntaxError' && err.status === 400) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains malformed JSON'
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  });
}

module.exports = errorHandler;