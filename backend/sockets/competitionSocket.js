import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import { logger } from "../config/logger.js";
import { authenticateSocket } from "./socketAuth.js";

/**
 * Attach the competition namespace to the Socket.io server.
 * Clients join a competition-specific room so they only receive updates
 * for the competition they are watching.
 */
export function attachCompetitionSocket(io) {
  const ns = io.of("/competition");
  ns.use(authenticateSocket);

  ns.on("connection", (socket) => {
    socket.on("join", (competitionId) => {
      if (typeof competitionId === "string" && competitionId.length > 0) {
        socket.join(`comp:${competitionId}`);
        socket.emit(SOCKET_EVENTS.COMPETITION_JOINED, { competitionId });
      }
    });

    socket.on("leave", (competitionId) => {
      if (typeof competitionId === "string") {
        socket.leave(`comp:${competitionId}`);
      }
    });

    socket.on("disconnect", () => {
      // Rooms are cleaned up automatically.
    });
  });

  logger.info("Competition socket namespace attached");
}

/**
 * Broadcast a competition update to all clients watching a specific competition.
 */
export function emitCompetitionUpdate(io, competitionId, data) {
  io.of("/competition")
    .to(`comp:${competitionId}`)
    .emit(SOCKET_EVENTS.COMPETITION_UPDATED, { competitionId, ...data });
}
