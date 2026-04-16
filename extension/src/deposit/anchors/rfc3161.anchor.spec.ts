import { Rfc3161Anchor } from './rfc3161.anchor';
import { AnchorRequest } from './anchor';

describe('Rfc3161Anchor', () => {
    let anchor: Rfc3161Anchor;
    const testRequest: AnchorRequest = {
        manifestHashHex: 'abcd'.repeat(16),
        manifestDigest: new Uint8Array(32),
    };

    beforeEach(() => {
        anchor = new Rfc3161Anchor({ id: 'freetsa', label: 'FreeTSA' });
    });

    it('should have correct kind', () => {
        expect(anchor.kind).toBe('rfc3161');
    });

    it('should have correct provider', () => {
        expect(anchor.provider).toBe('freetsa');
        expect(anchor.providerLabel).toBe('FreeTSA');
    });

    it('should have tsr proof extension with provider', () => {
        expect(anchor.proofExtension).toBe('tsr.freetsa');
    });

    it('should have different proof extension per provider', () => {
        const digicert = new Rfc3161Anchor({ id: 'digicert', label: 'DigiCert' });
        expect(digicert.proofExtension).toBe('tsr.digicert');
    });

    it('should return failed status when API unreachable', async () => {
        const result = await anchor.submit(testRequest);

        expect(result.kind).toBe('rfc3161');
        expect(result.provider).toBe('freetsa');
        expect(result.status).toBe('failed');
        expect(result.error).toBeTruthy();
    });
});
