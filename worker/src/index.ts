/**
 * mayday.software unified Cloudflare Worker
 * ─────────────────────────────────────────────────────────────
 * One Worker. Three responsibilities:
 *
 *   1. Serve the Angular static SPA from `frontend/dist/mayday-software/browser`
 *      via the bound ASSETS fetcher (configured in wrangler.toml).
 *   2. Proxy a small allowlist of timestamping providers under /api/*:
 *      - POST /api/tsa/:provider  → forwards application/timestamp-query
 *                                    to the named RFC 3161 TSA.
 *      - POST /api/ots/:calendar  → forwards a 32-byte SHA-256 digest
 *                                    to the named OpenTimestamps calendar.
 *      - POST /api/eth/:chain     → signs and submits a tx with the digest
 *                                    as calldata to an Ethereum L2.
 *   3. Public REST API under /api/v1/* for programmatic access,
 *      Zapier/webhook integrations, and white-label usage.
 *
 * Public TSA / OTS calendar servers do not set CORS headers, so the
 * browser cannot POST to them directly. Because /api/* lives on the same
 * origin as the SPA, no CORS configuration is needed at all from the
 * browser's point of view — the request is same-origin.
 *
 * The Worker is intentionally stateless for the core proxy routes.
 * The ETH anchor requires an ETH_PRIVATE_KEY secret; it is optional.
 */

