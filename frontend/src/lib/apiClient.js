// src/lib/apiClient.js
// Thin fetch wrapper for the SkillPath backend API.
// - Reads the base URL from VITE_API_URL (falls back to local backend).
// - Stores JWT access/refresh tokens in localStorage.
// - Transparently refreshes the access token once on a 401, then retries.

import { normalizeApiBase } from './apiUrl';

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

const ACCESS_KEY = 'sp_access_token';
const REFRESH_KEY = 'sp_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function buildError(status, body) {
  const message = (body && body.message) || `Request failed (${status})`;
  const details = body && body.error && body.error.details;
  const full = Array.isArray(details) && details.length ? `${message}: ${details.join(', ')}` : message;
  return new ApiError(full, { status, code: body && body.error && body.error.code, details });
}

async function rawRequest(path, { method = 'GET', body, auth = false, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const access = token || (auth ? getAccessToken() : null);
  if (access) headers.Authorization = `Bearer ${access}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      'Cannot connect to the SkillPath server. Check that the backend is online and VITE_API_URL points to the deployed API.',
      {
        status: 0,
        code: 'NETWORK_ERROR',
        details: [err?.message || 'Network request failed'],
      },
    );
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* response had no JSON body */
  }

  if (!res.ok) throw buildError(res.status, json);
  return json && json.data !== undefined ? json.data : json;
}

let refreshPromise = null;
async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = rawRequest('/auth/refresh-token', { method: 'POST', body: { refreshToken } })
      .then((data) => {
        setTokens(data);
        return data.accessToken;
      })
      .catch((err) => {
        clearTokens();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function request(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    // Access token likely expired: refresh once and retry the authed call.
    if (err instanceof ApiError && err.status === 401 && options.auth && getRefreshToken()) {
      try {
        const newAccess = await tryRefresh();
        if (newAccess) return await rawRequest(path, { ...options, token: newAccess });
      } catch {
        /* refresh failed — fall through and throw the original error */
      }
    }
    throw err;
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
