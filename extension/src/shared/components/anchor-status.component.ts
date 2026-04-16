import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiStatusDot } from '../../ui/ui-status-dot';
import { UiBadge } from '../../ui/ui-badge';
import type { AnchorAttestation } from '../../deposit/anchors/anchor';

@Component({
    selector: 'ext-anchor-status',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule, UiStatusDot, UiBadge],
    template: `
        @for (a of attestations(); track a.provider) {
            <div class="row">
                <ui-status-dot [state]="dotState(a)" />
                <span class="provider">{{ a.providerLabel }}</span>
                <ui-badge [tone]="badgeTone(a)" [dot]="false">
                    {{ 'anchors.' + a.status | translate }}
                </ui-badge>
            </div>
        }
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--sp-2);
        }
        .row {
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            padding: var(--sp-2) 0;
        }
        .provider {
            flex: 1;
            font-size: var(--fs-xs);
            color: var(--text);
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `],
})
export class AnchorStatusComponent {
    attestations = input.required<AnchorAttestation[]>();

    dotState(a: AnchorAttestation): 'idle' | 'pending' | 'ok' | 'fail' {
        switch (a.status) {
            case 'confirmed': return 'ok';
            case 'failed': return 'fail';
            case 'submitting': return 'pending';
            default: return 'idle';
        }
    }

    badgeTone(a: AnchorAttestation): 'neutral' | 'brand' | 'success' | 'danger' {
        switch (a.status) {
            case 'confirmed': return 'success';
            case 'failed': return 'danger';
            case 'submitting': return 'brand';
            default: return 'neutral';
        }
    }
}
