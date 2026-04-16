# mayday.software deposit — Browser Extension

Chrome MV3 / Firefox extension for cryptographic copyright deposit directly from the browser toolbar.

Part of the [deposit.mayday.software](https://deposit.mayday.software/) monorepo.

## Features

| Tab | Description |
|---|---|
| **Deposit** | Drag-and-drop files → SHA-256 → CITATION.cff manifest → timestamp anchors |
| **Capture** | Snapshot current page (HTML + screenshot) → timestamp anchors |
| **History** | View past deposits, badge count, link to main website |

## Setup

```bash
cd extension
npm install
```

## Build

```bash
# Chrome (production)
npm run build

# Firefox (production)
npm run build:firefox

# Development (watch mode)
npm run watch
```

Build output: `dist/extension/browser/`

## Load in browser

- **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select `dist/extension/browser/`
- **Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → select `dist/extension/browser/manifest.json`

## Package for distribution

```bash
npm run package:chrome   # → dist/mayday-ext-chrome.zip
npm run package:firefox  # → dist/mayday-ext-firefox.zip
```

## Architecture

- **Angular 21** popup (zoneless, standalone components)
- **Manifest V3** (Chrome) with Firefox overrides via `manifest.firefox.json`
- **esbuild** post-build for `background.js` (service worker) and `content.js` (page capture)
- **webextension-polyfill** for cross-browser API compatibility
- **i18n:** `@ngx-translate` (runtime) + `_locales/` (native browser i18n)
- Design tokens shared with frontend via `tokens.scss`

## Build output sizes

| Component | Size |
|---|---|
| Initial (Angular + anchors + UI) | ~544 KB |
| Lazy (animations) | ~68 KB |
| Background service worker | ~11 KB |
| Content script | ~400 bytes |
| Styles | ~6 KB |
| **Total** | **~630 KB** |

## Dependencies

- Angular 21 (core, common, forms, platform-browser, animations)
- `@ngx-translate/core` — runtime i18n
- `webextension-polyfill` — cross-browser extension API
- `asn1js`, `pkijs` — RFC 3161 timestamp token parsing
- `openpgp` — GPG/PGP signature support

## Actuality

> ✅ Verified 2026-04-16 — builds, loads, and operates in Chrome and Firefox.
