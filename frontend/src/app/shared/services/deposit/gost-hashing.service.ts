import { Injectable } from '@angular/core';

/**
 * GOST R 34.11-2012 «Stribog» hash function — the Russian Federation's
 * national cryptographic hash standard.
 *
 * Uses the @li0ard/streebog pure TypeScript implementation (lazy-loaded).
 * Complements SHA-256 for compliance with Russian/CIS cybersecurity
 * regulations (Federal Law 152-FZ, FSB requirements for CIPF).
 *
 * Standard: GOST R 34.11-2012 "Information technology — Cryptographic
 * data security — Hash function" (Стрибог).
 */

export interface GostHashedFile {
    path: string;
    size: number;
    stribog256: string;
}

@Injectable({ providedIn: 'root' })
export class GostHashingService {
    private streebogFn: ((data: Uint8Array) => Uint8Array) | null = null;

    private async load(): Promise<(data: Uint8Array) => Uint8Array> {
        if (!this.streebogFn) {
            const mod: Record<string, unknown> = await import('@li0ard/streebog');
            this.streebogFn = (mod['streebog256'] ?? mod['default']) as (data: Uint8Array) => Uint8Array;
        }
        return this.streebogFn!;
    }

    async hashFile(file: File, path?: string): Promise<GostHashedFile> {
        const fn = await this.load();
        const buffer = new Uint8Array(await file.arrayBuffer());
        const digest = fn(buffer);
        const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
        return {
            path: path ?? (rel || file.name),
            size: file.size,
            stribog256: bytesToHex(new Uint8Array(digest))
        };
    }

    async hashString(input: string): Promise<string> {
        const fn = await this.load();
        const buffer = new TextEncoder().encode(input);
        return bytesToHex(new Uint8Array(fn(buffer)));
    }
}

function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
    return hex;
}
