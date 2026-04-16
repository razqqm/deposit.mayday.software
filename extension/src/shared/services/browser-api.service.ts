import { Injectable } from '@angular/core';

/**
 * Thin wrapper around the WebExtension browser API.
 * Exists solely so tests can provide a mock via DI instead of
 * fighting with module-level imports of webextension-polyfill.
 */
@Injectable({ providedIn: 'root' })
export class BrowserApiService {
    private _browser: any = null;

    private async getBrowser(): Promise<any> {
        if (!this._browser) {
            try {
                const mod = await import('webextension-polyfill');
                if (mod.default?.storage?.local) {
                    this._browser = mod.default;
                } else {
                    this._browser = this.createStub();
                }
            } catch {
                this._browser = this.createStub();
            }
        }
        return this._browser;
    }

    private createStub(): any {
        const noop = async () => ({});
        return {
            storage: {
                local: { get: noop, set: noop, remove: noop, clear: noop },
                onChanged: { addListener() {}, removeListener() {} },
            },
            action: { setBadgeText: noop, setBadgeBackgroundColor: noop },
            tabs: { query: async () => [], sendMessage: noop, captureVisibleTab: noop },
            runtime: { onMessage: { addListener() {} }, onInstalled: { addListener() {} } },
        };
    }

    // Storage
    async storageGet(keys: string | string[]): Promise<Record<string, unknown>> {
        const b = await this.getBrowser();
        return b.storage.local.get(keys);
    }

    async storageSet(items: Record<string, unknown>): Promise<void> {
        const b = await this.getBrowser();
        await b.storage.local.set(items);
    }

    onStorageChanged(fn: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void): void {
        this.getBrowser().then(b => {
            b.storage.onChanged.addListener(fn);
        }).catch(() => {});
    }

    // Badge
    async setBadgeText(text: string): Promise<void> {
        try {
            const b = await this.getBrowser();
            await b.action.setBadgeText({ text });
            await b.action.setBadgeBackgroundColor({ color: '#f59e0b' });
        } catch { /* not available outside extension */ }
    }

    // Tabs
    async getActiveTab(): Promise<{ id?: number; url?: string; title?: string; windowId?: number } | null> {
        const b = await this.getBrowser();
        const [tab] = await b.tabs.query({ active: true, currentWindow: true });
        return tab ?? null;
    }

    async sendTabMessage(tabId: number, message: unknown): Promise<unknown> {
        const b = await this.getBrowser();
        return b.tabs.sendMessage(tabId, message);
    }

    async captureVisibleTab(windowId: number): Promise<string> {
        const b = await this.getBrowser();
        return b.tabs.captureVisibleTab(windowId, { format: 'png' });
    }
}
