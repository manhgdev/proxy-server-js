/**
 * Custom error class cho API errors
 */
class APIError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad Request', errors = []) {
    super(message, 400, errors);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized', errors = []) {
    super(message, 401, errors);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends APIError {
  constructor(message = 'Forbidden', errors = []) {
    super(message, 403, errors);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends APIError {
  constructor(message = 'Resource not found', errors = []) {
    super(message, 404, errors);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends APIError {
  constructor(message = 'Conflict', errors = []) {
    super(message, 409, errors);
  }
}

/**
 * 422 Validation Error
 */
class ValidationError extends APIError {
  constructor(message = 'Validation Error', errors = []) {
    super(message, 422, errors);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal Server Error', errors = []) {
    super(message, 500, errors);
  }
}

/**
 * 503 Service Unavailable Error
 */
class ServiceUnavailableError extends APIError {
  constructor(message = 'Service Unavailable', errors = []) {
    super(message, 503, errors);
  }
}

export {
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError
}; 