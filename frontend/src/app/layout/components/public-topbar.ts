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
                        <button type="button" class="icon-btn install-btn" (click)="installApp()"
                                [attr.aria-label]="'pwa.install' | translate"
                                [title]="'pwa.install' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                    }
                    <div class="seg" role="group" [attr.aria-label]="'a11y.switchLang' | translate">
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
                    <button type="button" class="icon-btn menu-btn" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen()" aria-label="Menu">
                        @if (menuOpen()) {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
                        } @else {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                        }
                    </button>
                </div>
            </div>
        </nav>
    `,
    styles: [`
        :host { display: block; }
        .topbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
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
            width: 28px;
            height: 28px;
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
            width: 32px;
            height: 32px;
            color: var(--text-mute);
            border-radius: var(--r-sm);
            transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }
        .icon-btn:hover { background: var(--bg-mute); color: var(--text); }
        .install-btn { color: var(--brand-strong); }
        .install-btn:hover { background: var(--brand-soft); color: var(--brand-strong); }
        .menu-btn { display: none; }

        @media (max-width: 720px) {
            .inner { gap: var(--sp-3); padding: 0 var(--sp-4); }
            .menu-btn { display: inline-flex; }
            .links {
                position: absolute;
                top: 56px;
                left: 0;
                right: 0;
                flex-direction: column;
                align-items: stretch;
                gap: 0;
                background: var(--bg-elev);
                border-bottom: 1px solid var(--border);
                padding: var(--sp-2);
                transform: translateY(-8px);
                opacity: 0;
                pointer-events: none;
                transition: opacity var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
            }
            .links.is-open { opacity: 1; transform: translateY(0); pointer-events: auto; }
            .link { padding: var(--sp-3); border-radius: var(--r-sm); }
            .seg { display: none; }
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
