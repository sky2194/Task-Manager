// errorHandler.js — Global Error Handler Middleware
// ================================================
// Express recognizes error-handling middleware by its
// 4-parameter signature: (err, req, res, next).
// Any error passed via next(err) will land here.
// ================================================

function errorHandler(err, req, res, next) {
  // Log the full error stack trace to the console (useful for debugging)
  console.error(err.stack);

  // Determine the HTTP status code.
  // If the error has a custom statusCode, use it; otherwise default to 500.
  const statusCode = err.statusCode || 500;

  // Send a clean JSON error response to the client
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
}

module.exports = errorHandler;
