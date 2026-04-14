import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
    selector: 'ui-progress',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="track" [attr.role]="'progressbar'"
             [attr.aria-valuemin]="0" [attr.aria-valuemax]="100" [attr.aria-valuenow]="pct()">
            <div class="fill" [style.width.%]="pct()"></div>
        </div>
        @if (showLabel()) {
            <span class="label mono">{{ pct() }}%</span>
        }
    `,
    styles: [`
        :host {
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            width: 100%;
        }
        .track {
            flex: 1;
            height: 4px;
            background: var(--bg-mute);
            border-radius: var(--r-full);
            overflow: hidden;
        }
        .fill {
            height: 100%;
            background: var(--brand);
            border-radius: var(--r-full);
            transition: width var(--dur-base) var(--ease-out);
        }
        .label {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            min-width: 3ch;
            text-align: right;
        }
    `],
})
export class UiProgress {
    value = input<number>(0);
    showLabel = input<boolean>(false);

    pct = computed(() => Math.max(0, Math.min(100, Math.round(this.value()))));
}
