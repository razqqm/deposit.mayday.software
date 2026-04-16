import * as asn1js from 'asn1js';
import { TimeStampReq, TimeStampResp, MessageImprint, AlgorithmIdentifier } from 'pkijs';
import { Anchor, AnchorAttestation, AnchorRequest } from './anchor';
import { WORKER_BASE } from './worker-config';

/**
 * RFC 3161 Time-Stamp Protocol client.
 *
 * Builds a TimeStampReq DER blob in the browser via pkijs/asn1js,
 * POSTs it to the Cloudflare Worker proxy (which forwards to a
 * hard-coded list of public TSAs — public TSAs do not set CORS,
 * so direct browser requests are impossible), parses the response,
 * and stores the raw TimeStampResp bytes as a .tsr file.
 *
 * The .tsr file is verifiable offline by anyone with OpenSSL:
 *   openssl ts -verify -data CITATION.cff -in CITATION.cff.tsr.<provider> \
 *               -CAfile <provider>-ca.pem
 */

// SHA-256 OID
const ID_SHA256 = '2.16.840.1.101.3.4.2.1';

export interface Rfc3161Provider {
    /** Stable id used in URLs and proof filenames, e.g. 'freetsa'. */
    id: string;
    /** Human-readable label for UI / certificate. */
    label: string;
}

export class Rfc3161Anchor implements Anchor {
    readonly kind = 'rfc3161' as const;
    readonly provider: string;
    readonly providerLabel: string;
    readonly proofExtension: string;

    constructor(private readonly providerInfo: Rfc3161Provider) {
        this.provider = providerInfo.id;
        this.providerLabel = providerInfo.label;
        this.proofExtension = `tsr.${providerInfo.id}`;
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
            const tsq = buildTimeStampReq(request.manifestDigest);

            const url = `${WORKER_BASE}/api/tsa/${this.provider}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/timestamp-query' },
                body: tsq as BodyInit
            });
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}: ${await resp.text().catch(() => '')}`);
            }
            const tsrBytes = new Uint8Array(await resp.arrayBuffer());
            if (tsrBytes.length === 0) {
                throw new Error('Empty TSA response');
            }

            const parsed = parseTimeStampResp(tsrBytes);

            return {
                ...base,
                status: 'confirmed',
                proofBytes: tsrBytes,
                anchoredAt: parsed.genTime?.toISOString(),
                humanSummary: parsed.genTime
                    ? `${this.providerLabel} · ${parsed.genTime.toISOString()}${parsed.serial ? ` · serial 0x${parsed.serial}` : ''}`
                    : `${this.providerLabel} · timestamp received`
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

/**
 * Build an ASN.1 DER-encoded TimeStampReq.
 *
 *   TimeStampReq ::= SEQUENCE {
 *       version          INTEGER (v1(1)),
 *       messageImprint   MessageImprint,
 *       reqPolicy        OPTIONAL,
 *       nonce            INTEGER OPTIONAL,
 *       certReq          BOOLEAN DEFAULT FALSE,
 *       extensions       OPTIONAL
 *   }
 */
function buildTimeStampReq(digest: Uint8Array): Uint8Array {
    // Make sure both digest and nonce live in fresh ArrayBuffers (not SharedArrayBuffer).
    const digestCopy = new Uint8Array(digest);
    const messageImprint = new MessageImprint({
        hashAlgorithm: new AlgorithmIdentifier({
            algorithmId: ID_SHA256,
            algorithmParams: new asn1js.Null()
        }),
        hashedMessage: new asn1js.OctetString({ valueHex: digestCopy.buffer as ArrayBuffer })
    });

    // 8-byte random nonce — protects against replay attacks.
    const nonceBytes = new Uint8Array(8);
    crypto.getRandomValues(nonceBytes);

    const req = new TimeStampReq({
        version: 1,
        messageImprint,
        nonce: new asn1js.Integer({ valueHex: nonceBytes.buffer as ArrayBuffer }),
        certReq: true
    });

    return new Uint8Array(req.toSchema().toBER(false));
}

interface ParsedTsr {
    status: number;
    genTime?: Date;
    serial?: string;
}

function parseTimeStampResp(bytes: Uint8Array): ParsedTsr {
    // Copy into fresh ArrayBuffer to satisfy asn1js BufferSource typing.
    const buf = new Uint8Array(bytes).buffer as ArrayBuffer;
    const ber = asn1js.fromBER(buf);
    if (ber.offset === -1) {
        throw new Error('Failed to decode TimeStampResp DER');
    }
    const resp = new TimeStampResp({ schema: ber.result });
    const status = resp.status.status;
    if (status !== 0 && status !== 1) {
        throw new Error(`TSA returned status ${status} (rejected)`);
    }

    let genTime: Date | undefined;
    let serial: string | undefined;
    try {
        const tstInfo = resp.timeStampToken
            ? extractTstInfo(resp.timeStampToken.content as object)
            : null;
        if (tstInfo) {
            genTime = tstInfo.genTime;
            serial = tstInfo.serialHex;
        }
    } catch {
        /* fall through — we still keep the raw .tsr even if parsing fails */
    }

    return { status, genTime, serial };
}

interface TstInfoExtract {
    genTime?: Date;
    serialHex?: string;
}

/**
 * Walk the SignedData → eContent → TSTInfo to pull out genTime + serialNumber.
 * pkijs exposes ContentInfo / SignedData but TSTInfo is plain ASN.1 inside.
 */
function extractTstInfo(content: object): TstInfoExtract | null {
    // pkijs ContentInfo wraps SignedData; SignedData.encapContentInfo.eContent is TSTInfo.
    const signedData = (content as { encapContentInfo?: { eContent?: { valueBlock?: { valueHex?: ArrayBuffer } } } }).encapContentInfo;
    const eContent = signedData?.eContent?.valueBlock?.valueHex;
    if (!eContent) return null;

    const ber = asn1js.fromBER(eContent);
    if (ber.offset === -1) return null;
    const seq = ber.result as asn1js.Sequence;
    const values = seq.valueBlock.value;
    // TSTInfo SEQUENCE {
    //   version                   INTEGER  { v1(1) },
    //   policy                    OBJECT IDENTIFIER,
    //   messageImprint            MessageImprint,
    //   serialNumber              INTEGER,
    //   genTime                   GeneralizedTime,
    //   ...
    // }
    let serialHex: string | undefined;
    let genTime: Date | undefined;
    if (values[3] instanceof asn1js.Integer) {
        const buf = (values[3] as asn1js.Integer).valueBlock.valueHexView;
        serialHex = bytesToHex(buf);
    }
    if (values[4] instanceof asn1js.GeneralizedTime) {
        genTime = (values[4] as asn1js.GeneralizedTime).toDate();
    }
    return { serialHex, genTime };
}

function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}
