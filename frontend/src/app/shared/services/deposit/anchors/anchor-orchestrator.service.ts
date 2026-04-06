import { Injectable, signal, Signal } from '@angular/core';
import { Anchor, AnchorAttestation, AnchorRequest } from './anchor';
import { Rfc3161Anchor } from './rfc3161.anchor';
import { OpentimestampsAnchor } from './opentimestamps.anchor';

/**
 * Runs all enabled anchors in parallel and exposes their statuses
 * through a signal so the UI can render progress per-row.
 *
 * Anchors are independent — one failure does not affect others.
 */
@Injectable({ providedIn: 'root' })
export class AnchorOrchestratorService {
    private readonly anchorsState = signal<AnchorAttestation[]>([]);
    readonly anchors: Signal<AnchorAttestation[]> = this.anchorsState.asReadonly();

    private readonly enabled: Anchor[] = [
        new Rfc3161Anchor({ id: 'freetsa', label: 'FreeTSA' }),
        new Rfc3161Anchor({ id: 'digicert', label: 'DigiCert' }),
        new Rfc3161Anchor({ id: 'sectigo', label: 'Sectigo' }),
        new OpentimestampsAnchor({ id: 'alice', label: 'alice.btc.calendar' }),
        new OpentimestampsAnchor({ id: 'finney', label: 'finney.eternitywall' })
    ];

    /**
     * Reset state and submit the manifest hash to all enabled anchors
     * in parallel. Returns once every anchor has either confirmed or
     * failed; the UI signal updates incrementally.
     */
    async submit(request: AnchorRequest): Promise<AnchorAttestation[]> {
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
