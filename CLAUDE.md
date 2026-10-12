# ON4OSA site — maintenance notes

Jekyll site (no theme gem; custom layouts in `_layouts/`, Bootstrap 5 vendored
under `assets/`). Content tables are driven by data files in `_data/`.

## Multilingual (NL / EN)

Every page exists once per language, under `/nl/…` and `/en/…`. There is **no
plugin** involved — it is all Liquid, so the site keeps building on GitHub
Pages.

> **The English content uses US English** (spelling, word choice and date
> format: `Sep 6–7, 2025`, not `6–7 Sep 2025`).

### Where things live

| File | Role |
| ---- | ---- |
| `_config.yml` → `languages`, `default_lang`, `fallback_lang` | which languages exist, the base language, and the gateway fallback |
| `_data/i18n.yml` | **all** fixed UI strings, per language (navigation, buttons, table headers …) |
| `nl/*.md`, `en/*.md` | the page files; thin for data-driven pages |
| `_includes/pages/*.html` | shared markup for data-driven pages |
| `_includes/url.html` | looks up a URL by `slug` + language |
| `_includes/field.html` | reads a translated field from a data item |
| `_layouts/redirect.html` | the language gateway on the old URLs (`/`, `/about/`, …) |

### Page front matter

Every real page has **`lang`** and **`slug`**. The `slug` is language-neutral
and ties the translations together — the language switcher, the `hreflang`
tags and all internal links are derived from it:

```yaml
---
layout: default
lang: en
slug: field-days         # same slug as nl/velddagen.md
title: Field days
permalink: /en/field-days/   # may differ per language
---
```

So the permalink does **not** have to match across languages
(`/nl/radioamateur-worden/` ↔ `/en/become-a-radio-amateur/`).

### Linking to another page

Never hardcode a permalink — look it up by slug:

```liquid
{%- include url.html slug='on9bd' lang=page.lang -%}
<a href="{{ page_url | relative_url }}">…</a>
```

### UI strings

Fixed strings come from `_data/i18n.yml`:

```liquid
{%- assign t = site.data.i18n[page.lang] -%}
{{ t.velddagen.title }}
```

Both language blocks must have the same keys. Note: **don't use `{`/`}` in
placeholders** (`%count%`, not `%{count}`) — a brace closes the Liquid
expression early.

### Strings in data fields

**Language-specific fields carry a suffix** (`_nl`, `_en`); fields without a
suffix apply to every language. That way the field name itself tells you
whether it needs translating:

```yaml
- topic_nl: Draadantennes      # language-specific
  topic_en: Wire antennas      # language-specific
  speaker: ON6DC               # universal — no translation needed
```

```liquid
{% include field.html item=l key='topic' %}
```

`field.html` looks up in this order: `<field>_<lang>` → `<field>_<default_lang>`
→ `<field>`. So a missing translation falls back to the Dutch instead of
rendering empty.

Language-specific fields per file:

| File | `_nl` / `_en` |
| ---- | ------------- |
| `meetings.yml` | `when`, `venue`, `time` |
| `agenda.yml` | `date_label` (`_nl` only), `location`, `topic` |
| `velddagen.yml` | `date_label` (`_nl` only), `event`, `placement` |
| `velddagen_fotos.yml` | `caption`, `alt` |
| `nieuwsbrieven.yml` | `title` |
| `silent-key.yml` | `text` |
| `posters.yml` | `alt`, `aria` |

Everything else is universal: callsigns, dates, scores, filenames, addresses,
URLs, categories.

**Dates only have an `_nl` field.** `date_label_nl` is Dutch copy; other
languages format the ISO date themselves — talks in `_includes/talk-row.html`,
field days in `_includes/velddag-date.html`. That way there is only one date to
maintain.

### The language gateway

`/`, `/velddagen/`, `/about/`, … are no longer real pages but `layout: redirect`
stubs. They pick the language in this order:

1. **`localStorage.lang`** — an earlier choice made with the language switcher
   always wins. The switcher stores that value; see the block near the top of
   `assets/js/main.js`.
