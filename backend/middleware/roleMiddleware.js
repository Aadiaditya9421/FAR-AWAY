import { ERROR_CODES } from "../utils/errorCodes.js";
import { AppError } from "../utils/responseHandler.js";

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, ERROR_CODES.AUTH_REQUIRED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to perform this action", 403, ERROR_CODES.FORBIDDEN));
      return;
    }

    next();
  };
}
