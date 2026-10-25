import { useEffect, useRef } from 'react'

/**
 * Ad surface. Renders nothing until an AdSense publisher id is configured at
 * build time (VITE_ADSENSE_CLIENT + VITE_ADSENSE_SLOT), so the live site has no
 * third-party script until ads are deliberately turned on.
 */
let loader: Promise<void> | null = null

function loadAdsense(client: string): Promise<void> {
  if (loader) return loader
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('ad script blocked')))
    document.head.appendChild(script)
  })
  return loader
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
  const slot = import.meta.env.VITE_ADSENSE_SLOT as string | undefined
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)
  const enabled = Boolean(client && slot)

  useEffect(() => {
    if (!client || !slot) return
    let cancelled = false

    loadAdsense(client)
      .then(() => {
        if (cancelled || pushed.current || !insRef.current) return
        pushed.current = true
        window.adsbygoogle = window.adsbygoogle ?? []
        // One push per <ins>, in the order they appear on the page.
        window.adsbygoogle.push({})
      })
      // A blocker, a corporate proxy or an offline tab must never break a tool.
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [client, slot])

  if (!enabled) return null

  return (
    <div className="ad-slot">
      <span className="ad-label">{label}</span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
