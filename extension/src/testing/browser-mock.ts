/**
 * Mock for webextension-polyfill used in tests.
 * Provides in-memory implementations of chrome.storage, chrome.tabs, etc.
 */

const storageData: Record<string, unknown> = {};
const changeListeners: Array<(changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void> = [];

export const browserMock = {
    storage: {
        local: {
            async get(keys: string | string[]): Promise<Record<string, unknown>> {
                const keyList = typeof keys === 'string' ? [keys] : keys;
                const result: Record<string, unknown> = {};
                for (const k of keyList) {
                    if (k in storageData) result[k] = storageData[k];
                }
                return result;
            },
            async set(items: Record<string, unknown>): Promise<void> {
                const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
                for (const [k, v] of Object.entries(items)) {
                    changes[k] = { oldValue: storageData[k], newValue: v };
                    storageData[k] = v;
                }
                for (const listener of changeListeners) {
                    listener(changes);
                }
            },
            async remove(keys: string | string[]): Promise<void> {
                const keyList = typeof keys === 'string' ? [keys] : keys;
                for (const k of keyList) {
                    delete storageData[k];
                }
            },
            async clear(): Promise<void> {
                for (const k of Object.keys(storageData)) {
                    delete storageData[k];
                }
            },
        },
        onChanged: {
            addListener(fn: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void): void {
                changeListeners.push(fn);
            },
            removeListener(fn: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void): void {
                const idx = changeListeners.indexOf(fn);
                if (idx >= 0) changeListeners.splice(idx, 1);
            },
        },
    },
    action: {
        async setBadgeText(_details: { text: string }): Promise<void> {},
        async setBadgeBackgroundColor(_details: { color: string }): Promise<void> {},
    },
    tabs: {
        async query(_queryInfo: Record<string, unknown>): Promise<Array<{ id?: number; url?: string; title?: string; windowId?: number }>> {
            return [{ id: 1, url: 'https://example.com', title: 'Example', windowId: 1 }];
        },
        async sendMessage(_tabId: number, _message: unknown): Promise<unknown> {
            return { html: '<html><body>Test</body></html>', url: 'https://example.com', title: 'Example', meta: {} };
        },
        async captureVisibleTab(_windowId: number, _options: Record<string, unknown>): Promise<string> {
            // 1x1 transparent PNG as data URL
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        },
    },
    runtime: {
        onMessage: {
            addListener(_fn: (...args: unknown[]) => void): void {},
            removeListener(_fn: (...args: unknown[]) => void): void {},
        },
        onInstalled: {
            addListener(_fn: (details: { reason: string }) => void): void {},
        },
    },
    contextMenus: {
        create(_createProperties: Record<string, unknown>): void {},
        onClicked: {
            addListener(_fn: (...args: unknown[]) => void): void {},
        },
    },
};

/** Reset storage between tests */
export function resetBrowserMock(): void {
    for (const k of Object.keys(storageData)) {
        delete storageData[k];
    }
    changeListeners.length = 0;
}
