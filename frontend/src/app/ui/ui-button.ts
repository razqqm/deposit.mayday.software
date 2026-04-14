import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'mono' | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'ui-button,button[ui-button],a[ui-button]',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (loading()) {
            <span class="spin" aria-hidden="true"></span>
        }
        <ng-content />
    `,
    host: {
        '[class]': 'cls()',
        '[attr.disabled]': 'disabled() || loading() ? true : null',
        '[attr.aria-busy]': 'loading() ? "true" : null',
    },
    styles: [`
        :host {
            --btn-bg: var(--bg-elev);
            --btn-fg: var(--text);
            --btn-border: var(--border-strong);
            --btn-px: var(--sp-4);
            --btn-py: var(--sp-3);
            --btn-fs: var(--fs-sm);

            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--sp-2);
            padding: var(--btn-py) var(--btn-px);
            font-family: inherit;
            font-size: var(--btn-fs);
            font-weight: var(--fw-semi);
            line-height: 1;
            letter-spacing: var(--ls-snug);
            background: var(--btn-bg);
            color: var(--btn-fg);
            border: 1px solid var(--btn-border);
            border-radius: var(--r-md);
            cursor: pointer;
            user-select: none;
            white-space: nowrap;
            text-decoration: none;
            transition: background-color var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out),
                        color var(--dur-fast) var(--ease-out),
                        transform var(--dur-fast) var(--ease-out),
                        box-shadow var(--dur-fast) var(--ease-out);
        }
        :host:hover { transform: translateY(-1px); }
        :host:active { transform: translateY(0); }
        :host[disabled] {
            opacity: 0.55;
            cursor: not-allowed;
            pointer-events: none;
        }

        :host(.is-sm) { --btn-px: var(--sp-3); --btn-py: var(--sp-2); --btn-fs: var(--fs-xs); border-radius: var(--r-sm); }
        :host(.is-lg) { --btn-px: var(--sp-6); --btn-py: var(--sp-4); --btn-fs: var(--fs-base); border-radius: var(--r-lg); }

        :host(.v-primary) {
            --btn-bg: var(--text);
            --btn-fg: var(--bg);
            --btn-border: var(--text);
        }
        :host(.v-primary):hover {
            --btn-bg: color-mix(in oklch, var(--text) 88%, var(--bg));
            box-shadow: var(--shadow-md);
        }

        :host(.v-secondary) {
            --btn-bg: var(--bg-elev);
            --btn-fg: var(--text);
            --btn-border: var(--border-strong);
        }
        :host(.v-secondary):hover {
            --btn-bg: var(--bg-mute);
            --btn-border: var(--text);
        }

        :host(.v-ghost) {
            --btn-bg: transparent;
            --btn-fg: var(--text);
            --btn-border: transparent;
        }
        :host(.v-ghost):hover {
            --btn-bg: var(--bg-mute);
        }

        :host(.v-mono) {
            --btn-bg: var(--brand);
            --btn-fg: var(--brand-text);
            --btn-border: var(--brand);
        }
        :host(.v-mono):hover {
            --btn-bg: var(--brand-strong);
            --btn-border: var(--brand-strong);
            box-shadow: 0 0 0 4px var(--brand-glow);
        }

        :host(.v-danger) {
            --btn-bg: var(--danger-soft);
            --btn-fg: var(--danger);
            --btn-border: color-mix(in oklch, var(--danger) 40%, var(--border));
        }

        .spin {
            width: 1em;
            height: 1em;
            border: 2px solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            opacity: 0.9;
        }
    `],
})
export class UiButton {
    variant = input<UiButtonVariant>('secondary');
    size = input<UiButtonSize>('md');
    loading = input<boolean>(false);
    disabled = input<boolean>(false);

    cls = computed(() => `v-${this.variant()} is-${this.size()}`);
}
