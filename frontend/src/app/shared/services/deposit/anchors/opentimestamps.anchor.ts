import { Anchor, AnchorAttestation, AnchorRequest } from './anchor';
import { WORKER_BASE } from './worker-config';

/**
 * Custom OpenTimestamps client.
 *
 * Why not the npm `opentimestamps` package: it depends on Node-only
 * modules (`fs`, `request`) and does not bundle cleanly into Angular's
 * esbuild. The OTS calendar protocol itself is trivial — POST 32 raw
 * bytes of SHA-256 digest, get back a serialized Timestamp tree. The
 * .ots file format is `magic + version + sha256_op + digest + tree`.
 *
 * We route the call through our Cloudflare Worker proxy because the
 * various calendar servers do not consistently set CORS headers, and
 * also so we can transparently handle their occasional outages.
 *
 * Each calendar produces its own .ots file. After the user runs
 * `ots upgrade *.ots` locally (or after we add an upgrade flow),
 * each proof becomes anchored in a Bitcoin block.
 */

// Magic bytes from the OTS spec (DetachedTimestampFile header).
//   "\x00OpenTimestamps\x00\x00Proof\x00" + 8-byte protocol magic.
const HEADER_MAGIC = new Uint8Array([
    0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73,
    0x00, 0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94
]);
const MAJOR_VERSION = 0x01;
const OP_SHA256 = 0x08;

export interface OpentimestampsCalendar {
    /** Stable id used in URLs and proof filenames, e.g. 'alice'. */
    id: string;
    /** Human-readable label for UI. */
    label: string;
}

export class OpentimestampsAnchor implements Anchor {
    readonly kind = 'opentimestamps' as const;
    readonly provider: string;
    readonly providerLabel: string;
    readonly proofExtension: string;

    constructor(private readonly calendar: OpentimestampsCalendar) {
        this.provider = `opentimestamps-${calendar.id}`;
        this.providerLabel = `OpenTimestamps · ${calendar.label}`;
        this.proofExtension = `ots.${calendar.id}`;
    }

    async submit(request: AnchorRequest): Promise<AnchorAttestation> {
        const base: AnchorAttestation = {
            kind: this.kind,
            provider: this.provider,
            providerLabel: this.providerLabel,
            proofExtension: this.proofExtension,
            status: 'submitting'
        };

        try {
            const url = `${WORKER_BASE}/api/ots/${this.calendar.id}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/vnd.opentimestamps.v1'
                },
                body: request.manifestDigest as BodyInit
            });
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}: ${await resp.text().catch(() => '')}`);
            }
            const calendarBytes = new Uint8Array(await resp.arrayBuffer());
            if (calendarBytes.length === 0) {
                throw new Error('Empty calendar response');
            }

            const otsFile = buildDetachedTimestampFile(request.manifestDigest, calendarBytes);

            return {
                ...base,
                status: 'confirmed',
                proofBytes: otsFile,
                anchoredAt: new Date().toISOString(),
                humanSummary: `${this.providerLabel} · pending Bitcoin block (run \`ots upgrade\` after ~6h to anchor)`
            };
        } catch (err) {
            return {
                ...base,
                status: 'failed',
                error: err instanceof Error ? err.message : String(err)
            };
        }
    }
}

function buildDetachedTimestampFile(digest: Uint8Array, calendarTree: Uint8Array): Uint8Array {
    if (digest.length !== 32) {
        throw new Error(`Expected 32-byte SHA-256 digest, got ${digest.length}`);
    }
    const out = new Uint8Array(HEADER_MAGIC.length + 1 + 1 + digest.length + calendarTree.length);
    let offset = 0;
    out.set(HEADER_MAGIC, offset);
    offset += HEADER_MAGIC.length;
    out[offset++] = MAJOR_VERSION;
    out[offset++] = OP_SHA256;
    out.set(digest, offset);
    offset += digest.length;
    out.set(calendarTree, offset);
    return out;
}
