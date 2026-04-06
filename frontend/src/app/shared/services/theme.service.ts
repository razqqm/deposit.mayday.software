import { Injectable, inject, signal, computed, DOCUMENT, OnDestroy } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly STORAGE_KEY = 'theme';

    readonly mode = signal<ThemeMode>('auto');
    readonly isDark = signal(false);

    readonly icon = computed(() => {
        const m = this.mode();
        if (m === 'light') return 'pi-sun';
        if (m === 'dark') return 'pi-moon';
        return '';
    });

    readonly isAuto = computed(() => this.mode() === 'auto');

    private mediaQuery: MediaQueryList | null = null;
    private mediaListener = (e: MediaQueryListEvent) => {
        if (this.mode() === 'auto') {
            this.applyDark(e.matches);
        }
    };

    init(): void {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null : null;
        const mode = saved && ['light', 'dark', 'auto'].includes(saved) ? saved : 'auto';

        if (typeof window !== 'undefined') {
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.mediaQuery.addEventListener('change', this.mediaListener);
        }

        this.mode.set(mode);
        this.applyMode(mode);
    }

    ngOnDestroy(): void {
        this.mediaQuery?.removeEventListener('change', this.mediaListener);
    }

    cycle(): void {
        const order: ThemeMode[] = ['light', 'dark', 'auto'];
        const next = order[(order.indexOf(this.mode()) + 1) % order.length];
        this.setMode(next);
    }

    setMode(mode: ThemeMode): void {
        this.mode.set(mode);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, mode);
        }
        this.applyMode(mode);
    }

    private applyMode(mode: ThemeMode): void {
        if (mode === 'auto') {
            const prefersDark = this.mediaQuery?.matches ?? false;
            this.applyDark(prefersDark);
        } else {
            this.applyDark(mode === 'dark');
        }
    }

    private applyDark(dark: boolean): void {
        const el = this.document.documentElement;
        if (dark) {
            el.classList.add('app-dark');
        } else {
            el.classList.remove('app-dark');
        }
        this.isDark.set(dark);
    }
}
