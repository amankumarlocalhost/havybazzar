/**
 * api.js
 * ---------------------------------------------------------------------------
 * Poore frontend me backend ko call karne ka SIRF EK tareeka — kahin bhi
 * seedha `fetch()` mat kijiye. Ye function:
 *
 *   1. Sahi Authorization header lagata hai (user ya admin token, scope
 *      ke hisaab se)
 *   2. User ke liye — agar access token expire ho gaya (401 aaya), TO
 *      EK BAAR refresh-token try karta hai aur original request dobara
 *      chalata hai. User ko kuch pata nahi chalta.
 *   3. Backend ka response format hamesha `{ success, message, data }`
 *      hota hai — is wrapper ke baad caller ko seedha `data` milta hai,
 *      ya ek Error throw hoti hai jisme backend ka message hota hai.
 * ---------------------------------------------------------------------------
 */

import { getUserToken, setUserToken, clearUserToken, getAdminToken } from './tokenStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

let refreshPromise = null; // ek waqt me sirf ek hi refresh call chale (concurrent requests ke liye)

async function refreshUserToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // httpOnly refresh cookie isi se jaata hai
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to refresh token');
        const json = await res.json();
        setUserToken(json.data.accessToken);
        return json.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * @param {string} path - e.g. "/listings/browse"
 * @param {object} options
 * @param {string} [options.method='GET']
 * @param {object} [options.body]
 * @param {'user'|'admin'|'public'} [options.auth='public']
 * @param {boolean} [options.isFormData=false] - FormData bhejte waqt Content-Type khud set na karein
 */
export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, auth = 'public', isFormData = false, _isRetry = false } = options;

  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';

  if (auth === 'user') {
    const token = getUserToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  } else if (auth === 'admin') {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // refresh cookie ke liye hamesha bhejo
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  // User ka access token expire ho gaya — EK baar refresh try karo
  if (res.status === 401 && auth === 'user' && !_isRetry) {
    try {
      await refreshUserToken();
      return apiFetch(path, { ...options, _isRetry: true });
    } catch {
      clearUserToken();
      // Refresh bhi fail hua — asli 401 throw karo, caller (AuthContext)
      // ise pakadke user ko login page pe bhej dega
    }
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Invalid response from the server.');
  }

  if (!res.ok || json.success === false) {
    const error = new Error(json.message || 'Something went wrong.');
    error.status = res.status;
    throw error;
  }

  return json.data;
}

// ---- Chhote convenience wrappers ----
export const api = {
  get: (path, auth) => apiFetch(path, { method: 'GET', auth }),
  post: (path, body, auth) => apiFetch(path, { method: 'POST', body, auth }),
  patch: (path, body, auth) => apiFetch(path, { method: 'PATCH', body, auth }),
  delete: (path, auth) => apiFetch(path, { method: 'DELETE', auth }),
  postForm: (path, formData, auth) => apiFetch(path, { method: 'POST', body: formData, auth, isFormData: true }),
};

export { refreshUserToken };
