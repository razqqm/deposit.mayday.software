/**
 * mayday.software unified Cloudflare Worker
 * ─────────────────────────────────────────────────────────────
 * One Worker. Two responsibilities:
 *
 *   1. Serve the Angular static SPA from `frontend/dist/mayday-software/browser`
 *      via the bound ASSETS fetcher (configured in wrangler.toml).
 *   2. Proxy a small allowlist of timestamping providers under /api/*:
 *      - POST /api/tsa/:provider  → forwards application/timestamp-query
 *                                    to the named RFC 3161 TSA.
 *      - POST /api/ots/:calendar  → forwards a 32-byte SHA-256 digest
 *                                    to the named OpenTimestamps calendar.
 *
 * Public TSA / OTS calendar servers do not set CORS headers, so the
 * browser cannot POST to them directly. Because /api/* lives on the same
 * origin as the SPA, no CORS configuration is needed at all from the
 * browser's point of view — the request is same-origin.
 *
 * The Worker is intentionally stateless: no env vars, no secrets, no
 * KV/D1/R2, and no logging of request bodies. The provider allowlist
 * is hardcoded; clients cannot ask the Worker to fetch arbitrary URLs.
 */

interface Env {
    ASSETS: Fetcher;
}

const TSA_PROVIDERS: Record<string, string> = {
    freetsa: 'https://freetsa.org/tsr',
    digicert: 'http://timestamp.digicert.com',
    sectigo: 'http://timestamp.sectigo.com'
};

const OTS_CALENDARS: Record<string, string> = {
    alice: 'https://alice.btc.calendar.opentimestamps.org',
    bob: 'https://bob.btc.calendar.opentimestamps.org',
    finney: 'https://finney.calendar.eternitywall.com',
    catallaxy: 'https://btc.calendar.catallaxy.com'
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Everything outside /api/* goes straight to the static SPA.
        if (!url.pathname.startsWith('/api/')) {
            return env.ASSETS.fetch(request);
        }

        if (request.method === 'OPTIONS') {
            // Same-origin in production, but useful for `wrangler dev` against
            // a local Angular dev server on :4200.
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        if (request.method !== 'POST') {
            return withCors(new Response('Method not allowed', { status: 405 }));
        }

        const parts = url.pathname.split('/').filter(Boolean);
        // Expected: ['api', 'tsa'|'ots', '<id>']
        if (parts.length !== 3 || parts[0] !== 'api') {
            return withCors(new Response('Not found', { status: 404 }));
        }

        const [, route, providerId] = parts;
        try {
            if (route === 'tsa') return await handleTsa(providerId, request);
            if (route === 'ots') return await handleOts(providerId, request);
            return withCors(new Response('Unknown route', { status: 404 }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'unknown error';
            return withCors(new Response(`upstream error: ${message}`, { status: 502 }));
        }
    }
};

async function handleTsa(providerId: string, request: Request): Promise<Response> {
    const target = TSA_PROVIDERS[providerId];
    if (!target) {
        return withCors(new Response(`unknown TSA provider: ${providerId}`, { status: 404 }));
    }
    const body = await request.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > 64 * 1024) {
        return withCors(new Response('invalid request body', { status: 400 }));
    }
    const upstream = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/timestamp-query' },
        body
    });
    return relay(upstream, 'application/timestamp-reply');
}

async function handleOts(calendarId: string, request: Request): Promise<Response> {
    const base = OTS_CALENDARS[calendarId];
    if (!base) {
        return withCors(new Response(`unknown OTS calendar: ${calendarId}`, { status: 404 }));
    }
    const body = await request.arrayBuffer();
    if (body.byteLength !== 32) {
        return withCors(new Response('expected 32-byte digest', { status: 400 }));
    }
    const upstream = await fetch(`${base}/digest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/vnd.opentimestamps.v1',
            'User-Agent': 'mayday-software/1.0'
        },
        body
    });
    return relay(upstream, 'application/octet-stream');
}

async function relay(upstream: Response, fallbackContentType: string): Promise<Response> {
    const bytes = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('Content-Type') || fallbackContentType;
    return new Response(bytes, {
        status: upstream.status,
        headers: {
            ...corsHeaders(),
            'Content-Type': contentType,
            'Cache-Control': 'no-store'
        }
    });
}

function corsHeaders(): Record<string, string> {
    // CORS is only needed for `wrangler dev` against a local frontend on a
    // different port. In production the SPA is served from the same origin
    // as the Worker, so the browser never sends a preflight.
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '86400'
    };
}

function withCors(resp: Response): Response {
    const headers = new Headers(resp.headers);
    for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, v);
    return new Response(resp.body, { status: resp.status, headers });
}
