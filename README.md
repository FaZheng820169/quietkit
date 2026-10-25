# QuietKit

Private file tools that run entirely in the browser. No uploads, no accounts, no server-side processing.

Live site: https://fazheng820169.github.io/quietkit/

## Tools

- **Image compressor** — resize and re-encode JPEG / PNG / WebP with the Canvas API.
- **Metadata cleaner** — a hand-written JPEG/PNG segment parser that lists EXIF, GPS, XMP and IPTC data, then rewrites the file without it (preserving the display orientation tag).
- **PDF merge** — copies pages between documents with pdf-lib, without rasterising them.

## Development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check, build to dist/, emit 404.html + sitemap.xml
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`VITE_BASE_PATH=/<repo-name>/` and publishes `dist/` to GitHub Pages.

Set `VITE_ADSENSE_CLIENT` and `VITE_ADSENSE_SLOT` at build time to activate the
ad slots that are already positioned in the layouts.

## Testing note

`scripts/postbuild.mjs` copies `index.html` to `404.html` so client-side routes
work on GitHub Pages, and generates `robots.txt` + `sitemap.xml` from `SITE_URL`.
