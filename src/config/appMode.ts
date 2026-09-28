export type AppMode = 'client' | 'admin';

const rawMode = (import.meta.env.VITE_APP_MODE || 'client').toLowerCase().trim();

export const APP_MODE: AppMode = rawMode === 'admin' ? 'admin' : 'client';
export const IS_ADMIN_MODE: boolean = APP_MODE === 'admin';
export const IS_CLIENT_MODE: boolean = APP_MODE === 'client';
