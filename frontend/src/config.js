// Central config — all environment-specific values live here
export const API_BASE       = import.meta.env.VITE_API_BASE   ?? 'http://localhost:8000';
export const ADMIN_PATH     = import.meta.env.VITE_ADMIN_PATH ?? '/home/admins-login';
export const PRICE_INR      = 21;       // base: resume only
export const PRICE_INR_JD   = 25;       // with JD match score
export const APP_NAME       = 'ReLak';
export const APP_YEAR       = 2026;
