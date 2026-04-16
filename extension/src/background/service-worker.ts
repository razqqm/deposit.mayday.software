/**
 * MV3 Background Service Worker.
 *
 * Responsibilities:
 * - Badge count management (listens to storage changes)
 * - Context menu for "Deposit this page"
 * - Extension install/update handling
 */

import browser from 'webextension-polyfill';

const DEPOSITS_KEY = 'deposits';

// Update badge when storage changes
browser.storage.onChanged.addListener((changes) => {
    if (changes[DEPOSITS_KEY]) {
        const deposits = (changes[DEPOSITS_KEY].newValue as unknown[]) ?? [];
        void updateBadge(deposits.length);
    }
});

// Initialize badge on startup
browser.storage.local.get(DEPOSITS_KEY).then((data) => {
    const deposits = (data[DEPOSITS_KEY] as unknown[]) ?? [];
    void updateBadge(deposits.length);
});

// Context menu for page deposit
browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus?.create({
        id: 'deposit-page',
        title: 'Deposit this page — mayday.software',
        contexts: ['page'],
    });
});

browser.contextMenus?.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'deposit-page' && tab?.id) {
        // Open the popup programmatically by activating the extension
        // MV3 doesn't allow programmatic popup opening, so open the full site
        void browser.tabs.create({
            url: 'https://deposit.mayday.software',
        });
    }
});

// Show onboarding on first install
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        void browser.tabs.create({
            url: 'https://deposit.mayday.software/how',
        });
    }
});

async function updateBadge(count: number): Promise<void> {
    try {
        await browser.action.setBadgeText({ text: count > 0 ? String(count) : '' });
        await browser.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    } catch {
        // action API may not be available
    }
}
