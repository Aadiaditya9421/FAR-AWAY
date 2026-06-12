import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAuthToken,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from "../services/authService.js";
import { sendCreated, sendSuccess } from "../utils/responseHandler.js";

export async function register(req, res) {
  const data = await registerUser(req.body);
  return sendCreated(res, { message: "Registration successful", data });
}

export async function login(req, res) {
  const data = await loginUser(req.body);
  return sendSuccess(res, { message: "Login successful", data });
}

export async function logout(req, res) {
  await logoutUser(req.user._id, req.body.refreshToken);
  return sendSuccess(res, { message: "Logout successful" });
}

export async function refreshToken(req, res) {
  const data = await refreshAuthToken(req.body.refreshToken);
  return sendSuccess(res, { message: "Token refreshed", data });
}

export async function me(req, res) {
  return sendSuccess(res, { message: "Current user", data: req.user });
}

export async function forgotPassword(req, res) {
  await requestPasswordReset(req.body.email);
  // Always the same response, regardless of whether the email exists.
  return sendSuccess(res, {
    message: "If an account with that email exists, a password reset link has been sent.",
  });
}

export async function resetPassword(req, res) {
  await resetPasswordService(req.body);
  return sendSuccess(res, {
    message: "Password has been reset. Please log in with your new password.",
  });
}
