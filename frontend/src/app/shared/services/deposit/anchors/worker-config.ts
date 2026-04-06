/**
 * Cloudflare Worker proxy base URL.
 *
 * The Worker code lives in /workers/tsa-proxy and forwards
 * RFC 3161 + OpenTimestamps calendar requests with CORS headers.
 *
 * Override at runtime by setting `window.__MAYDAY_WORKER_BASE__`
 * before app bootstrap (useful for `ng serve` against a local Worker
 * via `wrangler dev`).
 */
declare global {
    interface Window {
        __MAYDAY_WORKER_BASE__?: string;
    }
}

const DEFAULT_WORKER_BASE = 'https://mayday-tsa-proxy.workers.dev';

export const WORKER_BASE: string =
    (typeof window !== 'undefined' && window.__MAYDAY_WORKER_BASE__) || DEFAULT_WORKER_BASE;