2. **The browser language** — the first language in `navigator.languages` that
   we publish. Matching is on the primary subtag, so `nl-BE` and `nl-NL` both
   count as `nl`.
3. **`fallback_lang`** (`en`) — for visitors asking for neither Dutch nor
   English.

Mind the difference with `default_lang` (`nl`): that is the site's *base
language* (the `_nl` fields and the canonical), not what an unknown visitor
gets to see. `hreflang="x-default"` therefore follows `fallback_lang`, not
`default_lang`: that tag should point at the page a visitor without a matching
language actually lands on, which is the English one.

Stubs are `noindex` + `sitemap: false` and link every language with
`hreflang`, so crawlers and visitors without JavaScript still get through.
Their canonical points to the Dutch version (the base language); their
`x-default` to the English one, same as on the real pages.

### Activations cards on the homepage

The four cards come from `home.activations` in `_data/i18n.yml`, per language.
Each item has `title`, `text` and `button` (the button label — per item, so
"Our results" next to "Visit the website"), plus one of:

- `slug` — an internal page, looked up via `url.html`;
- `url` — an external site, opens in a new tab;
- neither — the button becomes a visibly disabled placeholder.

### Adding a page

1. Create `nl/<name>.md` and `en/<name>.md` with the same `slug`, each with its
   own `lang`, `title`, `permalink` and `description`.
2. Put the shared markup in `_includes/pages/` if the page is data-driven; if
   it is prose, simply write it twice.
3. Add the strings to **both** blocks in `_data/i18n.yml`.
4. Want it in the navigation? Add an item with that `slug` to `nav.items`, in
   both languages.
5. Need the old URL to keep working? Create a stub with `layout: redirect` and
   a `targets` map.

### Adding a language

Add a block to `_data/i18n.yml`, add the code to `languages` in `_config.yml`,
create the `<code>/` page files, and extend `targets` in every redirect stub.

> **Beware with `jekyll serve`:** the watcher does **not** reload
> `_config.yml`. If you change `languages` or `default_lang`, restart the
> server — otherwise it keeps building with the old config and the language
> switcher disappears from the generated pages.

## Content images — tiered format strategy (AVIF → WebP → JPEG)

**Preferred way to add a content photo.** Ship three encodings of the same
image and let the browser pick the best one it supports, via `<picture>`:

```html
<picture>
  <source srcset="/assets/img/name.avif" type="image/avif">
  <source srcset="/assets/img/name.webp" type="image/webp">
  <img src="/assets/img/name.jpg" alt="Description"
       width="1200" height="896" loading="lazy" decoding="async">
</picture>
```

Rules that matter:

- **Order is significant.** The browser takes the *first* `<source>` whose
  `type` it understands, so keep AVIF → WebP, smallest format first.
- **`<img>` is the fallback and carries the attributes.** `alt`,
  `width`/`height`, `loading` and `decoding` belong on the `<img>`, not on the
  `<source>` elements. Never drop the `<img>` — without it nothing renders.
- **Always set `width`/`height`** to the image's real pixel size. The browser
  derives the aspect ratio and reserves the space before the file arrives,
  which prevents layout shift (CLS). It does *not* fix the displayed size as
  long as the CSS says `width: 100%; height: auto` (as `.on9bd-img` does).
- **All three files must exist.** If a `<source>` 404s the browser does **not**
  fall back to the next one — the image simply breaks. Generate every variant.
- Use `loading="lazy"` for below-the-fold images only; never for an image
  visible on first paint.

### Generating the variants (requires ImageMagick ≥ 7.1.2 with AVIF support)

Check AVIF is available first — it must show `rw+`:

```sh
magick -list format | grep -i avif
```

Then, from the original (JPEG is the source of truth, kept for fallback):

```sh
magick assets/img/name.jpg -strip -quality 50 assets/img/name.avif
magick assets/img/name.jpg -strip -quality 80 -define webp:method=6 assets/img/name.webp
```