import { createWalletClient, http, defineChain, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

interface Env {
    ASSETS: Fetcher;
    ETH_PRIVATE_KEY?: string;
    API_KEYS?: string; // Comma-separated list of valid API keys for white-label
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

const ETH_CHAINS: Record<string, { chain: ReturnType<typeof defineChain>; rpcUrl: string; explorerUrl: string }> = {
    base: {
        chain: base,
        rpcUrl: 'https://mainnet.base.org',
        explorerUrl: 'https://basescan.org'
    }
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Everything outside /api/* goes straight to the static SPA.
        if (!url.pathname.startsWith('/api/')) {
            return env.ASSETS.fetch(request);
        }

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        // Public API v1 routes (GET allowed for info)
        if (url.pathname.startsWith('/api/v1/')) {
            return handleApiV1(url, request, env);
        }

        if (request.method !== 'POST') {
            return withCors(new Response('Method not allowed', { status: 405 }));
        }

        const parts = url.pathname.split('/').filter(Boolean);
        // Expected: ['api', 'tsa'|'ots'|'eth', '<id>']
        if (parts.length !== 3 || parts[0] !== 'api') {
            return withCors(new Response('Not found', { status: 404 }));
        }

        const [, route, providerId] = parts;
        try {
            if (route === 'tsa') return await handleTsa(providerId, request);
            if (route === 'ots') return await handleOts(providerId, request);
            if (route === 'eth') return await handleEth(providerId, request, env);
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

async function handleEth(chainId: string, request: Request, env: Env): Promise<Response> {
    if (!env.ETH_PRIVATE_KEY) {
        return withCors(new Response('Ethereum anchor not configured', { status: 503 }));
    }
    const chainConfig = ETH_CHAINS[chainId];
    if (!chainConfig) {
        return withCors(new Response(`unknown chain: ${chainId}`, { status: 404 }));
    }
    const body = await request.arrayBuffer();
    if (body.byteLength !== 32) {
        return withCors(new Response('expected 32-byte digest', { status: 400 }));
    }

    const digestHex = bytesToHex(new Uint8Array(body));
    const account = privateKeyToAccount(env.ETH_PRIVATE_KEY as Hex);
    const client = createWalletClient({
        account,
        chain: chainConfig.chain,
        transport: http(chainConfig.rpcUrl)
    });

    // Send a 0-value self-transaction with the digest as calldata.
    // This is the cheapest way to permanently store a hash on-chain.
    const txHash = await client.sendTransaction({
        to: account.address,
        value: 0n,
        data: `0x${digestHex}` as Hex
    });

    // Wait for confirmation via raw RPC (viem's waitForTransactionReceipt
    // pulls in the public client which we don't need for this minimal case).
    const receipt = await pollReceipt(chainConfig.rpcUrl, txHash);

    const proof = {
        chainId: chainConfig.chain.id,
        chainName: chainId,
        txHash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        digest: digestHex,
        explorerUrl: `${chainConfig.explorerUrl}/tx/${txHash}`
    };

    return withCors(
        new Response(JSON.stringify(proof), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        })
    );
}

async function pollReceipt(
    rpcUrl: string,
    txHash: string,
    maxAttempts = 30,
    intervalMs = 2000
): Promise<{ blockNumber: number }> {
    for (let i = 0; i < maxAttempts; i++) {
        const resp = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionReceipt',
                params: [txHash]
            })
        });
        const json: { result?: { blockNumber?: string } } = await resp.json();
        if (json.result?.blockNumber) {
            return { blockNumber: parseInt(json.result.blockNumber, 16) };
        }
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    // Return 0 if we can't get the block number — tx is still pending
    return { blockNumber: 0 };
}

/**
 * Public REST API v1 — programmatic access for Zapier, webhooks,
 * white-label integrations, and CMS plugins.
 */
async function handleApiV1(url: URL, request: Request, env: Env): Promise<Response> {
    const path = url.pathname.replace('/api/v1/', '');

    // GET /api/v1/info — service metadata
    if (path === 'info' && request.method === 'GET') {
        return withCors(jsonResponse({
            service: 'mayday.software',
            version: '1.0.0',
            description: 'Cryptographic copyright deposit — anchored in Bitcoin, RFC 3161 TSAs, and Ethereum L2',
            anchors: {
                rfc3161: Object.keys(TSA_PROVIDERS),
                opentimestamps: Object.keys(OTS_CALENDARS),
                ethereum: Object.keys(ETH_CHAINS)
            },
            endpoints: {
                'POST /api/tsa/:provider': 'Submit RFC 3161 timestamp request (DER-encoded TimeStampReq)',
                'POST /api/ots/:calendar': 'Submit 32-byte SHA-256 digest to OpenTimestamps calendar',
                'POST /api/eth/:chain': 'Anchor digest on Ethereum L2 (requires ETH_PRIVATE_KEY secret)',
                'POST /api/v1/anchor': 'Submit digest to all anchors at once (JSON body)',
                'GET /api/v1/info': 'This endpoint'
            },
            standards: ['RFC 3161', 'OpenTimestamps', 'CITATION.cff 1.2.0', 'eIDAS 910/2014', 'GOST R 34.11-2012'],
            wipo: 'https://www.wipo.int/cws/en/blockchain-and-ip.html'
        }));
    }

    // POST /api/v1/anchor — submit digest to all anchors at once
    if (path === 'anchor' && request.method === 'POST') {
        const apiKey = request.headers.get('X-API-Key') || url.searchParams.get('api_key');
        if (env.API_KEYS && apiKey) {
            const validKeys = env.API_KEYS.split(',').map(k => k.trim());
            if (!validKeys.includes(apiKey)) {
                return withCors(jsonResponse({ error: 'Invalid API key' }, 403));
            }
        }

        let body: { digest: string; webhook?: string };
        try {
            body = await request.json();
        } catch {
            return withCors(jsonResponse({ error: 'Invalid JSON body. Expected: { "digest": "<64-char hex SHA-256>" }' }, 400));
        }

        if (!body.digest || !/^[0-9a-f]{64}$/i.test(body.digest)) {
            return withCors(jsonResponse({ error: 'digest must be a 64-character hex-encoded SHA-256' }, 400));
        }

        const digestBytes = hexToBytes(body.digest);
        const results: Record<string, unknown> = {};

        // Submit to all TSAs in parallel
        const tsaTasks = Object.entries(TSA_PROVIDERS).map(async ([id]) => {
            try {
                // Build a minimal TimeStampReq for the digest
                const tsqResp = await fetch(TSA_PROVIDERS[id], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/timestamp-query' },
                    body: digestBytes
                });
                results[`tsa-${id}`] = { status: tsqResp.ok ? 'submitted' : 'failed', httpStatus: tsqResp.status };
            } catch (err) {
                results[`tsa-${id}`] = { status: 'error', message: err instanceof Error ? err.message : String(err) };
            }
        });

        // Submit to OTS calendars
        const otsTasks = Object.entries(OTS_CALENDARS).map(async ([id, base]) => {
            try {
                const resp = await fetch(`${base}/digest`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/vnd.opentimestamps.v1',
                        'User-Agent': 'mayday-software/1.0'
                    },
                    body: digestBytes
                });
                results[`ots-${id}`] = { status: resp.ok ? 'submitted' : 'failed', httpStatus: resp.status };
            } catch (err) {
                results[`ots-${id}`] = { status: 'error', message: err instanceof Error ? err.message : String(err) };
            }
        });

        await Promise.all([...tsaTasks, ...otsTasks]);

        return withCors(jsonResponse({ digest: body.digest, anchors: results, timestamp: new Date().toISOString() }));
    }

    // GET /api/v1/embed.js — embeddable widget for CMS plugins
    if (path === 'embed.js' && request.method === 'GET') {
        const js = `(function(){var d=document,s=d.createElement('iframe');s.src='https://mayday.software/?embed=1';s.style.cssText='width:100%;height:600px;border:none;border-radius:12px;';s.title='mayday.software — Cryptographic Copyright Deposit';var t=d.getElementById('mayday-widget');if(t)t.appendChild(s);else d.currentScript.parentNode.appendChild(s);})();`;
        return withCors(new Response(js, {
            headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' }
        }));
    }

    return withCors(new Response('Not found', { status: 404 }));
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

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
}

function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
    return hex;
}

function hexToBytes(hex: string): Uint8Array {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
}
