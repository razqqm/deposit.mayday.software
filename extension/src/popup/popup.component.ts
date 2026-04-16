import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DepositTabComponent } from '../tabs/deposit/deposit-tab.component';
import { CaptureTabComponent } from '../tabs/capture/capture-tab.component';
import { DashboardTabComponent } from '../tabs/dashboard/dashboard-tab.component';

export type TabId = 'deposit' | 'capture' | 'dashboard';

@Component({
    selector: 'ext-popup',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule, DepositTabComponent, CaptureTabComponent, DashboardTabComponent],
    template: `
        <nav class="tabs">
            <button
                class="tab"
                [class.active]="activeTab() === 'deposit'"
                (click)="activeTab.set('deposit')"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {{ 'tabs.deposit' | translate }}
            </button>
            <button
                class="tab"
                [class.active]="activeTab() === 'capture'"
                (click)="activeTab.set('capture')"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {{ 'tabs.capture' | translate }}
            </button>
            <button
                class="tab"
                [class.active]="activeTab() === 'dashboard'"
                (click)="activeTab.set('dashboard')"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                {{ 'tabs.dashboard' | translate }}
            </button>
        </nav>

        <main class="content">
            @switch (activeTab()) {
                @case ('deposit') { <ext-deposit-tab /> }
                @case ('capture') { <ext-capture-tab /> }
                @case ('dashboard') { <ext-dashboard-tab /> }
            }
        </main>
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 500px;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border);
            background: var(--bg-elev);
            padding: 0 var(--sp-2);
            flex-shrink: 0;
        }
        .tab {
            display: flex;
            align-items: center;
            gap: var(--sp-2);
            padding: var(--sp-3) var(--sp-4);
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            font: inherit;
            font-size: var(--fs-xs);
            font-weight: var(--fw-semi);
            color: var(--text-mute);
            cursor: pointer;
            transition: color var(--dur-fast) var(--ease-out),
                        border-color var(--dur-fast) var(--ease-out);
            white-space: nowrap;
        }
        .tab:hover {
            color: var(--text);
        }
        .tab.active {
            color: var(--brand-strong);
            border-bottom-color: var(--brand);
        }
        .content {
            flex: 1;
            overflow-y: auto;
            padding: var(--sp-4);
        }
    `],
})
export class PopupComponent {
    activeTab = signal<TabId>('deposit');
}
