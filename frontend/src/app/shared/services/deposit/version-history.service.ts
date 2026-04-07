import { Injectable, signal } from '@angular/core';

/**
 * Stores deposit history in IndexedDB for version tracking.
 * Inspired by Bernstein's version history feature.
 *
 * Each deposit is recorded with its manifest digest, files, and anchors.
 * Users can see all deposits they've made and track how their
 * project evolves over time — all stored locally, never on any server.
 */

export interface DepositRecord {
    /** Manifest SHA-256 digest — primary key */
    digest: string;
    title: string;
    version: string;
    authorName: string;
    authorEmail: string;
    fileCount: number;
    totalSize: number;
    timestamp: string;
    /** Which anchors confirmed */
    anchors: { provider: string; status: string; anchoredAt?: string }[];
    /** Was GPG signed? */
    gpgSigned: boolean;
    gpgKeyId?: string;
}

const DB_NAME = 'mayday-deposits';
const STORE_NAME = 'history';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class VersionHistoryService {
    readonly history = signal<DepositRecord[]>([]);

    private dbPromise: Promise<IDBDatabase> | null = null;

    private openDb(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise;
        this.dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'digest' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('title', 'title', { unique: false });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return this.dbPromise;
    }

    async save(record: DepositRecord): Promise<void> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(record);
            tx.oncomplete = () => {
                void this.loadAll();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    async loadAll(): Promise<DepositRecord[]> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).index('timestamp').openCursor(null, 'prev');
            const records: DepositRecord[] = [];
            req.onsuccess = () => {
                const cursor = req.result;
                if (cursor) {
                    records.push(cursor.value);
                    cursor.continue();
                } else {
                    this.history.set(records);
                    resolve(records);
                }
            };
            req.onerror = () => reject(req.error);
        });
    }

    async getByTitle(title: string): Promise<DepositRecord[]> {
        const all = await this.loadAll();
        return all.filter(r => r.title === title);
    }

    async deleteRecord(digest: string): Promise<void> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(digest);
            tx.oncomplete = () => {
                void this.loadAll();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    }
}
