import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authenticate JWT token middleware
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authorization token required');
    }

    const token = authHeader.slice(7); // Remove 'Bearer '
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 401, 'Invalid or expired token');
    }

    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Authentication failed', error.message);
  }
};

/**
 * Authorize by roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

export default { authenticate, authorize };
