const LOCAL_API_URL = 'http://localhost:5000/api';
const SAME_ORIGIN_API_URL = '/api';

function getDefaultApiUrl() {
  return import.meta.env?.PROD ? SAME_ORIGIN_API_URL : LOCAL_API_URL;
}

export function normalizeApiBase(rawValue = getDefaultApiUrl()) {
  const trimmed = String(rawValue || getDefaultApiUrl()).trim().replace(/\/$/, '');

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
