import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardTabComponent } from './dashboard-tab.component';
import { ExtensionStorageService, DepositRecord } from '../../shared/services/extension-storage.service';

class FakeLoader extends TranslateLoader {
    getTranslation(): Observable<any> {
        return of({
            dashboard: {
                title: 'History', empty: 'No deposits', emptyHint: 'Create one',
                totalDeposits: 'deposits', openSite: 'Open site', files: 'files', anchors: 'anchors',
            },
        });
    }
}

function makeRecord(overrides: Partial<DepositRecord> = {}): DepositRecord {
    return {
        digest: 'abc123',
        title: 'Test',
        version: '1.0.0',
        authorName: 'Author',
        authorEmail: 'a@b.com',
        fileCount: 5,
        totalSize: 2048,
        timestamp: '2026-04-16T10:00:00Z',
        anchors: [{ provider: 'freetsa', status: 'confirmed' }],
        gpgSigned: false,
        ...overrides,
    };
}

describe('DashboardTabComponent', () => {
    let component: DashboardTabComponent;
    let fixture: ComponentFixture<DashboardTabComponent>;
    let mockStorage: {
        deposits: ReturnType<typeof signal<DepositRecord[]>>;
        depositCount: ReturnType<typeof signal<number>>;
    };

    beforeEach(async () => {
        mockStorage = {
            deposits: signal<DepositRecord[]>([]),
            depositCount: signal(0),
        };

        await TestBed.configureTestingModule({
            imports: [
                DashboardTabComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                }),
            ],
            providers: [
                { provide: ExtensionStorageService, useValue: mockStorage },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show empty state when no deposits', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.empty')).toBeTruthy();
    });

    it('should show deposits when available', () => {
        mockStorage.deposits.set([makeRecord(), makeRecord({ digest: 'xyz' })]);
        mockStorage.depositCount.set(2);
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.empty')).toBeFalsy();
        expect(el.querySelectorAll('ui-card').length).toBe(2);
    });

    it('should count confirmed anchors', () => {
        const record = makeRecord({
            anchors: [
                { provider: 'a', status: 'confirmed' },
                { provider: 'b', status: 'failed' },
                { provider: 'c', status: 'confirmed' },
            ],
        });
        expect(component.confirmedCount(record)).toBe(2);
    });

    it('should format sizes', () => {
        expect(component.formatSize(100)).toBe('100 B');
        expect(component.formatSize(2048)).toBe('2.0 KB');
        expect(component.formatSize(5242880)).toBe('5.0 MB');
    });

    it('should format dates', () => {
        const formatted = component.formatDate('2026-04-16T10:30:00Z');
        expect(formatted).toBeTruthy();
        expect(formatted).not.toBe('2026-04-16T10:30:00Z'); // Should be human-readable
    });

    it('should handle invalid date gracefully', () => {
        const formatted = component.formatDate('invalid');
        // Should return the original string or a formatted value, not throw
        expect(formatted).toBeTruthy();
    });

    it('should have link to full site', () => {
        const el: HTMLElement = fixture.nativeElement;
        const link = el.querySelector('a[href="https://deposit.mayday.software"]');
        expect(link).toBeTruthy();
    });
});
