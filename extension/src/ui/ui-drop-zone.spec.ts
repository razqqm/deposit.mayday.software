import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiDropZone } from './ui-drop-zone';

describe('UiDropZone', () => {
    let component: UiDropZone;
    let fixture: ComponentFixture<UiDropZone>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiDropZone],
        }).compileComponents();

        fixture = TestBed.createComponent(UiDropZone);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('label', 'Drop files here');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display label', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('Drop files here');
    });

    it('should display hint', () => {
        fixture.componentRef.setInput('hint', 'or click to browse');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('or click to browse');
    });

    it('should not be dragging by default', () => {
        expect(component.dragging()).toBeFalse();
    });

    it('should set dragging on dragenter', () => {
        const event = new DragEvent('dragenter');
        component.onDragEnter(event);
        expect(component.dragging()).toBeTrue();
    });

    it('should set dragging on dragover', () => {
        const event = new DragEvent('dragover');
        component.onDragOver(event);
        expect(component.dragging()).toBeTrue();
    });

    it('should clear dragging on dragleave', () => {
        component.dragging.set(true);
        const event = new DragEvent('dragleave');
        component.onDragLeave(event);
        expect(component.dragging()).toBeFalse();
    });

    it('should compute hasFiles correctly when null', () => {
        fixture.componentRef.setInput('files', null);
        fixture.detectChanges();
        expect(component.hasFiles()).toBeFalse();
    });

    it('should compute hasFiles correctly when array', () => {
        const f = new File(['x'], 'x.txt');
        fixture.componentRef.setInput('files', [f]);
        fixture.detectChanges();
        expect(component.hasFiles()).toBeTrue();
    });

    it('should compute hasFiles correctly when empty array', () => {
        fixture.componentRef.setInput('files', []);
        fixture.detectChanges();
        expect(component.hasFiles()).toBeFalse();
    });

    it('should compute hasFiles for single file', () => {
        const f = new File(['x'], 'x.txt');
        fixture.componentRef.setInput('files', f);
        fixture.detectChanges();
        expect(component.hasFiles()).toBeTrue();
    });

    it('should compute summary for single file', () => {
        const f = new File(['hello world'], 'test.txt');
        fixture.componentRef.setInput('files', [f]);
        fixture.detectChanges();
        expect(component.summary()).toContain('test.txt');
    });

    it('should compute summary for multiple files', () => {
        const files = [new File(['a'], 'a.txt'), new File(['bb'], 'b.txt')];
        fixture.componentRef.setInput('files', files);
        fixture.detectChanges();
        expect(component.summary()).toContain('2 files');
    });

    it('should emit filesChange on input change', () => {
        const spy = spyOn(component.filesChange, 'emit');
        const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
        const dt = new DataTransfer();
        dt.items.add(new File(['x'], 'x.txt'));
        input.files = dt.files;
        input.dispatchEvent(new Event('change'));
        expect(spy).toHaveBeenCalled();
    });

    it('should emit empty array on clear', () => {
        const spy = spyOn(component.filesChange, 'emit');
        const event = new MouseEvent('click');
        component.clear(event);
        expect(spy).toHaveBeenCalledWith([]);
    });
});
