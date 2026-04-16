# Production readiness checklist

This document replaces one-off sprint notes with a stable launch checklist.
Use it before each public release.

## Scope

- Documentation integrity
- SEO and indexing hygiene
- Legal page presence and consistency
- Contact and social metadata sanity
- Build and smoke verification

## Release gate

A release is production-ready only if all sections below pass.

## 1. Repository and legal basics

- Root `LICENSE` file exists and matches project claims.
- Root `README.md` reflects current product status (no outdated MVP phrasing).
- Domain references are consistent (`deposit.mayday.software` for app surface).

## 2. Indexing and sitemap

- `frontend/public/robots.txt` points to the correct sitemap URL.
- `frontend/public/sitemap.xml` includes current public routes:
  - `/`
  - `/how`
  - `/verify`
  - `/privacy`
  - `/terms`
- `lastmod` values are updated for release date.

## 3. Legal pages and disclaimers

- `/privacy` and `/terms` routes render correctly in EN and RU.
- Legal wording includes jurisdiction and legal-advice disclaimers.
- Boilerplate warnings are visible where legal review is still pending.

## 4. Footer and contact channels

- Footer legal links include Privacy and Terms.
- Placeholder contacts are explicitly marked (if not provisioned yet).
- No dead social links are exposed as active channels.

## 5. Metadata and social preview

- `frontend/src/index.html` has valid Open Graph and Twitter card metadata.
- Unregistered handles are not listed in `twitter:site` / `twitter:creator`.
- JSON-LD `sameAs` only contains live and official profiles.
- OG image resolves and loads fast (`1200x630`).

## 6. Build and smoke checks

- Frontend build succeeds (`cd frontend && npm run build`).
- Extension build succeeds (`cd extension && npm run build`).
- Worker local run succeeds (`npx wrangler dev`).
- Core routes return `200`.
- `sitemap.xml` serves all required route entries.
- Language switch EN/RU works for all major pages.
- Extension loads in Chrome and Firefox without console errors.

## Suggested command set

```bash
cd frontend && npm run build
cd ../extension && npm run build
cd .. && npx wrangler dev
curl -sf http://localhost:8787/
curl -sf http://localhost:8787/privacy
curl -sf http://localhost:8787/terms
curl -s http://localhost:8787/sitemap.xml
```

## Ownership

- Product owner: message and legal accuracy.
- Engineering owner: route/build/runtime correctness.
- Final legal review: external counsel before legal reliance.

## Actuality

> ✅ Verified 2026-04-16 — all gates checked, extension build added, smoke commands updated.

---

## RU summary

Документ теперь является постоянным чеклистом перед релизом, а не журналом спринта.

Перед production-публикацией обязательно проверяются:

- лицензия и актуальность README,
- robots/sitemap,
- наличие и корректность страниц Privacy/Terms,
- валидность футера и контактов,
- OG/Twitter/JSON-LD метаданные,
- сборка фронтенда, расширения и smoke-проверка маршрутов.
