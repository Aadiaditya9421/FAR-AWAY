import { io } from 'socket.io-client';
import { getAccessToken } from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing slash and '/api' to get the socket host
const SOCKET_HOST = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

let rootSocket = null;
let leaderboardSocket = null;
let competitionSocket = null;

export function connectSockets() {
  if (rootSocket) return;

  const token = getAccessToken();
  if (!token) return;

  const socketOptions = {
    auth: { token },
    transports: ['websocket', 'polling'],
  };

  // Root namespace connection
  rootSocket = io(SOCKET_HOST, socketOptions);

  rootSocket.on('connect', () => {
    console.log('Root socket connected');
  });

  // Leaderboard namespace connection
  leaderboardSocket = io(`${SOCKET_HOST}/leaderboard`, socketOptions);

  leaderboardSocket.on('connect', () => {
    console.log('Leaderboard namespace socket connected');
  });

  // Competition namespace connection
  competitionSocket = io(`${SOCKET_HOST}/competition`, socketOptions);

  competitionSocket.on('connect', () => {
    console.log('Competition namespace socket connected');
  });
}

export function disconnectSockets() {
  if (rootSocket) {
    rootSocket.disconnect();
    rootSocket = null;
  }
  if (leaderboardSocket) {
    leaderboardSocket.disconnect();
    leaderboardSocket = null;
  }
  if (competitionSocket) {
    competitionSocket.disconnect();
    competitionSocket = null;
  }
}

export function getRootSocket() {
  return rootSocket;
}

export function getLeaderboardSocket() {
  return leaderboardSocket;
}

export function getCompetitionSocket() {
  return competitionSocket;
}
