import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { CaptureTabComponent } from './capture-tab.component';
import { HashingService } from '../../deposit/hashing.service';
import { ManifestService } from '../../deposit/manifest.service';
import { AnchorOrchestratorService } from '../../deposit/anchors/anchor-orchestrator.service';
import { CaptureService } from '../../shared/services/capture.service';
import { ExtensionStorageService } from '../../shared/services/extension-storage.service';

class FakeLoader extends TranslateLoader {
    getTranslation(): Observable<any> {
        return of({
            capture: {
                title: 'Capture', description: 'Capture page', captureBtn: 'Capture',
                capturing: 'Capturing', includeScreenshot: 'Screenshot', pageTitle: 'Page', pageUrl: 'URL',
            },
            deposit: { done: 'Done', manifestHash: 'Hash', downloadManifest: 'Download', downloadProofs: 'Proofs', newDeposit: 'New' },
            anchors: { confirmed: 'OK', submitting: 'Submitting', failed: 'Failed', pending: 'Pending' },
        });
    }
}

describe('CaptureTabComponent', () => {
    let component: CaptureTabComponent;
    let fixture: ComponentFixture<CaptureTabComponent>;
    let captureSpy: jasmine.SpyObj<CaptureService>;

    beforeEach(async () => {
        captureSpy = jasmine.createSpyObj('CaptureService', ['capturePage', 'dataUrlToFile']);
        const hashingSpy = jasmine.createSpyObj('HashingService', ['hashFile', 'hashMany', 'hashString']);
        const manifestSpy = jasmine.createSpyObj('ManifestService', ['build']);
        const orchestratorSpy = jasmine.createSpyObj('AnchorOrchestratorService', ['submit', 'reset'], {
            anchors: jasmine.createSpy().and.returnValue([]),
        });
        const storageSpy = jasmine.createSpyObj('ExtensionStorageService', ['saveDeposit']);

        hashingSpy.hashMany.and.resolveTo([{ path: 'page.html', size: 100, sha256: 'abc' }]);
        manifestSpy.build.and.resolveTo({ yaml: '', sha256: 'aabb', issuedAt: '2026-04-16T10:00:00Z' });
        orchestratorSpy.submit.and.resolveTo([]);
        storageSpy.saveDeposit.and.resolveTo();

        await TestBed.configureTestingModule({
            imports: [
                CaptureTabComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                }),
            ],
            providers: [
                { provide: CaptureService, useValue: captureSpy },
                { provide: HashingService, useValue: hashingSpy },
                { provide: ManifestService, useValue: manifestSpy },
                { provide: AnchorOrchestratorService, useValue: orchestratorSpy },
                { provide: ExtensionStorageService, useValue: storageSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CaptureTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start at idle step', () => {
        expect(component.step()).toBe('idle');
    });

    it('should default to include screenshot', () => {
        expect(component.includeScreenshot()).toBeTrue();
    });

    it('should toggle screenshot setting', () => {
        component.includeScreenshot.set(false);
        expect(component.includeScreenshot()).toBeFalse();
    });

    it('should handle capture error gracefully', async () => {
        captureSpy.capturePage.and.rejectWith(new Error('No active tab'));

        await component.capture();

        expect(component.step()).toBe('error');
        expect(component.errorMessage()).toBe('No active tab');
    });

    it('should reset state', () => {
        component.step.set('error');
        component.errorMessage.set('Some error');

        component.reset();

        expect(component.step()).toBe('idle');
        expect(component.errorMessage()).toBe('');
        expect(component.captured()).toBeNull();
        expect(component.manifest()).toBeNull();
    });

    it('should capture page successfully', async () => {
        captureSpy.capturePage.and.resolveTo({
            url: 'https://example.com',
            title: 'Example',
            html: '<html></html>',
            screenshotDataUrl: 'data:image/png;base64,abc',
        });
        captureSpy.dataUrlToFile.and.returnValue(new File(['png'], 'screenshot.png', { type: 'image/png' }));

        await component.capture();

        expect(component.step()).toBe('done');
        expect(component.captured()?.title).toBe('Example');
    });
});
