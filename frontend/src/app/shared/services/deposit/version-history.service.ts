import { Injectable, computed, signal } from '@angular/core';

/**
 * Stores deposit history in IndexedDB for version tracking.
 *
 * Each deposit is recorded with its manifest digest, files, anchors,
 * and GPG metadata. Users can see all deposits they've made and track
 * how their project evolves over time — all stored locally, never on
 * any server.
 */

export interface DepositAnchorSummary {
    provider: string;
    status: string;
    anchoredAt?: string;
}

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
    anchors: DepositAnchorSummary[];
    gpgSigned: boolean;
    gpgKeyId?: string;
}

/** A project groups deposits sharing the same title, newest first. */
export interface DepositProject {
    title: string;
    latest: DepositRecord;
    versions: DepositRecord[];
    totalFiles: number;
    totalSize: number;
}

export interface HistoryExport {
    format: 'mayday.deposit-history';
    version: 1;
    exportedAt: string;
    records: DepositRecord[];
}

const DB_NAME = 'mayday-deposits';
const STORE_NAME = 'history';
const DB_VERSION = 1;
const EXPORT_FORMAT = 'mayday.deposit-history' as const;

@Injectable({ providedIn: 'root' })
export class VersionHistoryService {
    readonly history = signal<DepositRecord[]>([]);

    /** Records grouped by project title, each group sorted newest-first. */
    readonly projects = computed<DepositProject[]>(() => {
        const byTitle = new Map<string, DepositRecord[]>();
        for (const rec of this.history()) {
            const key = (rec.title || '—').trim();
            const bucket = byTitle.get(key) ?? [];
            bucket.push(rec);
            byTitle.set(key, bucket);
        }
        const out: DepositProject[] = [];
        for (const [title, versions] of byTitle) {
            versions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            out.push({
                title,
                latest: versions[0],
                versions,
                totalFiles: versions.reduce((s, r) => s + r.fileCount, 0),
                totalSize: versions.reduce((s, r) => s + r.totalSize, 0),
            });
        }
        out.sort((a, b) => b.latest.timestamp.localeCompare(a.latest.timestamp));
        return out;
    });

    /** Total deposits across all projects. */
    readonly depositCount = computed(() => this.history().length);
    readonly projectCount = computed(() => this.projects().length);

    /** Earliest timestamp in the history (ISO string) or null. */
    readonly oldestTimestamp = computed<string | null>(() => {
        const hist = this.history();
        if (!hist.length) return null;
        return hist.reduce((m, r) => (r.timestamp < m ? r.timestamp : m), hist[0].timestamp);
    });

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

    async clearAll(): Promise<void> {
        const db = await this.openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => {
                void this.loadAll();
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    /** Export every record as a portable JSON document. */
    exportJson(): string {
        const payload: HistoryExport = {
            format: EXPORT_FORMAT,
            version: 1,
            exportedAt: new Date().toISOString(),
            records: this.history(),
        };
        return JSON.stringify(payload, null, 2);
    }

    /**
     * Import a previously exported JSON document. Upserts by digest —
     * existing records are overwritten. Returns the number of records
     * actually imported. Throws on malformed input.
     */
    async importJson(text: string): Promise<number> {
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            throw new Error('Not valid JSON');
        }
        if (!parsed || typeof parsed !== 'object') {
            throw new Error('Empty or non-object payload');
        }
        const doc = parsed as Partial<HistoryExport>;
        if (doc.format !== EXPORT_FORMAT) {
            throw new Error(`Unexpected format: ${doc.format ?? 'missing'}`);
        }
        if (!Array.isArray(doc.records)) {
            throw new Error('Missing records array');
        }

        const db = await this.openDb();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            for (const rec of doc.records as DepositRecord[]) {
                if (rec && typeof rec.digest === 'string' && /^[0-9a-f]{64}$/i.test(rec.digest)) {
                    store.put(rec);
                }
            }
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        await this.loadAll();
        return doc.records.length;
    }
}
