import { Injectable, inject, signal, DOCUMENT, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs';
import { PrimeNG } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly translate = inject(TranslateService);
    private readonly primeng = inject(PrimeNG);
    private readonly document = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);

    readonly supportedLanguages = ['en', 'ru'];
    readonly currentLang = signal('en');
    private readonly seoByLang: Record<string, { title: string; description: string; ogTitle: string; ogDescription: string; locale: string }> = {
        en: {
            title: 'mayday.software — Prove you created it first',
            description: 'Hash your files locally. Anchor the proof in Bitcoin, Ethereum, and RFC 3161 timestamping authorities. Download a court-ready certificate. Free, no account, zero-knowledge.',
            ogTitle: 'Prove you created it first — without notaries',
            ogDescription: 'Cryptographic copyright deposit: local SHA-256 hashing + Bitcoin, Ethereum & RFC 3161 anchors = legal-grade proof that anyone can verify forever.',
            locale: 'en_US'
        },
        ru: {
            title: 'mayday.software — Докажи, что создал первым',
            description: 'Хешируй файлы локально. Зафиксируй доказательство в Bitcoin, Ethereum и RFC 3161. Скачай сертификат для суда. Бесплатно, без регистрации, zero-knowledge.',
            ogTitle: 'Докажи, что создал первым — без нотариусов',
            ogDescription: 'Криптографическое депонирование: SHA-256 в браузере + якоря Bitcoin, Ethereum и RFC 3161 = доказательство судебного уровня.',
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

        this.translate.onLangChange.pipe(
            switchMap(({ lang: newLang }) => {
                this.currentLang.set(newLang);
                this.document.documentElement.lang = newLang;
                this.applySeoTags(newLang);
                return this.translate.get('primeng');
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe(res => {
            if (res && typeof res === 'object') {
                this.primeng.setTranslation(res);
            }
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
        this.setMeta('property', 'og:image:alt', cfg.ogTitle);
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
