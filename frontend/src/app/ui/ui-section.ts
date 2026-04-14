import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'ui-section',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [class]="containerClass()">
            @if (eyebrow() || title() || subtitle()) {
                <header class="head">
                    @if (eyebrow()) { <span class="eyebrow">{{ eyebrow() }}</span> }
                    @if (title()) { <h2 class="title display-3">{{ title() }}</h2> }
                    @if (subtitle()) { <p class="sub lead">{{ subtitle() }}</p> }
                </header>
            }
            <div class="body">
                <ng-content />
            </div>
        </div>
    `,
    host: {
        '[class.is-tight]': 'tight()',
        '[id]': 'sectionId() || null',
    },
    styles: [`
        :host {
            display: block;
            padding-block: clamp(var(--sp-16), 10vw, var(--sp-24));
        }
        :host(.is-tight) {
            padding-block: clamp(var(--sp-10), 6vw, var(--sp-16));
        }
        .head {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--sp-4);
            margin-bottom: var(--sp-12);
            max-width: 62ch;
        }
        .head.center {
            align-items: center;
            text-align: center;
            margin-inline: auto;
        }
        .title {
            margin: 0;
        }
        .sub {
            margin: 0;
        }
        .body {
            display: block;
        }

        :host[data-align="center"] .head {
            align-items: center;
            text-align: center;
            margin-inline: auto;
        }
    `],
})
export class UiSection {
    eyebrow = input<string>('');
    title = input<string>('');
    subtitle = input<string>('');
    sectionId = input<string>('');
    tight = input<boolean>(false);
    wide = input<boolean>(false);
    narrow = input<boolean>(false);

    containerClass(): string {
        if (this.wide()) return 'container-wide';
        if (this.narrow()) return 'container-narrow';
        return 'container';
    }
}
