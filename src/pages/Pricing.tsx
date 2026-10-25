import { Link } from 'react-router-dom'
import { CheckIcon } from '../components/Icons'
import { routeMeta, useSeo } from '../lib/seo'

const freeFeatures = [
  'All thirty-seven tools, unlimited files',
  'Batch a whole folder in one pass',
  'No watermark on any result',
  'No account, no email',
  'Works offline once loaded',
  'Files never leave your browser',
]

const proFeatures = [
  'Custom batch chains you design yourself',
  'Saved presets per tool',
  'No ads on any page',
  'One licence, no renewal',
]

export function Pricing() {
  useSeo(routeMeta('/pricing'))

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Pricing</span>
          <h1>Free today. Pro when it is actually useful.</h1>
          <p>
            Charging money for a tool that costs almost nothing to run would be strange. The free
            tier is the product; Pro exists for people who want to design their own batch chains
            and presets — and for anyone who would rather not see the ads that keep the free tier
            running.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="price-grid">
            <div className="price-card featured">
              <div>
                <span className="eyebrow">Available now</span>
                <h2 style={{ fontSize: 24, marginTop: 10 }}>Free</h2>
              </div>
              <div className="price">
                $0 <span>forever</span>
              </div>
              <ul className="price-list">
                {freeFeatures.map((feature) => (
                  <li key={feature}>
                    <CheckIcon size={15} /> {feature}
                  </li>
                ))}
              </ul>
              <Link className="btn btn-primary btn-block" to="/tools">
                Open the toolbox
              </Link>
            </div>

            <div className="price-card">
              <div>
                <span className="eyebrow">In development</span>
                <h2 style={{ fontSize: 24, marginTop: 10 }}>Pro</h2>
              </div>
              <div className="price">
                $19 <span>one-time, planned</span>
              </div>
              <ul className="price-list">
                {proFeatures.map((feature) => (
                  <li key={feature}>
                    <CheckIcon size={15} /> {feature}
                  </li>
                ))}
              </ul>
              <button className="btn btn-block" disabled>
                Not on sale yet
              </button>
              <p className="small muted">
                Pro ships only when custom chains and presets work reliably. Until then there is
                nothing to buy — and the free tools stay free.
              </p>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 26 }}>
            <span className="panel-title">Why this is not a subscription</span>
            <p className="small muted" style={{ maxWidth: '70ch' }}>
              The tools run on your hardware, so there is no per-file cost to cover. Hosting is paid
              for by plainly marked advertising and by one-time Pro licences, which is why the price
              is a one-off rather than a renewal. If QuietKit ever needs a server for a feature, that
              feature will be priced separately and clearly — not bundled into a plan that quietly
              raises its price each year.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
