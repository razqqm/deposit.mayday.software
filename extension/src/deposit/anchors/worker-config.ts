/**
 * Same-origin API base for the unified Cloudflare Worker.
 *
 * In production the SPA and the Worker live on the same origin
 * (mayday.software), so anchor requests go to relative `/api/...`
 * paths and the browser never makes a cross-origin request.
 *
 * For `ng serve` against a separately running `wrangler dev` (which
 * listens on a different port), set `window.__MAYDAY_WORKER_BASE__`
 * before app bootstrap to e.g. `http://localhost:8787`. The Worker
 * sends permissive CORS headers in dev mode, so this Just Works.
 */
declare global {
    interface Window {
        __MAYDAY_WORKER_BASE__?: string;
    }
}

const DEFAULT_WORKER_BASE = '';

export const WORKER_BASE: string =
    (typeof window !== 'undefined' && window.__MAYDAY_WORKER_BASE__) || DEFAULT_WORKER_BASE;
