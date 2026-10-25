import { useEffect } from 'react'
import routes from '../content/routes.json'

const SITE = 'QuietKit'

type Seo = {
  title: string
  description: string
  path?: string
  jsonLd?: Record<string, unknown>
}

type RouteMeta = { title: string; description: string; priority: string }

const meta = routes as Record<string, RouteMeta>

/**
 * Single source of truth for per-route titles and descriptions. The same JSON
 * is read by scripts/postbuild.mjs so the shipped HTML carries them too.
 */
export function routeMeta(path: string) {
  const entry = meta[path]
  if (!entry) throw new Error(`No route metadata for ${path}`)
  return { title: entry.title, description: entry.description, path }
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
}

export function useSeo({ title, description, path, jsonLd }: Seo) {
  useEffect(() => {
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })

    const origin = window.location.origin
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    const canonical = `${origin}${base}${path || window.location.pathname.replace(base, '')}`
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })

    let script = document.getElementById('route-jsonld')
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = 'route-jsonld'
        ;(script as HTMLScriptElement).type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [title, description, path, jsonLd])
}

export function toolJsonLd(name: string, description: string, path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'WebApplication'],
    name,
    description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (browser)',
    browserRequirements: 'Requires JavaScript. Runs entirely in the browser.',
    url: `${window.location.origin}${base}${path}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: SITE },
  }
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}
