import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiButton } from '../../ui/ui-button';
import { UiCard } from '../../ui/ui-card';
import { UiProgress } from '../../ui/ui-progress';
import { HashingService } from '../../deposit/hashing.service';
import { ManifestService, BuiltManifest } from '../../deposit/manifest.service';
import { AnchorOrchestratorService } from '../../deposit/anchors/anchor-orchestrator.service';
import { AnchorStatusComponent } from '../../shared/components/anchor-status.component';
import { CaptureService, CapturedPage } from '../../shared/services/capture.service';
import { ExtensionStorageService } from '../../shared/services/extension-storage.service';

type CaptureStep = 'idle' | 'capturing' | 'anchoring' | 'done' | 'error';

@Component({
    selector: 'ext-capture-tab',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule, UiButton, UiCard, UiProgress, AnchorStatusComponent],
    template: `
        @switch (step()) {
            @case ('idle') {
                <div class="intro">
                    <h2 class="title">{{ 'capture.title' | translate }}</h2>
                    <p class="desc">{{ 'capture.description' | translate }}</p>

                    <label class="checkbox-row">
                        <input type="checkbox" [checked]="includeScreenshot()" (change)="includeScreenshot.set(!includeScreenshot())" />
                        {{ 'capture.includeScreenshot' | translate }}
                    </label>

                    <button ui-button variant="primary" (click)="capture()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        {{ 'capture.captureBtn' | translate }}
                    </button>
                </div>
            }

            @case ('capturing') {
                <ui-card>
                    <p class="status-text">{{ 'capture.capturing' | translate }}</p>
                    <ui-progress [value]="progress()" [showLabel]="true" />
                </ui-card>
            }

            @case ('anchoring') {
                <ui-card>
                    <div class="page-info">
                        <span class="label">{{ 'capture.pageTitle' | translate }}</span>
                        <span class="value truncate">{{ captured()?.title }}</span>
                    </div>
                    <div class="page-info">
                        <span class="label">{{ 'capture.pageUrl' | translate }}</span>
                        <span class="value mono truncate">{{ captured()?.url }}</span>
                    </div>
                    <ext-anchor-status [attestations]="orchestrator.anchors()" />
                </ui-card>
            }

            @case ('done') {
                <ui-card [title]="'deposit.done' | translate">
                    <div class="page-info">
                        <span class="label">{{ 'capture.pageTitle' | translate }}</span>
                        <span class="value truncate">{{ captured()?.title }}</span>
                    </div>
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

            @case ('error') {
                <ui-card>
                    <p class="error-text">{{ errorMessage() }}</p>
                    <button ui-button variant="secondary" (click)="reset()">
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
        .intro {
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
        }
        .title {
            font-size: var(--fs-lg);
            font-weight: var(--fw-semi);
            color: var(--text);
            margin: 0;
        }
        .desc {
            font-size: var(--fs-sm);
            color: var(--text-mute);
            margin: 0;
            line-height: var(--lh-base);
        }
        .checkbox-row {
            display: flex;
            align-items: center;
            gap: var(--sp-2);
            font-size: var(--fs-sm);
            color: var(--text);
            cursor: pointer;
        }
        .checkbox-row input {
            accent-color: var(--brand);
        }
        .status-text {
            font-size: var(--fs-sm);
            color: var(--text-mute);
        }
        .page-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .label {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            font-weight: var(--fw-medium);
        }
        .value {
            font-size: var(--fs-sm);
            color: var(--text);
        }
        .result-section {
            display: flex;
            flex-direction: column;
            gap: var(--sp-1);
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
        .error-text {
            font-size: var(--fs-sm);
            color: var(--danger);
        }
    `],
})
export class CaptureTabComponent {
    private readonly captureService = inject(CaptureService);
    private readonly hashing = inject(HashingService);
    private readonly manifestService = inject(ManifestService);
    readonly orchestrator = inject(AnchorOrchestratorService);
    private readonly storage = inject(ExtensionStorageService);

    step = signal<CaptureStep>('idle');
    includeScreenshot = signal(true);
    progress = signal(0);
    captured = signal<CapturedPage | null>(null);
    manifest = signal<BuiltManifest | null>(null);
    errorMessage = signal('');

    async capture(): Promise<void> {
        this.step.set('capturing');
        this.progress.set(10);

        try {
            const page = await this.captureService.capturePage(this.includeScreenshot());
            this.captured.set(page);
            this.progress.set(30);

            // Create File objects from captured content
            const files: File[] = [
                new File([page.html], 'page.html', { type: 'text/html' }),
            ];
            if (page.screenshotDataUrl) {
                files.push(this.captureService.dataUrlToFile(page.screenshotDataUrl, 'screenshot.png'));
            }

            // Hash files
            const hashedFiles = await this.hashing.hashMany(files);
            this.progress.set(50);

            // Build manifest
            const pageTitle = page.title || new URL(page.url).hostname;
            const manifest = await this.manifestService.build({
                title: `Web snapshot: ${pageTitle}`,
                version: new Date().toISOString().slice(0, 10),
                license: 'N/A',
                authorGivenNames: 'Browser Extension',
                authorFamilyNames: '',
                authorEmail: '',
                files: hashedFiles,
            });
            this.manifest.set(manifest);
            this.progress.set(70);

            // Submit to anchors
            this.step.set('anchoring');
            const digestBytes = hexToBytes(manifest.sha256);
            const attestations = await this.orchestrator.submit({
                manifestHashHex: manifest.sha256,
                manifestDigest: digestBytes,
            });

            // Save to storage
            await this.storage.saveDeposit({
                digest: manifest.sha256,
                title: `Web: ${pageTitle}`,
                version: new Date().toISOString().slice(0, 10),
                authorName: 'Browser Extension',
                authorEmail: '',
                fileCount: files.length,
                totalSize: files.reduce((s, f) => s + f.size, 0),
                timestamp: manifest.issuedAt,
                anchors: attestations.map((a) => ({
                    provider: a.provider,
                    status: a.status,
                    anchoredAt: a.anchoredAt,
                })),
                gpgSigned: false,
            });

            this.step.set('done');
        } catch (err) {
            this.errorMessage.set(err instanceof Error ? err.message : String(err));
            this.step.set('error');
        }
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
        this.step.set('idle');
        this.progress.set(0);
        this.captured.set(null);
        this.manifest.set(null);
        this.errorMessage.set('');
        this.orchestrator.reset();
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
