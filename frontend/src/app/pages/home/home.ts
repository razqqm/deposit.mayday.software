import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HashedFile, HashingService } from '@/app/shared/services/deposit/hashing.service';
import { GostHashingService } from '@/app/shared/services/deposit/gost-hashing.service';
import { BuiltManifest, ManifestService } from '@/app/shared/services/deposit/manifest.service';
import { CertificateService } from '@/app/shared/services/deposit/certificate.service';
import { AnchorOrchestratorService } from '@/app/shared/services/deposit/anchors/anchor-orchestrator.service';
import { AnchorAttestation } from '@/app/shared/services/deposit/anchors/anchor';
import { SigningService, SigningResult } from '@/app/shared/services/deposit/signing.service';
import { ReportService } from '@/app/shared/services/deposit/report.service';
import { VersionHistoryService } from '@/app/shared/services/deposit/version-history.service';
import { GitService, GitMetadata } from '@/app/shared/services/deposit/git.service';
import { RevealDirective } from '@/app/shared/directives/reveal.directive';
import {
    UiButton,
    UiCard,
    UiSection,
    UiDropZone,
    UiCodeBlock,
    UiBadge,
    UiMesh,
    UiStatusDot,
    UiProgress,
    UiDotState,
} from '@/app/ui';

interface FormState {
    title: string;
    version: string;
    license: string;
    authorGivenNames: string;
    authorFamilyNames: string;
    authorEmail: string;
    gpgPrivateKey: string;
    gpgPassphrase: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        TranslateModule,
        FormsModule,
        RevealDirective,
        SlicePipe,
        UiButton,
        UiCard,
        UiSection,
        UiDropZone,
        UiCodeBlock,
        UiBadge,
        UiMesh,
        UiStatusDot,
        UiProgress,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class HomePage {
    private readonly hashingSvc = inject(HashingService);
    private readonly gostSvc = inject(GostHashingService);
    private readonly manifestSvc = inject(ManifestService);
    private readonly certSvc = inject(CertificateService);
    private readonly orchestrator = inject(AnchorOrchestratorService);
    private readonly signingSvc = inject(SigningService);
    private readonly reportSvc = inject(ReportService);
    private readonly historySvc = inject(VersionHistoryService);
    private readonly gitSvc = inject(GitService);
    private readonly translate = inject(TranslateService);

    readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
    readonly anchors = this.orchestrator.anchors;
    readonly depositHistory = this.historySvc.history;

    readonly dragOver = signal(false);
    readonly hashing = signal(false);
    readonly hashedCount = signal(0);
    readonly totalFiles = signal(0);
    readonly hashedFiles = signal<HashedFile[]>([]);
    readonly generating = signal(false);
    readonly manifest = signal<BuiltManifest | null>(null);
    readonly gpgSignature = signal<SigningResult | null>(null);
    readonly gpgSigning = signal(false);
    readonly gpgError = signal<string | null>(null);
    readonly gitMeta = signal<GitMetadata | null>(null);
    readonly gostDigest = signal<string | null>(null);
    readonly droppedFilesList = signal<File[]>([]);
    readonly gpgOpen = signal(false);

    form: FormState = {
        title: '',
        version: '0.1.0',
        license: 'MIT',
        authorGivenNames: '',
        authorFamilyNames: '',
        authorEmail: '',
        gpgPrivateKey: '',
        gpgPassphrase: '',
    };

    readonly totalSizeHuman = computed(() => formatBytes(this.hashedFiles().reduce((s, f) => s + f.size, 0)));
    readonly hashingProgress = computed(() =>
        this.totalFiles() > 0 ? Math.round((this.hashedCount() / this.totalFiles()) * 100) : 0
    );
    readonly issuedHuman = computed(() => {
        const m = this.manifest();
        return m ? new Date(m.issuedAt).toUTCString() : '';
    });

    constructor() {
        void this.historySvc.loadAll();
    }

    openFileDialog(): void {
        this.fileInput().nativeElement.click();
    }

    toggleGpg(): void {
        this.gpgOpen.update(v => !v);
    }

    canGenerate(): boolean {
        return !!this.form.title && !!this.form.authorGivenNames && this.hashedFiles().length > 0;
    }

    async onDropZoneFiles(files: File[]): Promise<void> {
        if (!files.length) {
            this.clearSignal();
            return;
        }
        await this.processFiles(files);
    }

    clearSignal(): void {
        this.hashedFiles.set([]);
        this.manifest.set(null);
        this.gpgSignature.set(null);
        this.gpgError.set(null);
        this.gitMeta.set(null);
        this.gostDigest.set(null);
        this.droppedFilesList.set([]);
    }

    private async processFiles(files: File[]): Promise<void> {
        this.hashing.set(true);
        this.hashedCount.set(0);
        this.totalFiles.set(files.length);
        this.droppedFilesList.set(files);
        const out: HashedFile[] = [];
        for (const f of files) {
            try {
                out.push(await this.hashingSvc.hashFile(f));
            } catch { /* skip unreadable files */ }
            this.hashedCount.update((n) => n + 1);
        }
        out.sort((a, b) => a.path.localeCompare(b.path));
        this.hashedFiles.set(out);
        this.hashing.set(false);
        this.manifest.set(null);

        this.gitSvc.extractMetadata(files).then(meta => this.gitMeta.set(meta)).catch(() => {});
    }

    async generate(): Promise<void> {
        if (!this.canGenerate()) return;
        this.generating.set(true);
        this.orchestrator.reset();
        this.gpgSignature.set(null);
        this.gpgError.set(null);
        try {
            const m = await this.manifestSvc.build({
                title: this.form.title,
                version: this.form.version,
                license: this.form.license,
                authorGivenNames: this.form.authorGivenNames,
                authorFamilyNames: this.form.authorFamilyNames,
                authorEmail: this.form.authorEmail,
                files: this.hashedFiles(),
            });
            this.manifest.set(m);

            if (this.form.gpgPrivateKey.trim()) {
                this.gpgSigning.set(true);
                try {
                    const result = await this.signingSvc.sign(
                        m.yaml,
                        this.form.gpgPrivateKey,
                        this.form.gpgPassphrase || undefined
                    );
                    this.gpgSignature.set(result);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    this.gpgError.set(msg === 'GPG_PASSPHRASE_REQUIRED' ? this.translate.instant('gpg.passphraseRequired') : msg);
                } finally {
                    this.gpgSigning.set(false);
                    this.form.gpgPrivateKey = '';
                    this.form.gpgPassphrase = '';
                }
            }

            queueMicrotask(() => document.querySelector('.result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

            const digest = hexToBytes(m.sha256);
            void this.orchestrator.submit({ manifestHashHex: m.sha256, manifestDigest: digest }).then(anchors => {
                void this.historySvc.save({
                    digest: m.sha256,
                    title: this.form.title,
                    version: this.form.version,
                    authorName: `${this.form.authorGivenNames} ${this.form.authorFamilyNames}`.trim(),
                    authorEmail: this.form.authorEmail,
                    fileCount: this.hashedFiles().length,
                    totalSize: this.hashedFiles().reduce((s, f) => s + f.size, 0),
                    timestamp: m.issuedAt,
                    anchors: anchors.map(a => ({ provider: a.provider, status: a.status, anchoredAt: a.anchoredAt })),
                    gpgSigned: !!this.gpgSignature(),
                    gpgKeyId: this.gpgSignature()?.keyId,
                });
            });

            this.gostSvc.hashString(m.yaml)
                .then(h => this.gostDigest.set(h))
                .catch(() => this.gostDigest.set(null));
        } finally {
            this.generating.set(false);
        }
    }

    hasAnyConfirmedAnchor(): boolean {
        return this.anchors().some((a) => a.status === 'confirmed' && !!a.proofBytes);
    }

    anchorDotState(a: AnchorAttestation): UiDotState {
        if (a.status === 'confirmed') return 'ok';
        if (a.status === 'failed') return 'fail';
        if (a.status === 'submitting' || a.status === 'pending') return 'pending';
        return 'idle';
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
                files: this.hashedFiles(),
            },
            manifest: m,
            anchors: this.anchors(),
            gpgSignature: this.gpgSignature() ?? undefined,
        });
        this.certSvc.print(svg);
        this.certSvc.download(`mayday-certificate-${m.sha256.slice(0, 12)}.svg`, svg, 'image/svg+xml');
    }

