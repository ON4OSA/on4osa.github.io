# ON4OSA site — maintenance notes

Jekyll site (no theme gem; custom layouts in `_layouts/`, Bootstrap 5 vendored
under `assets/`). Content tables are driven by data files in `_data/`.

## Meertaligheid (NL / EN)

Elke pagina bestaat één keer per taal, onder `/nl/…` en `/en/…`. Er is **geen
plugin** in het spel — alles is Liquid, zodat de site op GitHub Pages blijft
bouwen.

> **De Engelse content gebruikt US English** (spelling, woordkeuze én
> datumnotatie: `Sep 6–7, 2025`, niet `6–7 Sep 2025`).

### Waar wat staat

| Bestand | Rol |
| ------- | --- |
| `_config.yml` → `languages`, `default_lang` | welke talen bestaan, en welke de standaard is |
| `_data/i18n.yml` | **alle** vaste teksten, per taal (navigatie, knoppen, tabelkoppen …) |
| `nl/*.md`, `en/*.md` | de paginabestanden; dun voor datagedreven pagina's |
| `_includes/pages/*.html` | de gedeelde opmaak van datagedreven pagina's |
| `_includes/url.html` | zoekt een URL op via `slug` + taal |
| `_includes/field.html` | leest een vertaald veld uit een data-item |
| `_layouts/redirect.html` | de taalpoort op de oude URL's (`/`, `/about/`, …) |

### Front matter van een pagina

Elke echte pagina heeft **`lang`** en **`slug`**. De `slug` is taalneutraal en
koppelt de vertalingen aan elkaar — daaruit volgen de taalwisselaar, de
`hreflang`-tags en alle interne links:

```yaml
---
layout: default
lang: en
slug: velddagen          # zelfde slug als nl/velddagen.md
title: Field days
permalink: /en/field-days/   # mag per taal verschillen
---
```

De permalink hoeft dus **niet** hetzelfde te zijn in beide talen
(`/nl/radioamateur-worden/` ↔ `/en/become-a-radio-amateur/`).

### Verwijzen naar een andere pagina

Nooit een permalink hardcoden — zoek hem op via de slug:

```liquid
{%- include url.html slug='on9bd' lang=page.lang -%}
<a href="{{ page_url | relative_url }}">…</a>
```

### Teksten

Vaste teksten komen uit `_data/i18n.yml`:

```liquid
{%- assign t = site.data.i18n[page.lang] -%}
{{ t.velddagen.title }}
```

Beide taalblokken moeten dezelfde sleutels hebben. Let op: gebruik **geen
`{`/`}` in placeholders** (`%count%`, niet `%{count}`) — een accolade sluit de
Liquid-expressie voortijdig af.

### Teksten in datavelden

**Taalgebonden velden dragen een achtervoegsel** (`_nl`, `_en`); velden zonder
achtervoegsel gelden voor alle talen. Zo is aan het veld zelf te zien of het
vertaald moet worden:

```yaml
- topic_nl: Draadantennes      # taalgebonden
  topic_en: Wire antennas      # taalgebonden
  speaker: ON6DC               # universeel — geen vertaling nodig
```

```liquid
{% include field.html item=l key='topic' %}
```

`field.html` zoekt in deze volgorde: `<veld>_<taal>` → `<veld>_<default_lang>`
→ `<veld>`. Ontbreekt een vertaling, dan valt de pagina dus terug op het
Nederlands in plaats van leeg te renderen.

Taalgebonden velden per bestand:

| Bestand | `_nl` / `_en` |
| ------- | ------------- |
| `meetings.yml` | `when`, `venue`, `time` |
| `voordrachten.yml` | `date_label` (alleen `_nl`), `location`, `topic` |
| `velddagen.yml` | `date_label` (alleen `_nl`), `event`, `placement` |
| `velddagen_fotos.yml` | `caption`, `alt` |
| `nieuwsbrieven.yml` | `title` |
| `silent-key.yml` | `text` |

Alles daarbuiten is universeel: roepnamen, datums, scores, bestandsnamen,
adressen, URL's, categorieën.

**Datums hebben alleen een `_nl`-veld.** `date_label_nl` is Nederlandse copy;
andere talen formatteren de ISO-datum zelf — voor voordrachten in
`_includes/talk-row.html`, voor velddagen in `_includes/velddag-date.html`.
Zo hoeft er maar één datum onderhouden te worden.

### De taalpoort

`/`, `/velddagen/`, `/about/`, … zijn geen echte pagina's meer maar
`layout: redirect`-stubs. Ze lezen `localStorage.lang` en sturen door; zonder
opgeslagen waarde (of bij een onbekende waarde) naar `default_lang`. De
taalwisselaar schrijft die waarde weg — zie het blok onderaan
`assets/js/main.js`.

Stubs staan op `noindex` + `sitemap: false` en linken elke taal met `hreflang`,
zodat crawlers en bezoekers zonder JavaScript er nog steeds door raken.

### Een pagina toevoegen

1. Maak `nl/<naam>.md` en `en/<naam>.md` met dezelfde `slug`, elk met eigen
   `lang`, `title`, `permalink` en `description`.
2. Zet de gedeelde opmaak in `_includes/pages/` als de pagina datagedreven is;
   is het proza, schrijf het dan gewoon twee keer uit.
3. Voeg de teksten toe aan **beide** blokken in `_data/i18n.yml`.
4. Wil je hem in de navigatie? Zet een item met die `slug` in `nav.items`, in
   beide talen.
5. Oude URL blijven ondersteunen? Maak een stub met `layout: redirect` en een
   `targets`-map.

### Een taal toevoegen

Blok bijzetten in `_data/i18n.yml`, code toevoegen aan `languages` in
`_config.yml`, `<code>/`-paginabestanden aanmaken, en `targets` uitbreiden in
elke redirect-stub.

> **Let op bij `jekyll serve`:** de watcher herlaadt `_config.yml` **niet**.
> Wijzig je `languages` of `default_lang`, herstart dan de server — anders
> bouwt hij door met de oude config en verdwijnt de taalwisselaar uit de
> gegenereerde pagina's.

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
