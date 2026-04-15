# mayday.software deposit

Open-source cryptographic deposit for source code authorship and timestamp evidence.

- License: MIT (see [LICENSE](LICENSE)) 
- Production app: [https://deposit.mayday.software/](https://deposit.mayday.software/)
- Monorepo: Angular frontend + Cloudflare Worker API relay

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

### Technical notes

- Frontend: Angular 21, static SPA.
- i18n: EN and RU via `@ngx-translate`.
- Worker: no user file storage; relay-only model for timestamp requests.
- Deploy: single Cloudflare Workers deployment from repository root.

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

```bash
cd frontend && npm run build
# output: frontend/dist/mayday-software/browser/
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

## External references

- CITATION File Format: [https://citation-file-format.github.io/](https://citation-file-format.github.io/)
- OpenTimestamps: [https://opentimestamps.org/](https://opentimestamps.org/)
- Angular Service Worker docs: [https://angular.dev/ecosystem/service-workers/getting-started](https://angular.dev/ecosystem/service-workers/getting-started)
- Cloudflare Workers Static Assets docs: [https://developers.cloudflare.com/workers/static-assets/](https://developers.cloudflare.com/workers/static-assets/)

---

## RU summary

`mayday.software deposit` - это open-source сервис для криптографического депонирования программных артефактов.

- Основной домен продукта: `deposit.mayday.software`.
- Сервис фиксирует:
  - что было создано (хеш),
  - кем подписано (подпись, по roadmap),
  - когда существовало (таймштампы OTS/Bitcoin и RFC 3161).
- Позиционирование: дополнительный слой доказательств, а не замена государственной регистрации.
- Архитектура: Angular SPA + Cloudflare Worker relay без хранения пользовательских файлов.
- Подробности по правовым аспектам СНГ: [docs/RESEARCH_CIS.md](docs/RESEARCH_CIS.md).
