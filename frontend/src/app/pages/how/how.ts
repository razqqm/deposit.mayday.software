import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    computed,
    effect,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { isPlatformBrowser, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CertificateService } from '@/app/shared/services/deposit/certificate.service';
import { UiSection, UiButton } from '@/app/ui';

/** Number of stages in the pipeline (0..5). Keep in sync with template. */
const STAGES = 6;

/** Duration of a single stage in ms. Total loop = STAGES × STAGE_DURATION. */
const STAGE_DURATION_MS = 4500;

/** Content pool — one sample per demo frame, used across all 6 stages. */
interface DemoFrame {
    filename: string;
    ext: string;
    icon: string;
    size: string;
    author: string;
    date: string;
    sha256: string;
    gpgKeyId: string;
    gpgFingerprint: string;
    txHash: string;
    txBlock: string;
    otsSerial: string;
    freetsaSerial: string;
    digicertSerial: string;
    sectigoSerial: string;
}

const DEMO_POOL: DemoFrame[] = [
    {
        filename: 'aurora_dashboard_v4.fig', ext: 'fig', icon: '🎨',
        size: '7.6 MB', author: 'Mila Sorokina', date: '2026-04-08',
        sha256: '9c07646d781e43fe35c63773a63742937aa9e79b1b09138ef3f0c2e4392856d2',
        gpgKeyId: 'A1B2 C3D4 E5F6 A1B2', gpgFingerprint: 'A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4E5F6A1B2',
        txHash: '0x9f4d82e1a27b4c839acfb21e0ef94d1820e3c4b5d6a7f8', txBlock: '28491037',
        otsSerial: '4a1f7b92', freetsaSerial: '8A3F10C9', digicertSerial: '0B72E4D1', sectigoSerial: '5D91A0FE',
    },
    {
        filename: 'neural-engine-v3.rs', ext: 'rs', icon: '⚙️',
        size: '482 KB', author: 'Игорь Кузнецов', date: '2026-04-08',
        sha256: 'e1a04bc2f97d530816e3a2fd7c914b08a2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
        gpgKeyId: 'B3D5 E7F9 B1C3 E5F7', gpgFingerprint: 'B3D5E7F9B1C3E5F7D9E1F3B5C7D9E1F3B5C7D9E1',
        txHash: '0x3ab9041ef75c6d28a91b7c4e2f85d1970c6a8b4e5d7f3a', txBlock: '28491186',
        otsSerial: '1c8d39f4', freetsaSerial: 'D1E7F8A2', digicertSerial: '7F12AB83', sectigoSerial: '2C84EB91',
    },
    {
        filename: 'brand-system-kit.zip', ext: 'zip', icon: '📦',
        size: '12.3 MB', author: 'Rafael Santos', date: '2026-04-07',
        sha256: '3d8b4f2a1c07e96580dfa3b7c4e21d09a7f2e1bc09d84a3f6519c0e7d2b8f14e',
        gpgKeyId: 'C4D6 E8FA C2D4 F6A8', gpgFingerprint: 'C4D6E8FAC2D4F6A8C4D6E8FAC2D4F6A8C4D6E8FA',
        txHash: '0x7cd182b6a3e7f9401b5d8c6e2a4f91230e8b6d4c5a7f9e', txBlock: '28491117',
        otsSerial: '9b72e1da', freetsaSerial: '2F91BA83', digicertSerial: 'C3D4E5F6', sectigoSerial: '8ED2F4C1',
    },
    {
        filename: 'dissertation-final.pdf', ext: 'pdf', icon: '📄',
        size: '2.8 MB', author: 'Анна Петрова', date: '2026-04-08',
        sha256: '7f2e1bc09d84a3f6519c0e7d2b8f14e1a04bc2f97d530816e3a2fd7c914b08a2',
        gpgKeyId: 'D5E7 F9A2 D3E5 F7A9', gpgFingerprint: 'D5E7F9A2D3E5F7A9D5E7F9A2D3E5F7A9D5E7F9A2',
        txHash: '0x4e9cd17a52b6f83910e2c5b8d4a7f1680d9c5a3b7e6f2a', txBlock: '28491207',
        otsSerial: '6a3c2f81', freetsaSerial: 'EA1C83B7', digicertSerial: '91F2A3D4', sectigoSerial: '3A7BC2E9',
    },
    {
        filename: 'game-soundtrack-master.wav', ext: 'wav', icon: '🎵',
        size: '124.5 MB', author: 'Akira Tanaka', date: '2026-04-08',
        sha256: 'b4d7f2e1c9301aeb6d0f58c9e2a47193d6c2f8a3b5e1d9f4a7c0e3b6d9f2a5c8',
        gpgKeyId: 'E6F8 A1B3 E4F6 A8BA', gpgFingerprint: 'E6F8A1B3E4F6A8BAE6F8A1B3E4F6A8BAE6F8A1B3',
        txHash: '0x1f5ae20b84c7d916f23e9b4c7a0d8e5470c3d6a9e2b5f8', txBlock: '28491172',
        otsSerial: '8e41b290', freetsaSerial: '47BA91D3', digicertSerial: 'D02AE7C8', sectigoSerial: 'B4F1E85D',
    },
];

