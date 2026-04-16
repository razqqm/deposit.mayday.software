import { Injectable } from '@angular/core';
import browser from 'webextension-polyfill';

export interface CapturedPage {
    url: string;
    title: string;
    html: string;
    screenshotDataUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class CaptureService {
    async capturePage(includeScreenshot: boolean): Promise<CapturedPage> {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) throw new Error('No active tab');

        // Request HTML from content script
        const response = await browser.tabs.sendMessage(tab.id, { type: 'CAPTURE_HTML' });
        const result: CapturedPage = {
            url: tab.url ?? '',
            title: tab.title ?? '',
            html: (response as { html: string }).html,
        };

        // Capture screenshot if requested
        if (includeScreenshot) {
            result.screenshotDataUrl = await browser.tabs.captureVisibleTab(
                tab.windowId!,
                { format: 'png' }
            );
        }

        return result;
    }

    /** Convert a data URL to a File object. */
    dataUrlToFile(dataUrl: string, filename: string): File {
        const [meta, base64] = dataUrl.split(',');
        const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
        const bytes = atob(base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        return new File([arr], filename, { type: mime });
    }
}
