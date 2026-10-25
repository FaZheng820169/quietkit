/**
 * Post-build: GitHub Pages needs a 404.html fallback for client-side routes,
 * and search engines need an up-to-date sitemap.
 */
import { copyFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve('dist')
const base = process.env.VITE_BASE_PATH || '/'
const normalizeBase = base.endsWith('/') ? base : `${base}/`
const siteUrl = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '')

copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))

const routes = [
  { path: '', priority: '1.0' },
  { path: 'tools', priority: '0.8' },
  { path: 'tools/image-compressor', priority: '0.9' },
  { path: 'tools/metadata-cleaner', priority: '0.9' },
  { path: 'tools/pdf-merge', priority: '0.9' },
  { path: 'pricing', priority: '0.6' },
  { path: 'privacy', priority: '0.3' },
  { path: 'about', priority: '0.4' },
]

const today = new Date().toISOString().slice(0, 10)
const urls = routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${normalizeBase}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')

writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
)

writeFileSync(
  resolve(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}${normalizeBase}sitemap.xml\n`,
)

console.log(`postbuild: 404.html + sitemap.xml for ${siteUrl}${normalizeBase}`)
