import { io } from 'socket.io-client';
import { getAccessToken } from './apiClient';
import { getSocketHost, normalizeApiBase } from './apiUrl';

const API_URL = normalizeApiBase(import.meta.env.VITE_API_URL);
const SOCKET_HOST = getSocketHost(API_URL);

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
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
  };

  // Root namespace connection
  rootSocket = io(SOCKET_HOST, socketOptions);

  rootSocket.on('connect', () => {
    console.log('Root socket connected');
  });

  rootSocket.on('connect_error', (error) => {
    console.warn('Root socket connection failed:', error.message);
  });

  // Leaderboard namespace connection
  leaderboardSocket = io(`${SOCKET_HOST}/leaderboard`, socketOptions);

  leaderboardSocket.on('connect', () => {
    console.log('Leaderboard namespace socket connected');
  });

  leaderboardSocket.on('connect_error', (error) => {
    console.warn('Leaderboard socket connection failed:', error.message);
  });

  // Competition namespace connection
  competitionSocket = io(`${SOCKET_HOST}/competition`, socketOptions);

  competitionSocket.on('connect', () => {
    console.log('Competition namespace socket connected');
  });

  competitionSocket.on('connect_error', (error) => {
    console.warn('Competition socket connection failed:', error.message);
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
