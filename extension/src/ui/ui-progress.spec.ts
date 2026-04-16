import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiProgress } from './ui-progress';

describe('UiProgress', () => {
    let component: UiProgress;
    let fixture: ComponentFixture<UiProgress>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiProgress],
        }).compileComponents();

        fixture = TestBed.createComponent(UiProgress);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to 0', () => {
        expect(component.pct()).toBe(0);
    });

    it('should clamp to 0 minimum', () => {
        fixture.componentRef.setInput('value', -10);
        fixture.detectChanges();
        expect(component.pct()).toBe(0);
    });

    it('should clamp to 100 maximum', () => {
        fixture.componentRef.setInput('value', 150);
        fixture.detectChanges();
        expect(component.pct()).toBe(100);
    });

    it('should round to integer', () => {
        fixture.componentRef.setInput('value', 33.7);
        fixture.detectChanges();
        expect(component.pct()).toBe(34);
    });

    it('should set fill width', () => {
        fixture.componentRef.setInput('value', 50);
        fixture.detectChanges();
        const fill = fixture.nativeElement.querySelector('.fill') as HTMLElement;
        expect(fill.style.width).toBe('50%');
    });

    it('should hide label by default', () => {
        const label = fixture.nativeElement.querySelector('.label');
        expect(label).toBeFalsy();
    });

    it('should show label when enabled', () => {
        fixture.componentRef.setInput('showLabel', true);
        fixture.componentRef.setInput('value', 75);
        fixture.detectChanges();
        const label = fixture.nativeElement.querySelector('.label');
        expect(label?.textContent?.trim()).toBe('75%');
    });
});
