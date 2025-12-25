const stripTrailingSlashes = (value) => String(value || '').replace(/\/+$/, '');

export const getApiUrl = () => {
  const raw = import.meta.env.VITE_API_URL;
  if (raw) return stripTrailingSlashes(raw);
  return '/api';
};

export const getSocketUrl = () => {
  const apiUrl = getApiUrl();
  if (apiUrl.startsWith('/')) return undefined;
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

export const getBackendOrigin = () => {
  const apiUrl = getApiUrl();
  if (apiUrl.startsWith('/')) return window.location.origin;

  try {
    const u = new URL(apiUrl);
    const basePath = u.pathname.replace(/\/+$/, '').replace(/\/api$/, '');
    return `${u.origin}${basePath}`;
  } catch {
    return stripTrailingSlashes(apiUrl).replace(/\/api$/, '');
  }
};

