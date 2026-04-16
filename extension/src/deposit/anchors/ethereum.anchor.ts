import { Anchor, AnchorAttestation, AnchorRequest } from './anchor';
import { WORKER_BASE } from './worker-config';

/**
 * Ethereum L2 (Base) timestamp anchor.
 *
 * Sends the 32-byte SHA-256 digest to the Cloudflare Worker at
 * `/api/eth/<chain>`. The Worker signs a zero-value transaction with
 * the digest as calldata and submits it to the L2 RPC. The resulting
 * transaction hash is an immutable on-chain proof.
 *
 * Requires `ETH_PRIVATE_KEY` secret configured in Cloudflare Workers.
 * If the secret is missing, the Worker returns 503 and this anchor
 * reports a graceful "not configured" failure.
 */

export interface EthereumChain {
    /** Stable id used in URLs, e.g. 'base'. */
    id: string;
    /** Human-readable label for UI. */
    label: string;
    /** Block explorer base URL for generating verification links. */
    explorerUrl: string;
}

/** Proof file stored as JSON — can be independently verified on-chain. */
export interface EthereumProof {
    chainId: number;
    chainName: string;
    txHash: string;
    blockNumber: number;
    timestamp: string;
    digest: string;
    explorerUrl: string;
}

export class EthereumAnchor implements Anchor {
    readonly kind = 'ethereum' as const;
    readonly provider: string;
    readonly providerLabel: string;
    readonly proofExtension: string;

    constructor(private readonly chain: EthereumChain) {
        this.provider = `ethereum-${chain.id}`;
        this.providerLabel = `Ethereum L2 · ${chain.label}`;
        this.proofExtension = `eth.${chain.id}.json`;
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
            const url = `${WORKER_BASE}/api/eth/${this.chain.id}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' },
                body: request.manifestDigest as BodyInit
            });

            if (resp.status === 503) {
                return {
                    ...base,
                    status: 'failed',
                    error: 'Ethereum anchor not configured — ETH_PRIVATE_KEY secret required'
                };
            }

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}: ${await resp.text().catch(() => '')}`);
            }

            const proof: EthereumProof = await resp.json();
            const proofBytes = new TextEncoder().encode(JSON.stringify(proof, null, 2));

            return {
                ...base,
                status: 'confirmed',
                proofBytes,
                anchoredAt: proof.timestamp,
                humanSummary: `${this.chain.label} tx ${proof.txHash.slice(0, 14)}… · block #${proof.blockNumber}`
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
