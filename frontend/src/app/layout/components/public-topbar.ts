import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '@/app/shared/services/language.service';
import { ThemeService } from '@/app/shared/services/theme.service';

@Component({
    selector: 'app-public-topbar',
    standalone: true,
    imports: [RouterLink],
    template: `
        <nav class="topbar" aria-label="Main navigation">
            <div class="topbar-inner">
                <a routerLink="/" class="logo-link" aria-label="mayday.software home">
                    <svg class="logo-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f59e0b" stroke-width="3"/>
                        <path d="M22 28 L32 38 L42 28" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M32 18 L32 36" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <span class="logo-text">mayday<span class="logo-text-dim">.software</span></span>
                </a>

                <div class="controls">
                    <button (click)="theme.cycle()" class="ctrl-btn"
                            [attr.aria-label]="'Theme: ' + theme.mode()">
                        @if (theme.mode() === 'light') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="5"/>
                                <line x1="12" y1="1" x2="12" y2="3"/>
                                <line x1="12" y1="21" x2="12" y2="23"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="1" y1="12" x2="3" y2="12"/>
                                <line x1="21" y1="12" x2="23" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        } @else if (theme.mode() === 'dark') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        } @else {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="9"/>
                                <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none"/>
                            </svg>
                        }
                    </button>
                    <span class="separator"></span>
                    <button (click)="switchLanguage()" class="ctrl-btn"
                            [attr.aria-label]="lang.currentLang() === 'en' ? 'Switch to Russian' : 'Switch to English'">
                        {{ lang.currentLang() === 'en' ? 'RU' : 'EN' }}
                    </button>
                </div>
            </div>
        </nav>
    `,
    styles: [`
        .topbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: #0b0f1a;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .topbar-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 1rem;
            height: 3rem;
        }

        @media (min-width: 768px) {
            .topbar-inner { padding: 0 1.5rem; }
        }

        .logo-link {
            display: flex;
            align-items: center;
            gap: .55rem;
            text-decoration: none;
        }

        .logo-icon {
            width: 26px;
            height: 26px;
            transition: opacity 0.2s;
        }

        .logo-link:hover .logo-icon {
            opacity: 0.75;
        }

        .logo-text {
            color: #fff;
            font-size: .82rem;
            font-weight: 700;
            letter-spacing: .01em;
        }

        .logo-text-dim {
            color: rgba(255, 255, 255, 0.4);
            font-weight: 500;
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .separator {
            width: 1px;
            height: 14px;
            background: rgba(255, 255, 255, 0.12);
            margin: 0 0.2rem;
        }

        .ctrl-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 30px;
            min-width: 30px;
            padding: 0 0.5rem;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: rgba(255, 255, 255, 0.65);
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;
            font-size: 0.72rem;
            font-weight: 600;
            font-family: inherit;
            letter-spacing: 0.03em;
            line-height: 1;
        }

        .ctrl-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
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
}