- `-strip` removes EXIF/metadata.
- AVIF `-quality 50` ≈ visually equivalent to JPEG ~80; AVIF's scale is not the
  same as JPEG's, so lower numbers are normal and still look fine.
- `webp:method=6` is the slowest/best compression setting.
- Do **not** upscale or change dimensions — all three variants must be the same
  pixel size, otherwise the `width`/`height` on `<img>` no longer matches.

#### Batch: all three formats at once

For a single image (writes `name.avif` + `name.webp` next to `name.jpg`):

```sh
f=assets/img/name.jpg
magick "$f" -strip -quality 50 "${f%.jpg}.avif"
magick "$f" -strip -quality 80 -define webp:method=6 "${f%.jpg}.webp"
```

For every JPEG in a folder:

```sh
for f in assets/img/nieuwsbrieven/*.jpg; do
  magick "$f" -strip -quality 50 "${f%.jpg}.avif"
  magick "$f" -strip -quality 80 -define webp:method=6 "${f%.jpg}.webp"
done
```

For every JPEG under `assets/img/`, skipping ones already done (safe to re-run):

```sh
find assets/img -name '*.jpg' | while read -r f; do
  [ -f "${f%.jpg}.avif" ] || magick "$f" -strip -quality 50 "${f%.jpg}.avif"
  [ -f "${f%.jpg}.webp" ] || magick "$f" -strip -quality 80 -define webp:method=6 "${f%.jpg}.webp"
done
```

Verify afterwards that every JPEG has both siblings — a missing variant means a
broken image, not a fallback:

```sh
find assets/img -name '*.jpg' | while read -r f; do
  for e in avif webp; do
    [ -f "${f%.jpg}.$e" ] || echo "MISSING: ${f%.jpg}.$e"
  done
done
```

Reference result for `westhinder.jpg` (1200×896):

| Format | Size | vs JPEG |
| ------ | ---- | ------- |
| JPEG   | 265K | —       |
| WebP   | 165K | −38%    |
| AVIF   | 89K  | −67%    |

Check the source image's real dimensions with:

```sh
magick identify -format '%wx%h\n' assets/img/name.jpg
```

Note that a `<picture>` is inline by default. Where the `<img>` relies on a
percentage height (as the newsletter covers do), give the wrapper a box too —
see `.newsletter-cover picture` in `assets/css/main.css`.

### Where this is applied

- `assets/img/westhinder.jpg` — ON9BD section on the homepage.
- `assets/img/nieuwsbrieven/*.jpg` — the OSA Nieuws cards (featured + grid).
- Still plain JPEG: the carousel images in `assets/img/velddagen/` (and
  `westhinder.jpg` as used by the carousel on `/on9bd/`). Converting those means
  the carousel loop has to assume all three variants exist for every gallery
  image — see the 404 caveat above before doing it.

## Posters on the homepage

The posters above the talks table on the homepage come from
`_data/posters.yml`, shown side by side in file order. Adding or removing a
poster never touches `_data/i18n.yml` or the layout — everything per poster
lives in that file:

```yaml
- file: poster-nieuwjaarsdrink-2027   # base name in assets/img/posters/
  width: 1086                         # pixel size of <file>.jpg
  height: 1537
  alt_nl: Affiche van de nieuwjaarsdrink 2027 …   # alt text + lightbox title
  alt_en: Poster for the 2027 New Year's reception …
  aria_nl: Bekijk de affiche van de nieuwjaarsdrink op ware grootte   # button label
  aria_en: View the New Year's reception poster at full size
```

Each poster needs **six files** in `assets/img/posters/`: `<file>.{avif,webp,jpg}`
(full size, opened in the lightbox) and `<file>-thumb.{avif,webp,jpg}`.
Name them `poster-<event>`. From a PDF:

