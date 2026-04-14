import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiBadgeTone = 'neutral' | 'brand' | 'success' | 'danger' | 'info';

@Component({
    selector: 'ui-badge',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<ng-content />`,
    host: { '[class]': '"t-" + tone() + (dot() ? " has-dot" : "")' },
    styles: [`
        :host {
            display: inline-flex;
            align-items: center;
            gap: var(--sp-2);
            padding: var(--sp-1) var(--sp-3);
            border-radius: var(--r-full);
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            letter-spacing: var(--ls-snug);
            line-height: 1.4;
            white-space: nowrap;
            border: 1px solid var(--border);
            background: var(--bg-elev);
            color: var(--text-mute);
        }
        :host(.t-brand) {
            background: var(--brand-soft);
            color: var(--brand-strong);
            border-color: color-mix(in oklch, var(--brand) 30%, var(--border));
        }
        :host(.t-success) {
            background: var(--success-soft);
            color: var(--success);
            border-color: color-mix(in oklch, var(--success) 30%, var(--border));
        }
        :host(.t-danger) {
            background: var(--danger-soft);
            color: var(--danger);
            border-color: color-mix(in oklch, var(--danger) 30%, var(--border));
        }
        :host(.t-info) {
            background: var(--info-soft);
            color: var(--info);
            border-color: color-mix(in oklch, var(--info) 30%, var(--border));
        }
        :host(.has-dot)::before {
            content: '';
            width: 6px; height: 6px;
            border-radius: 50%;
            background: currentColor;
        }
    `],
})
export class UiBadge {
    tone = input<UiBadgeTone>('neutral');
    dot = input<boolean>(false);
}
