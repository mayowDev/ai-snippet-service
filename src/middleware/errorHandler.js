function errorHandler(err, req, res, next) {
  // Log the error
  console.error("[ErrorHandler]", err);

  // Set status code
  const status = err.status || 500;

  // Hide stack trace in production
  const response = {
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  };
  if (process.env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler; 