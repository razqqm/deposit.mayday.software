import { TestBed } from '@angular/core/testing';
import { BrowserApiService } from './browser-api.service';

describe('BrowserApiService', () => {
    let service: BrowserApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BrowserApiService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('storageGet (falls back to stub)', () => {
        it('should return empty object for unknown key', async () => {
            const result = await service.storageGet('nonexistent');
            expect(result).toBeTruthy();
            expect(typeof result).toBe('object');
        });

        it('should handle array of keys', async () => {
            const result = await service.storageGet(['a', 'b']);
            expect(typeof result).toBe('object');
        });
    });

    describe('storageSet (falls back to stub)', () => {
        it('should not throw', async () => {
            await expectAsync(service.storageSet({ test: 'value' })).toBeResolved();
        });
    });

    describe('setBadgeText (falls back to stub)', () => {
        it('should not throw', async () => {
            await expectAsync(service.setBadgeText('5')).toBeResolved();
        });

        it('should handle empty text', async () => {
            await expectAsync(service.setBadgeText('')).toBeResolved();
        });
    });

    describe('onStorageChanged', () => {
        it('should accept a listener without throwing', () => {
            expect(() => service.onStorageChanged(() => {})).not.toThrow();
        });
    });

    describe('getActiveTab (falls back to stub)', () => {
        it('should return null or a tab object', async () => {
            const result = await service.getActiveTab();
            // Stub returns empty array, so first element is undefined → null
            expect(result === null || result === undefined || typeof result === 'object').toBeTrue();
        });
    });

    describe('sendTabMessage (falls back to stub)', () => {
        it('should not throw', async () => {
            await expectAsync(service.sendTabMessage(1, { type: 'test' })).toBeResolved();
        });
    });

    describe('captureVisibleTab (falls back to stub)', () => {
        it('should not throw', async () => {
            await expectAsync(service.captureVisibleTab(1)).toBeResolved();
        });
    });
});
