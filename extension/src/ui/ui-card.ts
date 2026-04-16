import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'ui-card',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (eyebrow() || title() || subtitle()) {
            <header class="head">
                @if (eyebrow()) { <span class="eyebrow">{{ eyebrow() }}</span> }
                @if (title()) { <h3 class="title">{{ title() }}</h3> }
                @if (subtitle()) { <p class="sub">{{ subtitle() }}</p> }
            </header>
        }
        <div class="body">
            <ng-content />
        </div>
        <ng-content select="[slot=footer]" />
    `,
    host: {
        '[class.is-interactive]': 'interactive()',
        '[class.is-flat]': 'flat()',
        '[class.is-elevated]': 'elevated()',
    },
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
            padding: var(--sp-6);
            background: var(--bg-elev);
            border: 1px solid var(--border);
            border-radius: var(--r-lg);
            transition: border-color var(--dur-fast) var(--ease-out),
                        box-shadow var(--dur-fast) var(--ease-out),
                        transform var(--dur-fast) var(--ease-out);
        }
        :host(.is-flat) { background: transparent; }
        :host(.is-elevated) { box-shadow: var(--shadow-md); }
        :host(.is-interactive) { cursor: pointer; }
        :host(.is-interactive):hover {
            border-color: var(--border-strong);
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        .head {
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
        }
        .eyebrow {
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            letter-spacing: var(--ls-wide);
            text-transform: uppercase;
            color: var(--text-mute);
        }
        .title {
            font-size: var(--fs-xl);
            font-weight: var(--fw-semi);
            line-height: var(--lh-snug);
            letter-spacing: var(--ls-snug);
            margin: 0;
            color: var(--text);
        }
        .sub {
            font-size: var(--fs-sm);
            color: var(--text-mute);
            line-height: var(--lh-base);
            margin: 0;
        }
        .body {
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
        }
    `],
})
export class UiCard {
    eyebrow = input<string>('');
    title = input<string>('');
    subtitle = input<string>('');
    interactive = input<boolean>(false);
    flat = input<boolean>(false);
    elevated = input<boolean>(false);
}
