import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DepositTabComponent } from './deposit-tab.component';
import { HashingService } from '../../deposit/hashing.service';
import { ManifestService } from '../../deposit/manifest.service';
import { AnchorOrchestratorService } from '../../deposit/anchors/anchor-orchestrator.service';
import { ExtensionStorageService } from '../../shared/services/extension-storage.service';

class FakeLoader extends TranslateLoader {
    getTranslation(): Observable<any> {
        return of({
            deposit: {
                dropLabel: 'Drop files', dropHint: 'or click', formTitle: 'Title',
                formVersion: 'Version', formAuthor: 'Author', formEmail: 'Email',
                submit: 'Submit', submitting: 'Submitting', hashingProgress: 'Hashing',
                done: 'Done', manifestHash: 'Hash', downloadManifest: 'Download',
                downloadProofs: 'Proofs', newDeposit: 'New',
            },
            dashboard: { files: 'files' },
            anchors: { confirmed: 'OK', submitting: 'Submitting', failed: 'Failed', pending: 'Pending' },
        });
    }
}

describe('DepositTabComponent', () => {
    let component: DepositTabComponent;
    let fixture: ComponentFixture<DepositTabComponent>;
    let hashingSpy: jasmine.SpyObj<HashingService>;
    let manifestSpy: jasmine.SpyObj<ManifestService>;
    let orchestratorSpy: jasmine.SpyObj<AnchorOrchestratorService>;
    let storageSpy: jasmine.SpyObj<ExtensionStorageService>;

    beforeEach(async () => {
        hashingSpy = jasmine.createSpyObj('HashingService', ['hashFile', 'hashMany', 'hashString']);
        manifestSpy = jasmine.createSpyObj('ManifestService', ['build']);
        orchestratorSpy = jasmine.createSpyObj('AnchorOrchestratorService', ['submit', 'reset'], {
            anchors: jasmine.createSpy().and.returnValue([]),
        });
        storageSpy = jasmine.createSpyObj('ExtensionStorageService', ['saveDeposit', 'loadDeposits']);

        await TestBed.configureTestingModule({
            imports: [
                DepositTabComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                }),
            ],
            providers: [
                { provide: HashingService, useValue: hashingSpy },
                { provide: ManifestService, useValue: manifestSpy },
                { provide: AnchorOrchestratorService, useValue: orchestratorSpy },
                { provide: ExtensionStorageService, useValue: storageSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DepositTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start at files step', () => {
        expect(component.step()).toBe('files');
    });

    it('should transition to hashing when files selected', async () => {
        hashingSpy.hashFile.and.resolveTo({ path: 'test.txt', size: 100, sha256: 'abc123' });

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        await component.onFilesSelected([file]);

        expect(component.step()).toBe('form');
        expect(component.hashedFiles().length).toBe(1);
    });

    it('should not transition with empty file list', async () => {
        await component.onFilesSelected([]);
        expect(component.step()).toBe('files');
    });

    it('should compute total size', async () => {
        hashingSpy.hashFile.and.callFake(async (f: File) => ({
            path: f.name, size: f.size, sha256: 'abc',
        }));

        const files = [
            new File(['a'.repeat(100)], 'a.txt'),
            new File(['b'.repeat(200)], 'b.txt'),
        ];
        await component.onFilesSelected(files);

        expect(component.totalSize()).toBe(300);
    });

    it('should format sizes correctly', () => {
        expect(component.formatSize(500)).toBe('500 B');
        expect(component.formatSize(1536)).toBe('1.5 KB');
        expect(component.formatSize(1572864)).toBe('1.5 MB');
    });

    it('should reset to initial state', () => {
        component.step.set('done');
        component.formTitle = 'Test';
        component.formAuthor = 'Author';

        component.reset();

        expect(component.step()).toBe('files');
        expect(component.formTitle).toBe('');
        expect(component.formAuthor).toBe('');
        expect(component.files()).toEqual([]);
        expect(component.hashedFiles()).toEqual([]);
        expect(orchestratorSpy.reset).toHaveBeenCalled();
    });

    it('should submit deposit flow end-to-end', async () => {
        hashingSpy.hashFile.and.resolveTo({ path: 'test.txt', size: 100, sha256: 'deadbeef' });
        manifestSpy.build.and.resolveTo({
            yaml: 'cff-version: 1.2.0\ntitle: "Test"',
            sha256: 'aabbccdd00112233aabbccdd00112233aabbccdd00112233aabbccdd00112233',
            issuedAt: '2026-04-16T10:00:00Z',
        });
        orchestratorSpy.submit.and.resolveTo([
            { kind: 'rfc3161', provider: 'freetsa', providerLabel: 'FreeTSA', proofExtension: 'tsr', status: 'confirmed' },
        ]);
        storageSpy.saveDeposit.and.resolveTo();

        // Step 1: select files
        await component.onFilesSelected([new File(['test'], 'test.txt')]);
        expect(component.step()).toBe('form');

        // Step 2: fill form and submit
        component.formTitle = 'Test Project';
        component.formAuthor = 'Author';
        await component.onSubmit();

        expect(component.step()).toBe('done');
        expect(manifestSpy.build).toHaveBeenCalled();
        expect(orchestratorSpy.submit).toHaveBeenCalled();
        expect(storageSpy.saveDeposit).toHaveBeenCalled();
    });
});
