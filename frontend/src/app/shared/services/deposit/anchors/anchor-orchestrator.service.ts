import { Injectable, signal, Signal } from '@angular/core';
import { Anchor, AnchorAttestation, AnchorRequest } from './anchor';
import { Rfc3161Anchor } from './rfc3161.anchor';
import { OpentimestampsAnchor } from './opentimestamps.anchor';
import { EthereumAnchor } from './ethereum.anchor';
import { WORKER_BASE } from './worker-config';

/**
 * Runs all enabled anchors in parallel and exposes their statuses
 * through a signal so the UI can render progress per-row.
 *
 * Anchors are independent — one failure does not affect others.
 *
 * The Ethereum anchor is feature-flagged server-side (ETH_PRIVATE_KEY
 * secret in the Worker). We probe `/api/v1/info` once at startup and
 * only enable the anchor when the server reports it as available —
 * so deployments without a funded wallet don't show a "not configured"
 * error row in the UI.
 */
@Injectable({ providedIn: 'root' })
export class AnchorOrchestratorService {
    private readonly anchorsState = signal<AnchorAttestation[]>([]);
    readonly anchors: Signal<AnchorAttestation[]> = this.anchorsState.asReadonly();

    /** Baseline anchors that require no server-side secrets — always on. */
    private readonly baseline: Anchor[] = [
        new Rfc3161Anchor({ id: 'freetsa', label: 'FreeTSA' }),
        new Rfc3161Anchor({ id: 'digicert', label: 'DigiCert' }),
        new Rfc3161Anchor({ id: 'sectigo', label: 'Sectigo' }),
        new OpentimestampsAnchor({ id: 'alice', label: 'alice.btc.calendar' }),
        new OpentimestampsAnchor({ id: 'finney', label: 'finney.eternitywall' }),
    ];

    private enabled: Anchor[] = [...this.baseline];
    private readonly ready: Promise<void> = this.init();

    /**
     * Probe /api/v1/info to learn which optional anchors are configured
     * on this deployment and append them to the enabled list.
     */
    private async init(): Promise<void> {
        try {
            const resp = await fetch(`${WORKER_BASE}/api/v1/info`, { method: 'GET' });
            if (!resp.ok) return;
            const info: { anchors?: { ethereum?: string[] } } = await resp.json();
            const ethChains = info.anchors?.ethereum ?? [];
            if (ethChains.includes('base')) {
                this.enabled = [
                    ...this.baseline,
                    new EthereumAnchor({ id: 'base', label: 'Base (Ethereum L2)', explorerUrl: 'https://basescan.org' }),
                ];
            }
        } catch {
            // Worker unreachable or info endpoint missing — keep the baseline.
        }
    }

    /**
     * Reset state and submit the manifest hash to all enabled anchors
     * in parallel. Returns once every anchor has either confirmed or
     * failed; the UI signal updates incrementally.
     */
    async submit(request: AnchorRequest): Promise<AnchorAttestation[]> {
        await this.ready;

        // Initial pending row for every anchor so the UI shows them up front.
        const initial: AnchorAttestation[] = this.enabled.map((a) => ({
            kind: a.kind,
            provider: a.provider,
            providerLabel: a.providerLabel,
            proofExtension: a.proofExtension,
            status: 'submitting'
        }));
        this.anchorsState.set(initial);

        const tasks = this.enabled.map(async (anchor, idx) => {
            try {
                const result = await anchor.submit(request);
                this.replaceAt(idx, result);
                return result;
            } catch (err) {
                const failed: AnchorAttestation = {
                    ...initial[idx],
                    status: 'failed',
                    error: err instanceof Error ? err.message : String(err)
                };
                this.replaceAt(idx, failed);
                return failed;
            }
        });

        return Promise.all(tasks);
    }

    reset(): void {
        this.anchorsState.set([]);
    }

    private replaceAt(index: number, attestation: AnchorAttestation): void {
        const next = [...this.anchorsState()];
        next[index] = attestation;
        this.anchorsState.set(next);
    }
}
