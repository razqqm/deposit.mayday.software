import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HashedFile, HashingService } from '@/app/shared/services/deposit/hashing.service';
import { GostHashingService, GostHashedFile } from '@/app/shared/services/deposit/gost-hashing.service';
import { BuiltManifest, ManifestService } from '@/app/shared/services/deposit/manifest.service';
import { CertificateService } from '@/app/shared/services/deposit/certificate.service';
import { AnchorOrchestratorService } from '@/app/shared/services/deposit/anchors/anchor-orchestrator.service';
import { AnchorAttestation } from '@/app/shared/services/deposit/anchors/anchor';
import { SigningService, SigningResult } from '@/app/shared/services/deposit/signing.service';
import { ReportService } from '@/app/shared/services/deposit/report.service';
import { VersionHistoryService, DepositRecord } from '@/app/shared/services/deposit/version-history.service';
import { GitService, GitMetadata } from '@/app/shared/services/deposit/git.service';
import { RevealDirective } from '@/app/shared/directives/reveal.directive';

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
    imports: [TranslateModule, FormsModule, RevealDirective, SlicePipe],
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
                        <span class="title-line title-line--accent">
                            <span class="strikethrough-wrap">
                                {{ 'hero.titleLine2' | translate }}
                                <span class="strikethrough-line" aria-hidden="true"></span>
                            </span>
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

                <aside class="hero-demo" aria-hidden="true">
                    <div class="demo-card" (click)="showExampleCert()">
                        <div class="demo-pipeline">
                            <!-- Stage 1: File drops in -->
                            <div class="stage stage-file">
                                <div class="file-icon-wrap">
                                    <svg class="file-svg" viewBox="0 0 40 48" fill="none">
                                        <path d="M4 6a4 4 0 0 1 4-4h16l12 12v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z" fill="var(--bg-sunk)" stroke="var(--border-strong)" stroke-width="1.5"/>
                                        <path d="M24 2v12h12" stroke="var(--border-strong)" stroke-width="1.5" fill="none"/>
                                    </svg>
                                    <div class="file-glow"></div>
                                </div>
                                <div class="file-info">
                                    <span class="file-name"></span>
                                    <span class="file-size"></span>
                                </div>
                            </div>

                            <!-- Stage 2: Proof layers assemble -->
                            <div class="stage stage-proof">
                                <div class="proof-chip proof-chip--what">
                                    <span class="pc-key">{{ 'hero.bento.what' | translate }}</span>
                                    <span class="pc-val">{{ 'hero.bento.whatVal' | translate }}</span>
                                </div>
                                <div class="proof-chip proof-chip--who">
                                    <span class="pc-key">{{ 'hero.bento.who' | translate }}</span>
                                    <span class="pc-val">{{ 'hero.bento.whoVal' | translate }}</span>
                                </div>
                                <div class="proof-chip proof-chip--when">
                                    <span class="pc-key">{{ 'hero.bento.when' | translate }}</span>
                                    <span class="pc-val">{{ 'hero.bento.whenVal' | translate }}</span>
                                </div>
                            </div>

                            <!-- Stage 3: Hashing -->
                            <div class="stage stage-hash">
                                <div class="hash-bar">
                                    <span class="hash-label">SHA-256</span>
                                    <div class="hash-progress"></div>
                                </div>
                                <code class="hash-output"></code>
                            </div>

                            <!-- Stage 4: Anchor broadcast — terminal style -->
                            <div class="stage stage-anchor">
                                <div class="anch-term">
                                    <div class="term-head">
                                        <span class="term-dot"></span>
                                        <span class="term-dot"></span>
                                        <span class="term-dot"></span>
                                        <span class="term-title">anchoring</span>
                                    </div>
                                    <div class="term-body">
                                        <div class="term-line tl--btc">
                                            <span class="tl-prompt">$</span>
                                            <span class="tl-cmd">ots stamp</span>
                                            <span class="tl-arg">digest.ots</span>
                                            <div class="tl-resp tl-resp--ok">
                                                <span class="tl-icon">✓</span> Submitted to Bitcoin calendar
                                            </div>
                                        </div>
                                        <div class="term-line tl--tsa1">
                                            <span class="tl-prompt">$</span>
                                            <span class="tl-cmd">curl -X POST</span>
                                            <span class="tl-arg">freetsa.org/tsr</span>
                                            <div class="tl-resp tl-resp--ok">
                                                <span class="tl-icon">✓</span> TSR token received · RFC 3161
                                            </div>
                                        </div>
                                        <div class="term-line tl--tsa2">
                                            <span class="tl-prompt">$</span>
                                            <span class="tl-cmd">curl -X POST</span>
                                            <span class="tl-arg">timestamp.digicert.com</span>
                                            <div class="tl-resp tl-resp--ok">
                                                <span class="tl-icon">✓</span> TSR token received · RFC 3161
                                            </div>
                                        </div>
                                        <div class="term-line tl--tsa3">
                                            <span class="tl-prompt">$</span>
                                            <span class="tl-cmd">curl -X POST</span>
                                            <span class="tl-arg">timestamp.sectigo.com</span>
                                            <div class="tl-resp tl-resp--ok">
                                                <span class="tl-icon">✓</span> TSR token received · RFC 3161
                                            </div>
                                        </div>
                                        <div class="term-line tl--eth">
                                            <span class="tl-prompt">$</span>
                                            <span class="tl-cmd">cast send</span>
                                            <span class="tl-arg">0x...Proof --rpc base-mainnet</span>
                                            <div class="tl-resp tl-resp--ok">
                                                <span class="tl-icon">✓</span> tx confirmed · block #28491037
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Blockchain chain visualization -->
                                <div class="chain-vis">
                                    <div class="chain-label">blockchain</div>
                                    <div class="chain-blocks">
                                        <div class="chain-block cb--old">
                                            <span class="cb-hash">a3f1...08d2</span>
                                            <span class="cb-n">#28491035</span>
                                        </div>
                                        <div class="chain-link"></div>
                                        <div class="chain-block cb--old2">
                                            <span class="cb-hash">0e7d...4b19</span>
                                            <span class="cb-n">#28491036</span>
                                        </div>
                                        <div class="chain-link"></div>
                                        <div class="chain-block cb--new">
                                            <span class="cb-hash">9c07...4293</span>
                                            <span class="cb-n">#28491037</span>
                                            <span class="cb-you">← your hash</span>
                                        </div>
                                    </div>
                                    <!-- Merkle path -->
                                    <div class="merkle-path">
                                        <svg class="merkle-svg" viewBox="0 0 220 68" fill="none">
                                            <!-- Root -->
                                            <rect class="mk-node mk-root" x="85" y="2" width="50" height="16" rx="3" />
                                            <text class="mk-text" x="110" y="13" text-anchor="middle">root</text>
                                            <!-- Branch lines -->
                                            <line class="mk-line mk-line--l" x1="95" y1="18" x2="50" y2="32" />
                                            <line class="mk-line mk-line--r" x1="125" y1="18" x2="170" y2="32" />
                                            <!-- Mid nodes -->
                                            <rect class="mk-node mk-mid1" x="25" y="32" width="50" height="14" rx="3" />
                                            <text class="mk-text" x="50" y="42" text-anchor="middle">h(a+b)</text>
                                            <rect class="mk-node mk-mid2" x="145" y="32" width="50" height="14" rx="3" />
                                            <text class="mk-text" x="170" y="42" text-anchor="middle">h(c+d)</text>
                                            <!-- Leaf lines -->
                                            <line class="mk-line mk-line--l2" x1="35" y1="46" x2="15" y2="56" />
                                            <line class="mk-line mk-line--r2" x1="65" y1="46" x2="85" y2="56" />
                                            <line class="mk-line mk-line--l3" x1="155" y1="46" x2="135" y2="56" />
                                            <line class="mk-line mk-line--r3" x1="185" y1="46" x2="205" y2="56" />
                                            <!-- Leaves -->
                                            <rect class="mk-node mk-leaf" x="2" y="55" width="28" height="12" rx="2" />
                                            <text class="mk-text mk-text--leaf" x="16" y="64" text-anchor="middle">a</text>
                                            <rect class="mk-node mk-leaf" x="72" y="55" width="28" height="12" rx="2" />
                                            <text class="mk-text mk-text--leaf" x="86" y="64" text-anchor="middle">b</text>
                                            <rect class="mk-node mk-leaf" x="122" y="55" width="28" height="12" rx="2" />
                                            <text class="mk-text mk-text--leaf" x="136" y="64" text-anchor="middle">c</text>
                                            <rect class="mk-node mk-leaf mk-leaf--you" x="192" y="55" width="28" height="12" rx="2" />
                                            <text class="mk-text mk-text--you" x="206" y="64" text-anchor="middle">9c07</text>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Stage 5: Certificate ready -->
                            <div class="stage stage-seal">
                                <div class="cert-card">
                                    <div class="cert-header">
                                        <svg class="cert-icon" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
                                        <span class="cert-title">{{ 'hero.bento.cert' | translate }}</span>
                                        <span class="cert-badge">PDF</span>
                                    </div>
                                    <div class="cert-body">
                                        <div class="cert-row">
                                            <span class="cert-label">SHA-256</span>
                                            <code class="cert-val">9c07646d...a6374293</code>
                                        </div>
                                        <div class="cert-row">
                                            <span class="cert-label">Anchors</span>
                                            <span class="cert-val cert-val--count">5 / 5</span>
                                        </div>
                                        <div class="cert-row">
                                            <span class="cert-label">eIDAS</span>
                                            <span class="cert-val cert-val--ok">Qualified</span>
                                        </div>
                                    </div>
                                    <div class="cert-dl">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        {{ 'deposit.download' | translate }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Connector line that pulses through the pipeline -->
                        <div class="demo-flow-line"></div>
                    </div>
                </aside>
            </div>
        </section>

        <section id="deposit" class="deposit" appReveal>
            <header class="section-head">
                <span class="eyebrow">{{ 'deposit.eyebrow' | translate }}</span>
                <h2 class="section-title">{{ 'deposit.sectionTitle' | translate }}</h2>
                <p class="section-sub">{{ 'deposit.sectionSub' | translate }}</p>
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
                        <p class="drop-sub">{{ 'drop.filesReady' | translate:{count: hashedFiles().length, size: totalSizeHuman()} }}</p>
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

                    <details class="gpg-section">
                        <summary class="gpg-toggle">
                            {{ 'gpg.title' | translate }}
                            <span class="gpg-optional">({{ 'gpg.optional' | translate }})</span>
                        </summary>
                        <p class="gpg-help">{{ 'gpg.help' | translate }}</p>
                        <label class="gpg-key-label">
                            <textarea
                                class="gpg-key-input"
                                [(ngModel)]="form.gpgPrivateKey"
                                [placeholder]="'gpg.pasteKey' | translate"
                                rows="4"
                                spellcheck="false"
                                autocomplete="off"
                            ></textarea>
                        </label>
                        <label class="gpg-passphrase-label">
                            <span>{{ 'gpg.passphrase' | translate }}</span>
                            <input type="password" [(ngModel)]="form.gpgPassphrase" autocomplete="off" />
                        </label>
                        <p class="gpg-skip-hint">{{ 'gpg.skipHint' | translate }}</p>
                    </details>

                    <button type="button" class="primary" [disabled]="generating() || !canGenerate()" (click)="generate()">
                        {{ (generating() ? 'actions.generating' : 'actions.generate') | translate }}
                    </button>
                </div>
            }

            @if (manifest(); as m) {
                <div class="result card">
                    <header class="result-head">
                        <span class="eyebrow eyebrow--success">{{ 'deposit.doneEyebrow' | translate }}</span>
                        <h2>{{ 'result.title' | translate }}</h2>
                    </header>

                    <div class="proof-grid">
                        <div class="proof">
                            <span class="proof-label">{{ 'result.what' | translate }}</span>
                            <code class="proof-hash">{{ m.sha256 }}</code>
                        </div>
                        <div class="proof">
                            <span class="proof-label">{{ 'result.who' | translate }}</span>
                            @if (gpgSignature(); as gpg) {
                                <span class="proof-value">
                                    {{ gpg.userId }}<br/>
                                    <span class="muted">{{ 'gpg.keyId' | translate }}: {{ gpg.keyId }}</span>
                                </span>
                            } @else {
                                <span class="proof-value">{{ form.authorGivenNames }} {{ form.authorFamilyNames }}<br/><span class="muted">{{ form.authorEmail }}</span><br/><span class="muted gpg-note">{{ 'gpg.skipped' | translate }}</span></span>
                            }
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
                        @if (gpgSignature()) {
                            <button type="button" class="ghost" (click)="downloadGpgSignature()">
                                {{ 'gpg.downloadAsc' | translate }}
                            </button>
                        }
                        <button type="button" class="ghost" (click)="downloadAllProofs()" [disabled]="!hasAnyConfirmedAnchor()">
                            {{ 'anchors.downloadAll' | translate }}
                        </button>
                        <button type="button" class="ghost" (click)="downloadReport()" [disabled]="!hasAnyConfirmedAnchor()">
                            {{ 'report.download' | translate }}
                        </button>
                    </div>

                    <details class="manifest-preview">
                        <summary>{{ 'result.manifest' | translate }}</summary>
                        <pre>{{ m.yaml }}</pre>
                    </details>

                    @if (gitMeta(); as git) {
                        <div class="git-meta">
                            <h3>{{ 'git.title' | translate }}</h3>
                            <div class="git-row"><span class="git-key">{{ 'git.branch' | translate }}</span><code>{{ git.branch }}</code></div>
                            <div class="git-row"><span class="git-key">{{ 'git.commit' | translate }}</span><code>{{ git.headCommit.slice(0, 12) }}</code></div>
                            @if (git.commitMessage) {
                                <div class="git-row"><span class="git-key">{{ 'git.message' | translate }}</span><span>{{ git.commitMessage }}</span></div>
                            }
                            @if (git.remoteUrl) {
                                <div class="git-row"><span class="git-key">{{ 'git.remote' | translate }}</span><code>{{ git.remoteUrl }}</code></div>
                            }
                            @if (git.commitCount) {
                                <div class="git-row"><span class="git-key">{{ 'git.commits' | translate }}</span><span>{{ git.commitCount }}</span></div>
                            }
                        </div>
                    }

                    @if (gostDigest()) {
                        <div class="gost-hash">
                            <h3>{{ 'gost.title' | translate }}</h3>
                            <code class="proof-hash">{{ gostDigest() }}</code>
                            <p class="muted">{{ 'gost.note' | translate }}</p>
                        </div>
                    }
                </div>
            }
        </section>

        <section class="info">
            <div class="info-grid">
                <div class="info-block info-block--wide card" appReveal>
                    <span class="eyebrow">{{ 'info.howEyebrow' | translate }}</span>
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
                    <span class="eyebrow">{{ 'info.whyEyebrow' | translate }}</span>
                    <h2>{{ 'why.title' | translate }}</h2>
                    <p>{{ 'why.p1' | translate }}</p>
                    <p>{{ 'why.p2' | translate }}</p>
                    <p>{{ 'why.p3' | translate }}</p>
                    <p class="callout">{{ 'why.p4' | translate }}</p>
                    <p class="muted-p">{{ 'why.alt' | translate }}</p>
                </div>

                <div class="info-block card" appReveal>
                    <span class="eyebrow">{{ 'info.legalEyebrow' | translate }}</span>
                    <h2>{{ 'legal.title' | translate }}</h2>
                    <p>{{ 'legal.p1' | translate }}</p>
                    <p>{{ 'legal.p2' | translate }}</p>
                    <p>{{ 'legal.p3' | translate }}</p>
                    <p>{{ 'legal.p4' | translate }}</p>
                </div>
            </div>
        </section>

        <section class="trust" appReveal>
            <header class="section-head">
                <span class="eyebrow">{{ 'trust.eyebrow' | translate }}</span>
                <h2 class="section-title">{{ 'trust.title' | translate }}</h2>
                <p class="section-sub">{{ 'trust.subtitle' | translate }}</p>
            </header>
            <div class="trust-grid">
                <div class="trust-card card">
                    <div class="trust-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <h3>{{ 'trust.wipo' | translate }}</h3>
                    <p>{{ 'trust.wipoDesc' | translate }}</p>
                </div>
                <div class="trust-card card">
                    <div class="trust-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </div>
                    <h3>{{ 'trust.paris' | translate }}</h3>
                    <p>{{ 'trust.parisDesc' | translate }}</p>
                </div>
                <div class="trust-card card">
                    <div class="trust-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3>{{ 'trust.eidas' | translate }}</h3>
                    <p>{{ 'trust.eidasDesc' | translate }}</p>
                </div>
                <div class="trust-card card">
                    <div class="trust-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                    </div>
                    <h3>{{ 'trust.privacy' | translate }}</h3>
                    <p>{{ 'trust.privacyDesc' | translate }}</p>
                </div>
            </div>
        </section>

        <section class="integrations" appReveal>
            <header class="section-head">
                <span class="eyebrow">{{ 'integrations.eyebrow' | translate }}</span>
                <h2 class="section-title">{{ 'integrations.title' | translate }}</h2>
                <p class="section-sub">{{ 'integrations.subtitle' | translate }}</p>
            </header>
            <div class="integrations-grid">
                <div class="integration-card card">
                    <h3>{{ 'integrations.api' | translate }}</h3>
                    <p>{{ 'integrations.apiDesc' | translate }}</p>
                    <code class="integration-code">POST /api/v1/anchor<br/>{{ '{' }}"digest":"&lt;sha256&gt;"{{ '}' }}</code>
                </div>
                <div class="integration-card card">
                    <h3>{{ 'integrations.zapier' | translate }}</h3>
                    <p>{{ 'integrations.zapierDesc' | translate }}</p>
                    <code class="integration-code">POST /api/v1/anchor<br/>X-API-Key: your_key</code>
                </div>
                <div class="integration-card card">
                    <h3>{{ 'integrations.cms' | translate }}</h3>
                    <p>{{ 'integrations.cmsDesc' | translate }}</p>
                    <code class="integration-code">&lt;div id="mayday-widget"&gt;&lt;/div&gt;<br/>&lt;script src="https://mayday.software<br/>/api/v1/embed.js"&gt;&lt;/script&gt;</code>
                </div>
                <div class="integration-card card">
                    <h3>{{ 'integrations.whitelabel' | translate }}</h3>
                    <p>{{ 'integrations.whitelabelDesc' | translate }}</p>
                    <code class="integration-code">GET /api/v1/info<br/>X-API-Key: your_key</code>
                </div>
            </div>
        </section>

        @if (depositHistory().length > 0) {
            <section class="history" appReveal>
                <header class="section-head">
                    <span class="eyebrow">{{ 'history.eyebrow' | translate }}</span>
                    <h2 class="section-title">{{ 'history.title' | translate }}</h2>
                    <p class="section-sub">{{ 'history.subtitle' | translate }}</p>
                </header>
                <div class="history-list">
                    @for (rec of depositHistory(); track rec.digest) {
                        <div class="history-item card">
                            <div class="history-meta">
                                <strong>{{ rec.title }}</strong>
                                <span class="muted">v{{ rec.version }}</span>
                                <span class="muted">{{ 'drop.filesCount' | translate:{count: rec.fileCount} }}</span>
                            </div>
                            <div class="history-details">
                                <code class="history-digest">{{ rec.digest.slice(0, 16) }}…</code>
                                <span class="history-date">{{ rec.timestamp | slice:0:10 }}</span>
                                <span class="history-anchors">{{ 'anchors.title' | translate }} ({{ rec.anchors.length }})</span>
                            </div>
                        </div>
                    }
                </div>
            </section>
        }

        <section class="faq" appReveal>
            <header class="section-head">
                <span class="eyebrow">{{ 'faq.eyebrow' | translate }}</span>
                <h2 class="section-title">{{ 'faq.title' | translate }}</h2>
            </header>
            <div class="faq-list">
                @for (i of [1,2,3,4,5,6,7,8]; track i) {
                    <details class="faq-item card">
                        <summary class="faq-q">{{ 'faq.q' + i | translate }}</summary>
                        <p class="faq-a">{{ 'faq.a' + i | translate }}</p>
                    </details>
                }
            </div>
        </section>
    `,
    styleUrl: './home.scss'
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

    form: FormState = {
        title: '',
        version: '0.1.0',
        license: 'MIT',
        authorGivenNames: '',
        authorFamilyNames: '',
        authorEmail: '',
        gpgPrivateKey: '',
        gpgPassphrase: ''
    };

    readonly totalSizeHuman = computed(() => formatBytes(this.hashedFiles().reduce((s, f) => s + f.size, 0)));

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
        this.gpgSignature.set(null);
        this.gpgError.set(null);
        this.gitMeta.set(null);
        this.gostDigest.set(null);
        this.droppedFilesList.set([]);
    }

    private async processFiles(files: File[]): Promise<void> {
        if (!files.length) return;
        this.hashing.set(true);
        this.hashedCount.set(0);
        this.totalFiles.set(files.length);
        this.droppedFilesList.set(files);
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

        // Extract git metadata in background
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
                files: this.hashedFiles()
            });
            this.manifest.set(m);

            // GPG signing (optional — only if user provided a key)
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
                    // Clear sensitive key material immediately
                    this.form.gpgPrivateKey = '';
                    this.form.gpgPassphrase = '';
                }
            }

            queueMicrotask(() => document.querySelector('.result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

            // Submit fingerprint to all anchors in parallel — non-blocking.
            const digest = hexToBytes(m.sha256);
            void this.orchestrator.submit({ manifestHashHex: m.sha256, manifestDigest: digest }).then(anchors => {
                // Save to local version history
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
                    gpgKeyId: this.gpgSignature()?.keyId
                });
            });

            // Compute GOST Stribog hash in background
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
            anchors: this.anchors(),
            gpgSignature: this.gpgSignature() ?? undefined
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
                files: this.hashedFiles()
            },
            manifest: m,
            anchors: this.anchors(),
            gpgSignature: this.gpgSignature() ?? undefined
        });
    }

    showExampleCert(): void {
        const svg = this.certSvc.render({
            input: {
                title: 'neural-style-transfer',
                version: '2.4.0',
                license: 'Apache-2.0',
                authorGivenNames: 'Alice',
                authorFamilyNames: 'Nakamoto',
                authorEmail: 'alice@example.org',
                files: [
                    { path: 'src/model.py', size: 42_310, sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' },
                    { path: 'src/train.py', size: 18_720, sha256: 'f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5' },
                    { path: 'weights/v2.4.bin', size: 3_145_728, sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' },
                ]
            },
            manifest: {
                yaml: '',
                sha256: '9c07646d781e43fe35c63773a63742937aa9e79b1b09138ef3f0c2e4392856d2',
                issuedAt: '2025-03-20T14:32:00Z'
            },
            anchors: [
                { kind: 'opentimestamps', provider: 'opentimestamps-alice', providerLabel: 'Bitcoin · OpenTimestamps', proofExtension: 'ots', status: 'confirmed', anchoredAt: '2025-03-20T15:04:22Z', humanSummary: 'Bitcoin block #890241' },
                { kind: 'rfc3161', provider: 'freetsa', providerLabel: 'FreeTSA · RFC 3161', proofExtension: 'tsr.freetsa', status: 'confirmed', anchoredAt: '2025-03-20T14:32:08Z' },
                { kind: 'rfc3161', provider: 'digicert', providerLabel: 'DigiCert · RFC 3161', proofExtension: 'tsr.digicert', status: 'confirmed', anchoredAt: '2025-03-20T14:32:12Z' },
            ],
            gpgSignature: {
                asciiArmor: '',
                keyId: 'A1B2C3D4E5F6A1B2',
                fingerprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
                signedAt: new Date('2025-03-20T14:32:00Z'),
                userId: 'Alice Nakamoto <alice@example.org>'
            }
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
