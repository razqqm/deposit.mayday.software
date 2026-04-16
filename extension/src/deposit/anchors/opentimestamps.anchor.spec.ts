import { OpentimestampsAnchor } from './opentimestamps.anchor';
import { AnchorRequest } from './anchor';

describe('OpentimestampsAnchor', () => {
    let anchor: OpentimestampsAnchor;
    const testRequest: AnchorRequest = {
        manifestHashHex: 'abcd'.repeat(16),
        manifestDigest: new Uint8Array(32),
    };

    beforeEach(() => {
        anchor = new OpentimestampsAnchor({ id: 'alice', label: 'alice.btc.calendar' });
    });

    it('should have correct kind', () => {
        expect(anchor.kind).toBe('opentimestamps');
    });

    it('should have correct provider (prefixed)', () => {
        expect(anchor.provider).toBe('opentimestamps-alice');
        expect(anchor.providerLabel).toBe('OpenTimestamps · alice.btc.calendar');
    });

    it('should have ots proof extension with calendar id', () => {
        expect(anchor.proofExtension).toBe('ots.alice');
    });

    it('should return failed status when API unreachable', async () => {
        const result = await anchor.submit(testRequest);

        expect(result.kind).toBe('opentimestamps');
        expect(result.provider).toBe('opentimestamps-alice');
        expect(result.status).toBe('failed');
        expect(result.error).toBeTruthy();
    });
});
