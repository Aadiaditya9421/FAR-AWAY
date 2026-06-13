import {
  registerUser,
  googleAuthUser,
  loginUser,
  logoutUser,
  refreshAuthToken,
  requestPasswordReset,
  recordCurrentUserLogin,
  resetPassword,
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

export async function googleAuth(req, res) {
  const data = await googleAuthUser(req.body);
  return sendSuccess(res, { message: "Google sign-in successful", data });
}

export async function forgotPassword(req, res) {
  const data = await requestPasswordReset(req.body);
  return sendSuccess(res, {
    message: "If that email is registered, a password reset link has been sent.",
    data,
  });
}

export async function completePasswordReset(req, res) {
  const data = await resetPassword(req.body);
  return sendSuccess(res, { message: "Password reset successful", data });
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
  const user = await recordCurrentUserLogin(req.user);
  return sendSuccess(res, { message: "Current user", data: user });
}
