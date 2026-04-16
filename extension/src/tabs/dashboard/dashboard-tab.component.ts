import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UiCard } from '../../ui/ui-card';
import { UiButton } from '../../ui/ui-button';
import { UiBadge } from '../../ui/ui-badge';
import { ExtensionStorageService, DepositRecord } from '../../shared/services/extension-storage.service';

@Component({
    selector: 'ext-dashboard-tab',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule, UiCard, UiButton, UiBadge],
    template: `
        <div class="header">
            <h2 class="title">{{ 'dashboard.title' | translate }}</h2>
            @if (storage.depositCount() > 0) {
                <ui-badge tone="brand" [dot]="true">
                    {{ storage.depositCount() }} {{ 'dashboard.totalDeposits' | translate }}
                </ui-badge>
            }
        </div>

        @if (storage.deposits().length === 0) {
            <div class="empty">
                <p class="empty-title">{{ 'dashboard.empty' | translate }}</p>
                <p class="empty-hint">{{ 'dashboard.emptyHint' | translate }}</p>
            </div>
        } @else {
            <div class="list">
                @for (record of storage.deposits(); track record.digest) {
                    <ui-card>
                        <div class="record-header">
                            <span class="record-title truncate">{{ record.title }}</span>
                            <span class="record-version mono">v{{ record.version }}</span>
                        </div>
                        <div class="record-meta">
                            <span>{{ record.fileCount }} {{ 'dashboard.files' | translate }}</span>
                            <span>·</span>
                            <span>{{ formatSize(record.totalSize) }}</span>
                            <span>·</span>
                            <span>{{ confirmedCount(record) }}/{{ record.anchors.length }} {{ 'dashboard.anchors' | translate }}</span>
                        </div>
                        <div class="record-time mono">{{ formatDate(record.timestamp) }}</div>
                        <code class="record-hash mono truncate">{{ record.digest }}</code>
                    </ui-card>
                }
            </div>
        }

        <a
            ui-button
            variant="ghost"
            href="https://deposit.mayday.software"
            target="_blank"
            rel="noopener"
            class="open-site"
        >
            {{ 'dashboard.openSite' | translate }}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-3);
        }
        .title {
            font-size: var(--fs-lg);
            font-weight: var(--fw-semi);
            color: var(--text);
            margin: 0;
        }
        .empty {
            text-align: center;
            padding: var(--sp-8) var(--sp-4);
        }
        .empty-title {
            font-size: var(--fs-base);
            font-weight: var(--fw-semi);
            color: var(--text-mute);
            margin: 0 0 var(--sp-2);
        }
        .empty-hint {
            font-size: var(--fs-sm);
            color: var(--text-dim);
            margin: 0;
        }
        .list {
            display: flex;
            flex-direction: column;
            gap: var(--sp-3);
        }
        .record-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--sp-2);
        }
        .record-title {
            font-size: var(--fs-sm);
            font-weight: var(--fw-semi);
            color: var(--text);
            flex: 1;
            min-width: 0;
        }
        .record-version {
            font-size: var(--fs-xs);
            color: var(--text-mute);
            flex-shrink: 0;
        }
        .record-meta {
            display: flex;
            gap: var(--sp-2);
            font-size: var(--fs-xs);
            color: var(--text-mute);
        }
        .record-time {
            font-size: var(--fs-xs);
            color: var(--text-dim);
        }
        .record-hash {
            font-size: 10px;
            color: var(--text-dim);
            display: block;
            max-width: 100%;
        }
        .open-site {
            align-self: center;
            margin-top: var(--sp-2);
        }
    `],
})
export class DashboardTabComponent {
    readonly storage = inject(ExtensionStorageService);

    confirmedCount(record: DepositRecord): number {
        return record.anchors.filter((a) => a.status === 'confirmed').length;
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    formatDate(iso: string): string {
        try {
            return new Date(iso).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return iso;
        }
    }
}
