const DEFAULT_API_URL = 'http://localhost:5000/api';

export function normalizeApiBase(rawValue = DEFAULT_API_URL) {
  const trimmed = String(rawValue || DEFAULT_API_URL).trim().replace(/\/$/, '');

  if (trimmed === '/api') return trimmed;

  if (trimmed.startsWith('/')) {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, '').endsWith('/api') ? withProtocol : `${withProtocol}/api`;
}

export function getSocketHost(apiBase) {
  return normalizeApiBase(apiBase).replace(/\/api\/?$/, '').replace(/\/$/, '');
}
