# Pre-production sprint — 7 must-fix items

> Sprint to close all ⚠️ gaps surfaced in the readiness audit. Mark items
> as you go. After this passes, the project is shippable to prod.

## Context

Marketing refresh + UX/animation refactor done. Audit on 2026-04-14 revealed
seven critical blockers before public launch — all listed below with explicit
file paths and acceptance criteria. Item 5 (Privacy + ToS) ships as
boilerplate based on our zero-knowledge architecture; final wording must be
reviewed by a lawyer before legal use.

## Progress checklist

- [x] **1. LICENSE** — add MIT `LICENSE` file at repo root.
- [x] **2. robots.txt** — Sitemap URL → `deposit.mayday.software`.
- [x] **3. sitemap.xml** — fix domain, add `/how` + `/verify`, refresh lastmod.
- [x] **4. README** — rephrase MVP language (it's a product, not a draft).
- [x] **5. Privacy + Terms** — boilerplate pages at `/privacy` and `/terms`, linked from footer.
- [x] **6. mailto** — placeholder until mailbox registered (mirror Twitter/Telegram/LinkedIn pattern).
- [x] **7. Twitter handle** — strip `twitter:site` / `twitter:creator` meta until account registered.
- [x] Build + smoke + i18n parity.

---

## 1. LICENSE

Create `LICENSE` (no extension, MIT) at repo root. Copyright `2026 mayday.software`.

**Acceptance**: GitHub displays "MIT" badge automatically; pricing card and footer claims about MIT licensing become legitimate.

## 2. robots.txt

Edit [frontend/public/robots.txt](frontend/public/robots.txt) — replace
`https://mayday.software/sitemap.xml` with `https://deposit.mayday.software/sitemap.xml`.

## 3. sitemap.xml

Rewrite [frontend/public/sitemap.xml](frontend/public/sitemap.xml):
- Base URL → `https://deposit.mayday.software/`
- Add entries for `/how` and `/verify` (priority 0.8) and `/privacy`, `/terms` (priority 0.3, monthly).
- `lastmod` → today (2026-04-14).

## 4. README

Edit [README.md](README.md):
- Strip MVP framing: "MVP-сервис" → "сервис", "Roadmap MVP" → "Roadmap".
- Update domain references from `mayday.software` to `deposit.mayday.software` for the app surface (keep `mayday.software` for the legal entity).
- Mention LICENSE file.

## 5. Privacy + Terms (boilerplate)

Two new lazy-loaded Angular components:

- `/privacy` → [frontend/src/app/pages/privacy/privacy.ts](frontend/src/app/pages/privacy/privacy.ts) + `.html` + `.scss`
- `/terms` → [frontend/src/app/pages/terms/terms.ts](frontend/src/app/pages/terms/terms.ts) + `.html` + `.scss`

Both share a minimal `.legal-page` layout (single column, narrow container, prose styling). Use `<ui-section>` for header.

Content (EN + RU, in i18n) — boilerplate sections:

**Privacy**:
1. **Effective date** — last update.
2. **Data we don't collect** — files, hashes (computed locally), IP address (Cloudflare logs only, not retained by us).
3. **Data Cloudflare collects** — connection metadata for `/api/*` proxy calls, retained per CF policy.
4. **Cookies** — none.
5. **Third-party services** — TSA/OTS endpoints we proxy (FreeTSA, DigiCert, Sectigo, OpenTimestamps calendars, Base L2 RPC). Each receives only the 32-byte fingerprint.
6. **Children** — service not aimed at users under 16.
7. **Changes** — versioned via Git.
8. **Contact** — link to GitHub issue tracker.

**Terms**:
1. **Service description** — cryptographic copyright deposit, free.
2. **No warranty** — provided "as is", no fitness guarantee.
3. **Not legal advice** — evidence quality depends on jurisdiction.
4. **Acceptable use** — no flooding, no proxying for malware C2.
5. **Intellectual property** — code MIT, your files remain yours.
6. **Liability cap** — to the maximum extent permitted by law, none.
7. **Governing law** — placeholder, lawyer to choose.

Add **lawyer-review notice** at top: "This is boilerplate. Have a lawyer review before relying on these terms."

Footer Legal column → add 2 new links to `/privacy` and `/terms`.

i18n keys: `privacy.*` (~12 keys) + `terms.*` (~12 keys) in EN + RU.

## 6. Email placeholder

Edit [public-footer.ts](frontend/src/app/layout/components/public-footer.ts):
- Email link gets `data-placeholder="email"` + `aria-disabled="true"` + `tabindex="-1"` (mirror Twitter/Telegram/LinkedIn).
- href stays `mailto:hi@mayday.software` for when mailbox is provisioned.
- i18n labels updated to add "(coming soon)" / "(скоро)".

## 7. Twitter handle

Edit [index.html](frontend/src/index.html):
- Remove `<meta name="twitter:site" content="@maydaysoftware" />` and
  `<meta name="twitter:creator" content="@maydaysoftware" />` lines.
- Keep `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- In JSON-LD `Organization.sameAs`, **remove** Twitter/Telegram/LinkedIn URLs
  until accounts are registered. Keep only the GitHub URL.

## Verification

1. `cd frontend && npx ng build --configuration development` — clean build.
2. `curl -sf http://localhost:8787/privacy` and `/terms` → 200, render boilerplate.
3. `curl -s http://localhost:8787/sitemap.xml | grep -E '/how|/verify|/privacy|/terms'` → all 4 present.
4. `cat LICENSE | head -3` → "MIT License" + copyright line.
5. Footer Legal column shows "Privacy", "Terms" links between Berne / eIDAS.
6. Click Email in footer → not interactive (placeholder visual).
7. View source of `/` → no `twitter:site` / `twitter:creator` lines.
8. `grep -c MVP README.md` → 0.
