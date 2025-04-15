import { APIError, InternalServerError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Middleware xử lý lỗi tập trung
 */
const errorHandler = (err, req, res, next) => {
  // Ghi log lỗi
  logger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    stack: err.stack,
    name: err.name
  });
  
  // Nếu lỗi là từ Joi Validation
  if (err.isJoi) {
    return res.status(422).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  // Nếu lỗi là từ MongoDB
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // Duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Duplicate entry',
        errors: [{ field: Object.keys(err.keyPattern)[0], message: 'Already exists' }]
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Database error',
      errors: process.env.NODE_ENV === 'development' ? [{ message: err.message }] : []
    });
  }
  
  // Nếu lỗi là từ Mongoose Validation
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message
    }));
    
    return res.status(422).json({
      status: 'error',
      message: 'Validation Error',
      errors
    });
  }
  
  // Nếu lỗi là từ custom APIError
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }
  
  // Nếu lỗi là SyntaxError (JSON parse error)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON',
      errors: [{ message: 'Could not parse JSON data' }]
    });
  }
  
  // Lỗi mặc định
  const internalError = new InternalServerError();
  
  res.status(internalError.statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? internalError.message : err.message,
    errors: process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : []
  });
};

/**
 * Middleware xử lý 404 Not Found
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    errors: [{ message: 'Resource not found' }]
  });
};

export {
  errorHandler,
  notFoundHandler
}; 