import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Adds a `data-reveal` attribute to the host element so it picks up
 * the global hidden styling, then sets `is-visible` once the element
 * has scrolled into view. Used for soft reveal-on-scroll across the
 * landing page. Falls back to permanently visible if IntersectionObserver
 * is unavailable.
 */
@Directive({
    selector: '[appReveal]',
    standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
    private readonly host = inject(ElementRef<HTMLElement>);
    private observer?: IntersectionObserver;

    ngOnInit(): void {
        const el = this.host.nativeElement;
        el.setAttribute('data-reveal', '');

        if (typeof IntersectionObserver === 'undefined') {
            el.classList.add('is-visible');
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        this.observer?.unobserve(entry.target);
                    }
                }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
        );
        this.observer.observe(el);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}
