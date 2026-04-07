import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-public-footer',
    standalone: true,
    imports: [TranslateModule],
    template: `
        <footer class="footer">
            <div class="footer-inner">
                <div class="footer-left">
                    <span class="copy">
                        <span class="dot" aria-hidden="true"></span>
                        © {{ year }} mayday.software
                    </span>
                    <span class="disc">{{ 'footer.disclaimer' | translate }}</span>
                </div>

                <div class="badges">
                    <a class="b" href="https://angular.dev" target="_blank" rel="noopener noreferrer" [title]="'footer.badge.angular' | translate">Angular</a>
                    <a class="b" href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" [title]="'footer.badge.typescript' | translate">TypeScript</a>
                    <a class="b" href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" [title]="'footer.badge.opentimestamps' | translate">OpenTimestamps</a>
                    <a class="b" href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" [title]="'footer.badge.bitcoin' | translate">Bitcoin</a>
                    <a class="b" href="https://citation-file-format.github.io" target="_blank" rel="noopener noreferrer" [title]="'footer.badge.citation' | translate">CITATION.cff</a>
                </div>
            </div>
        </footer>
    `,
    styles: [`
        .footer {
            background: var(--bg);
            border-top: 1px solid var(--border);
            margin-top: 4rem;
        }

        .footer-inner {
            max-width: 1180px;
            margin: 0 auto;
            padding: 1.4rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.5rem;
            flex-wrap: wrap;
        }

        @media (min-width: 768px) {
            .footer-inner { padding: 1.4rem 2rem; }
        }

        .footer-left {
            display: flex;
            align-items: center;
            gap: 0.9rem;
            flex-wrap: wrap;
            min-width: 0;
        }

        .copy {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-size: 0.74rem;
            font-weight: 600;
            color: var(--text-mute);
            letter-spacing: 0.01em;
            white-space: nowrap;
        }

        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--success);
            box-shadow: 0 0 8px color-mix(in oklch, var(--success) 60%, transparent);
        }

        .disc {
            font-size: 0.72rem;
            color: var(--text-dim);
            line-height: 1.45;
            max-width: 360px;
        }

        .badges {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            flex-wrap: wrap;
        }

        .b {
            display: inline-flex;
            align-items: center;
            padding: 0.32rem 0.65rem;
            border-radius: var(--r-sm);
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            text-decoration: none;
            color: var(--text-mute);
            background: transparent;
            border: 1px solid var(--border);
            transition: background var(--dur-fast) var(--ease-out),
                        color var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out);
        }

        .b:hover {
            background: var(--accent-soft);
            border-color: var(--accent);
            color: var(--text);
        }

        @media (max-width: 639px) {
            .footer-inner {
                flex-direction: column;
                align-items: flex-start;
            }
            .disc { display: none; }
        }
    `]
})
export class PublicFooter {
    readonly year = new Date().getFullYear();
}
