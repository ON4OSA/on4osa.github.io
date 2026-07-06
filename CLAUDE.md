# ON4OSA site — maintenance notes

Jekyll site (no theme gem; custom layouts in `_layouts/`, Bootstrap 5 vendored
under `assets/`). Content tables are driven by data files in `_data/`.

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
