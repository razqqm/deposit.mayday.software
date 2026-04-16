import { TestBed } from '@angular/core/testing';
import { CaptureService } from './capture.service';
import { BrowserApiService } from './browser-api.service';

describe('CaptureService', () => {
    let service: CaptureService;
    let apiSpy: jasmine.SpyObj<BrowserApiService>;

    beforeEach(() => {
        apiSpy = jasmine.createSpyObj('BrowserApiService', [
            'getActiveTab', 'sendTabMessage', 'captureVisibleTab',
            'storageGet', 'storageSet', 'onStorageChanged', 'setBadgeText',
        ]);

        TestBed.configureTestingModule({
            providers: [
                CaptureService,
                { provide: BrowserApiService, useValue: apiSpy },
            ],
        });
        service = TestBed.inject(CaptureService);
    });

    describe('dataUrlToFile', () => {
        it('should convert a data URL to a File', () => {
            const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
            const file = service.dataUrlToFile(dataUrl, 'test.png');

            expect(file).toBeInstanceOf(File);
            expect(file.name).toBe('test.png');
            expect(file.type).toBe('image/png');
            expect(file.size).toBeGreaterThan(0);
        });

        it('should handle different MIME types', () => {
            const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
            const file = service.dataUrlToFile(dataUrl, 'photo.jpg');
            expect(file.type).toBe('image/jpeg');
        });

        it('should produce correct byte count', () => {
            // "Hello" in base64 = "SGVsbG8="
            const dataUrl = 'data:text/plain;base64,SGVsbG8=';
            const file = service.dataUrlToFile(dataUrl, 'hello.txt');
            expect(file.size).toBe(5);
        });
    });

    describe('capturePage', () => {
        it('should throw when no active tab', async () => {
            apiSpy.getActiveTab.and.resolveTo(null);
            await expectAsync(service.capturePage(false)).toBeRejectedWithError('No active tab');
        });

        it('should capture HTML without screenshot', async () => {
            apiSpy.getActiveTab.and.resolveTo({ id: 1, url: 'https://example.com', title: 'Example', windowId: 1 });
            apiSpy.sendTabMessage.and.resolveTo({ html: '<html><body>Test</body></html>' });

            const result = await service.capturePage(false);
            expect(result.url).toBe('https://example.com');
            expect(result.title).toBe('Example');
            expect(result.html).toContain('<html>');
            expect(result.screenshotDataUrl).toBeUndefined();
            expect(apiSpy.captureVisibleTab).not.toHaveBeenCalled();
        });

        it('should capture HTML with screenshot', async () => {
            apiSpy.getActiveTab.and.resolveTo({ id: 1, url: 'https://example.com', title: 'Example', windowId: 1 });
            apiSpy.sendTabMessage.and.resolveTo({ html: '<html></html>' });
            apiSpy.captureVisibleTab.and.resolveTo('data:image/png;base64,abc');

            const result = await service.capturePage(true);
            expect(result.screenshotDataUrl).toBe('data:image/png;base64,abc');
            expect(apiSpy.captureVisibleTab).toHaveBeenCalledWith(1);
        });
    });
});
