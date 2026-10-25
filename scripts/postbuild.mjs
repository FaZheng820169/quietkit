/**
 * Post-build for static hosting (GitHub Pages / any CDN):
 *
 * 1. Writes per-route HTML shells so deep links answer HTTP 200 instead of 404.
 * 2. Bakes that route's title, description, canonical and social tags into the
 *    static HTML — crawlers and link previews never run our JavaScript.
 * 3. Emits sitemap.xml and robots.txt from the same route table the app uses.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve('dist')
const base = process.env.VITE_BASE_PATH || '/'
const normalizeBase = base.endsWith('/') ? base : `${base}/`
const siteUrl = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '')

const routes = JSON.parse(readFileSync(resolve('src/content/routes.json'), 'utf8'))

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const basePrefix = normalizeBase === '/' ? '' : normalizeBase.replace(/\/$/, '')

const urlFor = (path) =>
  `${siteUrl}${basePrefix}${path ? `/${path.replace(/^\//, '')}` : ''}`

const shell = readFileSync(resolve(dist, 'index.html'), 'utf8')

function renderShell(path, meta) {
  const url = urlFor(path === '/' ? '' : path)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="QuietKit" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ].join('\n    ')

  return shell.replace(
    /<!--seo-->[\s\S]*?<!--\/seo-->/,
    `<!--seo-->\n    ${head}\n    <!--/seo-->`,
  )
}

// Root shell carries the home page metadata.
writeFileSync(resolve(dist, 'index.html'), renderShell('/', routes['/']))

// Unknown paths fall back to the 404 shell; keep it out of the index.
writeFileSync(
  resolve(dist, '404.html'),
  renderShell('/404', routes['/404']).replace(
    '</title>',
    '</title>\n    <meta name="robots" content="noindex" />',
  ),
)

const sitemapRoutes = []

for (const [path, meta] of Object.entries(routes)) {
  if (path === '/' || path === '/404') continue
  const dir = resolve(dist, `.${path}`)
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), renderShell(path, meta))
  sitemapRoutes.push({ path, meta })
}

const today = new Date().toISOString().slice(0, 10)

const urls = [{ path: '/', meta: routes['/'] }, ...sitemapRoutes]
  .map(
    (route) => `  <url>
    <loc>${urlFor(route.path === '/' ? '' : route.path)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route.meta.priority}</priority>
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
  `User-agent: *\nAllow: /\n\nSitemap: ${urlFor('sitemap.xml')}\n`,
)

console.log(
  `postbuild: ${sitemapRoutes.length + 1} route shells + sitemap for ${urlFor('')}`,
)
