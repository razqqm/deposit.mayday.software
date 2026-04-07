import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@/app/shared/services/language.service';
import { ThemeService } from '@/app/shared/services/theme.service';

@Component({
    selector: 'app-public-topbar',
    standalone: true,
    imports: [RouterLink, TranslateModule],
    template: `
        <nav class="topbar" aria-label="Main navigation">
            <div class="topbar-inner">
                <a routerLink="/" class="logo-link" aria-label="mayday.software home">
                    <svg class="logo-mark" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--brand)" stroke-width="3.5"/>
                        <path d="M22 28 L32 38 L42 28" fill="none" stroke="var(--brand)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M32 18 L32 36" stroke="var(--brand)" stroke-width="3.5" stroke-linecap="round"/>
                    </svg>
                    <span class="logo-text">mayday<span class="logo-text-dim">.software</span></span>
                </a>

                <nav class="nav-links">
                    <a routerLink="/verify" class="nav-link">{{ 'verify.title' | translate }}</a>
                </nav>

                <div class="controls">
                    <button (click)="cycleTheme()" class="ctrl-btn"
                            [attr.aria-label]="'Theme: ' + theme.mode()"
                            [title]="'Theme: ' + theme.mode()">
                        @if (theme.mode() === 'light') {
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="4"/>
                                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                            </svg>
                        } @else if (theme.mode() === 'dark') {
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        } @else {
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9"/>
                                <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>
                            </svg>
                        }
                    </button>
                    <span class="separator"></span>
                    <button (click)="switchLanguage()" class="ctrl-btn ctrl-btn--text"
                            [attr.aria-label]="lang.currentLang() === 'en' ? 'Switch to Russian' : 'Switch to English'">
                        {{ lang.currentLang() === 'en' ? 'RU' : 'EN' }}
                    </button>
                </div>
            </div>
        </nav>
    `,
    styles: [`
        .topbar {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: var(--bg-overlay);
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border-bottom: 1px solid var(--border);
            transition: background-color var(--dur-base) var(--ease-out),
                        border-color var(--dur-base) var(--ease-out);
        }

        .topbar-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 1.25rem;
            height: 3.25rem;
        }

        @media (min-width: 768px) {
            .topbar-inner { padding: 0 2rem; }
        }

        .logo-link {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            text-decoration: none;
            color: var(--text);
            transition: opacity var(--dur-fast) var(--ease-out);
        }

        .logo-link:hover {
            opacity: 0.78;
        }

        .logo-mark {
            width: 26px;
            height: 26px;
            display: block;
        }

        .logo-text {
            font-size: 0.86rem;
            font-weight: 700;
            letter-spacing: -0.005em;
            color: var(--text);
        }

        .logo-text-dim {
            color: var(--text-dim);
            font-weight: 500;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .nav-link {
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--text-mute);
            text-decoration: none;
            letter-spacing: 0.01em;
            transition: color var(--dur-fast) var(--ease-out);
        }

        .nav-link:hover {
            color: var(--brand);
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 0.15rem;
        }

        .separator {
            width: 1px;
            height: 16px;
            background: var(--border);
            margin: 0 0.35rem;
        }

        .ctrl-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            min-width: 32px;
            padding: 0 0.55rem;
            border-radius: var(--r-md);
            border: none;
            background: transparent;
            color: var(--text-mute);
            cursor: pointer;
            transition: background var(--dur-fast) var(--ease-out),
                        color var(--dur-fast) var(--ease-out);
            font: inherit;
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            line-height: 1;
        }

        .ctrl-btn:hover {
            background: var(--bg-elev);
            color: var(--text);
        }

        .ctrl-btn--text {
            font-feature-settings: 'tnum';
        }

        .ctrl-btn svg {
            display: block;
        }
    `]
})
export class PublicTopbar {
    readonly lang = inject(LanguageService);
    readonly theme = inject(ThemeService);

    switchLanguage(): void {
        this.lang.switchLanguage();
    }

    cycleTheme(): void {
        // Use View Transitions for a soft crossfade between themes when supported.
        const doc = document as Document & {
            startViewTransition?: (cb: () => void) => unknown;
        };
        if (typeof doc.startViewTransition === 'function') {
            doc.startViewTransition(() => this.theme.cycle());
        } else {
            this.theme.cycle();
        }
    }
}
