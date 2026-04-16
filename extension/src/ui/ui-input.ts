import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uidCounter = 0;

@Component({
    selector: 'ui-input',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInput), multi: true },
    ],
    template: `
        @if (label()) {
            <label [for]="uid" class="label">
                {{ label() }}
                @if (required()) { <span class="req" aria-hidden="true">*</span> }
            </label>
        }
        <div class="shell" [class.has-error]="!!error()">
            <input
                [id]="uid"
                [type]="type()"
                [placeholder]="placeholder()"
                [value]="inner()"
                [disabled]="disabled()"
                [attr.inputmode]="inputmode() || null"
                [attr.autocomplete]="autocomplete()"
                (input)="onInput($event)"
                (blur)="onTouched()"
            />
        </div>
        @if (hint() && !error()) { <p class="hint">{{ hint() }}</p> }
        @if (error()) { <p class="err">{{ error() }}</p> }
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
            width: 100%;
        }
        .label {
            font-size: var(--fs-sm);
            font-weight: var(--fw-medium);
            color: var(--text);
            letter-spacing: var(--ls-snug);
        }
        .req { color: var(--danger); margin-left: 2px; }
        .shell {
            display: flex;
            align-items: center;
            background: var(--bg-elev);
            border: 1px solid var(--border-strong);
            border-radius: var(--r-md);
            transition: border-color var(--dur-fast) var(--ease-out),
                        box-shadow var(--dur-fast) var(--ease-out);
        }
        .shell:focus-within {
            border-color: var(--brand);
            box-shadow: var(--ring);
        }
        .shell.has-error {
            border-color: var(--danger);
        }
        .shell.has-error:focus-within {
            box-shadow: var(--ring-danger);
        }
        input {
            flex: 1;
            min-width: 0;
            padding: var(--sp-3) var(--sp-4);
            background: transparent;
            border: none;
            outline: none;
            color: var(--text);
            font: inherit;
            font-size: var(--fs-sm);
        }
        input::placeholder { color: var(--text-dim); }
        input:disabled { opacity: 0.55; cursor: not-allowed; }
        .hint { font-size: var(--fs-xs); color: var(--text-mute); margin: 0; }
        .err { font-size: var(--fs-xs); color: var(--danger); margin: 0; }
    `],
})
export class UiInput implements ControlValueAccessor {
    label = input<string>('');
    placeholder = input<string>('');
    hint = input<string>('');
    error = input<string>('');
    type = input<'text' | 'email' | 'password' | 'url'>('text');
    required = input<boolean>(false);
    inputmode = input<'text' | 'email' | 'url' | 'numeric' | ''>('');
    autocomplete = input<string>('off');

    readonly uid = `ui-input-${++uidCounter}`;
    inner = signal<string>('');
    disabled = signal<boolean>(false);

    private onChange: (v: string) => void = () => {};
    onTouched: () => void = () => {};

    writeValue(v: string): void { this.inner.set(v ?? ''); }
    registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }
    setDisabledState(d: boolean): void { this.disabled.set(d); }

    onInput(e: Event): void {
        const v = (e.target as HTMLInputElement).value;
        this.inner.set(v);
        this.onChange(v);
    }
}
