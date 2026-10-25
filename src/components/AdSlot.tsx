/**
 * Ad surface. Renders nothing until an AdSense publisher id is configured at
 * build time (VITE_ADSENSE_CLIENT + VITE_ADSENSE_SLOT). Keeping the slot in the
 * layout means turning ads on is a one-variable change, not a refactor.
 */
export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
  const slot = import.meta.env.VITE_ADSENSE_SLOT as string | undefined
  if (!client || !slot) return null

  return (
    <div className="ad-slot" aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
