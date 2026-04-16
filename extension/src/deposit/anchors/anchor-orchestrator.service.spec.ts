import { TestBed } from '@angular/core/testing';
import { AnchorOrchestratorService } from './anchor-orchestrator.service';

describe('AnchorOrchestratorService', () => {
    let service: AnchorOrchestratorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AnchorOrchestratorService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should start with empty anchors', () => {
        expect(service.anchors()).toEqual([]);
    });

    it('should reset anchors', () => {
        service.reset();
        expect(service.anchors()).toEqual([]);
    });

    it('should submit to all enabled anchors', async () => {
        const digest = new Uint8Array(32);
        crypto.getRandomValues(digest);
        const hex = Array.from(digest).map(b => b.toString(16).padStart(2, '0')).join('');

        // Submit will try to reach the API which won't work in tests,
        // but should not throw — each anchor handles errors gracefully
        const results = await service.submit({ manifestHashHex: hex, manifestDigest: digest });

        // Should have at least the baseline anchors (5: 3 TSAs + 2 OTS)
        expect(results.length).toBeGreaterThanOrEqual(5);

        // Each result should have required fields
        for (const r of results) {
            expect(r.kind).toBeTruthy();
            expect(r.provider).toBeTruthy();
            expect(r.providerLabel).toBeTruthy();
            expect(['confirmed', 'failed']).toContain(r.status);
        }
    });

    it('should update anchors signal during submit', async () => {
        const digest = new Uint8Array(32);
        const hex = '0'.repeat(64);

        await service.submit({ manifestHashHex: hex, manifestDigest: digest });

        // After submit completes, anchors signal should have results
        expect(service.anchors().length).toBeGreaterThanOrEqual(5);
    });

    it('should handle reset after submit', async () => {
        const digest = new Uint8Array(32);
        const hex = '0'.repeat(64);

        await service.submit({ manifestHashHex: hex, manifestDigest: digest });
        expect(service.anchors().length).toBeGreaterThan(0);

        service.reset();
        expect(service.anchors().length).toBe(0);
    });
});