```sh
cd assets/img/posters
magick -density 300 "poster.pdf[0]" -background white -flatten \
  -resize 1086x -strip -quality 85 poster-<event>.jpg
magick poster-<event>.jpg -resize 446x -strip -quality 85 poster-<event>-thumb.jpg
for f in poster-<event>.jpg poster-<event>-thumb.jpg; do
  magick "$f" -strip -quality 50 "${f%.jpg}.avif"
  magick "$f" -strip -quality 80 -define webp:method=6 "${f%.jpg}.webp"
done
```

(Width 1086/446 suits a portrait A4; for a landscape poster use 1448/840.)

- `width`/`height` are the full-size image's; the thumbnail reuses them, so it
  **must have the same aspect ratio**. Only the ratio matters there — the
  browser uses it to reserve space and to lay the thumbnails out.
- The thumbnails always share one height, whatever mix of portrait and
  landscape: each one grows in proportion to its aspect ratio, and the row's
  `max-width` (computed in `home.html` from the sum of the ratios) caps that
  height at 315px. No CSS change is needed for a new poster.
- Landscape posters open in a wide (`modal-xl`) lightbox, portrait ones in a
  narrower (`modal-lg`) one.
- Remove a poster's entry once the event is over. An empty file hides the
  row altogether.

## Velddagen — carousel photos

The "Enkele sfeerbeelden" carousel on `/velddagen/` is driven by
`_data/velddagen_fotos.yml` — one entry per photo, in slide order (newest
velddag on top, chronological within a velddag):

- `file` — filename in `assets/img/velddagen/`, without the `.jpg`
- `caption` — text in the grey pill at the bottom of the slide
- `alt` — optional; falls back to `caption` when omitted

House format for these photos, matching the ones already committed: **max
1600 px on the long side, progressive JPEG, quality 85, no metadata**. Camera
originals are 6000×4000 and carry EXIF/IPTC/XMP (including the photographer's
name) plus an ICC profile, so always run them through:

```sh
magick original.jpg -auto-orient -resize '1600x1600>' -strip \
  -interlace Plane -quality 85 assets/img/velddagen/velddag-ssb-2026-1.jpg
```

- `-auto-orient` **before** `-strip`, otherwise rotated shots come out sideways
  once the EXIF orientation tag is gone.
- `-resize '1600x1600>'` caps the long edge and only ever shrinks (quote it —
  the `>` is a shell redirect otherwise).
- `-strip` drops all metadata. Safe here because the profiles are plain sRGB;
  check with `magick identify -format '%[profile:icc]' f.jpg` if unsure.

Confirm nothing survived:

```sh
magick identify -verbose assets/img/velddagen/name.jpg | grep -c 'Profile-\|exif:'
```

Naming is `velddag-<mode>-<year>-<n>.jpg` (e.g. `velddag-cw-2026-1.jpg`). These
stay plain JPEG — see the note above about the carousel and missing variants.

### Per-velddag photo galleries

Each row of the results table on `/velddagen/` shows a photo icon when that
velddag has pictures; clicking it opens a lightbox carousel. **There is nothing
to configure** — the gallery is discovered from the filename:

    velddag-<mode>-<year>-<n>.<ext>   in  assets/img/velddagen/

The page derives the prefix from the table row itself (`event` gives the mode,
`date` gives the year), so an entry `UBA Velddag SSB` + `2025-09-06` picks up
every `velddag-ssb-2025-*` file. **To add photos to a velddag: process them as
above, name them with that prefix, drop them in the folder.** No YAML edit, no
new page markup. A velddag with no matching files simply shows no icon.

Notes:

- The files are used **as-is, in their original format** — the gallery reads
  whatever is on disk via `site.static_files`, so `.jpg`, `.png` and `.webp`
  all work and no AVIF/WebP variants are generated for them.
- Slides are ordered by filename, so numbering past `-9` sorts
  lexicographically (`-10` lands between `-1` and `-2`). Zero-pad
  (`-01`, `-02`, …) from the start if a velddag will have ten or more photos.
- The same files also feed the "Enkele sfeerbeelden" carousel at the bottom of
  the page, which *is* explicit — add a captioned entry in
  `_data/velddagen_fotos.yml` if a photo should appear there too.

