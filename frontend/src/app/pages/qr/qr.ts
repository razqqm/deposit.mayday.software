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
    iconKey: string;
}

const ICON_SVGS: Record<string, string> = {
    native:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    copy:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    email:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    linkedin:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.56c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>',
    facebook:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.62 8.62 0 0 0-.653-.036 26 26 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.7 1.7 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
    whatsapp:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.464 3.488"/></svg>',
    telegram:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    x:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    vk:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.66 2 15.07 2zm3.07 14.27h-1.45c-.55 0-.72-.44-1.71-1.43-.86-.83-1.24-.94-1.45-.94-.3 0-.39.08-.39.5v1.31c0 .36-.12.58-1.06.58-1.56 0-3.29-.95-4.51-2.71-1.83-2.58-2.34-4.52-2.34-4.92 0-.22.08-.42.5-.42h1.45c.38 0 .52.17.66.58.71 2.06 1.91 3.86 2.4 3.86.18 0 .27-.08.27-.55V10.6c-.06-.99-.58-1.07-.58-1.42 0-.16.14-.33.37-.33h2.28c.32 0 .43.17.43.55v2.88c0 .31.14.43.23.43.18 0 .34-.11.69-.46 1.07-1.2 1.83-3.05 1.83-3.05.1-.21.27-.41.66-.41h1.45c.43 0 .53.22.43.53-.18.83-1.93 3.31-1.93 3.31-.15.25-.21.36 0 .64.15.21.65.64.99 1.04.62.71 1.1 1.31 1.23 1.72.13.42-.09.63-.51.63z"/></svg>',
    arrow:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    arrowOut:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
    sun:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    auto:
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>'
};

const SHARE_ITEMS: ShareItem[] = [
    { kind: 'native',   labelKey: 'qr.shareNative',   iconKey: 'native' },
    { kind: 'copy',     labelKey: 'qr.shareCopy',     iconKey: 'copy' },
    { kind: 'email',    labelKey: 'qr.shareEmail',    iconKey: 'email' },
    { kind: 'linkedin', labelKey: 'qr.shareLinkedIn', iconKey: 'linkedin' },
    { kind: 'facebook', labelKey: 'qr.shareFacebook', iconKey: 'facebook' },
    { kind: 'whatsapp', labelKey: 'qr.shareWhatsApp', iconKey: 'whatsapp' },
    { kind: 'telegram', labelKey: 'qr.shareTelegram', iconKey: 'telegram' },
    { kind: 'x',        labelKey: 'qr.shareX',        iconKey: 'x' },
    { kind: 'vk',       labelKey: 'qr.shareVk',       iconKey: 'vk' }
];

