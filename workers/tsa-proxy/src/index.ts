/**
 * mayday.software TSA / OTS proxy
 * ─────────────────────────────────────────────────────────────
 * Tiny Cloudflare Worker that exists for ONE reason: public RFC 3161
 * Time-Stamp Authorities and OpenTimestamps calendar servers do not
 * set CORS headers, so the browser cannot POST to them directly.
 *
 * This Worker is a stupid byte-relay:
 *   1. Accept POST /tsa/:provider with application/timestamp-query body
 *      → forward to a hardcoded TSA URL → return reply with CORS.
 *   2. Accept POST /ots/:calendar with raw 32-byte SHA-256 digest
 *      → forward to a hardcoded OTS calendar URL → return reply.
 *
 * It logs nothing about request bodies. It has no env vars and no
 * secrets. The provider allowlist lives in this file, not in the
 * request — clients cannot ask the Worker to fetch arbitrary URLs.
 */

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

const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400'
};

export default {
    async fetch(request: Request): Promise<Response> {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        if (request.method !== 'POST') {
            return cors(new Response('Method not allowed', { status: 405 }));
        }

        const url = new URL(request.url);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length !== 2) {
            return cors(new Response('Not found', { status: 404 }));
        }

        const [route, providerId] = parts;
        try {
            if (route === 'tsa') {
                return await handleTsa(providerId, request);
            }
            if (route === 'ots') {
                return await handleOts(providerId, request);
            }
            return cors(new Response('Unknown route', { status: 404 }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'unknown error';
            return cors(new Response(`upstream error: ${message}`, { status: 502 }));
        }
    }
};

async function handleTsa(providerId: string, request: Request): Promise<Response> {
    const target = TSA_PROVIDERS[providerId];
    if (!target) {
        return cors(new Response(`unknown TSA provider: ${providerId}`, { status: 404 }));
    }
    const body = await request.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > 64 * 1024) {
        return cors(new Response('invalid request body', { status: 400 }));
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
        return cors(new Response(`unknown OTS calendar: ${calendarId}`, { status: 404 }));
    }
    const body = await request.arrayBuffer();
    // OTS digest is exactly 32 bytes for SHA-256.
    if (body.byteLength !== 32) {
        return cors(new Response('expected 32-byte digest', { status: 400 }));
    }
    const upstream = await fetch(`${base}/digest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/vnd.opentimestamps.v1',
            'User-Agent': 'mayday-tsa-proxy/1.0'
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
            ...CORS_HEADERS,
            'Content-Type': contentType,
            'Cache-Control': 'no-store'
        }
    });
}

function cors(resp: Response): Response {
    const headers = new Headers(resp.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
    return new Response(resp.body, { status: resp.status, headers });
}