The lightbox itself: Bootstrap supplies Esc, backdrop-click, focus trapping,
scroll locking and touch swipe. The block at the bottom of `assets/js/main.js`
adds ←/→ and Home/End (Bootstrap only binds those while focus is *inside* the
carousel, which never happens in a modal), the "3 / 7" counter, and eager
loading of the neighbouring slides. Nothing to configure per gallery.

## OSA Nieuws — newsletter thumbnails

The "OSA Nieuws" section shows each newsletter as a card rendered from the
**first page** of its PDF.

- PDFs live in `assets/nieuwsbrieven/` (e.g. `OSA_nieuws_2026_2.pdf`).
- First-page thumbnails live in `assets/img/nieuwsbrieven/` with the **same
  base filename** but `.jpg` (e.g. `OSA_nieuws_2026_2.jpg`).
- The cards are listed in `_data/nieuwsbrieven.yml` (newest first); `file` is the
  base name without extension, shared by the PDF and its thumbnail.

### Regenerate a thumbnail (requires ImageMagick + Ghostscript)

Single file:

```sh
magick -density 150 "assets/nieuwsbrieven/OSA_nieuws_2026_2.pdf[0]" \
  -background white -flatten -resize 640x -quality 82 -strip \
  "assets/img/nieuwsbrieven/OSA_nieuws_2026_2.jpg"
```

All PDFs at once:

```sh
for f in assets/nieuwsbrieven/*.pdf; do
  name=$(basename "$f" .pdf)
  magick -density 150 "${f}[0]" -background white -flatten \
    -resize 640x -quality 82 -strip "assets/img/nieuwsbrieven/${name}.jpg"
done
```

- `[0]` selects the first page.
- `-background white -flatten` composites transparent PDFs onto white.
- `-resize 640x` caps the width at 640px (A4 first page → ~640×905).
- `-strip` removes all metadata (EXIF etc.).

### Adding a new edition

1. Drop `OSA_nieuws_YYYY_N.pdf` into `assets/nieuwsbrieven/` (`chmod 644`).
2. Run the single-file command above for it.
3. Add a two-line entry at the top of `_data/nieuwsbrieven.yml`.

## Shareable section links (copy icon next to a heading)

Every `<h2 class="vd-subhead">` on `/radioamateur-worden/` (and
`/become-a-radio-amateur/`) carries a chain icon. Clicking it copies that
section's full URL to the clipboard, so you can send someone straight to one
part of the page.

Adding it to a heading — the `id` must match the heading's own. Use a short
keyword from the heading, in that page's language (`voorbereiden` on the
Dutch page, `preparing` on the English one), lowercase and hyphenated:

```liquid
<h2 class="vd-subhead" id="examen">Het examen per klasse{% include heading-anchor.html id='examen' %}</h2>
```

- The strings (`anchor.copy`, `anchor.copied`) live in `_data/i18n.yml`, per
  language; the include fetches them itself via `page.lang`.
- The icon is a **real `<a href="#id">`**. Without JavaScript — or when the
  clipboard is refused — it still works as a plain jump link.
- After a successful copy the JS sets the hash with `history.replaceState`
  instead of letting the link navigate: the default jump would needlessly
  scroll the heading under the navbar while you're already looking at it.
