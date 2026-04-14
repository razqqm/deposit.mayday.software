import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Subtle brand-accent gradient mesh for hero decor only.
 * Single instance per page — never used outside hero.
 */
@Component({
    selector: 'ui-mesh',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="mesh" aria-hidden="true">
            <span class="blob b1"></span>
            <span class="blob b2"></span>
            <span class="blob b3"></span>
        </div>
        <div class="grid" aria-hidden="true"></div>
    `,
    host: { '[class.is-subtle]': 'subtle()' },
    styles: [`
        :host {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        }
        .mesh {
            position: absolute;
            inset: -10%;
            filter: blur(80px);
            opacity: 0.6;
        }
        :host(.is-subtle) .mesh { opacity: 0.35; }

        .blob {
            position: absolute;
            border-radius: 50%;
        }
        .b1 {
            width: 420px; height: 420px;
            background: var(--brand);
            top: -10%; left: 10%;
            opacity: 0.55;
            animation: mesh-float 14s var(--ease-in-out) infinite;
        }
        .b2 {
            width: 520px; height: 520px;
            background: color-mix(in oklch, var(--brand) 60%, var(--bg));
            top: 30%; right: 5%;
            opacity: 0.45;
            animation: mesh-float 18s var(--ease-in-out) infinite reverse;
        }
        .b3 {
            width: 360px; height: 360px;
            background: color-mix(in oklch, var(--brand) 35%, var(--bg));
            bottom: -20%; left: 40%;
            opacity: 0.4;
            animation: mesh-float 16s var(--ease-in-out) infinite;
        }

        .grid {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(to right, color-mix(in oklch, var(--text) 4%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in oklch, var(--text) 4%, transparent) 1px, transparent 1px);
            background-size: 56px 56px;
            mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 35%, transparent 75%);
            -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 35%, transparent 75%);
        }
    `],
})
export class UiMesh {
    subtle = input<boolean>(false);
}
