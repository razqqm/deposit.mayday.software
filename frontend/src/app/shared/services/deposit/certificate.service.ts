import { Injectable } from '@angular/core';
import { BuiltManifest, ManifestInput } from './manifest.service';

export interface CertificateData {
    input: ManifestInput;
    manifest: BuiltManifest;
}

/**
 * Renders an SVG certificate of authorship that visually summarises
 * the deposit. The SVG is self-contained — anyone can open or print it
 * without internet access — and can be exported as PDF via window.print.
 */
@Injectable({ providedIn: 'root' })
export class CertificateService {
    render({ input, manifest }: CertificateData): string {
        const author = [input.authorGivenNames, input.authorFamilyNames].filter(Boolean).join(' ').trim() || '—';
        const issuedDate = new Date(manifest.issuedAt);
        const issuedHuman = issuedDate.toUTCString();
        const fileCount = input.files.length;
        const totalSize = input.files.reduce((sum, f) => sum + f.size, 0);
        const totalSizeHuman = formatBytes(totalSize);
        const hashTop = manifest.sha256.slice(0, 32);
        const hashBot = manifest.sha256.slice(32);

        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" width="1200" height="850" font-family="'Manrope', 'IBM Plex Sans', 'Helvetica Neue', sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0f1a"/>
      <stop offset="1" stop-color="#1a1207"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fbbf24"/>
      <stop offset="0.5" stop-color="#f59e0b"/>
      <stop offset="1" stop-color="#fbbf24"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="rgba(245,158,11,0.05)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="850" fill="url(#bg)"/>
  <rect width="1200" height="850" fill="url(#grid)"/>

  <!-- Outer frame -->
  <rect x="40" y="40" width="1120" height="770" fill="none" stroke="url(#gold)" stroke-width="3"/>
  <rect x="50" y="50" width="1100" height="750" fill="none" stroke="rgba(245,158,11,0.25)" stroke-width="1"/>

  <!-- Header -->
  <g transform="translate(600,140)">
    <text text-anchor="middle" fill="rgba(245,158,11,0.7)" font-size="14" letter-spacing="6" font-weight="600">MAYDAY · SOFTWARE</text>
    <text text-anchor="middle" y="60" fill="#fbbf24" font-size="46" letter-spacing="2" font-weight="800">CERTIFICATE OF AUTHORSHIP</text>
    <text text-anchor="middle" y="92" fill="rgba(255,255,255,0.45)" font-size="13" letter-spacing="3">CRYPTOGRAPHIC COPYRIGHT DEPOSIT</text>
  </g>

  <!-- Decorative seal -->
  <g transform="translate(600,320)">
    <circle r="60" fill="none" stroke="url(#gold)" stroke-width="2"/>
    <circle r="48" fill="none" stroke="rgba(245,158,11,0.4)" stroke-width="1" stroke-dasharray="3 4"/>
    <text text-anchor="middle" y="6" fill="#fbbf24" font-size="22" font-weight="800">SHA-256</text>
  </g>

  <!-- Body -->
  <g transform="translate(600,440)">
    <text text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="11" letter-spacing="3">THIS CERTIFIES THAT</text>
    <text text-anchor="middle" y="38" fill="#ffffff" font-size="32" font-weight="700">${escapeXml(author)}</text>
    <text text-anchor="middle" y="68" fill="rgba(255,255,255,0.5)" font-size="13" letter-spacing="2">IS THE AUTHOR OF</text>
    <text text-anchor="middle" y="104" fill="#ffffff" font-size="22" font-weight="600">${escapeXml(input.title || '—')}</text>
    <text text-anchor="middle" y="130" fill="rgba(255,255,255,0.55)" font-size="14">version ${escapeXml(input.version || '—')} · ${escapeXml(input.license || 'unspecified license')} · ${fileCount} file(s) · ${totalSizeHuman}</text>
  </g>

  <!-- Hash block -->
  <g transform="translate(600,640)">
    <text text-anchor="middle" fill="rgba(245,158,11,0.65)" font-size="11" letter-spacing="3">MANIFEST FINGERPRINT (SHA-256)</text>
    <text text-anchor="middle" y="26" fill="#fbbf24" font-size="16" font-family="'JetBrains Mono','SF Mono',Menlo,monospace" letter-spacing="1">${hashTop}</text>
    <text text-anchor="middle" y="48" fill="#fbbf24" font-size="16" font-family="'JetBrains Mono','SF Mono',Menlo,monospace" letter-spacing="1">${hashBot}</text>
  </g>

  <!-- Footer -->
  <g transform="translate(600,760)">
    <line x1="-300" y1="-22" x2="300" y2="-22" stroke="rgba(245,158,11,0.25)" stroke-width="1"/>
    <text text-anchor="middle" fill="rgba(255,255,255,0.55)" font-size="12">Issued ${escapeXml(issuedHuman)}</text>
    <text text-anchor="middle" y="20" fill="rgba(255,255,255,0.35)" font-size="11">Verifiable via OpenTimestamps · mayday.software</text>
  </g>
</svg>
`;
    }

    download(filename: string, content: string, mime: string): void {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    print(svg: string): void {
        const win = window.open('', '_blank', 'width=1200,height=900');
        if (!win) return;
        win.document.open();
        win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title>
<style>html,body{margin:0;padding:0;background:#0b0f1a;}svg{display:block;width:100vw;height:auto;max-height:100vh;}@media print{@page{size:landscape;margin:0;}body{background:#fff;}svg{width:100%;height:auto;}}</style>
</head><body>${svg}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),200));<\/script></body></html>`);
        win.document.close();
    }
}

function escapeXml(s: string): string {
    return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
