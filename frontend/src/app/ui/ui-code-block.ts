import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
    selector: 'ui-code-block',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (label()) {
            <div class="head">
                <span class="label">{{ label() }}</span>
                <button type="button" class="copy" (click)="copy()" [attr.aria-label]="'Copy'">
                    @if (copied()) { ✓ } @else { ⧉ }
                </button>
            </div>
        }
        <pre class="code"><code>{{ value() }}</code></pre>
        @if (!label()) {
            <button type="button" class="copy floating" (click)="copy()" [attr.aria-label]="'Copy'">
                @if (copied()) { ✓ } @else { ⧉ }
            </button>
        }
    `,
    styles: [`
        :host {
            position: relative;
            display: block;
            background: var(--bg-sunk);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            overflow: hidden;
        }
        .head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--sp-2) var(--sp-3);
            border-bottom: 1px solid var(--border);
            background: var(--bg-mute);
        }
        .label {
            font-size: var(--fs-xs);
            font-family: var(--font-mono);
            color: var(--text-mute);
            letter-spacing: var(--ls-mono);
        }
        .copy {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            padding: 2px 6px;
            border-radius: var(--r-xs);
            transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }
        .copy:hover { background: var(--bg-sunk); color: var(--text); }
        .copy.floating {
            position: absolute;
            top: var(--sp-2);
            right: var(--sp-2);
            background: var(--bg-elev);
            border: 1px solid var(--border);
        }
        pre {
            margin: 0;
            padding: var(--sp-3) var(--sp-4);
            font-family: var(--font-mono);
            font-size: var(--fs-xs);
            line-height: 1.6;
            color: var(--text);
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }
    `],
})
export class UiCodeBlock {
    value = input<string>('');
    label = input<string>('');

    copied = signal(false);

    async copy() {
        try {
            await navigator.clipboard.writeText(this.value());
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 1500);
        } catch {}
    }
}