    downloadGpgSignature(): void {
        const gpg = this.gpgSignature();
        const m = this.manifest();
        if (!gpg || !m) return;
        const stem = `CITATION-${m.sha256.slice(0, 12)}`;
        this.certSvc.download(`${stem}.cff.asc`, gpg.asciiArmor, 'application/pgp-signature');
    }

    downloadManifest(): void {
        const m = this.manifest();
        if (!m) return;
        this.certSvc.download(`CITATION-${m.sha256.slice(0, 12)}.cff`, m.yaml, 'text/yaml');
    }

    downloadReport(): void {
        const m = this.manifest();
        if (!m) return;
        this.reportSvc.generate({
            input: {
                title: this.form.title,
                version: this.form.version,
                license: this.form.license,
                authorGivenNames: this.form.authorGivenNames,
                authorFamilyNames: this.form.authorFamilyNames,
                authorEmail: this.form.authorEmail,
                files: this.hashedFiles(),
            },
            manifest: m,
            anchors: this.anchors(),
            gpgSignature: this.gpgSignature() ?? undefined,
        });
    }

    showExampleCert(): void {
        const svg = this.certSvc.render({
            input: {
                title: 'Aurora Dashboard',
                version: '4.0.0',
                license: 'CC BY-NC-SA 4.0',
                authorGivenNames: 'Mila',
                authorFamilyNames: 'Sorokina',
                authorEmail: 'mila@aurora-studio.design',
                files: [
                    { path: 'aurora_dashboard_v4.fig', size: 7_654_321, sha256: '9c07646d781e43fe35c63773a63742937aa9e79b1b09138ef3f0c2e4392856d2' },
                    { path: 'components/nav-sidebar.fig', size: 1_245_678, sha256: 'e1a04bc2f97d530816e3a2fd7c914b08a2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5' },
                    { path: 'tokens/design-tokens.json', size: 42_310, sha256: '3d8b4f2a1c07e96580dfa3b7c4e21d09a7f2e1bc09d84a3f6519c0e7d2b8f14e' },
                ],
            },
            manifest: {
                yaml: '',
                sha256: '9c07646d781e43fe35c63773a63742937aa9e79b1b09138ef3f0c2e4392856d2',
                issuedAt: '2026-04-08T14:32:07Z',
            },
            anchors: [
                { kind: 'opentimestamps', provider: 'opentimestamps-mila', providerLabel: 'Bitcoin · OpenTimestamps', proofExtension: 'ots', status: 'confirmed', anchoredAt: '2026-04-08T15:04:22Z', humanSummary: 'Bitcoin block #890241' },
                { kind: 'rfc3161', provider: 'freetsa', providerLabel: 'FreeTSA · RFC 3161', proofExtension: 'tsr.freetsa', status: 'confirmed', anchoredAt: '2026-04-08T14:32:08Z' },
                { kind: 'rfc3161', provider: 'digicert', providerLabel: 'DigiCert · RFC 3161', proofExtension: 'tsr.digicert', status: 'confirmed', anchoredAt: '2026-04-08T14:32:12Z' },
                { kind: 'rfc3161', provider: 'sectigo', providerLabel: 'Sectigo · RFC 3161', proofExtension: 'tsr.sectigo', status: 'confirmed', anchoredAt: '2026-04-08T14:32:15Z' },
                { kind: 'ethereum', provider: 'base-l2', providerLabel: 'Base L2 · Ethereum', proofExtension: 'eth', status: 'confirmed', anchoredAt: '2026-04-08T14:33:01Z', humanSummary: 'tx 0x9f4d…e1a2 block #28491037' },
            ],
            gpgSignature: {
                asciiArmor: '',
                keyId: 'A1B2C3D4E5F6A1B2',
                fingerprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
                signedAt: new Date('2026-04-08T14:32:07Z'),
                userId: 'Mila Sorokina <mila@aurora-studio.design>',
            },
        });
        this.certSvc.print(svg);
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
