/**
 * tokenStore.js
 * ---------------------------------------------------------------------------
 * Do ALAG token stores hain — kyun?
 *
 *   USER (buyer/seller): access token sirf MEMORY me rakha jaata hai
 *   (localStorage me NAHI) — taaki XSS attack se koi script isse chura
 *   na sake. Page refresh pe token kho jaata hai, isliye AuthContext
 *   app load hote hi `/auth/refresh-token` call karta hai — backend ka
 *   httpOnly refresh cookie (jo login pe already set ho chuka hota hai)
 *   use karke naya access token le leta hai, bina user ko dikhe.
 *
 *   ADMIN: backend me admin ke liye httpOnly refresh cookie ka koi
 *   mechanism nahi hai (Phase 5 me single 8-hour token hi banaya tha,
 *   refresh route nahi). Isliye admin token localStorage me rakha jaata
 *   hai — 8 ghante baad expire hoga, admin ko dobara login karna padega.
 *   Ye alag security trade-off hai jaan-boojh kar: admin panel already
 *   alag URL/audience hai, aur session chhota hai.
 * ---------------------------------------------------------------------------
 */

// ---- USER TOKEN (in-memory) ----
let userAccessToken = null;

export function getUserToken() {
  return userAccessToken;
}

export function setUserToken(token) {
  userAccessToken = token;
}

export function clearUserToken() {
  userAccessToken = null;
}

// ---- ADMIN TOKEN (localStorage) ----
const ADMIN_TOKEN_KEY = 'hb_admin_token';

export function getAdminToken() {
  if (typeof window === 'undefined') return null; // SSR safety
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
