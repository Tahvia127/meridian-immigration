# Meridian Immigration Law

A law firm site in five languages, one of them right-to-left.

**Status:** unpublished demo. Not on GitHub Pages, not linked from the studio site.
**Built by:** Framework Studio.

---

## What this one proves

Real internationalisation, not a translate widget.

- **Five separate pages**, one per language, each with its own `lang`, `dir`, `<title>`, meta description and JSON-LD. A Google Translate dropdown gives you none of that, and search engines index none of it.
- **`hreflang` on every page**, plus `x-default`, so search engines serve the right language to the right person.
- **Arabic is right-to-left and the layout mirrors**, because the stylesheet uses logical properties (`inset-inline-start`, `border-inline-start`, `padding-block-end`) rather than left and right. Nothing is flipped by hand; the browser does it because the CSS was written to allow it.
- **Per-language typography.** Arabic loads Noto Sans Arabic with a looser line height; Chinese loads Noto Sans SC. Neither is downloaded on the English page. Letter-spaced uppercase treatments are switched off for both, because they are a Latin-script idea that damages Arabic and Chinese.

## The build refuses to ship a broken translation

`build.mjs` flattens `en.json` into a set of key paths and checks every other language against it. A missing or extra key fails the build with a non-zero exit and names the key. You cannot accidentally publish a page with an untranslated section.

```
data/i18n/en.json  ─┐
data/i18n/es.json  ─┤
data/i18n/pl.json  ─┼─> build.mjs ─> index.html, es.html, pl.html, zh.html, ar.html
data/i18n/zh.json  ─┤
data/i18n/ar.json  ─┘
```

85 strings per language, verified identical across all five.

## Honest about the translations

Every non-English page carries a notice saying it was machine-assisted and is awaiting review by a native speaker, with an invitation to report anything wrong. On a legal site, presenting unreviewed translation as professional translation would be the actual harm — a client could act on a mistranslated deadline.

Before launch, a native speaker reviews each file. Nothing else changes; the JSON is the only thing they touch.

## Repository layout

```
data/site.json      Firm details, language list, demo notice.
data/i18n/*.json    One file per language. en.json is the reference.
src/page.template.html   One template, rendered five times.
build.mjs           Renders and validates. No dependencies.
*.html              Generated. Do not edit by hand.
```

## Running it

```bash
node build.mjs
python3 -m http.server 8000
```

## Design notes

- **Type:** Lora for display, Inter for body, plus Noto Sans Arabic and Noto Sans SC where needed.
- **Color:** ivory `#F7F4EE`, indigo `#2B3A67`, terracotta `#A64F30`. All pairings clear WCAG AA; the light terracotta was raised from 3.5:1 to 5.3:1 on indigo during the build.
- **Layout fix worth noting:** the fixed demo banner was covering the first 30px of page content, because the translation notice sits in normal flow before the sticky nav. The body now carries a matching top offset.

## Before this goes to a real client

1. Native-speaker review of every `data/i18n/*.json` file, then remove `transNote`.
2. Point the intake form at the firm's case management system over TLS. It currently validates and confirms without sending.
3. Replace the placeholder bar-number line with the real admission details.
4. Set `demo.show` to `false` in `data/site.json`.

## A note on the firm

Meridian is fictional. The bar note deliberately says "shown on request" rather than inventing a licence number, because a plausible-looking bar number on a law firm page is the kind of detail that should not exist even in a demo. Every page carries a disclaimer that nothing here is legal advice and that using the site creates no lawyer-client relationship.
