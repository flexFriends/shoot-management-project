import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return errorResponse(res, 409, `${field} already exists`);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Record not found');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Token expired');
  }

  // Validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 400, 'Validation error', details);
  }

  // Default error
  return errorResponse(
    res,
    err.status || 500,
    err.message || 'Internal server error'
  );
};

export default errorHandler;
