import {
    DestroyRef,
    Injectable,
    PLATFORM_ID,
    computed,
    inject,
    signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * A BeforeInstallPromptEvent is not exposed in lib.dom.d.ts by default.
 * We type it narrowly so we can stash it and fire the prompt later.
 */
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: readonly string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

/**
 * Single source of truth for PWA state:
 *   - `isOnline`        — reflects `navigator.onLine` with live updates.
 *   - `isInstalled`     — true when running as an installed PWA (display: standalone).
 *   - `canInstall`      — the browser fired beforeinstallprompt and we haven't used it yet.
 *   - `updateAvailable` — a newer service-worker version is waiting.
 *
 * Components read the signals directly (no subscriptions to manage) and
 * call `install()` or `reloadForUpdate()` to act on the current state.
 */
@Injectable({ providedIn: 'root' })
export class PwaService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly destroyRef = inject(DestroyRef);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    readonly isOnline = signal(this.isBrowser ? navigator.onLine : true);
    readonly updateAvailable = signal(false);
    readonly isInstalled = signal(this.detectStandalone());

    private installPromptEvent = signal<BeforeInstallPromptEvent | null>(null);
    readonly canInstall = computed(
        () => !!this.installPromptEvent() && !this.isInstalled()
    );

    constructor() {
        if (!this.isBrowser) return;

        this.wireOnlineOffline();
        this.wireStandaloneDetection();
        this.wireInstallPrompt();
        this.wireServiceWorkerUpdates();
    }

    /**
     * Trigger the browser's native install prompt. Only works during the
     * user gesture that called this method (click handler). Returns the
     * user's choice so callers can analytics-track.
     */
    async install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
        const evt = this.installPromptEvent();
        if (!evt) return 'unavailable';
        await evt.prompt();
        const result = await evt.userChoice;
        // The prompt event can only be used once; clear it either way.
        this.installPromptEvent.set(null);
        return result.outcome;
    }

    /**
     * Apply a pending service-worker update and reload so the new assets
     * are running. Called from the "Update available" toast.
     */
    async reloadForUpdate(): Promise<void> {
        if (!this.swUpdate.isEnabled) {
            location.reload();
            return;
        }
        try {
            await this.swUpdate.activateUpdate();
        } catch {
            /* non-fatal — reload anyway */
        }
        location.reload();
    }

    private wireOnlineOffline(): void {
        const online = () => this.isOnline.set(true);
        const offline = () => this.isOnline.set(false);
        window.addEventListener('online', online);
        window.addEventListener('offline', offline);
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('online', online);
            window.removeEventListener('offline', offline);
        });
    }

    private wireStandaloneDetection(): void {
        const mql = window.matchMedia('(display-mode: standalone)');
        const update = () => this.isInstalled.set(this.detectStandalone());
        mql.addEventListener?.('change', update);
        this.destroyRef.onDestroy(() => mql.removeEventListener?.('change', update));
    }

    private wireInstallPrompt(): void {
        const handler = (event: Event) => {
            event.preventDefault();
            this.installPromptEvent.set(event as BeforeInstallPromptEvent);
        };
        const installedHandler = () => {
            this.installPromptEvent.set(null);
            this.isInstalled.set(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        });
    }

    private wireServiceWorkerUpdates(): void {
        if (!this.swUpdate.isEnabled) return;

        this.swUpdate.versionUpdates
            .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
            .subscribe(() => this.updateAvailable.set(true));

        // Nudge the service worker to check for a new version every 10 min
        // so users on long-lived tabs get update toasts promptly.
        const checkInterval = window.setInterval(() => {
            this.swUpdate.checkForUpdate().catch(() => {
                /* offline — fine, try again next tick */
            });
        }, 10 * 60 * 1000);

        this.destroyRef.onDestroy(() => clearInterval(checkInterval));
    }

    private detectStandalone(): boolean {
        if (!this.isBrowser) return false;
        const mm = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
        const navStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
        return mm || navStandalone;
    }
}
