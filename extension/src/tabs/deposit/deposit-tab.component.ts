import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UiDropZone } from '../../ui/ui-drop-zone';
import { UiButton } from '../../ui/ui-button';
import { UiInput } from '../../ui/ui-input';
import { UiCard } from '../../ui/ui-card';
import { UiProgress } from '../../ui/ui-progress';
import { HashingService, HashedFile } from '../../deposit/hashing.service';
import { ManifestService, BuiltManifest } from '../../deposit/manifest.service';
import { AnchorOrchestratorService } from '../../deposit/anchors/anchor-orchestrator.service';
import { AnchorStatusComponent } from '../../shared/components/anchor-status.component';
import { ExtensionStorageService } from '../../shared/services/extension-storage.service';

type DepositStep = 'files' | 'hashing' | 'form' | 'anchoring' | 'done';

@Component({
    selector: 'ext-deposit-tab',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule, TranslateModule,
        UiDropZone, UiButton, UiInput, UiCard, UiProgress,
        AnchorStatusComponent,
    ],
    template: `
        @switch (step()) {
            @case ('files') {
                <ui-drop-zone
                    [label]="'deposit.dropLabel' | translate"
                    [hint]="'deposit.dropHint' | translate"
                    [multiple]="true"
                    [files]="files()"
                    [featured]="true"
                    (filesChange)="onFilesSelected($event)"
                />
            }

            @case ('hashing') {
                <ui-card>
                    <p class="status-text">{{ 'deposit.hashingProgress' | translate }}</p>
                    <ui-progress [value]="hashProgress()" [showLabel]="true" />
                </ui-card>
            }

            @case ('form') {
                <div class="form-stack">
                    <ui-input
                        [label]="'deposit.formTitle' | translate"
                        [required]="true"
                        [placeholder]="'My Project'"
                        [(ngModel)]="formTitle"
                    />
                    <ui-input
                        [label]="'deposit.formVersion' | translate"
                        [placeholder]="'1.0.0'"
                        [(ngModel)]="formVersion"
                    />
                    <ui-input
                        [label]="'deposit.formAuthor' | translate"
                        [required]="true"
                        [(ngModel)]="formAuthor"
                    />
                    <ui-input
                        [label]="'deposit.formEmail' | translate"
                        type="email"
                        inputmode="email"
                        [(ngModel)]="formEmail"
                    />

                    <div class="file-summary mono">
                        {{ hashedFiles().length }} {{ 'dashboard.files' | translate }}
                        · {{ formatSize(totalSize()) }}
                    </div>

                    <button ui-button variant="primary" (click)="onSubmit()" [disabled]="!canSubmit()">
                        {{ 'deposit.submit' | translate }}
                    </button>
                </div>
            }

            @case ('anchoring') {
                <ui-card [title]="'deposit.submitting' | translate">
                    <div class="manifest-hash mono">{{ manifest()?.sha256?.slice(0, 16) }}...</div>
                    <ext-anchor-status [attestations]="orchestrator.anchors()" />
                </ui-card>
            }

            @case ('done') {
                <ui-card [title]="'deposit.done' | translate">
                    <div class="result-section">
                        <span class="label">{{ 'deposit.manifestHash' | translate }}</span>
                        <code class="mono hash">{{ manifest()?.sha256 }}</code>
                    </div>

                    <ext-anchor-status [attestations]="orchestrator.anchors()" />

                    <div class="actions">
                        <button ui-button variant="secondary" size="sm" (click)="downloadManifest()">
                            {{ 'deposit.downloadManifest' | translate }}
                        </button>
                        <button ui-button variant="secondary" size="sm" (click)="downloadProofs()">
                            {{ 'deposit.downloadProofs' | translate }}
                        </button>
                    </div>

                    <button ui-button variant="ghost" (click)="reset()">
                        {{ 'deposit.newDeposit' | translate }}
                    </button>
                </ui-card>
            }
        }
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
        }
        .form-stack {
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
        }
        .file-summary {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            padding: var(--sp-2) 0;
        }
        .status-text {
            font-size: var(--fs-sm);
            color: var(--text-mute);
        }
        .manifest-hash {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            padding: var(--sp-1) 0 var(--sp-3);
        }
        .result-section {
            display: flex;
            flex-direction: column;
            gap: var(--sp-1);
        }
        .label {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            font-weight: var(--fw-medium);
        }
        .hash {
            font-size: var(--fs-xs);
            word-break: break-all;
            color: var(--text);
            background: var(--bg-sunk);
            padding: var(--sp-2) var(--sp-3);
            border-radius: var(--r-sm);
        }
        .actions {
            display: flex;
            gap: var(--sp-2);
            flex-wrap: wrap;
        }
    `],
})
export class DepositTabComponent {
    private readonly hashing = inject(HashingService);
    private readonly manifestService = inject(ManifestService);
    readonly orchestrator = inject(AnchorOrchestratorService);
    private readonly storage = inject(ExtensionStorageService);

