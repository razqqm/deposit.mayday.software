# PWA setup and operations

This document defines the production PWA behavior for the Angular frontend.
It is written as an evergreen operations guide, not a sprint log.

## Objectives

1. Installable app on mobile and desktop.
2. Offline shell for last-visited routes.
3. Local artifact workflow available offline up to network-dependent anchor submission.
4. Explicit and safe cache rules to avoid stale-content regressions.
5. User-visible update path when a new app version is available.

## Current implementation model

### Build and registration

- `@angular/service-worker` is used for PWA support.
- Service worker registration is enabled in production and disabled in dev mode.
- Registration strategy follows Angular recommendation (`registerWhenStable:30000`).

Key references:

- Angular SW getting started: [https://angular.dev/ecosystem/service-workers/getting-started](https://angular.dev/ecosystem/service-workers/getting-started)
- Angular SW configuration: [https://angular.dev/ecosystem/service-workers/config](https://angular.dev/ecosystem/service-workers/config)

### Cache policy

Cache behavior is configured in `frontend/ngsw-config.json`.

Recommended policy for this product:

- App shell assets (`index.html`, JS, CSS): prefetch.
- Static assets (`images`, `i18n`, manifest): lazy cache.
- Dynamic data endpoints:
  - informational endpoints: freshness with short timeout and finite TTL.
  - timestamp submission endpoints: network-first (or not cached).

Do not cache timestamp-proof submission routes where fresh upstream responses are required.

## Runtime UX requirements

- Show online/offline status in UI.
- Show "update available" toast and provide reload action.
- Show install CTA only when install prompt is available and app is not standalone.
- Keep anchor/submit actions clearly marked as network-dependent.

## Cloudflare deployment compatibility

The current Cloudflare Workers + Static Assets model supports this setup.

- Static files are deployed with Worker code as one unit.
- SPA fallback should use `not_found_handling = "single-page-application"`.
- API relay routes can remain Worker-driven via `/api/*`.

Reference:

- Cloudflare Static Assets docs: [https://developers.cloudflare.com/workers/static-assets/](https://developers.cloudflare.com/workers/static-assets/)

## Verification checklist

1. Build production frontend.
2. Confirm `ngsw.json` and `ngsw-worker.js` are emitted.
3. Run Worker locally and confirm service worker registration in browser DevTools.
4. Test offline reload of previously visited routes.
5. Confirm anchor-specific actions report offline/network errors clearly.
6. Simulate new deploy and verify update prompt + reload flow.

## Files involved

- `frontend/ngsw-config.json`
- `frontend/angular.json`
- `frontend/src/app.config.ts`
- `frontend/src/app/shared/services/pwa.service.ts`
- `frontend/src/app/layout/components/pwa-indicators.ts`

---

## Actuality

> ✅ Verified 2026-04-16 — all files, services, and cache policies confirmed operational.

## RU summary

Этот документ фиксирует рабочую PWA-модель для проекта:

- PWA включается в production через Angular Service Worker.
- Кэширование должно быть явным: shell/статические ресурсы кэшируются, критичные timestamp API не должны залипать в stale-cache.
- UI обязан показывать offline/online статус, доступность обновления и install CTA.
- Для Cloudflare используется связка Static Assets + Worker с SPA fallback.
- Верификация включает проверку offline-перезагрузки, update-flow и поведения якорных API при отсутствии сети.