- Visibility: hidden until you hover the heading, but **always visible where
  hover doesn't exist** (touch) — the same `@media (hover: hover) and (pointer:
  fine)` trick as the carousel captions. `:focus-visible` reveals it too,
  because keyboard users never get a hover.
- The confirmation bubble sits **below** the icon, right-aligned: above it
  would disappear under the sticky navbar, and centered it would run off-screen
  on a long heading on mobile.
- **Keep the full `0 0 24 24` viewBox** and size the icon in CSS. Trimming the
  viewBox to the artwork leaves the strokes touching its edge, and Firefox
  snaps the SVG viewport to whole device pixels and clips them.

## Favicons and app icons

All icons are derived from the OSA diamond emblem. **`favicon.svg` in the repo
root is the master** — it is the club logo SVG with its `viewBox` widened to a
square so the (roughly 1:2) diamond sits centred with ~5 % padding. Every raster
below is generated from it, so replacing the artwork means replacing
`favicon.svg` and re-running the commands.

| File | Size | Transparency | Used by |
| ---- | ---- | ------------ | ------- |
| `favicon.svg` | vector | transparent | modern browsers; **master for all others** |
| `favicon.ico` | 16 + 32 + 48 | transparent | older browsers, bookmarks |
| `apple-touch-icon.png` | 180×180 | **opaque** (white) | iOS home screen |
| `assets/img/icons/icon-192.png` | 192×192 | **opaque** (white) | Android / PWA |
| `assets/img/icons/icon-512.png` | 512×512 | **opaque** (white) | Android / PWA, splash |
| `assets/img/icons/icon-maskable-512.png` | 512×512 | **opaque** (white) | Android adaptive icons |
| `site.webmanifest` | — | — | lists the three PWA icons |

Rules that matter:

- **iOS and Android icons must be opaque.** iOS renders transparency as solid
  black, which swallows the emblem's black interior. Only `favicon.svg` and
  `favicon.ico` stay transparent, so they adapt to light/dark browser tabs.
- **The maskable icon needs a safe zone.** Its artwork is scaled to ~80 % of the
  canvas so Android's circle/squircle crop does not clip the diamond's points.
- **Do not stretch the emblem to a square.** It is about 1:2; squash it and the
  diamond distorts. The square `viewBox` in `favicon.svg` handles this.
- The `<link>` tags live in `_layouts/default.html`, alongside
  `<meta name="theme-color">`. `favicon.ico`, `apple-touch-icon.png`,
  `site.webmanifest` and `favicon.svg` must stay in the **repo root** — browsers
  and iOS probe those paths directly.
- Known limitation: at 16×16 the emblem blurs into an olive smudge (thin yellow
  border + black interior + small letters average together). Rendering directly,
  downsampling with Lanczos and sharpening all give the same result. A separate
  simplified glyph — solid diamond, no letters or antenna — is the only real fix.

### Regenerating (requires librsvg + ImageMagick)

`rsvg-convert` is used rather than ImageMagick's SVG renderer because it handles
the paths correctly. From the repo root:

```sh
# 1. multi-resolution favicon.ico (transparent)
for s in 16 32 48; do rsvg-convert -w $s -h $s favicon.svg -o /tmp/ico-$s.png; done
magick /tmp/ico-16.png /tmp/ico-32.png /tmp/ico-48.png favicon.ico

# 2. apple-touch-icon: artwork on ~80 % of an opaque 180x180 canvas
rsvg-convert -w 144 -h 144 favicon.svg -o /tmp/at.png
magick /tmp/at.png -background white -gravity center -extent 180x180 \
  -alpha remove -alpha off -strip apple-touch-icon.png

# 3. PWA icons (opaque)
for s in 192 512; do
  rsvg-convert -w $s -h $s favicon.svg -o /tmp/m-$s.png
  magick /tmp/m-$s.png -background white -alpha remove -alpha off -strip \
    assets/img/icons/icon-$s.png
done

# 4. maskable icon: artwork at 80 % inside a 512x512 canvas
rsvg-convert -w 410 -h 410 favicon.svg -o /tmp/mask.png
magick /tmp/mask.png -background white -gravity center -extent 512x512 \
  -alpha remove -alpha off -strip assets/img/icons/icon-maskable-512.png
```

Check the `.ico` really contains three sizes:

```sh
magick identify favicon.ico
```

### Replacing the logo

1. Put the new square SVG at `favicon.svg` in the repo root. If the artwork is
   not square, widen its `viewBox` (keep the same centre) instead of changing
   `width`/`height` — see the note above.
2. Re-run the four commands above.
3. If the brand colour changes, update `theme_color` in `site.webmanifest` and
   the `theme-color` meta tag in `_layouts/default.html` (currently `#4c63d2`).
