import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
    selector: 'ui-drop-zone',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <label
            class="zone"
            [class.is-dragging]="dragging()"
            [class.has-files]="hasFiles()"
            [class.is-compact]="compact()"
            [class.is-featured]="featured() && !hasFiles()"
            (dragenter)="onDragEnter($event)"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
        >
            <input
                type="file"
                [attr.accept]="accept() || null"
                [attr.multiple]="multiple() ? true : null"
                [attr.webkitdirectory]="directory() ? true : null"
                (change)="onChange($event)"
            />
            <span class="icon" aria-hidden="true">
                @if (icon() === 'file') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                } @else if (icon() === 'folder') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                } @else if (icon() === 'key') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                } @else if (icon() === 'shield') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                } @else if (icon() === 'pen') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                }
            </span>
            <span class="text">
                <span class="label">{{ label() }}</span>
                @if (summary()) {
                    <span class="summary">{{ summary() }}</span>
                } @else if (hint()) {
                    <span class="hint">{{ hint() }}</span>
                }
            </span>
            @if (hasFiles() && showClear()) {
                <button type="button" class="clear" (click)="clear($event)" aria-label="clear">×</button>
            }
        </label>
    `,
    styles: [`
        :host {
            display: block;
            width: 100%;
        }
        .zone {
            position: relative;
            display: flex;
            align-items: center;
            gap: var(--sp-4);
            padding: var(--sp-5) var(--sp-5);
            background: var(--bg-elev);
            border: 1px dashed var(--border-strong);
            border-radius: var(--r-md);
            cursor: pointer;
            transition: border-color var(--dur-fast) var(--ease-out),
                        background-color var(--dur-fast) var(--ease-out),
                        box-shadow var(--dur-fast) var(--ease-out);
            min-height: 64px;
        }
        .zone.is-compact { padding: var(--sp-3) var(--sp-4); min-height: 48px; }
        .zone:hover {
            border-color: var(--brand);
            background: color-mix(in oklch, var(--brand) 3%, var(--bg-elev));
        }
        .zone.is-dragging {
            border-color: var(--brand);
            border-style: solid;
            background: var(--brand-soft);
            box-shadow: var(--ring);
        }
        .zone.has-files {
            border-style: solid;
            border-color: color-mix(in oklch, var(--success) 50%, var(--border));
            background: var(--success-soft);
        }

        /* ──────────────────────────────────────────────────────────
           Featured state — primary page drop target.

           Transform-rotation technique (Safari / Firefox / Chrome all OK).
           Three layers inside the zone:
             ::before — an oversized square painted with a conic-gradient,
                         rotates with transform:rotate at 8s linear.
             ::after  — a solid inner fill inset by 1.5px, covers the
                         rotating gradient everywhere except the outermost
                         1.5px ring (so the rotation "leaks" only at the
                         border, making it look like a flowing edge).
             content  — bumped to z-index:2 so labels/icons sit on top.

           Outer ambient glow is done via box-shadow instead of a mask —
           no mask-composite quirks, works identically across browsers.

           One short lit arc (≈160° of the full 360°) means the eye sees a
           "run of light", not a rainbow — calm, not party lights.
           ────────────────────────────────────────────────────────── */
        /* ──────────────────────────────────────────────────────────
           Featured: a real solid amber frame that gently breathes —
           every 3.2s the border slightly deepens toward brand-strong
           and the amber glow expands 2-3px, then eases back. Contained
           entirely inside box-shadow (no bleeding blobs on the page) and
           needs no pseudo-elements, no conic gradients, no filters —
           identical in Safari / Firefox / Chrome.
           ────────────────────────────────────────────────────────── */
        .zone.is-featured {
            position: relative;
            border: 2px solid var(--brand);
            background: var(--bg-elev);
            animation: featured-breathe 3.2s ease-in-out infinite;
        }
        @keyframes featured-breathe {
            0%, 100% {
                border-color: var(--brand);
                box-shadow:
                    0 0 0 1px color-mix(in oklch, var(--brand) 18%, transparent),
                    0 0 16px -4px color-mix(in oklch, var(--brand) 28%, transparent);
            }
            50% {
                border-color: var(--brand-strong);
                box-shadow:
                    0 0 0 2px color-mix(in oklch, var(--brand) 34%, transparent),
                    0 0 26px -2px color-mix(in oklch, var(--brand) 52%, transparent);
            }
        }

        /* Hover / drag: lock to the fullest amber state. */
        .zone.is-featured:hover,
        .zone.is-featured.is-dragging {
            animation-play-state: paused;
            border-color: var(--brand-strong);
        }
        .zone.is-featured.is-dragging { background: var(--brand-soft); }

        @media (prefers-reduced-motion: reduce) {
            .zone.is-featured {
                animation: none;
                box-shadow:
                    0 0 0 1px color-mix(in oklch, var(--brand) 22%, transparent),
                    0 0 20px -4px color-mix(in oklch, var(--brand) 36%, transparent);
            }
        }
        input[type="file"] {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
        .icon {
            display: grid;
            place-items: center;
            width: 40px;
            height: 40px;
            border-radius: var(--r-md);
            background: var(--bg-sunk);
            color: var(--text-mute);
            flex-shrink: 0;
        }
        .zone.has-files .icon {
            background: color-mix(in oklch, var(--success) 12%, var(--bg-elev));
            color: var(--success);
        }
        .text {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
            flex: 1;
        }
        .label {
            font-size: var(--fs-sm);
            font-weight: var(--fw-semi);
            color: var(--text);
            letter-spacing: var(--ls-snug);
        }
        .summary {
            font-family: var(--font-mono);
            font-size: var(--fs-xs);
            color: var(--text-mute);
            letter-spacing: var(--ls-mono);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .hint {
            font-size: var(--fs-xs);
            color: var(--text-dim);
        }
        .clear {
            width: 24px;
            height: 24px;
            border-radius: var(--r-full);
            display: grid;
            place-items: center;
            background: var(--bg-elev);
            border: 1px solid var(--border);
            color: var(--text-mute);
            font-size: 18px;
            line-height: 1;
            z-index: 2;
            transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
        }
        .clear:hover { color: var(--danger); border-color: var(--danger); }
    `],
})
export class UiDropZone {
    label = input.required<string>();
    hint = input<string>('');
    accept = input<string>('');
    multiple = input<boolean>(false);
    directory = input<boolean>(false);
    icon = input<'file' | 'folder' | 'key' | 'shield' | 'pen' | 'upload'>('upload');
    files = input<File[] | File | null>(null);
    compact = input<boolean>(false);
    showClear = input<boolean>(true);
    /**
     * Turn on when this drop-zone is the page's primary call to action.
     * Adds a slow (8s) conic-gradient shimmer around the border plus a
     * soft ambient glow behind the card, so the eye finds the target
     * without feeling pressured. Disabled once files are loaded and
     * auto-disabled for `prefers-reduced-motion: reduce`.
     */
    featured = input<boolean>(false);

    readonly filesChange = output<File[]>();

    dragging = signal(false);

    hasFiles = computed(() => {
        const f = this.files();
        if (!f) return false;
        return Array.isArray(f) ? f.length > 0 : true;
    });

    summary = computed(() => {
        const f = this.files();
        if (!f) return '';
        if (Array.isArray(f)) {
            if (f.length === 0) return '';
            if (f.length === 1) return `${f[0].name} · ${this.fmtSize(f[0].size)}`;
            const total = f.reduce((s, x) => s + x.size, 0);
            return `${f.length} files · ${this.fmtSize(total)}`;
        }
        return `${f.name} · ${this.fmtSize(f.size)}`;
    });

    onChange(e: Event): void {
        const list = (e.target as HTMLInputElement).files;
        if (!list) return;
        this.filesChange.emit(Array.from(list));
    }

    onDragEnter(e: DragEvent): void { e.preventDefault(); this.dragging.set(true); }
    onDragOver(e: DragEvent): void { e.preventDefault(); this.dragging.set(true); }
    onDragLeave(e: DragEvent): void { e.preventDefault(); this.dragging.set(false); }
    onDrop(e: DragEvent): void {
        e.preventDefault();
        this.dragging.set(false);
        const items = e.dataTransfer?.files;
        if (!items) return;
        this.filesChange.emit(Array.from(items));
    }

    clear(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        this.filesChange.emit([]);
    }

    private fmtSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }
}
