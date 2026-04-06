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
                        <span class="dot"></span>
                        {{ year }}
                    </span>
                    <span class="disc">{{ 'footer.disclaimer' | translate }}</span>
                </div>

                <div class="badges">
                    <a class="b b--angular" href="https://angular.dev" target="_blank" rel="noopener noreferrer" title="Angular 21">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.247L23.32 3.982 11.999.0zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z"/></svg>
                        Angular
                    </a>
                    <a class="b b--ts" href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" title="TypeScript">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>
                        TypeScript
                    </a>
                    <a class="b b--tw" href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" title="Tailwind CSS">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c.913,.228,1.565,.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8-1.2,1.6-2.6,2.2-4.2,1.8-.913-.228-1.565-.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8ZM6.001,12c-3.2,0-5.2,1.6-6,4.8,1.2-1.6,2.6-2.2,4.2-1.8,.913,.228,1.565,.89,2.288,1.624,1.177,1.194,2.538,2.576,5.512,2.576,3.2,0,5.2-1.6,6-4.8-1.2,1.6-2.6,2.2-4.2,1.8-.913-.228-1.565-.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12Z"/></svg>
                        Tailwind
                    </a>
                    <a class="b b--ots" href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" title="OpenTimestamps">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z"/></svg>
                        OpenTimestamps
                    </a>
                    <a class="b b--btc" href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" title="Bitcoin">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.351-4.625c.252-1.677-1.027-2.58-2.778-3.182l.567-2.276-1.386-.345-.553 2.214c-.364-.09-.738-.176-1.11-.262l.557-2.232L11.198 4.5l-.566 2.276c-.302-.069-.598-.137-.886-.208v-.007L7.834 6.085l-.369 1.482s1.027.235 1.005.249c.561.14.662.51.645.806L8.99 11.46c.039.01.09.024.146.046l-.149-.037-.905 3.626c-.069.17-.243.426-.636.328.014.02-1.006-.252-1.006-.252l-.688 1.589 1.806.45c.336.084.665.172.99.255l-.572 2.302 1.385.345.567-2.279c.378.103.745.197 1.105.286l-.566 2.27 1.387.346.572-2.297c2.366.448 4.143.267 4.892-1.872.604-1.722-.03-2.715-1.273-3.362.906-.21 1.589-.806 1.771-2.038zm-3.166 4.443c-.43 1.722-3.327.79-4.265.557l.76-3.05c.94.236 3.953.7 3.505 2.493zm.43-4.469c-.392 1.566-2.802.77-3.582.575l.69-2.766c.78.196 3.302.563 2.892 2.191z"/></svg>
                        Bitcoin
                    </a>
                    <a class="b b--cff" href="https://citation-file-format.github.io" target="_blank" rel="noopener noreferrer" title="Citation File Format">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9z"/></svg>
                        CITATION.cff
                    </a>
                </div>
            </div>
        </footer>
    `,
    styles: [`
        .footer {
            background: #0b0f1a;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .footer-inner {
            max-width: 1100px;
            margin: 0 auto;
            padding: .55rem 1rem;
            display: flex;
            align-items: center;
            gap: .8rem;
        }

        @media (min-width: 768px) {
            .footer-inner { padding: .55rem 1.5rem; }
        }

        .footer-left {
            display: flex;
            align-items: center;
            gap: .6rem;
            min-width: 0;
        }

        .copy {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            font-size: .62rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.3);
            letter-spacing: .04em;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .dot {
            width: 4px; height: 4px;
            border-radius: 50%;
            background: rgba(6, 182, 212, 0.5);
        }

        .disc {
            font-size: .55rem;
            color: rgba(255, 255, 255, 0.18);
            line-height: 1.35;
            flex: 1;
            min-width: 0;
        }

        .badges {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
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
            color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.07);
            transition: background .2s, color .2s, border-color .2s;
            line-height: 1.4;
            white-space: nowrap;
        }

        .b svg { flex-shrink: 0; opacity: .65; }
        .b:hover { color: #fff; }
        .b:hover svg { opacity: 1; }

        .b--angular:hover { background: rgba(221,0,49,.35); border-color: rgba(221,0,49,.5); }
        .b--ts:hover      { background: rgba(49,120,198,.35); border-color: rgba(49,120,198,.5); }
        .b--tw:hover      { background: rgba(6,182,212,.28); border-color: rgba(6,182,212,.45); }
        .b--ots:hover     { background: rgba(245,158,11,.3); border-color: rgba(245,158,11,.5); }
        .b--btc:hover     { background: rgba(247,147,26,.35); border-color: rgba(247,147,26,.55); }
        .b--cff:hover     { background: rgba(99,102,241,.3); border-color: rgba(99,102,241,.5); }

        @media (max-width: 639px) {
            .disc { display: none; }
        }
    `]
})
export class PublicFooter {
    readonly year = new Date().getFullYear();
}