@Component({
    selector: 'app-how',
    standalone: true,
    imports: [TranslateModule, RouterLink, UpperCasePipe, UiSection, UiButton],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './how.html',
    styleUrl: './how.scss',
})
export class HowPage implements OnInit, OnDestroy {
    private readonly certSvc = inject(CertificateService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly platformId = inject(PLATFORM_ID);

    readonly pipelineRoot = viewChild<ElementRef<HTMLElement>>('pipelineRoot');

    readonly currentStage = signal(0);
    /**
     * Starts paused — ngOnInit flips it to true once we've confirmed
     * we're in a browser and the user hasn't requested reduced motion.
     * This keeps SSR and a11y paths clean.
     */
    readonly isPlaying = signal(false);
    readonly cycleSeed = signal(0);

    readonly stageCount = STAGES;
    readonly stageRange = Array.from({ length: STAGES }, (_, i) => i);

    /**
     * One demo sample locked in for the whole cycle. Re-rolls whenever a
     * loop completes so every round shows fresh filename/hash/tx data,
     * but never flickers mid-stage.
     */
    readonly demoFrame = computed<DemoFrame>(() => {
        const idx = this.cycleSeed() % DEMO_POOL.length;
        return DEMO_POOL[idx];
    });

    /** 0..1 visual progress of the cycle, useful for the narration rail. */
    readonly cycleProgress = computed(() => this.currentStage() / Math.max(1, STAGES - 1));

    private timerId: number | null = null;
    private observer: IntersectionObserver | null = null;
    private reducedMotion = false;

    constructor() {
        // Keep auto-advance in sync with isPlaying + viewport. effect() re-
        // evaluates whenever either signal changes, so pause/resume is free.
        effect(() => {
            const playing = this.isPlaying();
            this.clearTimer();
            if (playing && !this.reducedMotion) this.scheduleAdvance();
        });
    }

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (this.reducedMotion) {
            // Stay on stage 0, no auto-advance.
            return;
        }

        // Enable auto-advance and wire the viewport observer.
        this.isPlaying.set(true);
        queueMicrotask(() => this.setupObserver());
    }

    ngOnDestroy(): void {
        this.clearTimer();
        this.observer?.disconnect();
        this.observer = null;
    }

    goToStage(stage: number): void {
        const clamped = ((stage % STAGES) + STAGES) % STAGES;
        this.currentStage.set(clamped);
        // Reset cadence so the visited stage gets its full 4.5s window.
        if (this.isPlaying() && !this.reducedMotion) {
            this.clearTimer();
            this.scheduleAdvance();
        }
    }

    togglePlay(): void {
        if (this.reducedMotion) return;
        this.isPlaying.update((v) => !v);
    }

