import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { appRoutes } from './app.routes';
import Material from '@primeuix/themes/material';
import { definePreset, palette } from '@primeuix/themes';

const MaydayPreset = definePreset(Material, {
    primitive: {
        mayday: palette('#f59e0b')
    },
    semantic: {
        primary: {
            50: '{mayday.50}',
            100: '{mayday.100}',
            200: '{mayday.200}',
            300: '{mayday.300}',
            400: '{mayday.400}',
            500: '{mayday.500}',
            600: '{mayday.600}',
            700: '{mayday.700}',
            800: '{mayday.800}',
            900: '{mayday.900}',
            950: '{mayday.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{mayday.500}',
                    inverseColor: '#ffffff',
                    hoverColor: '{mayday.600}',
                    activeColor: '{mayday.700}'
                }
            },
            dark: {
                primary: {
                    color: '{mayday.300}',
                    inverseColor: '{mayday.950}',
                    hoverColor: '{mayday.200}',
                    activeColor: '{mayday.100}'
                }
            }
        }
    }
});

const I18N_VERSION = '2026-05-01.1';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(withFetch()),
        provideZonelessChangeDetection(),
        providePrimeNG({
            ripple: true,
            inputStyle: 'filled',
            theme: {
                preset: MaydayPreset,
                options: {
                    darkModeSelector: '.app-dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'tailwind-base, primeng, tailwind-utilities'
                    }
                }
            }
        }),
        provideTranslateService({
            defaultLanguage: 'en'
        }),
        provideTranslateHttpLoader({
            prefix: '/i18n/',
            suffix: `.json?v=${I18N_VERSION}`
        }),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            // Wait for the app to become idle before registering so we
            // don't compete with initial render / translation load.
            registrationStrategy: 'registerWhenStable:30000'
        })
    ]
};
