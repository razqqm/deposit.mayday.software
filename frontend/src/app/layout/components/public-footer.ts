import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../shared/services/language.service';

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

                    <nav class="social-row" [attr.aria-label]="'footer.followUs' | translate">
                        <a class="social-link"
                           href="https://github.com/razqqm/deposit.mayday.software"
                           target="_blank" rel="noopener noreferrer"
                           [attr.aria-label]="'footer.social.github' | translate"
                           [title]="'footer.social.github' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.83-.26.83-.58v-2.05c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .3"/></svg>
                        </a>
                        <a class="social-link"
                           [href]="websiteUrl()"
                           target="_blank" rel="noopener noreferrer"
                           [attr.aria-label]="'footer.social.website' | translate"
                           [title]="'footer.social.website' | translate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
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
                        <li><a href="https://github.com/razqqm/deposit.mayday.software" target="_blank" rel="noopener noreferrer">GitHub</a></li>
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

                <div class="badges">
                    <a class="b b--angular" href="https://angular.dev" target="_blank" rel="noopener noreferrer" title="Angular">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.247L23.32 3.982 11.999.0zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z"/></svg>
                        Angular
                    </a>
                    <a class="b b--ts" href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" title="TypeScript">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>
                        TypeScript
                    </a>
                    <a class="b b--btc" href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" title="Bitcoin">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.7-.17-1.053-.252l.53-2.12-1.313-.33-.54 2.152c-.286-.065-.567-.13-.84-.2l.001-.007-1.812-.452-.35 1.407s.975.224.955.238c.535.136.63.494.614.778l-.614 2.456c.037.01.083.024.135.046l-.137-.035-.86 3.456c-.065.16-.23.4-.6.308.013.02-.956-.239-.956-.239l-.652 1.514 1.71.427.937.24-.546 2.19 1.313.328.54-2.157c.36.1.708.19 1.05.273l-.538 2.155 1.315.33.546-2.183c2.245.424 3.93.253 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.867-.2 1.52-.77 1.694-1.94z"/></svg>
                        Bitcoin
                    </a>
                    <a class="b b--ots" href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" title="OpenTimestamps">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        OTS
                    </a>
                </div>
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

        .badges {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: auto;
        }
        .b {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px 2px 5px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.2px;
            text-decoration: none;
            color: var(--text-mute);
            background: var(--bg-elev);
            border: 1px solid var(--border);
            transition: background .2s, color .2s, border-color .2s;
            line-height: 1.4;
            white-space: nowrap;
        }
        .b svg { flex-shrink: 0; opacity: .65; }
        .b:hover { color: var(--text); }
        .b:hover svg { opacity: 1; }
        .b--angular:hover { background: rgba(221,0,49,.2);  border-color: rgba(221,0,49,.4); }
        .b--ts:hover      { background: rgba(49,120,198,.2); border-color: rgba(49,120,198,.4); }
        .b--btc:hover     { background: rgba(247,147,26,.2); border-color: rgba(247,147,26,.4); }
        .b--ots:hover     { background: rgba(26,115,232,.2); border-color: rgba(26,115,232,.4); }

        @media (max-width: 720px) {
            .inner {
                grid-template-columns: 1fr 1fr;
                gap: var(--sp-6);
                padding: var(--sp-10) var(--sp-4);
            }
            .brand-col { grid-column: span 2; }
            .bar { flex-wrap: wrap; }
            .badges { margin-left: 0; }
        }
    `],
})
export class PublicFooter {
    private readonly lang = inject(LanguageService);
    readonly year = new Date().getFullYear();
    readonly websiteUrl = computed(() => this.lang.currentLang() === 'ru' ? 'https://ilia.ae/' : 'https://ilia.ae/en/');
}
