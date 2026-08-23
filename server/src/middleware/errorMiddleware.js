const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Handle explicit Integration & Auth errors
  if (err.name === 'IntegrationError' || err.code === 'INTEGRATION_NOT_CONNECTED') {
    statusCode = 400;
    errorCode = 'INTEGRATION_NOT_CONNECTED';
  } else if (err.name === 'AuthExpiredError' || err.code === 'AUTH_EXPIRED') {
    statusCode = 401;
    errorCode = 'AUTH_EXPIRED';
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with specified ID';
    errorCode = 'RESOURCE_NOT_FOUND';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errorCode = 'DUPLICATE_KEY';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
