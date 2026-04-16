import { TestBed } from '@angular/core/testing';
import { ExtensionStorageService, DepositRecord } from './extension-storage.service';
import { BrowserApiService } from './browser-api.service';

function makeRecord(overrides: Partial<DepositRecord> = {}): DepositRecord {
    return {
        digest: 'abc123def456abc123def456abc123def456abc123def456abc123def456abcd',
        title: 'Test Project',
        version: '1.0.0',
        authorName: 'Test Author',
        authorEmail: 'test@test.com',
        fileCount: 3,
        totalSize: 1024,
        timestamp: '2026-04-16T10:00:00Z',
        anchors: [{ provider: 'freetsa', status: 'confirmed', anchoredAt: '2026-04-16T10:00:01Z' }],
        gpgSigned: false,
        ...overrides,
    };
}

describe('ExtensionStorageService', () => {
    let service: ExtensionStorageService;
    let apiSpy: jasmine.SpyObj<BrowserApiService>;
    const store: Record<string, unknown> = {};

    beforeEach(() => {
        // Clear store
        for (const k of Object.keys(store)) delete store[k];

        apiSpy = jasmine.createSpyObj('BrowserApiService', [
            'storageGet', 'storageSet', 'onStorageChanged', 'setBadgeText',
        ]);
        apiSpy.storageGet.and.callFake(async (keys: string | string[]) => {
            const keyList = typeof keys === 'string' ? [keys] : keys;
            const result: Record<string, unknown> = {};
            for (const k of keyList) {
                if (k in store) result[k] = store[k];
            }
            return result;
        });
        apiSpy.storageSet.and.callFake(async (items: Record<string, unknown>) => {
            Object.assign(store, items);
        });
        apiSpy.onStorageChanged.and.stub();
        apiSpy.setBadgeText.and.resolveTo();

        TestBed.configureTestingModule({
            providers: [
                ExtensionStorageService,
                { provide: BrowserApiService, useValue: apiSpy },
            ],
        });

        service = TestBed.inject(ExtensionStorageService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should start with empty deposits', () => {
        expect(service.depositCount()).toBe(0);
    });

    it('should register storage change listener', () => {
        expect(apiSpy.onStorageChanged).toHaveBeenCalledTimes(1);
    });

    it('should load deposits from storage', async () => {
        store['deposits'] = [makeRecord()];
        const records = await service.loadDeposits();
        expect(records.length).toBe(1);
        expect(service.deposits().length).toBe(1);
    });

    it('should sort deposits by timestamp descending', async () => {
        store['deposits'] = [
            makeRecord({ digest: 'a', timestamp: '2026-01-01T00:00:00Z' }),
            makeRecord({ digest: 'b', timestamp: '2026-04-01T00:00:00Z' }),
        ];
        const records = await service.loadDeposits();
        expect(records[0].timestamp).toBe('2026-04-01T00:00:00Z');
    });

    it('should save a new deposit', async () => {
        const record = makeRecord();
        await service.saveDeposit(record);

        expect(apiSpy.storageSet).toHaveBeenCalled();
        expect(service.deposits().length).toBe(1);
        expect(service.deposits()[0].title).toBe('Test Project');
    });

    it('should upsert by digest', async () => {
        await service.saveDeposit(makeRecord({ digest: 'abc', title: 'Old' }));
        await service.saveDeposit(makeRecord({ digest: 'abc', title: 'New' }));

        expect(service.deposits().length).toBe(1);
        expect(service.deposits()[0].title).toBe('New');
    });

    it('should delete a deposit', async () => {
        await service.saveDeposit(makeRecord({ digest: 'aaa' }));
        await service.saveDeposit(makeRecord({ digest: 'bbb' }));
        expect(service.deposits().length).toBe(2);

        await service.deleteDeposit('aaa');
        expect(service.deposits().length).toBe(1);
        expect(service.deposits()[0].digest).toBe('bbb');
    });

    it('should update badge on save', async () => {
        await service.saveDeposit(makeRecord());
        expect(apiSpy.setBadgeText).toHaveBeenCalledWith('1');
    });

    it('should clear badge when no deposits', async () => {
        await service.saveDeposit(makeRecord({ digest: 'x' }));
        await service.deleteDeposit('x');
        expect(apiSpy.setBadgeText).toHaveBeenCalledWith('');
    });

    it('should get default settings when none saved', async () => {
        const settings = await service.getSettings();
        expect(settings.language).toBe('en');
        expect(settings.defaultAuthor.givenNames).toBe('');
    });

    it('should save and retrieve settings', async () => {
        await service.saveSettings({
            language: 'ru',
            defaultAuthor: { givenNames: 'Test', familyNames: 'User', email: 'test@test.com' },
        });

        const settings = await service.getSettings();
        expect(settings.language).toBe('ru');
        expect(settings.defaultAuthor.givenNames).toBe('Test');
    });
});
