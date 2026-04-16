/**
 * Drop-in mock for webextension-polyfill.
 * Used by Karma via webpack resolve.alias so that any
 * `import browser from 'webextension-polyfill'` gets this instead.
 */

const storageData: Record<string, unknown> = {};
const changeListeners: Array<(changes: Record<string, unknown>) => void> = [];

const browser = {
    storage: {
        local: {
            async get(keys: string | string[]) {
                const keyList = typeof keys === 'string' ? [keys] : keys;
                const result: Record<string, unknown> = {};
                for (const k of keyList) {
                    if (k in storageData) result[k] = storageData[k];
                }
                return result;
            },
            async set(items: Record<string, unknown>) {
                for (const [k, v] of Object.entries(items)) {
                    storageData[k] = v;
                }
                for (const fn of changeListeners) fn(items);
            },
            async remove(keys: string | string[]) {
                const keyList = typeof keys === 'string' ? [keys] : keys;
                for (const k of keyList) delete storageData[k];
            },
            async clear() {
                for (const k of Object.keys(storageData)) delete storageData[k];
            },
        },
        onChanged: {
            addListener(fn: (changes: Record<string, unknown>) => void) { changeListeners.push(fn); },
            removeListener() {},
        },
    },
    action: {
        async setBadgeText() {},
        async setBadgeBackgroundColor() {},
    },
    tabs: {
        async query() { return [{ id: 1, url: 'https://example.com', title: 'Example', windowId: 1 }]; },
        async sendMessage() { return { html: '<html></html>', url: 'https://example.com', title: 'Example', meta: {} }; },
        async captureVisibleTab() { return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; },
    },
    runtime: {
        onMessage: { addListener() {}, removeListener() {} },
        onInstalled: { addListener() {} },
    },
    contextMenus: {
        create() {},
        onClicked: { addListener() {} },
    },
};

export default browser;
