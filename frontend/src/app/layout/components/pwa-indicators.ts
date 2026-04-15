import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PwaService } from '@/app/shared/services/pwa.service';

/**
 * Floating bottom-center toasts for PWA state.
 *
 *   - Offline banner    — shown whenever navigator.onLine is false.
 *                          Dismissable; re-appears when offline events fire again.
 *   - Update available  — shown when SwUpdate detects a new deploy.
 *                          Click "Reload" → activates the new SW and refreshes.
 *
 * Both toasts live in the same stack so they never overlap each other.
 * The install button is kept in the topbar to stay close to navigation.
 */
@Component({
    selector: 'app-pwa-indicators',
    standalone: true,
    imports: [TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="stack" aria-live="polite">
            @if (showUpdate()) {
                <div class="toast t-update" role="status">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-3-6.7"/>
                        <path d="M21 4v5h-5"/>
                    </svg>
                    <div class="body">
                        <strong>{{ 'pwa.updateTitle' | translate }}</strong>
                        <span class="caption">{{ 'pwa.updateDesc' | translate }}</span>
                    </div>
                    <button type="button" class="act" (click)="reload()">
                        {{ 'pwa.updateCta' | translate }}
                    </button>
                </div>
            }
            @if (!pwa.isOnline() && !offlineDismissed()) {
                <div class="toast t-offline" role="status">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M1 1l22 22"/>
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
                        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                        <line x1="12" y1="20" x2="12.01" y2="20"/>
                    </svg>
                    <div class="body">
                        <strong>{{ 'pwa.offlineTitle' | translate }}</strong>
                        <span class="caption">{{ 'pwa.offlineDesc' | translate }}</span>
                    </div>
                    <button type="button" class="close" (click)="offlineDismissed.set(true)" [attr.aria-label]="'pwa.dismiss' | translate">×</button>
                </div>
            }
        </div>
    `,
    styles: [`
        .stack {
            position: fixed;
            bottom: var(--sp-4);
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
            z-index: var(--z-toast);
            pointer-events: none;
            max-width: calc(100vw - var(--sp-8));
        }
        .toast {
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            padding: var(--sp-3) var(--sp-4);
            background: var(--bg-elev);
            border: 1px solid var(--border-strong);
            border-radius: var(--r-lg);
            box-shadow: var(--shadow-lg);
            min-width: 280px;
            max-width: 460px;
            animation: slide-up var(--dur-base) var(--ease-out);
        }
        .t-update {
            border-color: color-mix(in oklch, var(--brand) 40%, var(--border));
            background: color-mix(in oklch, var(--brand) 6%, var(--bg-elev));
        }
        .t-update svg { color: var(--brand-strong); flex-shrink: 0; }
        .t-offline {
            border-color: color-mix(in oklch, var(--danger) 30%, var(--border));
            background: color-mix(in oklch, var(--danger) 5%, var(--bg-elev));
        }
        .t-offline svg { color: var(--danger); flex-shrink: 0; }
        .body {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
            flex: 1;
        }
        .body strong {
            font-size: var(--fs-sm);
            font-weight: var(--fw-semi);
            color: var(--text);
        }
        .body .caption {
            font-size: var(--fs-xs);
            color: var(--text-mute);
        }
        .act {
            padding: var(--sp-2) var(--sp-3);
            background: var(--text);
            color: var(--bg);
            border-radius: var(--r-sm);
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            letter-spacing: var(--ls-snug);
            flex-shrink: 0;
            transition: background var(--dur-fast) var(--ease-out);
        }
        .act:hover { background: color-mix(in oklch, var(--text) 85%, var(--bg)); }
        .close {
            width: 24px;
            height: 24px;
            border-radius: var(--r-full);
            background: transparent;
            color: var(--text-mute);
            font-size: 18px;
            line-height: 1;
            flex-shrink: 0;
            transition: background var(--dur-fast) var(--ease-out);
        }
        .close:hover { background: var(--bg-mute); color: var(--text); }

        @keyframes slide-up {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 520px) {
            .toast { min-width: 0; width: 100%; }
        }
    `],
})
export class PwaIndicators {
    readonly pwa = inject(PwaService);
    readonly offlineDismissed = signal(false);

    // Track the update availability per-render: once dismissed by reload,
    // signal resets. We wrap to allow an escape hatch if we ever add a
    // "later" button.
    showUpdate = this.pwa.updateAvailable;

    reload(): void {
        void this.pwa.reloadForUpdate();
    }
}
