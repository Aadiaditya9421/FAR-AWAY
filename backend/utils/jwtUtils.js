import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl },
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenTtl },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
