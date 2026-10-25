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
  path
    ? `${siteUrl}${basePrefix}/${path.replace(/^\//, '')}`
    : `${siteUrl}${basePrefix}/`

const shell = readFileSync(resolve(dist, 'index.html'), 'utf8')

function renderShell(path, meta) {
  const url = urlFor(path === '/' ? '' : path)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = `${siteUrl}${basePrefix}/og.png`
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="QuietKit" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${image}" />`,
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

// AdSense asks for ads.txt at the domain root. On a custom domain that is
// exactly where this file lands; on the github.io project subpath it is
// advisory only, which is one more reason to move to a domain of our own.
const adsenseClient = process.env.VITE_ADSENSE_CLIENT
if (adsenseClient) {
  const publisher = adsenseClient.replace(/^ca-/, '')
  writeFileSync(
    resolve(dist, 'ads.txt'),
    `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`,
  )
  console.log(`postbuild: ads.txt for ${publisher}`)
}

console.log(
  `postbuild: ${sitemapRoutes.length + 1} route shells + sitemap for ${urlFor('')}`,
)
