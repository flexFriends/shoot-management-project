/**
 * Standard API Response format
 */
export const apiResponse = (res, statusCode, success, data = null, message = '') => {
  return res.status(statusCode).json({
    success,
    status: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Success response
 */
export const successResponse = (res, statusCode, data, message = 'Success') => {
  return apiResponse(res, statusCode, true, data, message);
};

/**
 * Error response
 */
export const errorResponse = (res, statusCode, message = 'Error', details = null) => {
  return apiResponse(res, statusCode, false, { error: message, details }, message);
};

export default {
  apiResponse,
  successResponse,
  errorResponse,
};
