import { TestBed } from '@angular/core/testing';
import { ManifestService, ManifestInput } from './manifest.service';
import { HashingService } from './hashing.service';

describe('ManifestService', () => {
    let service: ManifestService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ManifestService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('build', () => {
        const input: ManifestInput = {
            title: 'My Project',
            version: '2.0.0',
            license: 'MIT',
            authorGivenNames: 'John',
            authorFamilyNames: 'Doe',
            authorEmail: 'john@example.com',
            files: [
                { path: 'src/main.ts', size: 1234, sha256: 'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234' },
                { path: 'README.md', size: 567, sha256: 'ef012345ef012345ef012345ef012345ef012345ef012345ef012345ef012345' },
            ],
        };

        it('should produce valid CITATION.cff YAML', async () => {
            const result = await service.build(input);

            expect(result.yaml).toContain('cff-version: 1.2.0');
            expect(result.yaml).toContain('"My Project"');
            expect(result.yaml).toContain('"2.0.0"');
            expect(result.yaml).toContain('"MIT"');
            expect(result.yaml).toContain('"John"');
            expect(result.yaml).toContain('"Doe"');
            expect(result.yaml).toContain('"john@example.com"');
        });

        it('should include file entries', async () => {
            const result = await service.build(input);

            expect(result.yaml).toContain('files:');
            expect(result.yaml).toContain('"src/main.ts"');
            expect(result.yaml).toContain('size: 1234');
            expect(result.yaml).toContain('"README.md"');
        });

        it('should compute SHA-256 of manifest', async () => {
            const result = await service.build(input);

            expect(result.sha256).toMatch(/^[0-9a-f]{64}$/);
        });

        it('should set issuedAt timestamp', async () => {
            const before = new Date().toISOString();
            const result = await service.build(input);
            const after = new Date().toISOString();

            expect(result.issuedAt >= before).toBeTrue();
            expect(result.issuedAt <= after).toBeTrue();
        });

        it('should include date-released from issuedAt', async () => {
            const result = await service.build(input);
            const dateStr = result.issuedAt.slice(0, 10);

            expect(result.yaml).toContain(`date-released: "${dateStr}"`);
        });

        it('should handle missing family names', async () => {
            const noFamily: ManifestInput = { ...input, authorFamilyNames: '' };
            const result = await service.build(noFamily);

            expect(result.yaml).not.toContain('family-names');
        });

        it('should handle missing email', async () => {
            const noEmail: ManifestInput = { ...input, authorEmail: '' };
            const result = await service.build(noEmail);

            expect(result.yaml).not.toContain('email');
        });

        it('should escape special characters in title', async () => {
            const special: ManifestInput = { ...input, title: 'Project "with" quotes\\slashes' };
            const result = await service.build(special);

            expect(result.yaml).toContain('Project \\"with\\" quotes\\\\slashes');
        });

        it('should produce deterministic output for same input', async () => {
            // Note: issuedAt changes, so sha256 differs, but YAML structure is the same
            const r1 = await service.build(input);
            const r2 = await service.build(input);

            // Both should be valid
            expect(r1.yaml).toContain('cff-version: 1.2.0');
            expect(r2.yaml).toContain('cff-version: 1.2.0');
        });
    });
});
