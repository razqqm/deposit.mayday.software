import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-public-footer',
    standalone: true,
    imports: [TranslateModule, RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <footer class="footer">
            <div class="inner">
                <div class="col brand-col">
                    <span class="brand">
                        <span class="mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10 L12 15 L17 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 4 L12 14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                                <path d="M5 19 L19 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                            </svg>
                        </span>
                        <span class="brand-word">deposit</span>
                    </span>
                    <p class="tag">by <a href="https://mayday.software" target="_blank" rel="noopener noreferrer">mayday.software</a></p>
                    <p class="disc">{{ 'footer.disclaimer' | translate }}</p>

                    <!--
                      Social media row.
                      GitHub + Email are real. Twitter/Telegram/LinkedIn are
                      placeholders until accounts are registered. To activate:
                      replace the href, remove aria-disabled and tabindex="-1",
                      drop the data-placeholder attribute, and update the
                      Organization.sameAs array in index.html JSON-LD.
                    -->
                    <nav class="social-row" [attr.aria-label]="'footer.followUs' | translate">
                        <a class="social-link"
                           href="https://github.com/iarestov/mayday.software"
                           target="_blank" rel="noopener noreferrer"
                           [attr.aria-label]="'footer.social.github' | translate"
                           [title]="'footer.social.github' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.83-.26.83-.58v-2.05c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .3"/></svg>
                        </a>
                        <a class="social-link"
                           href="#" data-placeholder="twitter"
                           aria-disabled="true" tabindex="-1"
                           [attr.aria-label]="'footer.social.twitter' | translate"
                           [title]="'footer.social.twitter' | translate">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
                        </a>
                        <a class="social-link"
                           href="#" data-placeholder="telegram"
                           aria-disabled="true" tabindex="-1"
                           [attr.aria-label]="'footer.social.telegram' | translate"
                           [title]="'footer.social.telegram' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.51l-3-2.21-1.446 1.394c-.16.16-.296.296-.605.296l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.658-.643.135-.954l11.566-4.458c.538-.196 1.006.128.832.937Z"/></svg>
                        </a>
                        <a class="social-link"
                           href="#" data-placeholder="linkedin"
                           aria-disabled="true" tabindex="-1"
                           [attr.aria-label]="'footer.social.linkedin' | translate"
                           [title]="'footer.social.linkedin' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0Z"/></svg>
                        </a>
                        <a class="social-link"
                           href="mailto:hi@mayday.software"
                           data-placeholder="email"
                           aria-disabled="true" tabindex="-1"
                           [attr.aria-label]="'footer.social.email' | translate"
                           [title]="'footer.social.email' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                        </a>
                    </nav>
                </div>

                <div class="col">
                    <h4 class="col-title">Proof</h4>
                    <ul class="links">
                        <li><a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer">OpenTimestamps</a></li>
                        <li><a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer">Bitcoin</a></li>
                        <li><a href="https://citation-file-format.github.io" target="_blank" rel="noopener noreferrer">CITATION.cff</a></li>
                        <li><a href="https://datatracker.ietf.org/doc/html/rfc3161" target="_blank" rel="noopener noreferrer">RFC 3161</a></li>
                    </ul>
                </div>

                <div class="col">
                    <h4 class="col-title">Source</h4>
                    <ul class="links">
                        <li><a href="https://github.com/iarestov/mayday.software" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                        <li><a href="https://angular.dev" target="_blank" rel="noopener noreferrer">Angular</a></li>
                        <li><a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer">TypeScript</a></li>
                    </ul>
                </div>

                <div class="col">
                    <h4 class="col-title">Legal</h4>
                    <ul class="links">
                        <li><a routerLink="/privacy">{{ 'privacy.title' | translate }}</a></li>
                        <li><a routerLink="/terms">{{ 'terms.title' | translate }}</a></li>
                        <li><a href="https://www.wipo.int/treaties/en/ip/berne/" target="_blank" rel="noopener noreferrer">Berne Convention</a></li>
                        <li><a href="https://eur-lex.europa.eu/eli/reg/2014/910/oj" target="_blank" rel="noopener noreferrer">eIDAS 910/2014</a></li>
                    </ul>
                </div>
            </div>

            <div class="bar">
                <span class="dot" aria-hidden="true"></span>
                <span>© {{ year }} mayday.software</span>
                <span class="sep">·</span>
                <span>{{ 'footer.tagline' | translate }}</span>
            </div>
        </footer>
    `,
    styles: [`
        .footer {
            background: var(--bg);
            border-top: 1px solid var(--border);
            margin-top: var(--sp-20);
        }
        .inner {
            display: grid;
            grid-template-columns: 1.4fr 1fr 1fr 1fr;
            gap: var(--sp-8);
            max-width: var(--container-wide);
            margin-inline: auto;
            padding: var(--sp-12) var(--sp-6);
        }
        .col {
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
            min-width: 0;
        }
        .brand-col { gap: var(--sp-4); }
        .brand {
            display: inline-flex;
            align-items: center;
            gap: var(--sp-2);
            color: var(--text);
        }
        .mark {
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
            font-size: var(--fs-xl);
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1;
        }
        .tag {
            font-size: var(--fs-xs);
            color: var(--text-dim);
            margin-top: calc(-1 * var(--sp-1));
        }
        .tag a {
            color: var(--text-mute);
            text-decoration: none;
            transition: color var(--dur-fast) var(--ease-out);
        }
        .tag a:hover { color: var(--text); }

        .social-row {
            display: flex;
            gap: var(--sp-2);
            flex-wrap: wrap;
            margin-top: var(--sp-3);
        }
        .social-link {
            display: grid;
            place-items: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--bg-elev);
            border: 1px solid var(--border);
            color: var(--text-mute);
            text-decoration: none;
            transition: background var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out),
                        color var(--dur-fast) var(--ease-out),
                        transform var(--dur-fast) var(--ease-out);
        }
        .social-link:hover {
            border-color: var(--brand);
            color: var(--brand-strong);
            background: var(--brand-soft);
            transform: translateY(-2px);
        }
        .social-link[aria-disabled="true"] {
            opacity: 0.55;
            cursor: not-allowed;
        }
        .social-link[aria-disabled="true"]:hover {
            transform: none;
            background: var(--bg-elev);
        }
        .disc {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            line-height: 1.6;
            max-width: 36ch;
        }
        .col-title {
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            letter-spacing: var(--ls-wide);
            text-transform: uppercase;
            color: var(--text-dim);
        }
        .links {
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
        }
        .links a {
            font-size: var(--fs-sm);
            color: var(--text-mute);
            transition: color var(--dur-fast) var(--ease-out);
        }
        .links a:hover { color: var(--text); }

        .bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--sp-2);
            padding: var(--sp-4) var(--sp-6);
            border-top: 1px solid var(--border-soft);
            font-size: var(--fs-xs);
            color: var(--text-dim);
        }
        .sep { opacity: 0.5; }
        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--success);
            box-shadow: 0 0 8px color-mix(in oklch, var(--success) 60%, transparent);
        }

        @media (max-width: 720px) {
            .inner {
                grid-template-columns: 1fr 1fr;
                gap: var(--sp-6);
                padding: var(--sp-10) var(--sp-4);
            }
            .brand-col { grid-column: span 2; }
        }
    `],
})
export class PublicFooter {
    readonly year = new Date().getFullYear();
}
