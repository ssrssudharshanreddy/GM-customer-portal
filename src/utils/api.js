const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('gm_cp_access_token');
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem('gm_cp_access_token', access_token);
  if (refresh_token) localStorage.setItem('gm_cp_refresh_token', refresh_token);
}

export function clearTokens() {
  localStorage.removeItem('gm_cp_access_token');
  localStorage.removeItem('gm_cp_refresh_token');
  localStorage.removeItem('gm_cp_user');
}

async function refreshAccessToken() {
  const refresh_token = localStorage.getItem('gm_cp_refresh_token');
  if (!refresh_token) throw new Error('No refresh token');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const json = await res.json();
  const data = json.success !== undefined && json.data !== undefined ? json.data : json;
  setTokens(data);
  return data.access_token;
}

async function request(path, options = {}, retry = true) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && path !== '/auth/login') {
    try {
      await refreshAccessToken();
      return request(path, options, false);
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const error = new Error(body.message || body.error || 'Request failed');
    error.status = res.status;
    error.data = body;
    throw error;
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (json?.success !== undefined && json.data !== undefined) {
    if (json.pagination) {
      return {
        data: json.data,
        pagination: json.pagination,
        total: json.pagination.total,
      };
    }
    return json.data;
  }
  return json;
}

export const api = {
  get: (path, params) => {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          )
        )}`
      : path;
    return request(url);
  },
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => {
    const token = getToken();
    return fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        const error = new Error(body.message || body.error || 'Upload failed');
        error.status = res.status;
        error.data = body;
        throw error;
      }
      const json = await res.json();
      if (json?.success !== undefined && json.data !== undefined) {
        if (json.pagination) {
          return {
            data: json.data,
            pagination: json.pagination,
            total: json.pagination.total,
          };
        }
        return json.data;
      }
      return json;
    });
  },
};
