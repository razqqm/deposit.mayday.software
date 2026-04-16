import { Injectable, inject, signal, computed } from '@angular/core';
import { BrowserApiService } from './browser-api.service';

export interface DepositAnchorSummary {
    provider: string;
    status: string;
    anchoredAt?: string;
}

export interface DepositRecord {
    digest: string;
    title: string;
    version: string;
    authorName: string;
    authorEmail: string;
    fileCount: number;
    totalSize: number;
    timestamp: string;
    anchors: DepositAnchorSummary[];
    gpgSigned: boolean;
    gpgKeyId?: string;
}

export interface ExtensionSettings {
    language: 'en' | 'ru';
    defaultAuthor: { givenNames: string; familyNames: string; email: string };
}

const DEPOSITS_KEY = 'deposits';
const SETTINGS_KEY = 'settings';

@Injectable({ providedIn: 'root' })
export class ExtensionStorageService {
    private readonly api = inject(BrowserApiService);

    readonly deposits = signal<DepositRecord[]>([]);
    readonly depositCount = computed(() => this.deposits().length);

    private settingsCache: ExtensionSettings | null = null;

    constructor() {
        void this.loadDeposits();
        this.api.onStorageChanged((changes) => {
            if (DEPOSITS_KEY in changes) {
                const val = changes[DEPOSITS_KEY];
                this.deposits.set((val.newValue as DepositRecord[]) ?? []);
            }
        });
    }

    async loadDeposits(): Promise<DepositRecord[]> {
        const data = await this.api.storageGet(DEPOSITS_KEY);
        const records = (data[DEPOSITS_KEY] as DepositRecord[]) ?? [];
        records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        this.deposits.set(records);
        void this.api.setBadgeText(records.length > 0 ? String(records.length) : '');
        return records;
    }

    async saveDeposit(record: DepositRecord): Promise<void> {
        const current = [...this.deposits()];
        const idx = current.findIndex((r) => r.digest === record.digest);
        if (idx >= 0) {
            current[idx] = record;
        } else {
            current.unshift(record);
        }
        await this.api.storageSet({ [DEPOSITS_KEY]: current });
        this.deposits.set(current);
        void this.api.setBadgeText(current.length > 0 ? String(current.length) : '');
    }

    async deleteDeposit(digest: string): Promise<void> {
        const current = this.deposits().filter((r) => r.digest !== digest);
        await this.api.storageSet({ [DEPOSITS_KEY]: current });
        this.deposits.set(current);
        void this.api.setBadgeText(current.length > 0 ? String(current.length) : '');
    }

    async getSettings(): Promise<ExtensionSettings> {
        if (this.settingsCache) return this.settingsCache;
        const data = await this.api.storageGet(SETTINGS_KEY);
        this.settingsCache = (data[SETTINGS_KEY] as ExtensionSettings) ?? {
            language: 'en',
            defaultAuthor: { givenNames: '', familyNames: '', email: '' },
        };
        return this.settingsCache;
    }

    async saveSettings(settings: ExtensionSettings): Promise<void> {
        this.settingsCache = settings;
        await this.api.storageSet({ [SETTINGS_KEY]: settings });
    }
}
