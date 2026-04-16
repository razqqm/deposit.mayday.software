# mayday.software deposit

Open-source cryptographic deposit for source code authorship and timestamp evidence.

- License: MIT (see [LICENSE](LICENSE)) 
- Production app: [https://deposit.mayday.software/](https://deposit.mayday.software/)
- Monorepo: Angular frontend + Cloudflare Worker API relay + Browser extension (Chrome / Firefox)

## What this project does

The product creates independent evidence layers for software artifacts:

1. WHAT: SHA-256 fingerprint of files and manifest content.
2. WHO: cryptographic signature (roadmap item for browser GPG/OpenPGP flow).
3. WHEN: timestamp anchors (OpenTimestamps/Bitcoin and RFC 3161 TSA providers).

The evidence is designed to be verifiable without trusting this service.

## Product positioning

This product is an evidence layer, not a government registration authority.

- It helps prove existence and integrity at a certain time.
- It does not automatically grant legal presumptions in every jurisdiction.
- In Russia, state software registration under Civil Code Article 1262 is a separate mechanism.

For regional legal background, see [docs/RESEARCH_CIS.md](docs/RESEARCH_CIS.md).

## High-level workflow

```text
files/folder -> SHA-256 -> manifest.cff -> signature -> timestamp proofs
```

Expected output files:

- `manifest.cff`
- `manifest.cff.asc` (when signature flow is enabled)
- `manifest.cff.ots`
- `manifest.cff.asc.ots`

## Verification model

Third parties can independently verify proofs:

1. Verify signature (`gpg --verify ...`) when signature is present.
2. Verify timestamp (`ots verify ...`) against Bitcoin anchor data.
3. Optionally validate RFC 3161 tokens with OpenSSL.

The verification chain should remain valid even if this website is unavailable.

## Architecture

```text
Browser SPA (Angular)
  - local hashing and manifest generation
  - certificate rendering
  - timestamp request assembly
         |
         v
Cloudflare Worker (worker/src/index.ts)
  - serves SPA static assets
  - relays /api/tsa/* and /api/ots/* to allowlisted upstream providers
         |
         v
External timestamp services (RFC 3161 + OTS calendars)
```

### Browser extension

Chrome MV3 / Firefox extension that brings deposit and page-capture features directly into the browser toolbar.

```text
extension/
├── manifest.json              # Manifest V3 (Chrome)
├── manifest.firefox.json      # Firefox overrides (gecko.id, background.scripts)
├── angular.json               # Angular build config (outputHashing: none)
├── tsconfig.json / tsconfig.app.json
├── package.json               # Dependencies (Angular 21, webextension-polyfill, asn1js, pkijs, openpgp)
├── scripts/
│   └── build.mjs              # Post-build: esbuild for bg/content, manifest copy, _locales
├── src/
│   ├── main.ts                # Bootstrap + WORKER_BASE = "https://deposit.mayday.software"
│   ├── app.config.ts          # Zoneless, animations, inline i18n loader
│   ├── index.html             # Popup HTML (400×600)
│   ├── styles.scss            # Design tokens + dark mode via prefers-color-scheme
│   ├── tokens.scss            # Design tokens (shared with frontend)
│   ├── popup/                 # Shell with 3 tabs (Deposit / Capture / History)
│   ├── tabs/
│   │   ├── deposit/           # Drag-and-drop → SHA-256 → CITATION.cff → anchors
│   │   ├── capture/           # Page snapshot (HTML + screenshot) → anchors
│   │   └── dashboard/         # Deposit history, badge, link to website
│   ├── deposit/               # Hashing, manifest, anchor services (from frontend)
│   │   └── anchors/           # RFC 3161, OpenTimestamps, Ethereum
│   ├── ui/                    # UI components (from frontend)
│   ├── shared/services/       # ExtensionStorageService, CaptureService
│   ├── background/            # MV3 service worker (badge, context menu)
│   ├── content/               # Content script for HTML capture (<400 bytes)
│   └── i18n/                  # EN + RU (inline + _locales)
└── dist/extension/browser/    # Build output (load in Chrome or Firefox)
```

Build output sizes (production):

| Component | Size |
|---|---|
| Initial (Angular runtime + anchor logic + UI) | ~544 KB |
| Lazy (animations) | ~68 KB |
| Background service worker | ~11 KB |
| Content script | ~400 bytes |
| Styles | ~6 KB |
| **Total** | **~630 KB** |

### Technical notes

- Frontend: Angular 21, static SPA.
- Extension: Angular 21, MV3 popup (Chrome + Firefox), esbuild for background/content scripts.
- i18n: EN and RU via `@ngx-translate`.
- Worker: no user file storage; relay-only model for timestamp requests.
- Deploy: single Cloudflare Workers deployment from repository root.
- CI: GitHub Actions — lint, build (frontend + extension + worker), see [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Local development

### Frontend only

```bash
cd frontend
npm install
npm start
# http://localhost:4200/
```

Use this mode for UI work. Timestamp anchoring requires Worker API endpoints.

### Full stack (frontend + worker)

```bash
# from repository root
npm install
npx wrangler dev
# http://localhost:8787
```

If frontend sources change, rebuild static assets:

```bash
cd frontend && npm run build
```

## Production build

### Frontend

```bash
cd frontend && npm run build
# output: frontend/dist/mayday-software/browser/
```

### Browser extension

```bash
# Chrome
cd extension && npm install && npm run build
# output: extension/dist/extension/browser/

# Firefox
cd extension && npm run build:firefox

# From repository root (Chrome)
npm run build:ext
```

Loading the extension:

- **Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select `extension/dist/extension/browser/`
- **Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → select `extension/dist/extension/browser/manifest.json`

### Packaging for distribution

```bash
cd extension
npm run package:chrome   # → dist/mayday-ext-chrome.zip
npm run package:firefox  # → dist/mayday-ext-firefox.zip
```

## Deploy

```bash
npx wrangler login
npm run deploy
```

`wrangler.toml` points to:

- static assets directory: `frontend/dist/mayday-software/browser`
- worker entrypoint: `worker/src/index.ts`
- SPA fallback mode via `not_found_handling = "single-page-application"`

## Documentation map

- [docs/README.md](docs/README.md)
- [docs/PWA_SETUP.md](docs/PWA_SETUP.md)
- [docs/PRE_PROD_SPRINT.md](docs/PRE_PROD_SPRINT.md)
- [docs/MARKETING_REFRESH_2026.md](docs/MARKETING_REFRESH_2026.md)
- [docs/RESEARCH_CIS.md](docs/RESEARCH_CIS.md)
- [docs/AUDIT_2026-04-16.md](docs/AUDIT_2026-04-16.md)

## External references

- CITATION File Format: [https://citation-file-format.github.io/](https://citation-file-format.github.io/)
- OpenTimestamps: [https://opentimestamps.org/](https://opentimestamps.org/)
- Angular Service Worker docs: [https://angular.dev/ecosystem/service-workers/getting-started](https://angular.dev/ecosystem/service-workers/getting-started)
- Cloudflare Workers Static Assets docs: [https://developers.cloudflare.com/workers/static-assets/](https://developers.cloudflare.com/workers/static-assets/)

---

## Actuality

> ✅ Verified 2026-04-16 — all sections, commands, and links confirmed accurate.
> Extension (Chrome MV3 + Firefox) added to architecture and build documentation.
> Re-verified 2026-04-16 — manifest version aligned, .gitignore gaps fixed, embed.js endpoint documented.

## RU summary

`mayday.software deposit` - это open-source сервис для криптографического депонирования программных артефактов.

- Основной домен продукта: `deposit.mayday.software`.
- Сервис фиксирует:
  - что было создано (хеш),
  - кем подписано (подпись, по roadmap),
  - когда существовало (таймштампы OTS/Bitcoin и RFC 3161).
- Позиционирование: дополнительный слой доказательств, а не замена государственной регистрации.
- Архитектура: Angular SPA + Cloudflare Worker relay + браузерное расширение (Chrome/Firefox) без хранения пользовательских файлов.
- Подробности по правовым аспектам СНГ: [docs/RESEARCH_CIS.md](docs/RESEARCH_CIS.md).
