import {
    ChangeDetectionStrategy,
    Component,
    DOCUMENT,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import qrcode from 'qrcode-generator';
import { LanguageService } from '@/app/shared/services/language.service';
import { ThemeService } from '@/app/shared/services/theme.service';

type ShareKind =
    | 'native'
    | 'copy'
    | 'email'
    | 'linkedin'
    | 'facebook'
    | 'whatsapp'
    | 'telegram'
    | 'x'
    | 'vk';

interface ShareItem {
    kind: ShareKind;
    labelKey: string;
    accent: string;
}

const ICON_SVGS: Record<string, string> = {
    native:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 6 12 2 8 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    copy:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
    check:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    email:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
    linkedin:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/></svg>',
    facebook:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/></svg>',
    whatsapp:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.04 21.785h-.003a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.49-8.413z" fill="currentColor"/></svg>',
    telegram:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" fill="currentColor"/></svg>',
    x:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/></svg>',
    vk:
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12.785 16.241s.288-.032.435-.193c.135-.148.131-.425.131-.425s-.019-1.298.581-1.493c.592-.193 1.351 1.282 2.155 1.85.609.43 1.072.336 1.072.336l2.151-.031s1.124-.07.591-.962c-.043-.073-.31-.661-1.596-1.866-1.346-1.262-1.166-1.057.456-3.246.988-1.333 1.384-2.146 1.26-2.495-.117-.332-.852-.244-.852-.244l-2.444.015s-.181-.025-.315.056c-.131.079-.215.262-.215.262s-.384 1.034-.896 1.913c-1.08 1.853-1.512 1.951-1.69 1.836-.412-.267-.309-1.075-.309-1.648 0-1.793.272-2.541-.526-2.733-.265-.064-.461-.107-1.139-.114-.872-.009-1.61.003-2.027.207-.278.137-.492.441-.362.458.161.022.526.099.72.362.249.341.241 1.103.241 1.103s.143 2.094-.335 2.355c-.328.18-.776-.187-1.74-1.851-.493-.852-.866-1.793-.866-1.793s-.072-.176-.201-.27c-.156-.114-.375-.15-.375-.15l-2.323.015s-.349.01-.477.161c-.114.135-.009.413-.009.413s1.819 4.256 3.879 6.401c1.889 1.967 4.034 1.838 4.034 1.838h.971z" fill="currentColor"/></svg>',
    sun:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    auto:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>'
};

const SHARE_LAYOUT: ShareItem[] = [
    { kind: 'native',   labelKey: 'qr.shareNative',   accent: 'var(--brand)' },
    { kind: 'copy',     labelKey: 'qr.shareCopy',     accent: 'var(--brand)' },
    { kind: 'email',    labelKey: 'qr.shareEmail',    accent: '#94a3b8' },
    { kind: 'linkedin', labelKey: 'qr.shareLinkedIn', accent: '#0a66c2' },
    { kind: 'facebook', labelKey: 'qr.shareFacebook', accent: '#1877f2' },
    { kind: 'whatsapp', labelKey: 'qr.shareWhatsApp', accent: '#25d366' },
    { kind: 'telegram', labelKey: 'qr.shareTelegram', accent: '#2aabee' },
    { kind: 'x',        labelKey: 'qr.shareX',        accent: 'var(--text)' },
    { kind: 'vk',       labelKey: 'qr.shareVk',       accent: '#0077ff' }
];

@Component({
    selector: 'app-qr',
    standalone: true,
    imports: [TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <main class="qr">
            <div class="qr-bg" aria-hidden="true">
                <div class="qr-grid"></div>
                <div class="qr-glow qr-glow-a"></div>
                <div class="qr-glow qr-glow-b"></div>
                <div class="qr-glow qr-glow-c"></div>
            </div>

            <article class="qr-card">
                <header class="qr-head">
                    <a class="qr-brand" href="/" [attr.aria-label]="'a11y.homeLink' | translate">
                        <span class="qr-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10 L12 15 L17 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 4 L12 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                                <path d="M5 19 L19 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                            </svg>
                        </span>
                        <span class="qr-brand-word">deposit</span>
                    </a>

                    <div class="qr-controls">
                        <button type="button" class="qr-ctrl" (click)="cycleTheme()"
                                [attr.aria-label]="('a11y.themeLabel' | translate:{mode: theme.mode()})"
                                [title]="('a11y.themeLabel' | translate:{mode: theme.mode()})">
                            @if (theme.mode() === 'light') {
                                <span class="qr-ico" [innerHTML]="trustedIcons['sun']"></span>
                            } @else if (theme.mode() === 'dark') {
                                <span class="qr-ico" [innerHTML]="trustedIcons['moon']"></span>
                            } @else {
                                <span class="qr-ico" [innerHTML]="trustedIcons['auto']"></span>
                            }
                        </button>

                        <button type="button" class="qr-ctrl qr-ctrl--lang" (click)="switchLang()"
                                [attr.aria-label]="lang.currentLang() === 'ru' ? 'Switch to English' : 'Переключить на русский'"
                                [title]="lang.currentLang() === 'ru' ? 'Switch to English' : 'Переключить на русский'">
                            {{ lang.currentLang() === 'ru' ? 'EN' : 'RU' }}
                        </button>

                        <span class="qr-eyebrow">{{ 'qr.eyebrow' | translate }}</span>
                    </div>
                </header>

                <p class="qr-tagline">{{ 'qr.tagline' | translate }}</p>

                <div class="qr-frame">
                    <span class="qr-corner qr-corner-tl"></span>
                    <span class="qr-corner qr-corner-tr"></span>
                    <span class="qr-corner qr-corner-bl"></span>
                    <span class="qr-corner qr-corner-br"></span>
                    <div class="qr-svg" [innerHTML]="qrSvg()"></div>
                    <div class="qr-emblem" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 10 L12 15 L17 10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 4 L12 14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
                            <path d="M5 19 L19 19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>

                <p class="qr-scan-hint">{{ 'qr.scanHint' | translate }}</p>

                <section class="qr-section">
                    <h2 class="qr-section-title">{{ 'qr.shareTitle' | translate }}</h2>
                    <div class="qr-grid-9">
                        @for (item of items; track item.kind) {
                            <button type="button"
                                    class="chip"
                                    [class.chip--ok]="item.kind === 'copy' && copied()"
                                    [style.--chip-accent]="item.accent"
                                    (click)="onShare(item.kind)"
                                    [attr.aria-label]="(item.kind === 'copy' && copied() ? 'qr.shareCopied' : item.labelKey) | translate">
                                <span class="chip-ico">
                                    @if (item.kind === 'copy' && copied()) {
                                        <span [innerHTML]="trustedIcons['check']"></span>
                                    } @else {
                                        <span [innerHTML]="trustedIcons[item.kind]"></span>
                                    }
                                </span>
                                <span class="chip-label">
                                    {{ (item.kind === 'copy' && copied() ? 'qr.shareCopied' : item.labelKey) | translate }}
                                </span>
                            </button>
                        }
                    </div>
                </section>

                <section class="qr-section">
                    <h2 class="qr-section-title">{{ 'qr.linksTitle' | translate }}</h2>
                    <ul class="qr-links">
                        <li>
                            <a class="lnk" href="/">
                                <span class="lnk-label">{{ 'qr.linkSite' | translate }}</span>
                                <span class="lnk-arrow">→</span>
                            </a>
                        </li>
                        <li>
                            <a class="lnk" href="/how">
                                <span class="lnk-label">{{ 'qr.linkHow' | translate }}</span>
                                <span class="lnk-arrow">→</span>
                            </a>
                        </li>
                        <li>
                            <a class="lnk" href="/verify">
                                <span class="lnk-label">{{ 'qr.linkVerify' | translate }}</span>
                                <span class="lnk-arrow">→</span>
                            </a>
                        </li>
                        <li>
                            <a class="lnk" href="https://github.com/razqqm/deposit.mayday.software" target="_blank" rel="noopener noreferrer">
                                <span class="lnk-label">{{ 'qr.linkGithub' | translate }}</span>
                                <span class="lnk-arrow">↗</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </article>
        </main>
    `,
    styles: [`
        :host { display: block; min-height: 100vh; }

        .qr {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem 1rem;
            overflow: hidden;
            isolation: isolate;
        }

        /* ---- mesh background ---- */
        .qr-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
            background:
                linear-gradient(135deg,
                    color-mix(in oklch, var(--brand) 6%, var(--bg)) 0%,
                    var(--bg) 50%,
                    color-mix(in oklch, var(--brand-strong) 4%, var(--bg)) 100%);
        }
        .qr-grid {
            position: absolute; inset: 0;
            background-image:
                linear-gradient(color-mix(in oklch, var(--brand) 8%, transparent) 1px, transparent 1px),
                linear-gradient(90deg, color-mix(in oklch, var(--brand) 8%, transparent) 1px, transparent 1px);
            background-size: 36px 36px;
            mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%);
            -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%);
        }
        .qr-glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(90px);
            opacity: .55;
            animation: qr-float 22s ease-in-out infinite;
        }
        .qr-glow-a {
            top: -10%; left: -10%; width: 380px; height: 380px;
            background: radial-gradient(circle, color-mix(in oklch, var(--brand) 60%, transparent), transparent 70%);
        }
        .qr-glow-b {
            bottom: -10%; right: -8%; width: 420px; height: 420px;
            background: radial-gradient(circle, color-mix(in oklch, var(--brand-strong) 35%, transparent), transparent 70%);
            animation-duration: 26s;
            animation-delay: -8s;
        }
        .qr-glow-c {
            top: 30%; right: -20%; width: 320px; height: 320px;
            background: radial-gradient(circle, color-mix(in oklch, var(--info) 30%, transparent), transparent 70%);
            animation-duration: 30s;
            animation-delay: -14s;
        }
        @keyframes qr-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -20px) scale(1.05); }
            66% { transform: translate(-20px, 30px) scale(.95); }
        }
        @media (prefers-reduced-motion: reduce) {
            .qr-glow { animation: none; }
        }

        /* ---- card ---- */
        .qr-card {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 460px;
            padding: 1.6rem 1.6rem 1.4rem;
            background: color-mix(in oklch, var(--bg-elev) 88%, transparent);
            border: 1px solid color-mix(in oklch, var(--brand) 12%, var(--border));
            border-radius: 1.4rem;
            box-shadow:
                0 30px 80px -20px color-mix(in oklch, var(--text) 18%, transparent),
                0 0 0 1px color-mix(in oklch, var(--bg-elev) 60%, transparent) inset;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            text-align: center;
            animation: qr-pop .6s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes qr-pop {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ---- header ---- */
        .qr-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.1rem;
            gap: .5rem;
        }
        .qr-brand {
            display: inline-flex;
            align-items: center;
            gap: .55rem;
            color: var(--text);
            text-decoration: none;
            transition: transform var(--dur-fast) var(--ease-out);
        }
        .qr-brand:hover { transform: translateX(-1px); }
        .qr-mark {
            width: 36px; height: 36px;
            display: inline-flex; align-items: center; justify-content: center;
            color: var(--brand);
            background: linear-gradient(135deg,
                color-mix(in oklch, var(--brand) 22%, transparent),
                color-mix(in oklch, var(--brand) 6%, transparent));
            border-radius: 10px;
            flex-shrink: 0;
        }
        .qr-mark svg { width: 22px; height: 22px; }
        .qr-brand-word {
            font-family: var(--font-brand);
            font-size: 1.05rem;
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1;
        }

        .qr-controls {
            display: inline-flex;
            align-items: center;
            gap: .25rem;
        }
        .qr-ctrl {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 28px;
            min-width: 28px;
            padding: 0 .45rem;
            font-family: inherit;
            font-size: .68rem;
            font-weight: 600;
            letter-spacing: .03em;
            line-height: 1;
            color: var(--text-mute);
            background: transparent;
            border: 1px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: background var(--dur-fast) var(--ease-out),
                        color var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out);
        }
        .qr-ico { display: inline-flex; align-items: center; justify-content: center; }
        .qr-ico ::ng-deep svg { width: 14px; height: 14px; display: block; }
        .qr-ctrl:hover {
            background: var(--bg-mute);
            color: var(--text);
            border-color: var(--border-strong);
        }
        .qr-ctrl--lang {
            font-family: var(--font-mono);
            letter-spacing: .04em;
        }

        .qr-eyebrow {
            display: inline-flex;
            align-items: center;
            padding: .28rem .65rem;
            font-size: .58rem;
            font-weight: 700;
            letter-spacing: .22em;
            text-transform: uppercase;
            color: var(--brand-strong);
            background: var(--brand-soft);
            border: 1px solid color-mix(in oklch, var(--brand) 22%, transparent);
            border-radius: 999px;
            margin-left: .35rem;
            white-space: nowrap;
        }

        /* ---- tagline ---- */
        .qr-tagline {
            margin: 0 auto 1.3rem;
            font-size: .9rem;
            line-height: 1.5;
            color: var(--text-mute);
            max-width: 36ch;
        }

        /* ---- QR ---- */
        .qr-frame {
            position: relative;
            width: 280px;
            height: 280px;
            margin: 0 auto .7rem;
            padding: 14px;
            background: #fff;
            border-radius: 1rem;
            box-shadow:
                0 4px 16px color-mix(in oklch, var(--text) 12%, transparent),
                0 0 0 1px color-mix(in oklch, var(--text) 8%, transparent);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .qr-svg { width: 100%; height: 100%; line-height: 0; }
        .qr-svg ::ng-deep svg {
            width: 100% !important;
            height: 100% !important;
            display: block;
        }
        .qr-emblem {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 56px; height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--brand), var(--brand-strong));
            color: #fff;
            border-radius: 14px;
            box-shadow:
                0 0 0 6px #fff,
                0 6px 18px color-mix(in oklch, var(--brand) 35%, transparent);
        }
        .qr-emblem svg { width: 30px; height: 30px; }

        .qr-corner {
            position: absolute;
            width: 16px; height: 16px;
            border-color: var(--brand);
            border-style: solid;
            border-width: 0;
            pointer-events: none;
        }
        .qr-corner-tl { top: -2px;    left: -2px;   border-top-width: 3px;    border-left-width: 3px;   border-top-left-radius: .9rem; }
        .qr-corner-tr { top: -2px;    right: -2px;  border-top-width: 3px;    border-right-width: 3px;  border-top-right-radius: .9rem; }
        .qr-corner-bl { bottom: -2px; left: -2px;   border-bottom-width: 3px; border-left-width: 3px;   border-bottom-left-radius: .9rem; }
        .qr-corner-br { bottom: -2px; right: -2px;  border-bottom-width: 3px; border-right-width: 3px;  border-bottom-right-radius: .9rem; }

        .qr-scan-hint {
            margin: 0 auto 1.4rem;
            font-size: .72rem;
            color: var(--text-dim);
            font-style: italic;
            max-width: 36ch;
            line-height: 1.5;
            text-wrap: balance;
        }

        /* ---- sections ---- */
        .qr-section { margin-top: 1.1rem; }
        .qr-section-title {
            display: block;
            margin: 0 0 .55rem;
            font-size: .58rem;
            font-weight: 700;
            letter-spacing: .2em;
            text-transform: uppercase;
            color: var(--text-dim);
            text-align: left;
            border-top: 1px dashed var(--border);
            padding-top: .8rem;
        }

        /* ---- 3x3 share grid ---- */
        .qr-grid-9 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: .5rem;
        }
        .chip {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            gap: .55rem;
            min-width: 0;
            padding: .65rem .7rem;
            font-size: .76rem;
            font-weight: 600;
            font-family: inherit;
            color: var(--text);
            background: var(--bg-mute);
            border: 1px solid var(--border);
            border-radius: .65rem;
            cursor: pointer;
            text-align: left;
            overflow: hidden;
            transition: transform var(--dur-fast) var(--ease-out),
                        background var(--dur-base) var(--ease-out),
                        color var(--dur-base) var(--ease-out),
                        border-color var(--dur-base) var(--ease-out),
                        box-shadow var(--dur-base) var(--ease-out);
        }
        .chip:hover {
            transform: translateY(-1px);
            color: var(--chip-accent);
            border-color: color-mix(in oklch, var(--chip-accent) 45%, transparent);
            background: color-mix(in oklch, var(--chip-accent) 8%, var(--bg-elev));
            box-shadow: 0 4px 12px color-mix(in oklch, var(--chip-accent) 18%, transparent);
        }
        .chip:active { transform: translateY(0); }
        .chip--ok {
            color: var(--success) !important;
            border-color: color-mix(in oklch, var(--success) 45%, transparent) !important;
            background: var(--success-soft) !important;
        }
        .chip-ico {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px; height: 18px;
            flex-shrink: 0;
        }
        .chip-ico ::ng-deep svg {
            width: 18px; height: 18px;
            display: block;
        }
        .chip-label {
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* ---- quick links ---- */
        .qr-links {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: .3rem;
        }
        .lnk {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: .65rem .85rem;
            font-size: .82rem;
            font-weight: 600;
            color: var(--text);
            background: transparent;
            border: 1px solid transparent;
            border-radius: .55rem;
            text-decoration: none;
            transition: background var(--dur-base) var(--ease-out),
                        border-color var(--dur-base) var(--ease-out),
                        color var(--dur-base) var(--ease-out);
        }
        .lnk:hover {
            background: var(--bg-mute);
            border-color: var(--border);
        }
        .lnk-arrow {
            color: var(--brand);
            font-weight: 600;
            transition: transform var(--dur-base) var(--ease-out);
        }
        .lnk:hover .lnk-arrow { transform: translateX(2px); }

        /* ---- mobile ---- */
        @media (max-width: 480px) {
            .qr { padding: 1rem .8rem; }
            .qr-card { padding: 1.3rem 1rem 1.1rem; border-radius: 1.1rem; }
            .qr-frame { width: 240px; height: 240px; }

            .chip {
                flex-direction: column;
                gap: .35rem;
                padding: .65rem .35rem;
                font-size: .65rem;
                text-align: center;
                justify-content: center;
                line-height: 1.2;
            }
            .chip-label { white-space: normal; }
        }
    `]
})
export class QrPage implements OnInit {
    private readonly document = inject(DOCUMENT);
    private readonly translate = inject(TranslateService);
    private readonly sanitizer = inject(DomSanitizer);
    readonly lang = inject(LanguageService);
    readonly theme = inject(ThemeService);

    readonly origin = signal('https://mayday.software');
    readonly copied = signal(false);
    readonly items = SHARE_LAYOUT;

    readonly trustedIcons: Record<string, SafeHtml> = Object.fromEntries(
        Object.entries(ICON_SVGS).map(([k, v]) => [k, this.sanitizer.bypassSecurityTrustHtml(v)])
    );

    readonly qrSvg = computed<SafeHtml>(() => {
        const qr = qrcode(0, 'H');
        qr.addData(this.origin());
        qr.make();
        const count = qr.getModuleCount();
        const margin = 2;
        const size = count + margin * 2;

        let path = '';
        for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
                if (qr.isDark(r, c)) {
                    path += `M${c + margin} ${r + margin}h1v1h-1z`;
                }
            }
        }
        const svg =
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" ` +
            `shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">` +
            `<rect width="${size}" height="${size}" fill="#ffffff"/>` +
            `<path d="${path}" fill="#0a0a0c"/></svg>`;
        return this.sanitizer.bypassSecurityTrustHtml(svg);
    });

    ngOnInit(): void {
        this.lang.init();
        this.theme.init();
        const win = this.document.defaultView;
        if (win) {
            this.origin.set(win.location.origin);
            this.document.title = 'mayday.software';
        }
    }

    switchLang(): void {
        this.lang.switchLanguage();
    }

    cycleTheme(): void {
        const doc = this.document as Document & { startViewTransition?: (cb: () => void) => unknown };
        if (typeof doc.startViewTransition === 'function') {
            doc.startViewTransition(() => this.theme.cycle());
        } else {
            this.theme.cycle();
        }
    }

    onShare(kind: ShareKind): void {
        const url = this.origin();
        const title = 'mayday.software';
        const text = this.translate.instant('qr.shareMessage');
        const subject = this.translate.instant('qr.shareEmailSubject');
        const win = this.document.defaultView;
        if (!win) return;

        switch (kind) {
            case 'native':
                if (typeof win.navigator?.share === 'function') {
                    win.navigator.share({ title, text, url }).catch(() => { /* user cancelled */ });
                } else {
                    this.copyUrl(url);
                }
                return;

            case 'copy':
                this.copyUrl(url);
                return;

            case 'email':
                win.location.href =
                    `mailto:?subject=${encodeURIComponent(subject)}` +
                    `&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
                return;

            case 'telegram':
                this.openExternal(win,
                    `https://t.me/share/url?url=${encodeURIComponent(url)}` +
                    `&text=${encodeURIComponent(text)}`);
                return;

            case 'whatsapp':
                this.openExternal(win,
                    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
                return;

            case 'x':
                this.openExternal(win,
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` +
                    `&text=${encodeURIComponent(text)}`);
                return;

            case 'facebook':
                this.openExternal(win,
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                return;

            case 'linkedin':
                this.openExternal(win,
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
                return;

            case 'vk':
                this.openExternal(win,
                    `https://vk.com/share.php?url=${encodeURIComponent(url)}` +
                    `&title=${encodeURIComponent(title)}`);
                return;
        }
    }

    private openExternal(win: Window, href: string): void {
        win.open(href, '_blank', 'noopener,noreferrer');
    }

    private copyUrl(url: string): void {
        const win = this.document.defaultView;
        const finish = () => {
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 1800);
        };
        if (win?.navigator?.clipboard?.writeText) {
            win.navigator.clipboard.writeText(url).then(finish, () => this.copyFallback(url, finish));
        } else {
            this.copyFallback(url, finish);
        }
    }

    private copyFallback(url: string, finish: () => void): void {
        const ta = this.document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        this.document.body.appendChild(ta);
        ta.select();
        try {
            this.document.execCommand('copy');
            finish();
        } catch {
            /* nothing else to try */
        } finally {
            this.document.body.removeChild(ta);
        }
    }
}
