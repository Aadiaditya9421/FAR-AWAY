import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwtUtils.js";
import { AppError } from "../utils/responseHandler.js";
import { ERROR_CODES } from "../utils/errorCodes.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Authentication token is required", 401, ERROR_CODES.AUTH_REQUIRED);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password -refreshTokens");

    if (!user) {
      throw new AppError("Authenticated user no longer exists", 401, ERROR_CODES.AUTH_INVALID);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError("Invalid or expired token", 401, ERROR_CODES.AUTH_INVALID));
      return;
    }
    next(error);
  }
}
