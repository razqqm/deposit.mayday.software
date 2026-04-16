/**
 * Content script for page capture.
 *
 * Injected into every page at document_idle. Listens for messages
 * from the popup/background requesting HTML serialization.
 *
 * This file is compiled by esbuild (not Angular) and must stay
 * lightweight — no frameworks, no heavy dependencies.
 */

interface CaptureRequest {
    type: 'CAPTURE_HTML';
}

interface CaptureResponse {
    html: string;
    url: string;
    title: string;
    meta: Record<string, string>;
}

chrome.runtime.onMessage.addListener(
    (message: CaptureRequest, _sender, sendResponse: (response: CaptureResponse) => void) => {
        if (message.type !== 'CAPTURE_HTML') return false;

        const meta: Record<string, string> = {};
        document.querySelectorAll('meta[name], meta[property]').forEach((el) => {
            const key = el.getAttribute('name') || el.getAttribute('property') || '';
            const content = el.getAttribute('content') || '';
            if (key && content) meta[key] = content;
        });

        sendResponse({
            html: document.documentElement.outerHTML,
            url: location.href,
            title: document.title,
            meta,
        });

        return true; // keep the message channel open for async response
    }
);
