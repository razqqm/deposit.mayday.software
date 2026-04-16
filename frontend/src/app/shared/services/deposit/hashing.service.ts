import { Injectable } from '@angular/core';

export interface HashedFile {
    path: string;
    size: number;
    sha256: string;
}

/**
 * Computes SHA-256 hashes for files entirely in the browser via WebCrypto.
 * Files never leave the user's machine.
 */
@Injectable({ providedIn: 'root' })
export class HashingService {
    async hashFile(file: File, path?: string): Promise<HashedFile> {
        const buffer = await file.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', buffer);
        const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
        return {
            path: path ?? (rel || file.name),
            size: file.size,
            sha256: bufferToHex(digest)
        };
    }

    async hashMany(files: File[]): Promise<HashedFile[]> {
        const out: HashedFile[] = [];
        for (const f of files) {
            out.push(await this.hashFile(f));
        }
        out.sort((a, b) => a.path.localeCompare(b.path));
        return out;
    }

    async hashString(input: string): Promise<string> {
        const buffer = new TextEncoder().encode(input);
        const digest = await crypto.subtle.digest('SHA-256', buffer);
        return bufferToHex(digest);
    }
}

function bufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
}
