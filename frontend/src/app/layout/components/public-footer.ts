import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-public-footer',
    standalone: true,
    imports: [TranslateModule],
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
