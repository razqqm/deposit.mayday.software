import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HashedFile, HashingService } from '@/app/shared/services/deposit/hashing.service';
import { BuiltManifest, ManifestService } from '@/app/shared/services/deposit/manifest.service';
import { CertificateService } from '@/app/shared/services/deposit/certificate.service';
import { AnchorOrchestratorService } from '@/app/shared/services/deposit/anchors/anchor-orchestrator.service';
import { AnchorAttestation } from '@/app/shared/services/deposit/anchors/anchor';
import { RevealDirective } from '@/app/shared/directives/reveal.directive';

interface FormState {
    title: string;
    version: string;
    license: string;
    authorGivenNames: string;
    authorFamilyNames: string;
    authorEmail: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [TranslateModule, FormsModule, RevealDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="hero">
            <div class="hero-mesh" aria-hidden="true">
                <div class="mesh mesh-a"></div>
                <div class="mesh mesh-b"></div>
                <div class="mesh mesh-c"></div>
            </div>

            <div class="hero-grid">
                <div class="hero-copy">
                    <span class="badge">
                        <span class="badge-dot" aria-hidden="true"></span>
                        {{ 'hero.badge' | translate }}
                    </span>
                    <h1 class="title">
                        <span class="title-line">{{ 'hero.titleLine1' | translate }}</span>
                        <span class="title-line title-line--struck">
                            <span class="title-text">{{ 'hero.titleLine2' | translate }}</span>
                            <svg class="title-strike" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true">
                                <defs>
                                    <linearGradient id="strikeGold" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0" stop-color="#fbbf24" stop-opacity="0"/>
                                        <stop offset="0.15" stop-color="#fbbf24"/>
                                        <stop offset="0.5" stop-color="#f97316"/>
                                        <stop offset="0.85" stop-color="#fbbf24"/>
                                        <stop offset="1" stop-color="#fbbf24" stop-opacity="0"/>
                                    </linearGradient>
                                </defs>
                                <circle class="strike-stamp" cx="300" cy="40" r="34" fill="none" stroke="url(#strikeGold)" stroke-width="2.5"/>
                                <circle class="strike-stamp-inner" cx="300" cy="40" r="26" fill="none" stroke="url(#strikeGold)" stroke-width="1" stroke-dasharray="3 4"/>
                                <path class="strike-slash" d="M 20 62 Q 200 8, 580 22" fill="none" stroke="url(#strikeGold)" stroke-width="5" stroke-linecap="round"/>
                            </svg>
                        </span>
                    </h1>
                    <p class="subtitle">{{ 'hero.subtitle' | translate }}</p>
                    <div class="cta-row">
                        <a href="#deposit" class="cta cta--primary">
                            {{ 'hero.cta' | translate }}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        </a>
                    </div>
                    <p class="cta-hint">{{ 'hero.ctaHint' | translate }}</p>
                </div>

                <aside class="hero-bento" aria-hidden="true">
                    <div class="bento bento-hash">
                        <span class="bento-label">SHA-256 fingerprint</span>
                        <code class="bento-mono">9c07646d781e43fe<br/>35c63773a6374293<br/>7aa9e79b1b09138e<br/>f3f0c2e4392856d2</code>
                    </div>

                    <div class="bento bento-anchors">
                        <span class="bento-label">5 sources of truth</span>
                        <ul class="bento-list">
                            <li><span class="dot dot-btc"></span>Bitcoin · OpenTimestamps</li>
                            <li><span class="dot"></span>FreeTSA · RFC 3161</li>
                            <li><span class="dot"></span>DigiCert · RFC 3161</li>
                            <li><span class="dot"></span>Sectigo · RFC 3161</li>
                            <li><span class="dot dot-mute"></span>eIDAS QTSP · soon</li>
                        </ul>
                    </div>

                    <div class="bento bento-layers">
                        <span class="bento-label">3 proof layers</span>
                        <div class="layer-grid">
                            <div class="layer"><span class="layer-key">WHAT</span><span class="layer-val">Hash</span></div>
                            <div class="layer"><span class="layer-key">WHO</span><span class="layer-val">Author</span></div>
                            <div class="layer"><span class="layer-key">WHEN</span><span class="layer-val">Anchor</span></div>
                        </div>
                    </div>

                    <div class="bento bento-cert">
                        <span class="bento-label">Certificate</span>
                        <svg class="bento-cert-svg" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="188" height="118" rx="8" fill="none" stroke="var(--brand)" stroke-width="1.5"/>
                            <rect x="14" y="14" width="172" height="102" rx="4" fill="none" stroke="var(--brand)" stroke-width="0.5" stroke-opacity="0.5"/>
                            <line x1="40" y1="36" x2="160" y2="36" stroke="var(--text)" stroke-width="1.2" stroke-opacity="0.4"/>
                            <line x1="60" y1="48" x2="140" y2="48" stroke="var(--text)" stroke-width="1.2" stroke-opacity="0.25"/>
                            <circle cx="100" cy="76" r="14" fill="none" stroke="var(--brand)" stroke-width="1.2"/>
                            <circle cx="100" cy="76" r="10" fill="none" stroke="var(--brand)" stroke-width="0.5" stroke-dasharray="2 2"/>
                            <line x1="30" y1="104" x2="170" y2="104" stroke="var(--text)" stroke-width="0.6" stroke-opacity="0.3"/>
                            <line x1="48" y1="111" x2="152" y2="111" stroke="var(--text)" stroke-width="0.6" stroke-opacity="0.2"/>
                        </svg>
                    </div>
                </aside>
            </div>
        </section>

        <section id="deposit" class="deposit" appReveal>
            <header class="section-head">
                <span class="eyebrow">Step 1</span>
                <h2 class="section-title">Drop your source — we never see it</h2>
                <p class="section-sub">Hashing happens entirely in your browser via WebCrypto. The only thing that ever reaches our infrastructure is the 32-byte fingerprint of your manifest.</p>
            </header>

            <div
                class="drop card"
                [class.drop--active]="dragOver()"
                [class.drop--has-files]="hashedFiles().length > 0"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="openFileDialog()"
            >
                <input #fileInput type="file" multiple hidden (change)="onFilesPicked($event)" />

                @if (hashing()) {
                    <div class="drop-state">
                        <div class="spinner"></div>
                        <p>{{ 'drop.computing' | translate }}</p>
                        <p class="muted">{{ hashedCount() }} / {{ totalFiles() }}</p>
                    </div>
                } @else if (hashedFiles().length === 0) {
                    <div class="drop-state">
                        <svg class="drop-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M32 8v32"/>
                            <path d="M20 20l12-12 12 12"/>
                            <path d="M8 44v8a4 4 0 0 0 4 4h40a4 4 0 0 0 4-4v-8"/>
                        </svg>
                        <p class="drop-title">{{ 'drop.title' | translate }}</p>
                        <p class="drop-sub">{{ 'drop.subtitle' | translate }}</p>
                    </div>
                } @else {
                    <div class="drop-state ready">
                        <svg class="drop-icon ok" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="32" cy="32" r="28"/>
                            <path d="M20 32l8 8 16-16"/>
                        </svg>
                        <p class="drop-title">{{ 'drop.ready' | translate }}</p>
                        <p class="drop-sub">{{ hashedFiles().length }} files · {{ totalSizeHuman() }}</p>
                        <button type="button" class="link-btn" (click)="clear($event)">{{ 'drop.clear' | translate }}</button>
                    </div>
                }
            </div>

            @if (hashedFiles().length > 0) {
                <div class="form card">
                    <div class="form-row">
                        <label>
                            <span>{{ 'form.author' | translate }}</span>
                            <input type="text" [(ngModel)]="form.authorGivenNames" [placeholder]="'form.authorPh' | translate" />
                        </label>
                        <label>
                            <span>{{ 'form.email' | translate }}</span>
                            <input type="email" [(ngModel)]="form.authorEmail" [placeholder]="'form.emailPh' | translate" />
                        </label>
                    </div>
                    <div class="form-row">
                        <label class="grow">
                            <span>{{ 'form.title' | translate }}</span>
                            <input type="text" [(ngModel)]="form.title" [placeholder]="'form.titlePh' | translate" />
                        </label>
                    </div>
                    <div class="form-row">
                        <label>
                            <span>{{ 'form.version' | translate }}</span>
                            <input type="text" [(ngModel)]="form.version" [placeholder]="'form.versionPh' | translate" />
                        </label>
                        <label>
                            <span>{{ 'form.license' | translate }}</span>
                            <input type="text" [(ngModel)]="form.license" [placeholder]="'form.licensePh' | translate" />
                        </label>
                    </div>

                    <button type="button" class="primary" [disabled]="generating() || !canGenerate()" (click)="generate()">
                        {{ (generating() ? 'actions.generating' : 'actions.generate') | translate }}
                    </button>
                </div>
            }

            @if (manifest(); as m) {
                <div class="result card">
                    <header class="result-head">
                        <span class="eyebrow eyebrow--success">Done</span>
                        <h2>{{ 'result.title' | translate }}</h2>
                    </header>

                    <div class="proof-grid">
                        <div class="proof">
                            <span class="proof-label">{{ 'result.what' | translate }}</span>
                            <code class="proof-hash">{{ m.sha256 }}</code>
                        </div>
                        <div class="proof">
                            <span class="proof-label">{{ 'result.who' | translate }}</span>
                            <span class="proof-value">{{ form.authorGivenNames }} {{ form.authorFamilyNames }}<br/><span class="muted">{{ form.authorEmail }}</span></span>
                        </div>
                        <div class="proof">
                            <span class="proof-label">{{ 'result.when' | translate }}</span>
                            <span class="proof-value">{{ issuedHuman() }}</span>
                        </div>
                    </div>

                    <div class="anchors-block">
                        <h3>{{ 'anchors.title' | translate }}</h3>
                        <p class="anchors-help">{{ 'anchors.help' | translate }}</p>

                        @for (a of anchors(); track a.provider) {
                            <div class="anchor-row anchor-row--{{ a.status }}">
                                <span class="anchor-icon">
                                    @if (a.status === 'submitting' || a.status === 'pending') {
                                        <span class="anchor-spinner"></span>
                                    } @else if (a.status === 'confirmed') {
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-12"/></svg>
                                    } @else {
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>
                                    }
                                </span>
                                <div class="anchor-body">
                                    <div class="anchor-title">{{ a.providerLabel }}</div>
                                    <div class="anchor-summary">
                                        @if (a.status === 'confirmed') {
                                            {{ a.humanSummary }}
                                        } @else if (a.status === 'failed') {
                                            <span class="anchor-error">{{ 'anchors.failed' | translate }}: {{ a.error }}</span>
                                        } @else {
                                            {{ 'anchors.submitting' | translate }}
                                        }
                                    </div>
                                </div>
                                @if (a.status === 'confirmed' && a.proofBytes) {
                                    <button type="button" class="anchor-download" (click)="downloadProof(a)">
                                        {{ 'anchors.download' | translate }}
                                    </button>
                                }
                            </div>
                        }
                    </div>

                    <div class="actions">
                        <button type="button" class="primary" (click)="downloadCertificate()">
                            {{ 'actions.download' | translate }}
                        </button>
                        <button type="button" class="ghost" (click)="downloadManifest()">
                            {{ 'actions.downloadManifest' | translate }}
                        </button>
                        <button type="button" class="ghost" (click)="downloadAllProofs()" [disabled]="!hasAnyConfirmedAnchor()">
                            {{ 'anchors.downloadAll' | translate }}
                        </button>
                    </div>

                    <details class="manifest-preview">
                        <summary>{{ 'result.manifest' | translate }}</summary>
                        <pre>{{ m.yaml }}</pre>
                    </details>
                </div>
            }
        </section>

        <section class="info">
            <div class="info-grid">
                <div class="info-block info-block--wide card" appReveal>
                    <span class="eyebrow">How it works</span>
                    <h2>{{ 'how.title' | translate }}</h2>
                    <ol class="steps">
                        <li>
                            <span class="step-num">1</span>
                            <div>
                                <strong>{{ 'how.step1Title' | translate }}</strong>
                                <span>{{ 'how.step1Desc' | translate }}</span>
                            </div>
                        </li>
                        <li>
                            <span class="step-num">2</span>
                            <div>
                                <strong>{{ 'how.step2Title' | translate }}</strong>
                                <span>{{ 'how.step2Desc' | translate }}</span>
                            </div>
                        </li>
                        <li>
                            <span class="step-num">3</span>
                            <div>
                                <strong>{{ 'how.step3Title' | translate }}</strong>
                                <span>{{ 'how.step3Desc' | translate }}</span>
                            </div>
                        </li>
                        <li>
                            <span class="step-num">4</span>
                            <div>
                                <strong>{{ 'how.step4Title' | translate }}</strong>
                                <span>{{ 'how.step4Desc' | translate }}</span>
                            </div>
                        </li>
                    </ol>
                </div>

                <div class="info-block card" appReveal>
                    <span class="eyebrow">Why Bitcoin</span>
                    <h2>{{ 'why.title' | translate }}</h2>
                    <p>{{ 'why.p1' | translate }}</p>
                    <p>{{ 'why.p2' | translate }}</p>
                    <p>{{ 'why.p3' | translate }}</p>
                    <p class="callout">{{ 'why.p4' | translate }}</p>
                    <p class="muted-p">{{ 'why.alt' | translate }}</p>
                </div>

                <div class="info-block card" appReveal>
                    <span class="eyebrow">Legal</span>
                    <h2>{{ 'legal.title' | translate }}</h2>
                    <p>{{ 'legal.p1' | translate }}</p>
                    <p>{{ 'legal.p2' | translate }}</p>
                    <p>{{ 'legal.p3' | translate }}</p>
                    <p>{{ 'legal.p4' | translate }}</p>
                </div>
            </div>
        </section>
    `,
    styleUrl: './home.scss'
})
export class HomePage {
    private readonly hashingSvc = inject(HashingService);
    private readonly manifestSvc = inject(ManifestService);
    private readonly certSvc = inject(CertificateService);
    private readonly orchestrator = inject(AnchorOrchestratorService);

    readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
    readonly anchors = this.orchestrator.anchors;

    readonly dragOver = signal(false);
    readonly hashing = signal(false);
    readonly hashedCount = signal(0);
    readonly totalFiles = signal(0);
    readonly hashedFiles = signal<HashedFile[]>([]);
    readonly generating = signal(false);
    readonly manifest = signal<BuiltManifest | null>(null);

    form: FormState = {
        title: '',
        version: '0.1.0',
        license: 'MIT',
        authorGivenNames: '',
        authorFamilyNames: '',
        authorEmail: ''
    };

    readonly totalSizeHuman = computed(() => formatBytes(this.hashedFiles().reduce((s, f) => s + f.size, 0)));

    readonly issuedHuman = computed(() => {
        const m = this.manifest();
        return m ? new Date(m.issuedAt).toUTCString() : '';
    });

    openFileDialog(): void {
        this.fileInput().nativeElement.click();
    }

    canGenerate(): boolean {
        return !!this.form.title && !!this.form.authorGivenNames && this.hashedFiles().length > 0;
    }

    onDragOver(e: DragEvent): void {
        e.preventDefault();
        this.dragOver.set(true);
    }

    onDragLeave(e: DragEvent): void {
        e.preventDefault();
        this.dragOver.set(false);
    }

    async onDrop(e: DragEvent): Promise<void> {
        e.preventDefault();
        this.dragOver.set(false);
        const items = e.dataTransfer?.items;
        const files: File[] = [];
        if (items && items.length) {
            const promises: Promise<void>[] = [];
            for (let i = 0; i < items.length; i++) {
                const entry = (items[i] as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.();
                if (entry) {
                    promises.push(walkEntry(entry, '', files));
                } else {
                    const f = items[i].getAsFile();
                    if (f) files.push(f);
                }
            }
            await Promise.all(promises);
        } else if (e.dataTransfer?.files) {
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                files.push(e.dataTransfer.files[i]);
            }
        }
        await this.processFiles(files);
    }

    async onFilesPicked(e: Event): Promise<void> {
        const input = e.target as HTMLInputElement;
        if (!input.files) return;
        const files: File[] = [];
        for (let i = 0; i < input.files.length; i++) files.push(input.files[i]);
        await this.processFiles(files);
        input.value = '';
    }

    clear(e: Event): void {
        e.stopPropagation();
        this.hashedFiles.set([]);
        this.manifest.set(null);
    }

    private async processFiles(files: File[]): Promise<void> {
        if (!files.length) return;
        this.hashing.set(true);
        this.hashedCount.set(0);
        this.totalFiles.set(files.length);
        const out: HashedFile[] = [];
        for (const f of files) {
            try {
                out.push(await this.hashingSvc.hashFile(f));
            } catch {
                /* skip unreadable files */
            }
            this.hashedCount.update((n) => n + 1);
        }
        out.sort((a, b) => a.path.localeCompare(b.path));
        this.hashedFiles.set(out);
        this.hashing.set(false);
        this.manifest.set(null);
    }

    async generate(): Promise<void> {
        if (!this.canGenerate()) return;
        this.generating.set(true);
        this.orchestrator.reset();
        try {
            const m = await this.manifestSvc.build({
                title: this.form.title,
                version: this.form.version,
                license: this.form.license,
                authorGivenNames: this.form.authorGivenNames,
                authorFamilyNames: this.form.authorFamilyNames,
                authorEmail: this.form.authorEmail,
                files: this.hashedFiles()
            });
            this.manifest.set(m);
            queueMicrotask(() => document.querySelector('.result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

            // Submit fingerprint to all anchors in parallel — non-blocking.
            const digest = hexToBytes(m.sha256);
            void this.orchestrator.submit({ manifestHashHex: m.sha256, manifestDigest: digest });
        } finally {
            this.generating.set(false);
        }
    }

    hasAnyConfirmedAnchor(): boolean {
        return this.anchors().some((a) => a.status === 'confirmed' && !!a.proofBytes);
    }

    downloadProof(a: AnchorAttestation): void {
        if (!a.proofBytes) return;
        const m = this.manifest();
        const stem = m ? `CITATION-${m.sha256.slice(0, 12)}` : 'mayday-proof';
        this.certSvc.downloadBytes(`${stem}.cff.${a.proofExtension}`, a.proofBytes);
    }

    downloadAllProofs(): void {
        for (const a of this.anchors()) {
            if (a.status === 'confirmed' && a.proofBytes) {
                this.downloadProof(a);
            }
        }
    }

    downloadCertificate(): void {
        const m = this.manifest();
        if (!m) return;
        const svg = this.certSvc.render({
            input: {
                title: this.form.title,
                version: this.form.version,
                license: this.form.license,
                authorGivenNames: this.form.authorGivenNames,
                authorFamilyNames: this.form.authorFamilyNames,
                authorEmail: this.form.authorEmail,
                files: this.hashedFiles()
            },
            manifest: m,
            anchors: this.anchors()
        });
        this.certSvc.print(svg);
        this.certSvc.download(`mayday-certificate-${m.sha256.slice(0, 12)}.svg`, svg, 'image/svg+xml');
    }

    downloadManifest(): void {
        const m = this.manifest();
        if (!m) return;
        this.certSvc.download(`CITATION-${m.sha256.slice(0, 12)}.cff`, m.yaml, 'text/yaml');
    }
}

function hexToBytes(hex: string): Uint8Array {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface FsEntry {
    isFile: boolean;
    isDirectory: boolean;
    name: string;
    file?: (cb: (f: File) => void, err: () => void) => void;
    createReader?: () => { readEntries: (cb: (entries: FsEntry[]) => void) => void };
}

async function walkEntry(entry: FileSystemEntry | FsEntry, path: string, out: File[]): Promise<void> {
    const e = entry as FsEntry;
    if (e.isFile && e.file) {
        await new Promise<void>((resolve) => {
            e.file!(
                (file: File) => {
                    try {
                        Object.defineProperty(file, 'webkitRelativePath', { value: path + e.name });
                    } catch {
                        /* read-only on some browsers */
                    }
                    out.push(file);
                    resolve();
                },
                () => resolve()
            );
        });
    } else if (e.isDirectory && e.createReader) {
        const reader = e.createReader();
        await new Promise<void>((resolve) => {
            const readBatch = () => {
                reader.readEntries(async (entries: FsEntry[]) => {
                    if (!entries.length) return resolve();
                    for (const child of entries) {
                        await walkEntry(child, path + e.name + '/', out);
                    }
                    readBatch();
                });
            };
            readBatch();
        });
    }
}
