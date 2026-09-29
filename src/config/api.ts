/**
 * Centralized API configuration & dynamic origin resolver.
 * Handles automatic fallback between local development and production Render deployment.
 */

const PRODUCTION_API_URL = 'https://luxury-interio.onrender.com';

export function getApiOrigin(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  // 1. If an explicit remote URL is configured in environment
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. If running in local development environment
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return (envUrl || 'http://localhost:5001').replace(/\/$/, '');
  }

  // 3. Default production fallback for Cloudflare Workers & Pages deployments
  return PRODUCTION_API_URL;
}

export const API_ORIGIN = getApiOrigin();
