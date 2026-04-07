/**
 * Common interfaces for timestamp anchors.
 *
 * Each anchor takes the manifest fingerprint (SHA-256 of CITATION.cff)
 * and produces an independent piece of evidence that the fingerprint
 * existed at a specific moment in time. Anchors are sidecars — they
 * never modify the manifest itself.
 */

export type AnchorKind = 'opentimestamps' | 'rfc3161' | 'ethereum';

export type AnchorStatus = 'pending' | 'submitting' | 'confirmed' | 'failed';

export interface AnchorRequest {
    /** Hex-encoded SHA-256 of the manifest YAML. */
    manifestHashHex: string;
    /** Raw 32-byte SHA-256 digest of the manifest YAML. */
    manifestDigest: Uint8Array;
}

export interface AnchorAttestation {
    kind: AnchorKind;
    /** Stable provider id, e.g. 'freetsa', 'digicert', 'opentimestamps-alice'. */
    provider: string;
    /** Human-friendly provider label for UI / certificate. */
    providerLabel: string;
    status: AnchorStatus;
    /** Filename suffix used when downloading the proof, e.g. 'ots' or 'tsr.freetsa'. */
    proofExtension: string;
    /** Raw bytes of the proof file (filled when status === 'confirmed'). */
    proofBytes?: Uint8Array;
    /**
     * Time the proof was issued by the anchor (TSA genTime / OTS calendar
     * receipt time). Not the user's local clock.
     */
    anchoredAt?: string;
    /**
     * Free-form one-line summary suitable for the certificate, e.g.
     * "TSA serial 0xabcdef · 2026-04-06T07:00:00Z" or
     * "OpenTimestamps · alice.btc.calendar · pending Bitcoin block".
     */
    humanSummary?: string;
    error?: string;
}

export interface Anchor {
    readonly kind: AnchorKind;
    readonly provider: string;
    readonly providerLabel: string;
    readonly proofExtension: string;
    submit(request: AnchorRequest): Promise<AnchorAttestation>;
}
