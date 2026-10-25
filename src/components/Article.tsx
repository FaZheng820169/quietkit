import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './Icons'

type Props = {
  eyebrow: string
  title: string
  lede: string
  updated?: string
  toolTo: string
  toolLabel: string
  children: ReactNode
}

export function Article({ eyebrow, title, lede, updated, toolTo, toolLabel, children }: Props) {
  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">{eyebrow}</span>
          <h1 style={{ maxWidth: '22ch' }}>{title}</h1>
          <p>{lede}</p>
          <div className="row" style={{ marginTop: 20 }}>
            <Link className="btn btn-forest" to={toolTo}>
              {toolLabel} <ArrowRightIcon size={16} />
            </Link>
            {updated && <span className="mono small muted">Updated {updated}</span>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">{children}</div>
      </section>
    </>
  )
}
