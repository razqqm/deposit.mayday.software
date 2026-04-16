import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@/app/shared/services/language.service';
import { ThemeService } from '@/app/shared/services/theme.service';
import { PwaService } from '@/app/shared/services/pwa.service';

@Component({
    selector: 'app-public-topbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <nav class="topbar" [attr.aria-label]="'a11y.mainNav' | translate">
            <div class="inner">
                <a routerLink="/" class="brand" [attr.aria-label]="'a11y.homeLink' | translate">
                    <span class="brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 10 L12 15 L17 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 4 L12 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                            <path d="M5 19 L19 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                        </svg>
                    </span>
                    <span class="brand-word">deposit</span>
                </a>

                <nav class="links" [class.is-open]="menuOpen()">
                    <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }" class="link">{{ 'nav.home' | translate }}</a>
                    <a routerLink="/how" routerLinkActive="is-active" class="link">{{ 'info.howEyebrow' | translate }}</a>
                    <a routerLink="/verify" routerLinkActive="is-active" class="link">{{ 'verify.title' | translate }}</a>
                </nav>

                <div class="ctrls">
                    @if (pwa.canInstall()) {
                        <button type="button" class="icon-btn install-btn desktop-only" (click)="installApp()"
                                [attr.aria-label]="'pwa.install' | translate"
                                [title]="'pwa.install' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                    }
                    <div class="seg desktop-only" role="group" [attr.aria-label]="'a11y.switchLang' | translate">
                        <button type="button" class="seg-btn" [class.is-on]="lang.currentLang() === 'en'" (click)="setLang('en')">EN</button>
                        <button type="button" class="seg-btn" [class.is-on]="lang.currentLang() === 'ru'" (click)="setLang('ru')">RU</button>
                    </div>
                    <button type="button" class="icon-btn" (click)="cycleTheme()"
                            [attr.aria-label]="('a11y.themeLabel' | translate:{mode: theme.mode()})"
                            [title]="('a11y.themeLabel' | translate:{mode: theme.mode()})">
                        @if (theme.mode() === 'light') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                        } @else if (theme.mode() === 'dark') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        } @else {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>
                        }
                    </button>
                    <button type="button" class="icon-btn menu-btn" (click)="toggleMenu(); $event.stopPropagation()" [attr.aria-expanded]="menuOpen()" aria-label="Menu">
                        @if (menuOpen()) {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
                        } @else {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                        }
                    </button>
                </div>
            </div>
        </nav>

        <!-- ═══ Mobile fullscreen overlay menu ═══ -->
        <div class="mob-overlay" [class.is-open]="menuOpen()" (click)="menuOpen.set(false)">
            <div class="mob-menu">
                <div class="mob-nav" (click)="$event.stopPropagation()">
                    <a routerLink="/" routerLinkActive="mob-active" [routerLinkActiveOptions]="{ exact: true }" class="mob-link" (click)="menuOpen.set(false)">
                        <span class="mob-num">01</span>
                        <span class="mob-text">{{ 'nav.home' | translate }}</span>
                        <svg class="mob-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                    <a routerLink="/how" routerLinkActive="mob-active" class="mob-link" (click)="menuOpen.set(false)">
                        <span class="mob-num">02</span>
                        <span class="mob-text">{{ 'info.howEyebrow' | translate }}</span>
                        <svg class="mob-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>
                    <a routerLink="/verify" routerLinkActive="mob-active" class="mob-link" (click)="menuOpen.set(false)">
                        <span class="mob-num">03</span>
                        <span class="mob-text">{{ 'verify.title' | translate }}</span>
                        <svg class="mob-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </a>

                </div>
                <div class="mob-bottom" (click)="$event.stopPropagation()">
                    @if (pwa.canInstall()) {
                        <button type="button" class="mob-install" (click)="installApp(); menuOpen.set(false)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>{{ 'pwa.install' | translate }}</span>
                        </button>
                    }
                    <div class="mob-lang" role="group">
                        <button type="button" class="mob-lang-btn" [class.is-on]="lang.currentLang() === 'en'" (click)="setLang('en')">EN</button>
                        <button type="button" class="mob-lang-btn" [class.is-on]="lang.currentLang() === 'ru'" (click)="setLang('ru')">RU</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; }
        .topbar {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 500;
            background: var(--bg-overlay);
            backdrop-filter: blur(12px) saturate(160%);
            -webkit-backdrop-filter: blur(12px) saturate(160%);
            border-bottom: 1px solid var(--border);
        }
        .inner {
            display: flex;
            align-items: center;
            gap: var(--sp-6);
            max-width: var(--container-wide);
            margin-inline: auto;
            padding: 0 var(--sp-6);
            height: 56px;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: var(--sp-2);
            color: var(--text);
            flex-shrink: 0;
        }
        .brand-mark {
            display: grid;
            place-items: center;
            width: 28px; height: 28px;
            border-radius: 8px;
            background: var(--text);
            color: var(--bg);
        }
        .brand-word {
            font-family: var(--font-brand);
            font-size: var(--fs-lg);
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1;
            color: var(--text);
        }

        .links {
            display: flex;
            align-items: center;
            gap: var(--sp-1);
            flex: 1;
        }
        .link {
            padding: var(--sp-2) var(--sp-3);
            font-size: var(--fs-sm);
            font-weight: var(--fw-medium);
            color: var(--text-mute);
            border-radius: var(--r-sm);
            letter-spacing: var(--ls-snug);
            transition: color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out);
        }
        .link:hover { color: var(--text); background: var(--bg-mute); }
        .link.is-active { color: var(--text); background: var(--bg-mute); }

        .ctrls {
            display: flex;
            align-items: center;
            gap: var(--sp-2);
        }

        .seg {
            display: inline-flex;
            align-items: center;
            padding: 2px;
            background: var(--bg-mute);
            border: 1px solid var(--border);
            border-radius: var(--r-sm);
        }
        .seg-btn {
            padding: 4px 10px;
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            color: var(--text-mute);
            border-radius: 4px;
            letter-spacing: var(--ls-wide);
            transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }
        .seg-btn.is-on { background: var(--bg-elev); color: var(--text); box-shadow: var(--shadow-xs); }

        .icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px; height: 32px;
            color: var(--text-mute);
            border-radius: var(--r-sm);
            transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }
        .icon-btn:hover { background: var(--bg-mute); color: var(--text); }
        .install-btn { color: var(--brand-strong); }
        .install-btn:hover { background: var(--brand-soft); color: var(--brand-strong); }
        .menu-btn { display: none; }
        .desktop-only { display: inline-flex; }

        /* ═══ Mobile overlay ═══ */
        .mob-overlay {
            display: none;
        }

        @media (max-width: 720px) {
            .inner { gap: var(--sp-3); padding: 0 var(--sp-4); }
            .ctrls { margin-left: auto; }
            .menu-btn { display: inline-flex; }
            .desktop-only { display: none !important; }
            .links { display: none; }

            .mob-overlay {
                display: block;
                position: fixed;
                inset: 0;
                z-index: 499;
                background: color-mix(in oklch, var(--bg) 85%, transparent);
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                opacity: 0;
                visibility: hidden;
                transition: opacity 300ms var(--ease-out), visibility 0s 300ms;
            }
            .mob-overlay.is-open {
                opacity: 1;
                visibility: visible;
                transition: opacity 300ms var(--ease-out), visibility 0s;
            }

            .mob-menu {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: calc(56px + var(--sp-6)) var(--sp-6) var(--sp-6);
                height: 100%;
                pointer-events: auto;
            }

            .mob-nav {
                display: flex;
                flex-direction: column;
                gap: var(--sp-2);
            }

            .mob-link {
                display: flex;
                align-items: center;
                gap: var(--sp-4);
                padding: var(--sp-4) var(--sp-4);
                border-radius: var(--r-lg);
                color: var(--text);
                text-decoration: none;
                transition: background var(--dur-fast) var(--ease-out),
                            transform var(--dur-fast) var(--ease-out);
                border: 1px solid transparent;
            }
            .mob-link:hover,
            .mob-link:active {
                background: var(--bg-mute);
                transform: translateX(4px);
            }
            .mob-link.mob-active {
                background: var(--brand-soft);
                border-color: color-mix(in oklch, var(--brand) 30%, transparent);
            }
            .mob-link.mob-active .mob-num {
                background: var(--brand);
                color: var(--brand-text);
                border-color: var(--brand);
            }
            .mob-link.mob-active .mob-text {
                color: var(--brand-strong);
            }
            .mob-link.mob-active .mob-arrow {
                color: var(--brand);
            }

            .mob-num {
                display: grid;
                place-items: center;
                width: 36px; height: 36px;
                border-radius: 50%;
                background: var(--bg-sunk);
                border: 1px solid var(--border-strong);
                font-family: var(--font-mono);
                font-size: var(--fs-xs);
                font-weight: var(--fw-bold);
                color: var(--text-mute);
                letter-spacing: var(--ls-mono);
                flex-shrink: 0;
                transition: background var(--dur-fast) var(--ease-out),
                            color var(--dur-fast) var(--ease-out),
                            border-color var(--dur-fast) var(--ease-out);
            }
            .mob-text {
                flex: 1;
                font-size: var(--fs-xl);
                font-weight: var(--fw-semi);
                letter-spacing: var(--ls-snug);
            }
            .mob-arrow {
                color: var(--text-dim);
                opacity: 0;
                transform: translateX(-8px);
                transition: opacity var(--dur-fast) var(--ease-out),
                            transform var(--dur-fast) var(--ease-out),
                            color var(--dur-fast) var(--ease-out);
            }
            .mob-link:hover .mob-arrow,
            .mob-link.mob-active .mob-arrow {
                opacity: 1;
                transform: translateX(0);
            }

            .mob-bottom {
                display: flex;
                flex-direction: column;
                gap: var(--sp-4);
            }

            .mob-install {
                display: flex;
                align-items: center;
                gap: var(--sp-3);
                padding: var(--sp-4);
                margin-top: var(--sp-2);
                border-radius: var(--r-lg);
                background: var(--brand);
                color: var(--brand-text);
                font-size: var(--fs-base);
                font-weight: var(--fw-semi);
                letter-spacing: var(--ls-snug);
                width: 100%;
                border: none;
                cursor: pointer;
                transition: background var(--dur-fast) var(--ease-out),
                            transform var(--dur-fast) var(--ease-out);
            }
            .mob-install:active {
                background: var(--brand-strong);
                transform: scale(0.98);
            }

            .mob-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-top: var(--sp-4);
                border-top: 1px solid var(--border);
            }

            .mob-lang {
                display: flex;
                align-items: center;
                gap: var(--sp-1);
                padding: 3px;
                background: var(--bg-sunk);
                border: 1px solid var(--border);
                border-radius: var(--r-md);
            }
            .mob-lang-btn {
                padding: var(--sp-2) var(--sp-4);
                font-size: var(--fs-sm);
                font-weight: var(--fw-semi);
                color: var(--text-mute);
                border-radius: var(--r-sm);
                letter-spacing: var(--ls-wide);
                transition: background var(--dur-fast) var(--ease-out),
                            color var(--dur-fast) var(--ease-out);
            }
            .mob-lang-btn.is-on {
                background: var(--brand);
                color: var(--brand-text);
                box-shadow: var(--shadow-sm);
            }

            .mob-theme-btn {
                display: inline-flex;
                align-items: center;
                gap: var(--sp-2);
                padding: var(--sp-2) var(--sp-4);
                font-size: var(--fs-sm);
                font-weight: var(--fw-medium);
                color: var(--text-mute);
                background: var(--bg-sunk);
                border: 1px solid var(--border);
                border-radius: var(--r-md);
                transition: background var(--dur-fast) var(--ease-out),
                            color var(--dur-fast) var(--ease-out);
            }
            .mob-theme-btn:active {
                background: var(--bg-mute);
                color: var(--text);
            }
        }
    `],
})
export class PublicTopbar {
    readonly lang = inject(LanguageService);
    readonly theme = inject(ThemeService);
    readonly pwa = inject(PwaService);
    readonly menuOpen = signal(false);

    async installApp(): Promise<void> {
        await this.pwa.install();
    }

    setLang(code: 'en' | 'ru'): void {
        if (this.lang.currentLang() === code) return;
        this.lang.switchLanguage();
    }

    toggleMenu(): void { this.menuOpen.update(v => !v); }

    cycleTheme(): void {
        const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
        if (typeof doc.startViewTransition === 'function') {
            doc.startViewTransition(() => this.theme.cycle());
        } else {
            this.theme.cycle();
        }
    }
}
