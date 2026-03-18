const { z } = require('zod');
const { AppError } = require('../errors/AppError');

/**
 * Factory that validates req.body against a Zod schema.
 * Returns 422 with field-level errors on failure.
 *
 * Usage:
 *   router.post('/', validate(createOrderSchema), handler)
 */
const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return next(
        new AppError(
          'VALIDATION_ERROR',
          firstError.message,
          422,
          firstError.path.join('.'),
        ),
      );
    }

    req.validated = result.data;
    next();
  };
};

/**
 * Factory that validates req.query against a Zod schema.
 */
const validateQuery = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return next(
        new AppError(
          'VALIDATION_ERROR',
          firstError.message,
          422,
          firstError.path.join('.'),
        ),
      );
    }

    req.validatedQuery = result.data;
    next();
  };
};

module.exports = { validate, validateQuery };