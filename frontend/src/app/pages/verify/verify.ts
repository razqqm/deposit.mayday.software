import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HashingService } from '@/app/shared/services/deposit/hashing.service';
import { SigningService, VerifyResult } from '@/app/shared/services/deposit/signing.service';
import { UiButton, UiCard, UiDropZone, UiCodeBlock, UiBadge, UiSection } from '@/app/ui';

type CheckStatus = 'passed' | 'failed' | 'skipped';

interface CheckResult {
    kind: 'what' | 'who' | 'when';
    label: string;
    status: CheckStatus;
    details: string;
}

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [TranslateModule, FormsModule, UiButton, UiCard, UiDropZone, UiCodeBlock, UiBadge, UiSection],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ui-section
            [eyebrow]="'verify.eyebrow' | translate"
            [title]="'verify.title' | translate"
            [subtitle]="'verify.subtitle' | translate"
            [tight]="true">
            <div class="grid">
                <div class="zones">
                    <ui-drop-zone
                        [label]="'verify.dropManifest' | translate"
                        [hint]="'.cff · .yaml · .yml'"
                        accept=".cff,.yaml,.yml"
                        icon="file"
                        [files]="manifestFile()"
                        (filesChange)="setManifest($event)" />

                    <ui-drop-zone
                        [label]="'verify.dropSources' | translate"
                        icon="folder"
                        [multiple]="true"
                        [files]="sourceFiles()"
                        (filesChange)="setSources($event)" />

                    <ui-drop-zone
                        [label]="'verify.dropProofs' | translate"
                        hint=".tsr · .ots"
                        accept=".tsr,.ots"
                        icon="shield"
                        [multiple]="true"
                        [files]="proofFiles()"
                        (filesChange)="setProofs($event)" />

                    <ui-drop-zone
                        [label]="'verify.dropPublicKey' | translate"
                        hint=".asc · .gpg · .pgp · .pub"
                        accept=".asc,.gpg,.pgp,.pub,.key"
                        icon="key"
                        [files]="publicKeyFile()"
                        (filesChange)="setPublicKey($event)" />

                    @if (keyNeedsPassphrase()) {
                        <div class="key-pass">
                            <label class="key-pass-label">
                                <span class="caption">{{ 'verify.keyPassphraseLabel' | translate }}</span>
                                <input type="password"
                                    [(ngModel)]="keyPassphrase"
                                    autocomplete="off"
                                    spellcheck="false"
                                    class="key-pass-input" />
                            </label>
                            <p class="caption key-pass-hint">{{ 'verify.keyPassphraseHint' | translate }}</p>
                        </div>
                    }

                    <ui-drop-zone
                        [label]="'verify.dropSignature' | translate"
                        hint=".asc"
                        accept=".asc"
                        icon="pen"
                        [files]="signatureFile()"
                        (filesChange)="setSignature($event)" />
                </div>

                <aside class="side">
                    <ui-card
                        [eyebrow]="'verify.readiness' | translate"
                        [title]="zonesFilled() + '/5'"
                        [subtitle]="'verify.readinessHint' | translate">
                        <div class="readiness-list">
                            <div class="row" [class.ok]="!!manifestFile()">
                                <span class="tick">{{ manifestFile() ? '●' : '○' }}</span>
                                <span>{{ 'verify.dropManifest' | translate }}</span>
                                <ui-badge class="tag" tone="brand">{{ 'verify.required' | translate }}</ui-badge>
                            </div>
                            <div class="row" [class.ok]="sourceFiles().length > 0">
                                <span class="tick">{{ sourceFiles().length ? '●' : '○' }}</span>
                                <span>WHAT · sources</span>
                            </div>
                            <div class="row" [class.ok]="proofFiles().length > 0">
                                <span class="tick">{{ proofFiles().length ? '●' : '○' }}</span>
                                <span>WHEN · proofs</span>
                            </div>
                            <div class="row" [class.ok]="!!publicKeyFile() && !!signatureFile()">
                                <span class="tick">{{ publicKeyFile() && signatureFile() ? '●' : '○' }}</span>
                                <span>WHO · key + signature</span>
                            </div>
                        </div>

                        <button
                            ui-button
                            variant="primary"
                            size="lg"
                            [loading]="verifying()"
                            [disabled]="!manifestFile() || verifying()"
                            (click)="runVerification()"
                            style="width: 100%; margin-top: var(--sp-4);">
                            {{ verifying() ? ('verify.verifying' | translate) : ('verify.runButton' | translate) }}
                        </button>
                    </ui-card>
                </aside>
            </div>

            @if (checks().length) {
                <div class="results">
                    <div class="summary" [class.ok]="allPassed()" [class.fail]="!allPassed()">
                        <span class="tag">{{ allPassed() ? '✓' : '✗' }}</span>
                        <span>{{ allPassed() ? ('verify.allPassed' | translate) : ('verify.someFailures' | translate) }}</span>
                    </div>

                    <div class="check-grid">
                        @for (check of checks(); track $index) {
                            <ui-card class="check" [class]="'s-' + check.status">
                                <div class="check-head">
                                    <span class="icon" [class]="check.status">
                                        @if (check.status === 'passed') { ✓ }
                                        @else if (check.status === 'failed') { ✗ }
                                        @else { — }
                                    </span>
                                    <div>
                                        <h3 class="check-title">{{ check.label }}</h3>
                                        <span class="caption">
                                            @if (check.kind === 'what') { WHAT · content integrity }
                                            @else if (check.kind === 'who') { WHO · authorship }
                                            @else { WHEN · timestamp }
                                        </span>
                                    </div>
                                </div>
                                <p class="check-details">{{ check.details }}</p>
                            </ui-card>
                        }
                    </div>

                    <ui-card [eyebrow]="'verify.cliEyebrow' | translate"
                             [title]="'verify.cliTitle' | translate"
                             [subtitle]="'verify.cliHint' | translate">
                        <ui-code-block [value]="cliOts" label="bitcoin (opentimestamps)" />
                        <ui-code-block [value]="cliTsr" label="rfc 3161 (openssl)" />
                        <ui-code-block [value]="cliGpg" label="gpg signature" />
                    </ui-card>
                </div>
            }
        </ui-section>
    `,
    styleUrl: './verify.scss',
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

    /** Set true once we've parsed the uploaded key and confirmed it's a
     *  passphrase-locked private key. Triggers the passphrase input. */
    readonly keyNeedsPassphrase = signal(false);
    /** Two-way bound to the passphrase field. Cleared after each verify run. */
    keyPassphrase = '';

    readonly verifying = signal(false);
    readonly checks = signal<CheckResult[]>([]);

    readonly zonesFilled = computed(() => {
        let n = 0;
        if (this.manifestFile()) n++;
        if (this.sourceFiles().length) n++;
        if (this.proofFiles().length) n++;
        if (this.publicKeyFile()) n++;
        if (this.signatureFile()) n++;
        return n;
    });

    readonly allPassed = computed(() => {
        const c = this.checks();
        return c.length > 0 && c.every(ch => ch.status === 'passed' || ch.status === 'skipped');
    });

    readonly cliOts = 'ots verify CITATION.cff.ots';
    readonly cliTsr = 'openssl ts -verify -data CITATION.cff -in CITATION.cff.tsr.freetsa -CAfile freetsa-cacert.pem';
    readonly cliGpg = 'gpg --verify CITATION.cff.asc CITATION.cff';

    private t(key: string, params?: Record<string, unknown>): string {
        return this.translate.instant(key, params);
    }

    setManifest(files: File[]): void { this.manifestFile.set(files[0] ?? null); }
    setSources(files: File[]): void { this.sourceFiles.set(files); }
    setProofs(files: File[]): void { this.proofFiles.set(files); }
    async setPublicKey(files: File[]): Promise<void> {
        const file = files[0] ?? null;
        this.publicKeyFile.set(file);
        this.keyNeedsPassphrase.set(false);
        this.keyPassphrase = '';
        if (!file) return;
        try {
            const text = await file.text();
            const needs = await this.signingSvc.needsPassphraseForKey(text);
            this.keyNeedsPassphrase.set(needs);
        } catch {
            // Malformed file — leave passphrase hidden, real error will surface
            // when the user clicks Verify and the underlying parser throws.
        }
    }
    setSignature(files: File[]): void { this.signatureFile.set(files[0] ?? null); }

    async runVerification(): Promise<void> {
        const manifestFileRef = this.manifestFile();
        if (!manifestFileRef) return;
        this.verifying.set(true);
        this.checks.set([]);

        const results: CheckResult[] = [];

        try {
            const manifestText = await manifestFileRef.text();
            results.push(await this.checkWhat(manifestText));
            results.push(await this.checkWho(manifestText));
            results.push(...(await this.checkWhen(manifestText)));
        } catch (err) {
            results.push({
                kind: 'what',
                label: this.t('verify.failed'),
                status: 'failed',
                details: err instanceof Error ? err.message : String(err),
            });
        }

        this.checks.set(results);
        this.verifying.set(false);
    }

    private async checkWhat(manifestText: string): Promise<CheckResult> {
        const sources = this.sourceFiles();
        if (!sources.length) {
            return { kind: 'what', label: this.t('verify.checkWhat'), status: 'skipped', details: this.t('verify.skipped') };
        }

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
                kind: 'what',
                label: this.t('verify.checkWhat'),
                status: 'failed',
                details: `${matched} ${this.t('verify.hashMatch')}, ${mismatched} ${this.t('verify.hashMismatch')}. ${mismatchDetails.join('; ')}`,
            };
        }

        return {
            kind: 'what',
            label: this.t('verify.checkWhat'),
            status: 'passed',
            details: `${matched}/${manifestHashes.size} ${this.t('verify.hashMatch')}`,
        };
    }

    private async checkWho(manifestText: string): Promise<CheckResult> {
        const sigFile = this.signatureFile();
        const keyFile = this.publicKeyFile();

        if (!sigFile || !keyFile) {
            return { kind: 'who', label: this.t('verify.checkWho'), status: 'skipped', details: this.t('verify.skipped') };
        }

        try {
            const [sigText, keyText] = await Promise.all([sigFile.text(), keyFile.text()]);
            const passphrase = this.keyPassphrase.trim() || undefined;
            const result: VerifyResult = await this.signingSvc.verify(manifestText, sigText, keyText, passphrase);

            if (result.valid) {
                return {
                    kind: 'who',
                    label: this.t('verify.checkWho'),
                    status: 'passed',
                    details: `${this.t('verify.sigValid')} · Key ${result.keyId} · ${result.userId}`,
                };
            }
            return { kind: 'who', label: this.t('verify.checkWho'), status: 'failed', details: this.t('verify.sigInvalid') };
        } catch (err) {
            const raw = err instanceof Error ? err.message : String(err);
            const friendly = raw === 'GPG_PASSPHRASE_REQUIRED'
                ? this.t('verify.keyPassphraseRequired')
                : raw;
            return {
                kind: 'who',
                label: this.t('verify.checkWho'),
                status: 'failed',
                details: friendly,
            };
        }
    }

    private async checkWhen(manifestText: string): Promise<CheckResult[]> {
        const proofs = this.proofFiles();
        if (!proofs.length) {
            return [{ kind: 'when', label: this.t('verify.checkWhen'), status: 'skipped', details: this.t('verify.noProofs') }];
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
                    kind: 'when',
                    label: `${this.t('verify.checkWhen')} · ${name}`,
                    status: 'skipped',
                    details: this.translate.instant('verify.unknownFormat', { name }),
                });
            }
        }

        return results;
    }

    private parseOts(bytes: Uint8Array, manifestHash: string, filename: string): CheckResult {
        const OTS_MAGIC_LEN = 31;
        const label = `${this.t('verify.checkWhen')} · ${filename}`;

        if (bytes.length < OTS_MAGIC_LEN + 1 + 1 + 32) {
            return { kind: 'when', label, status: 'failed', details: this.t('verify.otsTooShort') };
        }

        const version = bytes[OTS_MAGIC_LEN];
        const hashOp = bytes[OTS_MAGIC_LEN + 1];
        const digest = Array.from(bytes.slice(OTS_MAGIC_LEN + 2, OTS_MAGIC_LEN + 2 + 32))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        if (hashOp !== 0x08) {
            return { kind: 'when', label, status: 'failed', details: `Unexpected hash op: 0x${hashOp.toString(16)}` };
        }
        if (digest !== manifestHash) {
            return {
                kind: 'when',
                label,
                status: 'failed',
                details: `${this.t('verify.otsDigestMismatch')}: ${digest.slice(0, 16)}… ≠ ${manifestHash.slice(0, 16)}…`,
            };
        }

        return {
            kind: 'when',
            label,
            status: 'passed',
            details: `${this.t('verify.otsParsed')} · v${version} · SHA-256 · ${this.t('verify.hashMatch')}`,
        };
    }

    private parseTsr(bytes: Uint8Array, filename: string): CheckResult {
        const label = `${this.t('verify.checkWhen')} · ${filename}`;
        if (bytes.length < 10 || bytes[0] !== 0x30) {
            return { kind: 'when', label, status: 'failed', details: this.t('verify.tsrInvalid') };
        }
        return {
            kind: 'when',
            label,
            status: 'passed',
            details: `${this.t('verify.tsrParsed')} · ${bytes.length} bytes · ${this.t('verify.cliHint')}`,
        };
    }
}