    /** Click handler on an empty spot in the card — advance one stage. */
    nextStage(event?: Event): void {
        event?.stopPropagation();
        this.goToStage(this.currentStage() + 1);
    }

    private scheduleAdvance(): void {
        this.timerId = window.setTimeout(() => {
            const next = (this.currentStage() + 1) % STAGES;
            if (next === 0) {
                this.cycleSeed.update((s) => s + 1);
            }
            this.currentStage.set(next);
            this.scheduleAdvance();
        }, STAGE_DURATION_MS);
    }

    private clearTimer(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    private setupObserver(): void {
        const root = this.pipelineRoot()?.nativeElement;
        if (!root || typeof IntersectionObserver === 'undefined') return;

        this.observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                if (entry.isIntersecting) {
                    if (!this.isPlaying()) {
                        // Restart the cycle from the beginning so the user sees
                        // the full journey when the section re-enters view.
                        this.currentStage.set(0);
                        this.isPlaying.set(true);
                    }
                } else {
                    if (this.isPlaying()) this.isPlaying.set(false);
                }
            },
            { threshold: 0.15 }
        );
        this.observer.observe(root);
        this.destroyRef.onDestroy(() => this.observer?.disconnect());
    }

    showExampleCert(): void {
        const frame = this.demoFrame();
        const svg = this.certSvc.render({
            input: {
                title: 'Aurora Dashboard',
                version: '4.0.0',
                license: 'CC BY-NC-SA 4.0',
                authorGivenNames: frame.author.split(' ')[0] ?? 'Mila',
                authorFamilyNames: frame.author.split(' ').slice(1).join(' ') || 'Sorokina',
                authorEmail: 'mila@aurora-studio.design',
                files: [
                    { path: frame.filename, size: 7_654_321, sha256: frame.sha256 },
                    { path: 'components/nav-sidebar.fig', size: 1_245_678, sha256: 'e1a04bc2f97d530816e3a2fd7c914b08a2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5' },
                    { path: 'tokens/design-tokens.json', size: 42_310, sha256: '3d8b4f2a1c07e96580dfa3b7c4e21d09a7f2e1bc09d84a3f6519c0e7d2b8f14e' },
                ],
            },
            manifest: { yaml: '', sha256: frame.sha256, issuedAt: '2026-04-08T14:32:07Z' },
            anchors: [
                { kind: 'opentimestamps', provider: 'opentimestamps-demo', providerLabel: 'Bitcoin · OpenTimestamps', proofExtension: 'ots', status: 'confirmed', anchoredAt: '2026-04-08T15:04:22Z', humanSummary: `Bitcoin block #${frame.txBlock}` },
                { kind: 'rfc3161', provider: 'freetsa', providerLabel: 'FreeTSA · RFC 3161', proofExtension: 'tsr.freetsa', status: 'confirmed', anchoredAt: '2026-04-08T14:32:08Z' },
                { kind: 'rfc3161', provider: 'digicert', providerLabel: 'DigiCert · RFC 3161', proofExtension: 'tsr.digicert', status: 'confirmed', anchoredAt: '2026-04-08T14:32:12Z' },
                { kind: 'rfc3161', provider: 'sectigo', providerLabel: 'Sectigo · RFC 3161', proofExtension: 'tsr.sectigo', status: 'confirmed', anchoredAt: '2026-04-08T14:32:15Z' },
                { kind: 'ethereum', provider: 'base-l2', providerLabel: 'Base L2 · Ethereum', proofExtension: 'eth', status: 'confirmed', anchoredAt: '2026-04-08T14:33:01Z', humanSummary: `tx ${frame.txHash.slice(0, 14)}…` },
            ],
            gpgSignature: {
                asciiArmor: '',
                keyId: frame.gpgKeyId.replace(/\s/g, ''),
                fingerprint: frame.gpgFingerprint,
                signedAt: new Date('2026-04-08T14:32:07Z'),
                userId: `${frame.author} <mila@aurora-studio.design>`,
            },
        });
        this.certSvc.print(svg);
    }
}