@Component({
    selector: 'app-qr',
    standalone: true,
    imports: [TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="qr-bg" aria-hidden="true">
            <span class="glow glow--1"></span>
            <span class="glow glow--2"></span>
            <span class="glow glow--3"></span>
            <span class="grid-overlay"></span>
            <span class="noise"></span>
        </div>

        <main class="qr-shell">
            <article class="qr-card">
                <header class="qr-head">
                    <a href="/" class="qr-logo" [attr.aria-label]="'a11y.homeLink' | translate">
                        <span class="qr-logo__mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10 L12 15 L17 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 4 L12 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                                <path d="M5 19 L19 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                            </svg>
                        </span>
                        <span class="qr-logo__text">deposit</span>
                    </a>

                    <div class="qr-head__right">
                        <button type="button" class="qr-icon-btn" (click)="switchLang()"
                                [title]="lang.currentLang() === 'ru' ? 'Switch to English' : 'Переключить на русский'"
                                [attr.aria-label]="lang.currentLang() === 'ru' ? 'Switch to English' : 'Переключить на русский'">
                            {{ lang.currentLang() === 'ru' ? 'EN' : 'RU' }}
                        </button>
                        <button type="button" class="qr-icon-btn qr-icon-btn--svg" (click)="cycleTheme()"
                                [attr.aria-label]="('a11y.themeLabel' | translate:{mode: theme.mode()})"
                                [title]="('a11y.themeLabel' | translate:{mode: theme.mode()})">
                            @if (theme.mode() === 'light') {
                                <span class="qr-icon" [innerHTML]="trustedIcons['sun']"></span>
                            } @else if (theme.mode() === 'dark') {
                                <span class="qr-icon" [innerHTML]="trustedIcons['moon']"></span>
                            } @else {
                                <span class="qr-icon" [innerHTML]="trustedIcons['auto']"></span>
                            }
                        </button>
                        <span class="qr-eyebrow">{{ 'qr.eyebrow' | translate }}</span>
                    </div>
                </header>

                <section class="qr-hero">
                    <h1 class="qr-domain">mayday.software</h1>
                    <p class="qr-tagline">{{ 'qr.tagline' | translate }}</p>
                </section>

                <section class="qr-code" aria-label="QR">
                    <div class="qr-code__frame">
                        <div class="qr-code__svg" [innerHTML]="qrSvg()"></div>
                        <span class="qr-code__badge" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10 L12 15 L17 10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 4 L12 14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
                                <path d="M5 19 L19 19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
                            </svg>
                        </span>
                    </div>
                    <p class="qr-scan-hint">{{ 'qr.scanHint' | translate }}</p>
                </section>

                <section class="qr-share" [attr.aria-label]="'qr.shareTitle' | translate">
                    <h2 class="qr-section-title">{{ 'qr.shareTitle' | translate }}</h2>
                    <div class="qr-grid">
                        @for (item of shareItems; track item.kind) {
                            <button type="button" class="qr-chip" (click)="onShare(item.kind)">
                                <span class="qr-chip__icon">
                                    @if (item.kind === 'copy' && copied()) {
                                        <span [innerHTML]="trustedIcons['check']"></span>
                                    } @else {
                                        <span [innerHTML]="trustedIcons[item.iconKey]"></span>
                                    }
                                </span>
                                <span class="qr-chip__label">
                                    @if (item.kind === 'copy' && copied()) {
                                        {{ 'qr.shareCopied' | translate }}
                                    } @else {
                                        {{ item.labelKey | translate }}
                                    }
                                </span>
                            </button>
                        }
                    </div>
                </section>

                <section class="qr-links" [attr.aria-label]="'qr.linksTitle' | translate">
                    <h2 class="qr-section-title">{{ 'qr.linksTitle' | translate }}</h2>
                    <a class="qr-link" href="/">
                        <span>{{ 'qr.linkSite' | translate }}</span>
                        <span class="qr-link__arrow" [innerHTML]="trustedIcons['arrow']"></span>
                    </a>
                    <a class="qr-link" href="/how">
                        <span>{{ 'qr.linkHow' | translate }}</span>
                        <span class="qr-link__arrow" [innerHTML]="trustedIcons['arrow']"></span>
                    </a>
                    <a class="qr-link" href="/verify">
                        <span>{{ 'qr.linkVerify' | translate }}</span>
                        <span class="qr-link__arrow" [innerHTML]="trustedIcons['arrow']"></span>
                    </a>
                    <a class="qr-link" href="https://github.com/razqqm/deposit.mayday.software" target="_blank" rel="noopener noreferrer">
                        <span>{{ 'qr.linkGithub' | translate }}</span>
                        <span class="qr-link__arrow" [innerHTML]="trustedIcons['arrowOut']"></span>
                    </a>
                </section>
            </article>
        </main>
    `,
    styles: [`
        :host {
            display: block;
            position: fixed;
            inset: 0;
            overflow-y: auto;
            background: var(--bg);
            color: var(--text);
        }

        /* ── Background ────────────────────────────────────── */
        .qr-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background:
                linear-gradient(135deg,
                    color-mix(in oklch, var(--brand) 8%, var(--bg)) 0%,
                    var(--bg) 50%,
                    color-mix(in oklch, var(--brand-strong) 6%, var(--bg)) 100%);
            overflow: hidden;
        }
        .glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(90px);
            opacity: 0.55;
            animation: qr-float 22s ease-in-out infinite;
        }
        .glow--1 {
            width: 420px; height: 420px;
            top: -10%; left: -8%;
            background: var(--brand);
            animation-delay: 0s;
        }
        .glow--2 {
            width: 340px; height: 340px;
            bottom: -15%; right: -10%;
            background: var(--brand-strong);
            animation-delay: -8s;
            animation-duration: 26s;
        }
        .glow--3 {
            width: 260px; height: 260px;
            top: 45%; left: 60%;
            background: color-mix(in oklch, var(--brand) 60%, var(--info));
            animation-delay: -14s;
            animation-duration: 30s;
            opacity: 0.4;
        }
        @keyframes qr-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%      { transform: translate(40px, -30px) scale(1.08); }
            66%      { transform: translate(-30px, 40px) scale(0.95); }
        }
        .grid-overlay {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(to right, color-mix(in oklch, var(--text) 6%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in oklch, var(--text) 6%, transparent) 1px, transparent 1px);
            background-size: 48px 48px;
            mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
            -webkit-mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
        }
        .noise {
            position: absolute;
            inset: 0;
            opacity: 0.04;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>");
        }

        /* ── Shell + card ──────────────────────────────────── */
        .qr-shell {
            position: relative;
            z-index: 1;
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--sp-6) var(--sp-4);
        }
        .qr-card {
            width: 100%;
            max-width: 460px;
            display: flex;
            flex-direction: column;
            gap: var(--sp-6);
            padding: var(--sp-8) var(--sp-6) var(--sp-7);
            background: color-mix(in oklch, var(--bg-elev) 86%, transparent);
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            border: 1px solid var(--border);
            border-radius: var(--r-2xl);
            box-shadow: var(--shadow-xl);
            animation: qr-rise 600ms var(--ease-out) both;
        }
        @keyframes qr-rise {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ────────────────────────────────────────── */
        .qr-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-3);
        }
        .qr-logo {
            display: inline-flex;
            align-items: center;
            gap: var(--sp-2);
            color: var(--text);
            text-decoration: none;
        }
        .qr-logo__mark {
            display: grid;
            place-items: center;
            width: 28px; height: 28px;
            border-radius: 8px;
            background: var(--text);
            color: var(--bg);
        }
        .qr-logo__mark svg { width: 18px; height: 18px; }
        .qr-logo__text {
            font-family: var(--font-brand);
            font-size: var(--fs-lg);
            font-weight: var(--fw-semi);
            letter-spacing: -0.02em;
            line-height: 1;
        }

        .qr-head__right {
            display: inline-flex;
            align-items: center;
            gap: var(--sp-2);
        }
        .qr-icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px; height: 28px;
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: var(--r-full);
            color: var(--text-mute);
            font-size: 10px;
            font-weight: var(--fw-bold);
            font-family: inherit;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: color var(--dur-fast) var(--ease-out),
                        background var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out);
        }
        .qr-icon-btn:hover {
            color: var(--text);
            border-color: var(--border-strong);
            background: var(--bg-mute);
        }
        .qr-icon { display: inline-flex; }
        .qr-icon ::ng-deep svg { display: block; }

        .qr-eyebrow {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: var(--r-full);
            background: var(--brand-soft);
            border: 1px solid color-mix(in oklch, var(--brand) 30%, transparent);
            color: var(--brand-strong);
            font-size: 10px;
            font-weight: var(--fw-bold);
            letter-spacing: var(--ls-wide);
            text-transform: uppercase;
            line-height: 1;
        }

        /* ── Hero ──────────────────────────────────────────── */
        .qr-hero {
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
            text-align: left;
        }
        .qr-domain {
            font-family: var(--font-brand);
            font-size: var(--fs-3xl);
            font-weight: var(--fw-bold);
            letter-spacing: -0.025em;
            line-height: 1.05;
            background: linear-gradient(135deg, var(--text) 0%, var(--brand-strong) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
        }
        .qr-tagline {
            font-size: var(--fs-sm);
            color: var(--text-mute);
            line-height: var(--lh-base);
            max-width: 38ch;
        }

        /* ── QR ────────────────────────────────────────────── */
        .qr-code {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--sp-3);
        }
        .qr-code__frame {
            position: relative;
            width: 280px;
            height: 280px;
            padding: 12px;
            background: #ffffff;
            border-radius: var(--r-lg);
            box-shadow: var(--shadow-md);
            overflow: hidden;
        }
        .qr-code__svg {
            width: 100%;
            height: 100%;
            line-height: 0;
        }
        .qr-code__svg ::ng-deep svg {
            width: 100%;
            height: 100%;
            display: block;
        }
        .qr-code__badge {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            display: grid;
            place-items: center;
            width: 56px; height: 56px;
            border-radius: 14px;
            background: #ffffff;
            box-shadow: 0 0 0 4px #ffffff, 0 4px 12px rgba(0, 0, 0, 0.15);
            color: #0a0a0c;
        }
        .qr-code__badge svg { width: 28px; height: 28px; }
        .qr-scan-hint {
            font-size: var(--fs-xs);
            color: var(--text-dim);
            text-align: center;
            max-width: 32ch;
            text-wrap: balance;
        }

        /* ── Section title ─────────────────────────────────── */
        .qr-section-title {
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            font-size: 10px;
            font-weight: var(--fw-bold);
            letter-spacing: var(--ls-wide);
            text-transform: uppercase;
            color: var(--text-dim);
            margin-bottom: var(--sp-3);
        }
        .qr-section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border-soft);
        }

        /* ── Share grid ────────────────────────────────────── */
        .qr-share { display: flex; flex-direction: column; }
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--sp-2);
        }
        .qr-chip {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-width: 0;
            padding: 12px 6px;
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            color: var(--text);
            font-family: inherit;
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            text-align: center;
            cursor: pointer;
            overflow: hidden;
            transition: color var(--dur-fast) var(--ease-out),
                        background var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out),
                        transform var(--dur-fast) var(--ease-out);
        }
        .qr-chip:hover {
            border-color: var(--border-strong);
            background: var(--bg-mute);
            transform: translateY(-1px);
        }
        .qr-chip:active { transform: translateY(0); }
        .qr-chip__icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px; height: 20px;
            color: var(--brand);
            flex-shrink: 0;
        }
        .qr-chip__icon ::ng-deep svg { display: block; }
        .qr-chip__label {
            min-width: 0;
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* ── Quick links ───────────────────────────────────── */
        .qr-links { display: flex; flex-direction: column; }
        .qr-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-3);
            padding: 10px 12px;
            border-radius: var(--r-sm);
            color: var(--text);
            font-size: var(--fs-sm);
            font-weight: var(--fw-medium);
            text-decoration: none;
            border: 1px solid transparent;
            transition: background var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out);
        }
        .qr-link:hover {
            background: var(--bg-mute);
            border-color: var(--border-soft);
        }
        .qr-link__arrow {
            display: inline-flex;
            color: var(--text-dim);
            transition: color var(--dur-fast) var(--ease-out),
                        transform var(--dur-fast) var(--ease-out);
        }
        .qr-link__arrow ::ng-deep svg { display: block; }
        .qr-link:hover .qr-link__arrow {
            color: var(--brand);
            transform: translateX(2px);
        }

        /* ── Adaptive ──────────────────────────────────────── */
        @media (max-width: 480px) {
            .qr-card {
                padding: var(--sp-6) var(--sp-4) var(--sp-5);
                border-radius: var(--r-xl);
                gap: var(--sp-5);
            }
            .qr-domain { font-size: var(--fs-2xl); }
            .qr-code__frame { width: 240px; height: 240px; }
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
    readonly shareItems = SHARE_ITEMS;

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
