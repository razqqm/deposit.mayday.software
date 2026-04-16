/**
 * Post-build script for the browser extension.
 *
 * 1. Copies manifest.json into the dist/extension/browser/ output.
 * 2. For --firefox: merges manifest.firefox.json overrides.
 * 3. Compiles background/service-worker.ts via esbuild.
 * 4. Compiles content/capture-content.ts via esbuild.
 * 5. Copies _locales for Chrome/Firefox native i18n.
 */

import { buildSync } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist/extension/browser');
const isFirefox = process.argv.includes('--firefox');

// 1. Copy and optionally merge manifest.json
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf-8'));
if (isFirefox) {
    const firefoxOverrides = JSON.parse(readFileSync(resolve(root, 'manifest.firefox.json'), 'utf-8'));
    Object.assign(manifest, firefoxOverrides);
}
writeFileSync(resolve(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// 2. Compile background service worker
buildSync({
    entryPoints: [resolve(root, 'src/background/service-worker.ts')],
    bundle: true,
    outfile: resolve(distDir, 'background.js'),
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    minify: true,
});

// 3. Compile content script
buildSync({
    entryPoints: [resolve(root, 'src/content/capture-content.ts')],
    bundle: true,
    outfile: resolve(distDir, 'content.js'),
    format: 'iife',
    target: 'es2022',
    platform: 'browser',
    minify: true,
});

// 4. Copy _locales for native i18n
const localesDir = resolve(root, 'src/i18n/_locales');
if (existsSync(localesDir)) {
    cpSync(localesDir, resolve(distDir, '_locales'), { recursive: true });
}

console.log(`Extension built for ${isFirefox ? 'Firefox' : 'Chrome'} → ${distDir}`);
