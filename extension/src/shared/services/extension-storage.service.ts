import { Injectable, signal, computed } from '@angular/core';
import browser from 'webextension-polyfill';

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
    readonly deposits = signal<DepositRecord[]>([]);
    readonly depositCount = computed(() => this.deposits().length);

    private settingsCache: ExtensionSettings | null = null;

    constructor() {
        void this.loadDeposits();
        browser.storage.onChanged.addListener((changes) => {
            if (changes[DEPOSITS_KEY]) {
                this.deposits.set((changes[DEPOSITS_KEY].newValue as DepositRecord[]) ?? []);
            }
        });
    }

    async loadDeposits(): Promise<DepositRecord[]> {
        const data = await browser.storage.local.get(DEPOSITS_KEY);
        const records = (data[DEPOSITS_KEY] as DepositRecord[]) ?? [];
        records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        this.deposits.set(records);
        void this.updateBadge(records.length);
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
        await browser.storage.local.set({ [DEPOSITS_KEY]: current });
        this.deposits.set(current);
        void this.updateBadge(current.length);
    }

    async deleteDeposit(digest: string): Promise<void> {
        const current = this.deposits().filter((r) => r.digest !== digest);
        await browser.storage.local.set({ [DEPOSITS_KEY]: current });
        this.deposits.set(current);
        void this.updateBadge(current.length);
    }

    async getSettings(): Promise<ExtensionSettings> {
        if (this.settingsCache) return this.settingsCache;
        const data = await browser.storage.local.get(SETTINGS_KEY);
        this.settingsCache = (data[SETTINGS_KEY] as ExtensionSettings) ?? {
            language: 'en',
            defaultAuthor: { givenNames: '', familyNames: '', email: '' },
        };
        return this.settingsCache;
    }

    async saveSettings(settings: ExtensionSettings): Promise<void> {
        this.settingsCache = settings;
        await browser.storage.local.set({ [SETTINGS_KEY]: settings });
    }

    private async updateBadge(count: number): Promise<void> {
        try {
            await browser.action.setBadgeText({ text: count > 0 ? String(count) : '' });
            await browser.action.setBadgeBackgroundColor({ color: '#f59e0b' });
        } catch {
            // action API may not be available in all contexts
        }
    }
}
