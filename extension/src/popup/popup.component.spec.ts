import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { PopupComponent } from './popup.component';

class FakeLoader extends TranslateLoader {
    getTranslation(): Observable<any> {
        return of({
            tabs: { deposit: 'Deposit', capture: 'Capture', dashboard: 'History' },
        });
    }
}

describe('PopupComponent', () => {
    let component: PopupComponent;
    let fixture: ComponentFixture<PopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PopupComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                }),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to deposit tab', () => {
        expect(component.activeTab()).toBe('deposit');
    });

    it('should switch tabs', () => {
        component.activeTab.set('capture');
        expect(component.activeTab()).toBe('capture');

        component.activeTab.set('dashboard');
        expect(component.activeTab()).toBe('dashboard');
    });

    it('should render tab buttons', () => {
        const el: HTMLElement = fixture.nativeElement;
        const tabs = el.querySelectorAll('.tab');
        expect(tabs.length).toBe(3);
    });

    it('should highlight active tab', () => {
        const el: HTMLElement = fixture.nativeElement;
        const firstTab = el.querySelector('.tab');
        expect(firstTab?.classList.contains('active')).toBeTrue();
    });
});
