import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiDotState = 'idle' | 'pending' | 'ok' | 'fail';

@Component({
    selector: 'ui-status-dot',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span class="dot" aria-hidden="true"></span>`,
    host: {
        '[class]': '"s-" + state()',
        '[attr.role]': '"status"',
        '[attr.aria-label]': 'state()',
    },
    styles: [`
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 0.75rem;
            height: 0.75rem;
        }
        .dot {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            background: var(--text-dim);
            box-shadow: 0 0 0 0 transparent;
            transition: background-color var(--dur-base) var(--ease-out);
        }
        :host(.s-pending) .dot {
            background: var(--brand);
            animation: pulse-dot 1.3s var(--ease-in-out) infinite;
            box-shadow: 0 0 0 3px var(--brand-glow);
        }
        :host(.s-ok) .dot {
            background: var(--success);
            box-shadow: 0 0 0 3px color-mix(in oklch, var(--success) 22%, transparent);
        }
        :host(.s-fail) .dot {
            background: var(--danger);
            box-shadow: 0 0 0 3px color-mix(in oklch, var(--danger) 22%, transparent);
        }
    `],
})
export class UiStatusDot {
    state = input<UiDotState>('idle');
}
