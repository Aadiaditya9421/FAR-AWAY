import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { env } from "../config/env.js";
import { getRedisClient } from "../config/redis.js";
import { logger } from "../config/logger.js";
import { authenticateSocket } from "./socketAuth.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

let io;
let socketAdapterSubscriber;

async function attachRedisAdapter() {
  if (!env.redisEnabled) return;

  const pubClient = getRedisClient();
  if (!pubClient?.isOpen) {
    logger.warn("Socket.io Redis adapter skipped because Redis is not connected.");
    return;
  }

  socketAdapterSubscriber = pubClient.duplicate();
  await socketAdapterSubscriber.connect();
  io.adapter(createAdapter(pubClient, socketAdapterSubscriber));
  logger.info("Socket.io Redis adapter attached");
}

/**
 * Initialise a Socket.io server attached to the given HTTP server.
 * Returns the io instance so other socket modules can attach namespaces.
 */
export async function initializeSockets(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  await attachRedisAdapter();

  io.use(authenticateSocket);

  // Default namespace — lightweight notification channel.
  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on("disconnect", () => {
      // Clean-up handled automatically by Socket.io rooms.
    });
  });

  logger.info("Socket.io initialised");
  return io;
}

export async function closeSocketAdapter() {
  if (socketAdapterSubscriber?.isOpen) {
    await socketAdapterSubscriber.quit();
  }
  socketAdapterSubscriber = null;
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

function normalizeDataChangedPayload(payload = {}) {
  const normalized = {
    scope: payload.scope || "all",
    source: payload.source || "server",
    updatedAt: new Date().toISOString(),
  };

  if (payload.entityId) normalized.entityId = payload.entityId.toString();
  if (payload.message) normalized.message = payload.message;
  if (payload.actorId) normalized.actorId = payload.actorId.toString();
  if (payload.audience) normalized.audience = payload.audience;

  return normalized;
}

/**
 * Tell every authenticated client to refresh data through normal API routes.
 * The payload intentionally stays generic; private data remains behind API auth.
 */
export function emitAppDataChanged(payload = {}) {
  if (!io) return;
  io.emit(SOCKET_EVENTS.APP_DATA_CHANGED, normalizeDataChangedPayload(payload));
}

/**
 * Tell selected users to refresh private account/user-scoped data.
 */
export function emitUserDataChanged(userId, payload = {}) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(
    SOCKET_EVENTS.APP_DATA_CHANGED,
    normalizeDataChangedPayload({
      scope: "account",
      audience: "user",
      ...payload,
    }),
  );
}

export function emitUsersDataChanged(userIds = [], payload = {}) {
  const uniqueIds = [...new Set(userIds.map((id) => id?._id?.toString?.() || id?.toString?.()).filter(Boolean))];
  uniqueIds.forEach((id) => emitUserDataChanged(id, payload));
}
