import { Link } from 'react-router-dom'
import { routeMeta, useSeo } from '../lib/seo'

export function NotFound() {
  useSeo(routeMeta('/404'))

  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div className="container-narrow">
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          404
        </span>
        <h1 style={{ fontSize: 40, margin: '16px 0 12px' }}>Nothing here</h1>
        <p className="muted">The page you asked for does not exist — but the tools do.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 24 }}>
          <Link className="btn btn-primary" to="/tools">
            Open the toolbox
          </Link>
          <Link className="btn" to="/">
            Back home
          </Link>
        </div>
      </div>
    </section>
  )
}
