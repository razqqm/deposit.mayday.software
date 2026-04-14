import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UiSection } from '@/app/ui';

/**
 * Single component renders both the Privacy and Terms boilerplate pages.
 * Which one is shown depends on the route data `kind` ('privacy' | 'terms').
 *
 * The content lives entirely in i18n (privacy.* / terms.*) so a lawyer can
 * edit JSON files without touching code. Both share an identical layout —
 * eyebrow + title + subtitle + boilerplate notice + numbered sections.
 */
@Component({
    selector: 'app-legal',
    standalone: true,
    imports: [TranslateModule, UiSection],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './legal.html',
    styleUrl: './legal.scss',
})
export class LegalPage {
    /** Optional input — when used as a routed component with `data: { kind }`. */
    kindInput = input<'privacy' | 'terms' | null>(null);

    private readonly route = inject(ActivatedRoute);
    private readonly routeData = toSignal(this.route.data, { initialValue: { kind: 'privacy' } as { kind?: string } });

    readonly kind = computed<'privacy' | 'terms'>(() => {
        const fromInput = this.kindInput();
        if (fromInput) return fromInput;
        return (this.routeData()?.['kind'] as 'privacy' | 'terms' | undefined) ?? 'privacy';
    });

    /** Section keys hN/pN — privacy has 7 numbered sections, terms has 8. */
    readonly sections = computed<number[]>(() => {
        return this.kind() === 'privacy'
            ? [1, 2, 3, 4, 5, 6, 7]
            : [1, 2, 3, 4, 5, 6, 7, 8];
    });

    headingKey(n: number): string {
        return `${this.kind()}.h${n}`;
    }

    paragraphKey(n: number): string {
        return `${this.kind()}.p${n}`;
    }
}