    step = signal<DepositStep>('files');
    files = signal<File[]>([]);
    hashedFiles = signal<HashedFile[]>([]);
    hashProgress = signal(0);
    manifest = signal<BuiltManifest | null>(null);

    formTitle = '';
    formVersion = '1.0.0';
    formAuthor = '';
    formEmail = '';

    totalSize = computed(() => this.hashedFiles().reduce((s, f) => s + f.size, 0));
    canSubmit = computed(() => this.formTitle.trim().length > 0 && this.formAuthor.trim().length > 0);

    async onFilesSelected(files: File[]): Promise<void> {
        if (!files.length) return;
        this.files.set(files);
        this.step.set('hashing');

        const hashed: HashedFile[] = [];
        for (let i = 0; i < files.length; i++) {
            hashed.push(await this.hashing.hashFile(files[i]));
            this.hashProgress.set(Math.round(((i + 1) / files.length) * 100));
        }
        this.hashedFiles.set(hashed);

        // Try to derive title from first file's directory
        const first = hashed[0]?.path ?? '';
        const dirName = first.includes('/') ? first.split('/')[0] : '';
        if (dirName) this.formTitle = dirName;

        this.step.set('form');
    }

    async onSubmit(): Promise<void> {
        this.step.set('anchoring');

        const manifest = await this.manifestService.build({
            title: this.formTitle.trim(),
            version: this.formVersion.trim() || '1.0.0',
            license: 'Proprietary',
            authorGivenNames: this.formAuthor.trim(),
            authorFamilyNames: '',
            authorEmail: this.formEmail.trim(),
            files: this.hashedFiles(),
        });
        this.manifest.set(manifest);

        const digestBytes = hexToBytes(manifest.sha256);
        const attestations = await this.orchestrator.submit({
            manifestHashHex: manifest.sha256,
            manifestDigest: digestBytes,
        });

        // Save to extension storage
        const confirmedAnchors = attestations.filter((a) => a.status === 'confirmed');
        await this.storage.saveDeposit({
            digest: manifest.sha256,
            title: this.formTitle.trim(),
            version: this.formVersion.trim() || '1.0.0',
            authorName: this.formAuthor.trim(),
            authorEmail: this.formEmail.trim(),
            fileCount: this.hashedFiles().length,
            totalSize: this.totalSize(),
            timestamp: manifest.issuedAt,
            anchors: attestations.map((a) => ({
                provider: a.provider,
                status: a.status,
                anchoredAt: a.anchoredAt,
            })),
            gpgSigned: false,
        });

        this.step.set('done');
    }

    downloadManifest(): void {
        const m = this.manifest();
        if (!m) return;
        downloadBlob(new Blob([m.yaml], { type: 'text/yaml' }), 'CITATION.cff');
    }

    downloadProofs(): void {
        for (const a of this.orchestrator.anchors()) {
            if (a.proofBytes) {
                downloadBlob(
                    new Blob([a.proofBytes as BlobPart], { type: 'application/octet-stream' }),
                    `CITATION.cff.${a.proofExtension}`
                );
            }
        }
    }

    reset(): void {
        this.step.set('files');
        this.files.set([]);
        this.hashedFiles.set([]);
        this.hashProgress.set(0);
        this.manifest.set(null);
        this.orchestrator.reset();
        this.formTitle = '';
        this.formVersion = '1.0.0';
        this.formAuthor = '';
        this.formEmail = '';
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
