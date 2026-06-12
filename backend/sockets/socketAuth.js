import { verifyAccessToken } from "../utils/jwtUtils.js";

function readSocketToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake.headers?.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) return token;

  return "";
}

export function authenticateSocket(socket, next) {
  try {
    const token = readSocketToken(socket);
    if (!token) {
      throw new Error("Socket authentication token is required");
    }

    const decoded = verifyAccessToken(token);
    socket.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch {
    next(new Error("Socket authentication failed"));
  }
}

