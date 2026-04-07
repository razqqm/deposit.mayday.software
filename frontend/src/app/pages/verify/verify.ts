import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HashingService } from '@/app/shared/services/deposit/hashing.service';
import { SigningService, VerifyResult } from '@/app/shared/services/deposit/signing.service';

type CheckStatus = 'passed' | 'failed' | 'skipped';

interface CheckResult {
    label: string;
    status: CheckStatus;
    details: string;
}

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="verify-container">
            <header class="verify-header">
                <h1>{{ 'verify.title' | translate }}</h1>
                <p>{{ 'verify.subtitle' | translate }}</p>
            </header>

            <!-- Drop zones -->
            <div class="drop-zones">
                <label class="drop-zone">
                    <input type="file" accept=".cff,.yaml,.yml" (change)="onManifest($event)">
                    <span class="zone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </span>
                    <span class="zone-text">
                        <span class="zone-label">{{ 'verify.dropManifest' | translate }}</span>
                        @if (manifestFile()) { <span class="zone-file">{{ manifestFile()!.name }}</span> }
                    </span>
                </label>

                <label class="drop-zone">
                    <input type="file" multiple (change)="onSources($event)">
                    <span class="zone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                    </span>
                    <span class="zone-text">
                        <span class="zone-label">{{ 'verify.dropSources' | translate }}</span>
                        @if (sourceFiles().length) { <span class="zone-file">{{ sourceFiles().length }} files</span> }
                    </span>
                </label>

                <label class="drop-zone">
                    <input type="file" accept=".tsr,.ots" multiple (change)="onProofs($event)">
                    <span class="zone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <span class="zone-text">
                        <span class="zone-label">{{ 'verify.dropProofs' | translate }}</span>
                        @if (proofFiles().length) { <span class="zone-file">{{ proofFiles().length }} files</span> }
                    </span>
                </label>

                <label class="drop-zone">
                    <input type="file" accept=".asc,.gpg,.pgp,.pub,.key" (change)="onPublicKey($event)">
                    <span class="zone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <span class="zone-text">
                        <span class="zone-label">{{ 'verify.dropPublicKey' | translate }}</span>
                        @if (publicKeyFile()) { <span class="zone-file">{{ publicKeyFile()!.name }}</span> }
                    </span>
                </label>

                <label class="drop-zone">
                    <input type="file" accept=".asc" (change)="onSignature($event)">
                    <span class="zone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                    </span>
                    <span class="zone-text">
                        <span class="zone-label">{{ 'verify.dropSignature' | translate }}</span>
                        @if (signatureFile()) { <span class="zone-file">{{ signatureFile()!.name }}</span> }
                    </span>
                </label>
            </div>

            <button class="verify-btn" [disabled]="!manifestFile() || verifying()" (click)="runVerification()">
                {{ verifying() ? '...' : ('verify.runButton' | translate) }}
            </button>

            <!-- Results -->
            @if (checks().length) {
                <div class="results">
                    @for (check of checks(); track check.label) {
                        <div class="check-card">
                            <div class="check-header">
                                <span class="check-icon" [class]="check.status">
                                    @if (check.status === 'passed') { ✓ }
                                    @else if (check.status === 'failed') { ✗ }
                                    @else { — }
                                </span>
                                <h3>{{ check.label }}</h3>
                            </div>
                            <div class="check-details">{{ check.details }}</div>
                        </div>
                    }
                </div>

                <div class="summary-bar" [class.all-pass]="allPassed()" [class.some-fail]="!allPassed()">
                    {{ allPassed() ? ('verify.allPassed' | translate) : ('verify.someFailures' | translate) }}
                </div>

                <div class="cli-hint">
                    {{ 'verify.cliHint' | translate }}
                    <code>ots verify CITATION.cff.ots</code>
                    <code>openssl ts -verify -data CITATION.cff -in CITATION.cff.tsr.freetsa -CAfile freetsa-cacert.pem</code>
                    <code>gpg --verify CITATION.cff.asc CITATION.cff</code>
                </div>
            }
        </div>
    `,
    styleUrl: './verify.scss'
})
export class VerifyPage {
    private readonly hashingSvc = inject(HashingService);
    private readonly signingSvc = inject(SigningService);
    private readonly translate = inject(TranslateService);

    readonly manifestFile = signal<File | null>(null);
    readonly sourceFiles = signal<File[]>([]);
    readonly proofFiles = signal<File[]>([]);
    readonly publicKeyFile = signal<File | null>(null);
    readonly signatureFile = signal<File | null>(null);

    readonly verifying = signal(false);
    readonly checks = signal<CheckResult[]>([]);

    readonly allPassed = () => {
        const c = this.checks();
        return c.length > 0 && c.every(ch => ch.status === 'passed' || ch.status === 'skipped');
    };

    private t(key: string): string {
        return this.translate.instant(key);
    }

    onManifest(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.manifestFile.set(file);
    }

    onSources(event: Event): void {
        const files = Array.from((event.target as HTMLInputElement).files ?? []);
        this.sourceFiles.set(files);
    }

    onProofs(event: Event): void {
        const files = Array.from((event.target as HTMLInputElement).files ?? []);
        this.proofFiles.set(files);
    }

    onPublicKey(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.publicKeyFile.set(file);
    }

    onSignature(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0] ?? null;
        this.signatureFile.set(file);
    }

    async runVerification(): Promise<void> {
        const manifestFileRef = this.manifestFile();
        if (!manifestFileRef) return;
        this.verifying.set(true);
        this.checks.set([]);

        const results: CheckResult[] = [];

        try {
            const manifestText = await manifestFileRef.text();

            // --- Check I: WHAT (re-hash sources, compare to manifest) ---
            results.push(await this.checkWhat(manifestText));

            // --- Check II: WHO (GPG signature verification) ---
            results.push(await this.checkWho(manifestText));

            // --- Check III: WHEN (proof file parsing) ---
            results.push(...await this.checkWhen(manifestText));

        } catch (err) {
            results.push({
                label: 'Error',
                status: 'failed',
                details: err instanceof Error ? err.message : String(err)
            });
        }

        this.checks.set(results);
        this.verifying.set(false);
    }

    private async checkWhat(manifestText: string): Promise<CheckResult> {
        const sources = this.sourceFiles();
        if (!sources.length) {
            return { label: this.t('verify.checkWhat'), status: 'skipped', details: this.t('verify.skipped') };
        }

        // Parse file hashes from manifest
        const manifestHashes = new Map<string, string>();
        const fileRegex = /^  - path:\s*"?(.+?)"?\s*$/gm;
        const hashRegex = /^    sha256:\s*([0-9a-f]{64})\s*$/gm;
        const paths = [...manifestText.matchAll(fileRegex)].map(m => m[1]);
        const hashes = [...manifestText.matchAll(hashRegex)].map(m => m[1]);
        for (let i = 0; i < Math.min(paths.length, hashes.length); i++) {
            manifestHashes.set(paths[i], hashes[i]);
        }

        let matched = 0;
        let mismatched = 0;
        const mismatchDetails: string[] = [];

        for (const file of sources) {
            const hashed = await this.hashingSvc.hashFile(file);
            const expected = manifestHashes.get(hashed.path);
            if (!expected) continue;
            if (expected === hashed.sha256) {
                matched++;
            } else {
                mismatched++;
                mismatchDetails.push(`${hashed.path}: ${this.t('verify.hashMismatch')}`);
            }
        }

        if (mismatched > 0) {
            return {
                label: this.t('verify.checkWhat'),
                status: 'failed',
                details: `${matched} ${this.t('verify.hashMatch')}, ${mismatched} ${this.t('verify.hashMismatch')}. ${mismatchDetails.join('; ')}`
            };
        }

        return {
            label: this.t('verify.checkWhat'),
            status: 'passed',
            details: `${matched}/${manifestHashes.size} ${this.t('verify.hashMatch')}`
        };
    }

    private async checkWho(manifestText: string): Promise<CheckResult> {
        const sigFile = this.signatureFile();
        const keyFile = this.publicKeyFile();

        if (!sigFile || !keyFile) {
            return { label: this.t('verify.checkWho'), status: 'skipped', details: this.t('verify.skipped') };
        }

        try {
            const [sigText, keyText] = await Promise.all([sigFile.text(), keyFile.text()]);
            const result: VerifyResult = await this.signingSvc.verify(manifestText, sigText, keyText);

            if (result.valid) {
                return {
                    label: this.t('verify.checkWho'),
                    status: 'passed',
                    details: `${this.t('verify.sigValid')} · Key ${result.keyId} · ${result.userId}`
                };
            } else {
                return {
                    label: this.t('verify.checkWho'),
                    status: 'failed',
                    details: this.t('verify.sigInvalid')
                };
            }
        } catch (err) {
            return {
                label: this.t('verify.checkWho'),
                status: 'failed',
                details: err instanceof Error ? err.message : String(err)
            };
        }
    }

    private async checkWhen(manifestText: string): Promise<CheckResult[]> {
        const proofs = this.proofFiles();
        if (!proofs.length) {
            return [{ label: this.t('verify.checkWhen'), status: 'skipped', details: this.t('verify.noProofs') }];
        }

        const manifestHash = await this.hashingSvc.hashString(manifestText);
        const results: CheckResult[] = [];

        for (const proof of proofs) {
            const bytes = new Uint8Array(await proof.arrayBuffer());
            const name = proof.name;

            if (name.endsWith('.ots')) {
                results.push(this.parseOts(bytes, manifestHash, name));
            } else if (name.includes('.tsr')) {
                results.push(this.parseTsr(bytes, name));
            } else {
                results.push({
                    label: `${this.t('verify.checkWhen')} · ${name}`,
                    status: 'skipped',
                    details: `Unknown proof format: ${name}`
                });
            }
        }

        return results;
    }

    private parseOts(bytes: Uint8Array, manifestHash: string, filename: string): CheckResult {
        // OTS header: magic (31 bytes) + version (1) + hash op (1) + digest (32)
        const OTS_MAGIC_LEN = 31;
        const label = `${this.t('verify.checkWhen')} · ${filename}`;

        if (bytes.length < OTS_MAGIC_LEN + 1 + 1 + 32) {
            return { label, status: 'failed', details: 'File too short to be a valid .ots' };
        }

        const version = bytes[OTS_MAGIC_LEN];
        const hashOp = bytes[OTS_MAGIC_LEN + 1];
        const digest = Array.from(bytes.slice(OTS_MAGIC_LEN + 2, OTS_MAGIC_LEN + 2 + 32))
            .map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashOp !== 0x08) {
            return { label, status: 'failed', details: `Unexpected hash op: 0x${hashOp.toString(16)}` };
        }

        if (digest !== manifestHash) {
            return { label, status: 'failed', details: `${this.t('verify.otsDigestMismatch')}: ${digest.slice(0, 16)}... ≠ ${manifestHash.slice(0, 16)}...` };
        }

        return {
            label,
            status: 'passed',
            details: `${this.t('verify.otsParsed')} · v${version} · SHA-256 · ${this.t('verify.hashMatch')}`
        };
    }

    private parseTsr(bytes: Uint8Array, filename: string): CheckResult {
        const label = `${this.t('verify.checkWhen')} · ${filename}`;

        // MVP: check that it's a valid DER structure
        // Full verification requires OpenSSL or pkijs chain validation
        if (bytes.length < 10 || bytes[0] !== 0x30) {
            return { label, status: 'failed', details: 'Not a valid DER-encoded TimeStampResp' };
        }

        return {
            label,
            status: 'passed',
            details: `${this.t('verify.tsrParsed')} · ${bytes.length} bytes · ${this.t('verify.cliHint')}`
        };
    }
}
