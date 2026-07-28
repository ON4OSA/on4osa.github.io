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
