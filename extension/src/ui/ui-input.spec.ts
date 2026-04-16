import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { UiInput } from './ui-input';

describe('UiInput', () => {
    let component: UiInput;
    let fixture: ComponentFixture<UiInput>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiInput, FormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(UiInput);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have unique uid', () => {
        const fixture2 = TestBed.createComponent(UiInput);
        expect(fixture2.componentInstance.uid).not.toBe(component.uid);
    });

    it('should display label', () => {
        fixture.componentRef.setInput('label', 'Email');
        fixture.detectChanges();
        const label = fixture.nativeElement.querySelector('.label');
        expect(label?.textContent).toContain('Email');
    });

    it('should show required marker', () => {
        fixture.componentRef.setInput('label', 'Name');
        fixture.componentRef.setInput('required', true);
        fixture.detectChanges();
        const req = fixture.nativeElement.querySelector('.req');
        expect(req).toBeTruthy();
    });

    it('should display hint text', () => {
        fixture.componentRef.setInput('hint', 'Enter your email');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Enter your email');
    });

    it('should display error text and hide hint', () => {
        fixture.componentRef.setInput('hint', 'Some hint');
        fixture.componentRef.setInput('error', 'Required field');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Required field');
        expect(fixture.nativeElement.querySelector('.hint')).toBeFalsy();
    });

    it('should implement ControlValueAccessor - writeValue', () => {
        component.writeValue('test');
        expect(component.inner()).toBe('test');
    });

    it('should handle null writeValue', () => {
        component.writeValue(null as any);
        expect(component.inner()).toBe('');
    });

    it('should implement ControlValueAccessor - registerOnChange', () => {
        const fn = jasmine.createSpy('onChange');
        component.registerOnChange(fn);

        const input = fixture.nativeElement.querySelector('input');
        input.value = 'new value';
        input.dispatchEvent(new Event('input'));

        expect(fn).toHaveBeenCalledWith('new value');
    });

    it('should implement ControlValueAccessor - registerOnTouched', () => {
        const fn = jasmine.createSpy('onTouched');
        component.registerOnTouched(fn);

        const input = fixture.nativeElement.querySelector('input');
        input.dispatchEvent(new Event('blur'));

        expect(fn).toHaveBeenCalled();
    });

    it('should implement setDisabledState', () => {
        component.setDisabledState(true);
        expect(component.disabled()).toBeTrue();

        component.setDisabledState(false);
        expect(component.disabled()).toBeFalse();
    });

    it('should update inner value on input', () => {
        const input = fixture.nativeElement.querySelector('input');
        input.value = 'typed';
        input.dispatchEvent(new Event('input'));
        expect(component.inner()).toBe('typed');
    });
});
