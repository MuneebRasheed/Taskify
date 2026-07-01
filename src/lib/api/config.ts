/**
 * Base URL for the Taskify backend API.
 * Set EXPO_PUBLIC_API_URL in .env (e.g. http://localhost:3001 for simulator,
 * or http://YOUR_IP:3001 for physical device).
 */
export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'https://taskify-production-e5eb.up.railway.app';
