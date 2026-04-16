import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import en from './i18n/en.json';
import ru from './i18n/ru.json';

const TRANSLATIONS: Record<string, TranslationObject> = { en, ru } as Record<string, TranslationObject>;

class InlineTranslateLoader extends TranslateLoader {
    getTranslation(lang: string): Observable<TranslationObject> {
        return of(TRANSLATIONS[lang] ?? TRANSLATIONS['en']);
    }
}

/** Detect browser UI language, fallback to 'en'. */
function detectLanguage(): string {
    const lang = navigator.language?.slice(0, 2) ?? 'en';
    return lang in TRANSLATIONS ? lang : 'en';
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideAnimationsAsync(),
        ...TranslateModule.forRoot({
            defaultLanguage: detectLanguage(),
            loader: { provide: TranslateLoader, useClass: InlineTranslateLoader },
        }).providers!,
    ],
};
