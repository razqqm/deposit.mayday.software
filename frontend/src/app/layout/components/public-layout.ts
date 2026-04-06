import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicTopbar } from './public-topbar';
import { PublicFooter } from './public-footer';
import { LanguageService } from '@/app/shared/services/language.service';
import { ThemeService } from '@/app/shared/services/theme.service';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [RouterOutlet, PublicTopbar, PublicFooter],
    template: `
        <div class="min-h-screen flex flex-col bg-surface-0 dark:bg-surface-950">
            <a class="skip-link" href="#main-content">Skip to main content</a>

            <header>
                <app-public-topbar />
            </header>

            <main id="main-content" class="flex-1 pt-12" role="main" aria-label="Main content">
                <router-outlet />
            </main>

            <footer>
                <app-public-footer />
            </footer>
        </div>
    `
})
export class PublicLayout implements OnInit {
    private readonly lang = inject(LanguageService);
    private readonly theme = inject(ThemeService);

    ngOnInit(): void {
        this.lang.init();
        this.theme.init();
    }
}
