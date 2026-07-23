# ON4OSA site — maintenance notes

Jekyll site (no theme gem; custom layouts in `_layouts/`, Bootstrap 5 vendored
under `assets/`). Content tables are driven by data files in `_data/`.

## Content images — tiered format strategy (AVIF → WebP → JPEG)

**Preferred way to add a content photo.** Ship three encodings of the same
image and let the browser pick the best one it supports, via `<picture>`:

```html
<picture>
  <source srcset="/assets/img/name.avif" type="image/avif">
  <source srcset="/assets/img/name.webp" type="image/webp">
  <img src="/assets/img/name.jpg" alt="Describtion"
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
