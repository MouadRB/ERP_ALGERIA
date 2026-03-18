const { AppError } = require('../errors/AppError');

/**
 * Express 4-argument error handler — must be registered last in index.js.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.field ? { field: err.field } : {}),
        requestId: req.requestId,
      },
    });
  }

  // Unexpected error
  // eslint-disable-next-line no-console
  console.error(`[ERROR] requestId=${req.requestId}`, err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Une erreur inattendue est survenue.',
      requestId: req.requestId,
    },
  });
};

module.exports = errorHandler;