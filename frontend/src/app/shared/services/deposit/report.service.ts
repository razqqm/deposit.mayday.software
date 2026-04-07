import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CertificateData } from './certificate.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
    private readonly translate = inject(TranslateService);

    async generate(data: CertificateData): Promise<void> {
        const pdfMake = await import('pdfmake/build/pdfmake');
        const pdfFonts = await import('pdfmake/build/vfs_fonts');
        (pdfMake as any).vfs = (pdfFonts as any).vfs ?? (pdfFonts as any).default?.vfs;

        const t = (key: string): string => this.translate.instant(key);
        const { input, manifest, anchors, gpgSignature } = data;

        const author = [input.authorGivenNames, input.authorFamilyNames].filter(Boolean).join(' ').trim() || '—';
        const issuedHuman = new Date(manifest.issuedAt).toUTCString();
        const totalSize = input.files.reduce((s, f) => s + f.size, 0);
        const confirmedAnchors = anchors.filter(a => a.status === 'confirmed');

        // --- Build file table ---
        const fileTableBody: any[][] = [
            [
                { text: t('report.file'), bold: true, fontSize: 8 },
                { text: t('report.size'), bold: true, fontSize: 8 },
                { text: t('report.hash'), bold: true, fontSize: 8 },
            ],
            ...input.files.map(f => [
                { text: f.path, fontSize: 7, font: 'Roboto' },
                { text: formatBytes(f.size), fontSize: 7, alignment: 'right' as const },
                { text: f.sha256, fontSize: 6, font: 'Roboto' },
            ]),
        ];

        // --- Build anchor table ---
        const anchorTableBody: any[][] = [
            [
                { text: t('report.provider'), bold: true, fontSize: 8 },
                { text: t('report.timestamp'), bold: true, fontSize: 8 },
                { text: t('report.status'), bold: true, fontSize: 8 },
            ],
            ...anchors.map(a => [
                { text: a.providerLabel, fontSize: 8 },
                { text: a.anchoredAt ? new Date(a.anchoredAt).toUTCString() : '—', fontSize: 8 },
                { text: a.status, fontSize: 8, color: a.status === 'confirmed' ? '#16a34a' : a.status === 'failed' ? '#dc2626' : '#a3a3a3' },
            ]),
        ];

        // --- WHO section content ---
        const whoContent: any[] = [
            { text: author, fontSize: 14, bold: true, margin: [0, 4, 0, 2] },
            input.authorEmail ? { text: input.authorEmail, fontSize: 10, color: '#666' } : {},
        ];

        if (gpgSignature) {
            whoContent.push(
                { text: '\n' + t('report.gpgSigned'), fontSize: 9, margin: [0, 6, 0, 2] },
                { text: `Key ID: ${gpgSignature.keyId}`, fontSize: 8, font: 'Roboto' },
                { text: `Fingerprint: ${gpgSignature.fingerprint}`, fontSize: 7, font: 'Roboto' },
                { text: `User ID: ${gpgSignature.userId}`, fontSize: 8 },
            );
        } else {
            whoContent.push({ text: '\n' + t('report.gpgSelfDeclared'), fontSize: 9, color: '#888', italics: true, margin: [0, 6, 0, 0] });
        }

        // --- Legal section ---
        const legalContent: any[] = [
            { text: t('legal.p1'), fontSize: 9, margin: [0, 0, 0, 6] },
            { text: t('legal.p2'), fontSize: 9, margin: [0, 0, 0, 6] },
            { text: t('legal.p3'), fontSize: 9, margin: [0, 0, 0, 6] },
            { text: t('legal.p4'), fontSize: 9 },
        ];

        // --- Verification instructions ---
        const verifyContent: any[] = [];
        if (confirmedAnchors.some(a => a.kind === 'rfc3161')) {
            verifyContent.push(
                { text: t('report.verifyRfc3161'), fontSize: 9, margin: [0, 4, 0, 2] },
                { text: 'openssl ts -verify -data CITATION.cff -in CITATION.cff.tsr.freetsa -CAfile freetsa-cacert.pem', fontSize: 7, font: 'Roboto', background: '#f5f5f5', margin: [0, 0, 0, 6] },
            );
        }
        if (confirmedAnchors.some(a => a.kind === 'opentimestamps')) {
            verifyContent.push(
                { text: t('report.verifyOts'), fontSize: 9, margin: [0, 4, 0, 2] },
                { text: 'ots verify CITATION.cff.ots', fontSize: 7, font: 'Roboto', background: '#f5f5f5', margin: [0, 0, 0, 6] },
            );
        }
        if (gpgSignature) {
            verifyContent.push(
                { text: t('report.verifyGpg'), fontSize: 9, margin: [0, 4, 0, 2] },
                { text: 'gpg --verify CITATION.cff.asc CITATION.cff', fontSize: 7, font: 'Roboto', background: '#f5f5f5', margin: [0, 0, 0, 6] },
            );
        }

        const docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [50, 60, 50, 60],
            footer: (currentPage: number, pageCount: number) => ({
                columns: [
                    { text: t('report.disclaimer'), fontSize: 7, color: '#999', margin: [50, 0, 0, 0] },
                    { text: `${currentPage}/${pageCount}`, fontSize: 7, color: '#999', alignment: 'right', margin: [0, 0, 50, 0] },
                ],
            }),
            content: [
                // --- Cover ---
                { text: 'MAYDAY · SOFTWARE', fontSize: 10, color: '#f59e0b', alignment: 'center', letterSpacing: 4, margin: [0, 40, 0, 8] },
                { text: t('report.title'), fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
                { text: t('report.subtitle'), fontSize: 10, color: '#888', alignment: 'center', margin: [0, 0, 0, 20] },
                { canvas: [{ type: 'line', x1: 120, y1: 0, x2: 375, y2: 0, lineWidth: 1, lineColor: '#e5e5e5' }], margin: [0, 0, 0, 20] },
                {
                    columns: [
                        { text: t('report.issued') + ':', fontSize: 9, color: '#666', width: 60 },
                        { text: issuedHuman, fontSize: 9 },
                    ],
                    margin: [0, 0, 0, 4],
                },
                {
                    columns: [
                        { text: t('report.manifestDigest') + ':', fontSize: 9, color: '#666', width: 'auto' },
                        { text: manifest.sha256, fontSize: 8, font: 'Roboto', margin: [8, 1, 0, 0] },
                    ],
                    margin: [0, 0, 0, 20],
                },

                // --- I. WHAT ---
                { text: t('report.whatTitle'), fontSize: 14, bold: true, margin: [0, 10, 0, 8] },
                { text: `${input.title || '—'} · v${input.version || '—'} · ${input.license || '—'}`, fontSize: 10, margin: [0, 0, 0, 4] },
                { text: `${input.files.length} files · ${formatBytes(totalSize)}`, fontSize: 9, color: '#666', margin: [0, 0, 0, 8] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto'],
                        body: fileTableBody,
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 12],
                },

                // --- II. WHO ---
                { text: t('report.whoTitle'), fontSize: 14, bold: true, margin: [0, 10, 0, 6], pageBreak: 'before' },
                ...whoContent,

                // --- III. WHEN ---
                { text: t('report.whenTitle'), fontSize: 14, bold: true, margin: [0, 20, 0, 8] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto'],
                        body: anchorTableBody,
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 12],
                },

                // --- IV. Legal ---
                { text: t('report.legalTitle'), fontSize: 14, bold: true, margin: [0, 16, 0, 8], pageBreak: 'before' },
                ...legalContent,

                // --- V. Verification ---
                { text: t('report.verifyTitle'), fontSize: 14, bold: true, margin: [0, 16, 0, 8] },
                ...verifyContent,
            ],
        };

        const pdf = pdfMake.createPdf(docDefinition);
        pdf.download(`mayday-report-${manifest.sha256.slice(0, 12)}.pdf`);
    }
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
