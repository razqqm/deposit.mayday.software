import { TestBed } from '@angular/core/testing';
import { HashingService } from './hashing.service';

describe('HashingService', () => {
    let service: HashingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HashingService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('hashFile', () => {
        it('should hash a file and return path, size, sha256', async () => {
            const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
            const result = await service.hashFile(file);

            expect(result.path).toBe('test.txt');
            expect(result.size).toBe(11);
            expect(result.sha256).toMatch(/^[0-9a-f]{64}$/);
        });

        it('should use provided path over filename', async () => {
            const file = new File(['data'], 'original.txt');
            const result = await service.hashFile(file, 'custom/path.txt');

            expect(result.path).toBe('custom/path.txt');
        });

        it('should produce deterministic hashes', async () => {
            const f1 = new File(['same content'], 'a.txt');
            const f2 = new File(['same content'], 'b.txt');
            const r1 = await service.hashFile(f1);
            const r2 = await service.hashFile(f2);

            expect(r1.sha256).toBe(r2.sha256);
        });

        it('should produce different hashes for different content', async () => {
            const f1 = new File(['content A'], 'a.txt');
            const f2 = new File(['content B'], 'b.txt');
            const r1 = await service.hashFile(f1);
            const r2 = await service.hashFile(f2);

            expect(r1.sha256).not.toBe(r2.sha256);
        });
    });

    describe('hashMany', () => {
        it('should hash multiple files', async () => {
            const files = [
                new File(['aaa'], 'a.txt'),
                new File(['bbb'], 'b.txt'),
                new File(['ccc'], 'c.txt'),
            ];
            const results = await service.hashMany(files);

            expect(results.length).toBe(3);
            results.forEach(r => expect(r.sha256).toMatch(/^[0-9a-f]{64}$/));
        });

        it('should sort results by path', async () => {
            const files = [
                new File(['c'], 'z.txt'),
                new File(['a'], 'a.txt'),
                new File(['b'], 'm.txt'),
            ];
            const results = await service.hashMany(files);

            expect(results[0].path).toBe('a.txt');
            expect(results[1].path).toBe('m.txt');
            expect(results[2].path).toBe('z.txt');
        });

        it('should handle empty file list', async () => {
            const results = await service.hashMany([]);
            expect(results).toEqual([]);
        });
    });

    describe('hashString', () => {
        it('should hash a string', async () => {
            const hash = await service.hashString('hello');
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        });

        it('should be deterministic', async () => {
            const h1 = await service.hashString('test');
            const h2 = await service.hashString('test');
            expect(h1).toBe(h2);
        });

        it('should match known SHA-256 for empty string', async () => {
            const hash = await service.hashString('');
            expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        });
    });
});
