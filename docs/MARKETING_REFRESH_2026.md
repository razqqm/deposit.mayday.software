# Marketing refresh — top-5 conversion gaps (April 2026)

> Reference plan executed in one iteration. Mark items as you go.

## Context

Audit on 2026-04-14 against benchmarks (Arclen CRO playbook, Webstacks, Veza Digital).
Five highest-leverage gaps closed in this pass:

1. Risk reversal in hero (kill the #1 trust objection up front).
2. Use-cases section (4 personas, "is this for me?").
3. Comparison table (mayday vs notary / Rospatent / n'RIS / EU TSA).
4. Pricing strip (transparent "$0 forever, open source, premium roadmap").
5. Open Graph image (1200×630, used by Twitter / Slack / Telegram previews).

## New section order (home.html)

```
1. Hero (+ risk-reversal line)
2. Trust bar
3. Deposit
4. How it works
5. Use cases                ← NEW
6. Legal
7. Comparison table         ← NEW
8. Why Bitcoin
9. Trust grid
10. Pricing                 ← NEW
11. History
12. FAQ
13. Final CTA
```

## Progress checklist

- [x] Research — 2026 SaaS landing benchmarks captured.
- [x] **1. Hero risk reversal** — extra subtitle line under hero copy.
- [x] **2. Use cases section** — 4 personas with scenario + icon.
- [x] **3. Comparison table** — 5 columns × 6 rows, sticky first column on mobile.
- [x] **4. Pricing strip** — single bold card with 3 sub-bullets.
- [x] **5. OG image** — SVG template + rasterized PNG 1200×630, hooked into index.html.
- [x] i18n keys for all new sections (EN + RU).
- [x] Build + smoke verification.
- [x] Mobile responsiveness checked at 1024 / 720 / 480.

---

## 1. Hero risk reversal

**Where**: under existing `hero.subtitle` paragraph in home.html.

**Copy**:
- EN: *"If this site disappears tomorrow, your proof keeps working — Bitcoin nodes and RFC 3161 verifiers are completely independent of us."*
- RU: *«Если сайт исчезнет завтра — доказательство продолжит работать. Bitcoin-узлы и проверка RFC 3161 ни от кого из нас не зависят.»*

**Files**:
- [home.html](frontend/src/app/pages/home/home.html) — add `<p class="caption hero-risk">` after subtitle.
- [home.scss](frontend/src/app/pages/home/home.scss) — `.hero-risk` style with subtle shield-icon prefix.
- en.json + ru.json — `hero.riskReversal`.

**Acceptance**: visible on first scroll, max ~2 lines on desktop, max 3 on mobile.

---

## 2. Use cases (4 personas)

**Where**: between `How it works` and `Legal` sections.

**Personas** — each card has icon + headline + scenario + suggested action:

| persona             | EN headline                          | RU headline                            |
|---------------------|--------------------------------------|----------------------------------------|
| Indie developer     | Lock in a release before filing      | Зафиксируй релиз перед подачей         |
| Designer / freelancer | Protect a Figma kit before pitching | Защити Figma-кит перед презентацией   |
| Writer / researcher | Stake your manuscript draft          | Закрепи черновик рукописи              |
| IP / legal team     | Batch-deposit client artifacts       | Депонируй артефакты клиентов пачкой    |

**Files**:
- home.html — new `<ui-section>` with `.use-cases` 4-grid.
- home.scss — `.use-cases` grid (4→2→1 responsive).
- en.json + ru.json — `useCases.*` block (eyebrow, title, subtitle, 4×{title, desc}).

**Acceptance**: 4 equal cards on ≥1024px, 2×2 on tablet, 1-column on mobile.

---

## 3. Comparison table

**Where**: between `Legal` and `Why Bitcoin`.

**Rows × Columns** — 6 dimensions × 5 alternatives:

| dimension                 | mayday          | Notary            | Rospatent        | n'RIS / IPChain        | EU eIDAS TSA       |
|---------------------------|-----------------|-------------------|------------------|------------------------|--------------------|
| Cost per deposit          | Free            | $20–100           | ₽3,000           | $10–50/yr              | €5–50              |
| Time to issue             | <2 min          | hours–days        | ~62 days         | minutes                | minutes            |
| Independent verification  | ✓ math          | ✗ trust           | ✗ trust          | ✗ private chain        | ✓ X.509            |
| Survives provider death   | ✓ Bitcoin       | ✗                 | ✗                | ✗                      | ✓ certs            |
| Court-tested              | ✓ Paris 2025    | ✓ centuries       | ✓ RF             | ⊘ no precedent         | ✓ EU               |
| Open source               | ✓ MIT           | n/a               | ✗                | ✗                      | varies             |

**Files**:
- home.html — new `<ui-section>` with `.compare-wrap` containing semantic `<table>`.
- home.scss — `.compare-table` (sticky first column, brand-tinted mayday column, ✓/✗/⊘ icons).
- en.json + ru.json — `compare.*` block (eyebrow, title, subtitle, dimensions, alternatives, cell values).

**Mobile**: horizontal scroll with sticky first column. No transformation to cards (loses the "math" effect).

**Acceptance**: mayday column visually wins at first glance, no horizontal overflow on 375px (scrolls inside container).

---

## 4. Pricing strip

**Where**: between `Trust grid` and `History`.

**Content**:
- Big **"$0"** + label "Free · Forever · No account".
- 3 bullets:
  1. Core deposit + verify always free.
  2. Open source under MIT — self-host or fork freely.
  3. Premium API / white-label / SLA — coming for teams (link to GitHub issue / waitlist).

**Files**:
- home.html — new `<ui-section>` with `.pricing-card` (1 prominent card, no tier-grid).
- home.scss — `.pricing-card` (large `$0` typography, brand accent, 3 checkmark bullets).
- en.json + ru.json — `pricing.*` block.

**Acceptance**: single card, never confused for a paid tier-table. Premium roadmap stays small/secondary.

---

## 5. Open Graph image (1200×630)

**Where**: `/public/images/og-image.png` (referenced by existing `<meta og:image>` tag).

**Design**:
- 1200×630 canvas, amber gradient background (brand → brand-strong, top-left → bottom-right).
- Left column (60%): huge "deposit" wordmark in Space Grotesk 700 + tagline "Prove you created it first".
- Right column (40%): stylized artifact card (3 rows WHAT/WHO/WHEN, monospace).
- Bottom strip: small "deposit.mayday.software · open source · zero-knowledge".

**Files**:
- create `frontend/public/images/og-image.svg`.
- generate `og-image.png` via `rsvg-convert -w 1200 -h 630 og-image.svg -o og-image.png`.

**Acceptance**: file exists at correct path, opens in browser, looks legible at 600×315 (Twitter compressed preview size).

---

## Verification

1. `cd frontend && npx ng build --configuration development` — clean build.
2. `curl -sf http://localhost:8787/` → 200.
3. `curl -sf http://localhost:8787/images/og-image.png -o /tmp/og && file /tmp/og` → `PNG image data, 1200 x 630`.
4. Visual sanity on http://localhost:8787:
   - Hero shows risk-reversal line under the subtitle.
   - Use-cases grid visible after How-it-works.
   - Comparison table renders, scrolls horizontally on mobile, mayday column highlighted.
   - Pricing card large `$0` visible after Trust grid.
   - i18n EN ↔ RU swap — every new section translates.
5. Lighthouse SEO check — meta tags + og:image now valid.
