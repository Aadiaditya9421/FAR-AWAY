import { Server } from "socket.io";
import { env } from "../config/env.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

let io;

/**
 * Initialise a Socket.io server attached to the given HTTP server.
 * Returns the io instance so other socket modules can attach namespaces.
 */
export function initializeSockets(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Default namespace — lightweight notification channel.
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("disconnect", () => {
      // Clean-up handled automatically by Socket.io rooms.
    });
  });

  console.log("Socket.io initialised");
  return io;
}

/**
 * Get the current io instance (available after initializeSockets has been called).
 */
export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialised — call initializeSockets first");
  }
  return io;
}

/**
 * Push a notification payload to a specific user.
 */
export function notifyUser(userId, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION, payload);
}
