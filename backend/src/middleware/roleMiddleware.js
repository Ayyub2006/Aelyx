import { errorResponse } from '../utils/apiResponse.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`
      );
    }
    next();
  };
};
