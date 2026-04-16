# CIS legal and market research for code deposit

Date of consolidation: 2026-04-15

This is a product-positioning brief, not legal advice.
Always validate claims with counsel before legal reliance.

## Executive summary

1. In most CIS jurisdictions, private deposit services usually prove existence/time, not automatic authorship presumption.
2. Government registration tracks (where available) remain the strongest formal path for presumptive legal standing.
3. Cryptographic evidence (hashes, signatures, timestamps) can be introduced as supporting evidence, but court treatment is jurisdiction-specific.
4. Product messaging should be "complementary evidence layer", not "full replacement of state registration".

## Practical legal framing for this project

### What we can safely claim

- The system records integrity fingerprints and timestamp evidence.
- Verification can be done independently from the platform operator.
- Evidence can support a broader proof package (development history, contracts, correspondence, publication trail).

### What we should avoid claiming

- Guaranteed authorship presumption from deposit alone.
- Guaranteed acceptance in every court.
- Statements implying legal registration equivalence in all jurisdictions.

## Country and ecosystem snapshot (high-level)

### Russia

- Software rights exist upon creation; registration is not mandatory for right existence.
- State software registration route (Civil Code Article 1262) is distinct from private deposit services.
- Private deposit evidence should be treated as supplementary proof material.

### Belarus

- National mechanisms exist for voluntary registration/deposit handling.
- Practical evidentiary value depends on court evaluation of the full evidence set.

### Kazakhstan

- State registry workflow exists for copyright objects including software.
- Administrative registration path remains distinct from private timestamp/deposit tools.

### Uzbekistan

- Software is protected under copyright framework as literary work category.
- Formal registration channels exist, while private technical proofs remain supportive.

### Kyrgyzstan

- Voluntary registration mechanisms exist via national IP institutions.
- Private cryptographic artifacts are best positioned as additional evidence.

### Armenia

- Notable due to stronger statutory treatment around deposit in some legal commentary.
- Still requires careful jurisdiction-specific legal interpretation before product claims.

### Azerbaijan

- National IP agency route exists for copyright registration functions.
- Private technical evidence remains complementary to formal legal procedures.

## Market positioning implications

### Positioning line

"Independent cryptographic evidence for software creation timeline and integrity."

### Recommended comparison stance

- Versus private registries: emphasize verifiability and openness.
- Versus government registration: emphasize speed, cost, and privacy for technical workflow; avoid equivalence claims.
- Versus notary process: emphasize developer-native automation and repeatability.

## Evidence stack recommended to users

For stronger disputes, combine:

1. source history (Git commits, tags, release artifacts),
2. authorship indicators (signed commits/releases, identity trail),
3. timestamp proofs (OTS/RFC3161 where used),
4. contractual and communication context.

No single artifact should be marketed as universally sufficient.

## Source list (curated)

### Product and technical standards

- OpenTimestamps: [https://opentimestamps.org/](https://opentimestamps.org/)
- Citation File Format: [https://citation-file-format.github.io/](https://citation-file-format.github.io/)
- Angular Service Worker docs: [https://angular.dev/ecosystem/service-workers/getting-started](https://angular.dev/ecosystem/service-workers/getting-started)
- Cloudflare Workers Static Assets docs: [https://developers.cloudflare.com/workers/static-assets/](https://developers.cloudflare.com/workers/static-assets/)

### Legal and institutional references used in prior research

- Russia legal overview references:
  - [https://www.consultant.ru/document/cons_doc_LAW_64629/](https://www.consultant.ru/document/cons_doc_LAW_64629/)
  - [https://base.garant.ru/12184522/](https://base.garant.ru/12184522/)
- Armenia law portal:
  - [https://www.aipa.am/en/CopyrightLaw/](https://www.aipa.am/en/CopyrightLaw/)
- EU Trusted List browser entry point:
  - [https://eidas.ec.europa.eu/efda/tl-browser/](https://eidas.ec.europa.eu/efda/tl-browser/)

Note: Some legal portals expose anti-bot or script-heavy pages; manual legal review is still required.

## Actuality

> ✅ Verified 2026-04-16 — legal references checked, positioning recommendations unchanged.
> All external legal portal links accessible as of audit date.
> Re-verified 2026-04-16 — claims cross-checked against product code and JSON-LD; positioning consistent.

---

## RU summary

Ключевой вывод для продукта: в большинстве стран СНГ депонирование и частные сервисы фиксируют факт существования/дату, но не дают автоматическую презумпцию авторства как универсальное правило.

Поэтому корректное позиционирование:

- не "замена госрегистрации",
- а "дополнительный независимый криптографический слой доказательств".

Для практической защиты нужно сочетать несколько слоёв:

- историю разработки (git),
- идентификацию автора,
- таймштампы,
- договорные и коммуникационные доказательства.
