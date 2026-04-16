import { EthereumAnchor } from './ethereum.anchor';
import { AnchorRequest } from './anchor';

describe('EthereumAnchor', () => {
    let anchor: EthereumAnchor;
    const testRequest: AnchorRequest = {
        manifestHashHex: 'abcd'.repeat(16),
        manifestDigest: new Uint8Array(32),
    };

    beforeEach(() => {
        anchor = new EthereumAnchor({
            id: 'base',
            label: 'Base (Ethereum L2)',
            explorerUrl: 'https://basescan.org',
        });
    });

    it('should have correct kind', () => {
        expect(anchor.kind).toBe('ethereum');
    });

    it('should have correct provider (prefixed)', () => {
        expect(anchor.provider).toBe('ethereum-base');
        expect(anchor.providerLabel).toBe('Ethereum L2 · Base (Ethereum L2)');
    });

    it('should have eth proof extension with chain id', () => {
        expect(anchor.proofExtension).toBe('eth.base.json');
    });

    it('should return failed status when API unreachable', async () => {
        const result = await anchor.submit(testRequest);

        expect(result.kind).toBe('ethereum');
        expect(result.provider).toBe('ethereum-base');
        expect(result.status).toBe('failed');
        expect(result.error).toBeTruthy();
    });
});
