import { validationResult } from 'express-validator';

/**
 * Middleware to validate request data based on express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors: errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }))
  });
}; 