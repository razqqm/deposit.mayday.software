import { Injectable, inject, signal, DOCUMENT } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly translate = inject(TranslateService);
    private readonly primeng = inject(PrimeNG);
    private readonly document = inject(DOCUMENT);

    readonly supportedLanguages = ['en', 'ru'];
    readonly currentLang = signal('en');
    private readonly seoByLang: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string; locale: string }> = {
        en: {
            title: 'mayday.software — Cryptographic Copyright Deposit',
            description: 'Sign your source code locally and anchor the proof in Bitcoin. Get a verifiable certificate of ownership without notaries.',
            ogTitle: 'Prove your code is yours — without notaries',
            ogDescription: 'Cryptographic copyright deposit for source code. Local signing + Bitcoin timestamping = a certificate that anyone can verify forever.',
            locale: 'en_US'
        },
        ru: {
            title: 'mayday.software — Криптографическое депонирование авторских прав',
            description: 'Подпиши исходный код локально и зафиксируй доказательство в Bitcoin. Сертификат владения без нотариусов.',
            ogTitle: 'Докажи, что код твой — без нотариусов',
            ogDescription: 'Криптографическое депонирование исходного кода: локальная подпись и Bitcoin-таймштамп.',
            locale: 'ru_RU'
        }
    };

    init(): void {
        this.translate.addLangs(this.supportedLanguages);
        this.translate.setDefaultLang('en');

        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
        const browserLang = this.translate.getBrowserLang();
        const lang = saved || (this.supportedLanguages.includes(browserLang ?? '') ? browserLang! : 'en');

        this.use(lang);

        this.translate.onLangChange.subscribe(({ lang: newLang }) => {
            this.currentLang.set(newLang);
            this.document.documentElement.lang = newLang;
            this.applySeoTags(newLang);
            this.translate.get('primeng').subscribe(res => {
                if (res && typeof res === 'object') {
                    this.primeng.setTranslation(res);
                }
            });
        });
    }

    switchLanguage(): void {
        const next = this.currentLang() === 'en' ? 'ru' : 'en';
        this.use(next);
    }

    use(lang: string): void {
        if (this.supportedLanguages.includes(lang)) {
            this.translate.use(lang);
            this.currentLang.set(lang);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('lang', lang);
            }
        }
    }

    private applySeoTags(lang: string): void {
        const cfg = this.seoByLang[lang] ?? this.seoByLang['en'];
        this.document.title = cfg.title;

        this.setMeta('name', 'description', cfg.description);
        this.setMeta('property', 'og:title', cfg.ogTitle);
        this.setMeta('property', 'og:description', cfg.ogDescription);
        this.setMeta('property', 'og:locale', cfg.locale);
        this.setMeta('name', 'twitter:title', cfg.ogTitle);
        this.setMeta('name', 'twitter:description', cfg.ogDescription);
    }

    private setMeta(attr: 'name' | 'property', key: string, value: string): void {
        const selector = `meta[${attr}="${key}"]`;
        const meta = this.document.head.querySelector(selector);
        if (meta) {
            meta.setAttribute('content', value);
            return;
        }

        const newMeta = this.document.createElement('meta');
        newMeta.setAttribute(attr, key);
        newMeta.setAttribute('content', value);
        this.document.head.appendChild(newMeta);
    }
}
