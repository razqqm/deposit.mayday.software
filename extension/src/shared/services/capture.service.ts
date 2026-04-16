import { Injectable, inject } from '@angular/core';
import { BrowserApiService } from './browser-api.service';

export interface CapturedPage {
    url: string;
    title: string;
    html: string;
    screenshotDataUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class CaptureService {
    private readonly api = inject(BrowserApiService);

    async capturePage(includeScreenshot: boolean): Promise<CapturedPage> {
        const tab = await this.api.getActiveTab();
        if (!tab?.id) throw new Error('No active tab');

        const response = await this.api.sendTabMessage(tab.id, { type: 'CAPTURE_HTML' });
        const result: CapturedPage = {
            url: tab.url ?? '',
            title: tab.title ?? '',
            html: (response as { html: string }).html,
        };

        if (includeScreenshot && tab.windowId != null) {
            result.screenshotDataUrl = await this.api.captureVisibleTab(tab.windowId);
        }

        return result;
    }

    dataUrlToFile(dataUrl: string, filename: string): File {
        const [meta, base64] = dataUrl.split(',');
        const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
        const bytes = atob(base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        return new File([arr], filename, { type: mime });
    }
}
