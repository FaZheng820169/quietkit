import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRightIcon } from './Icons'

export function ToolCard({
  to,
  icon,
  title,
  description,
  meta,
}: {
  to: string
  icon: ReactNode
  title: string
  description: string
  meta: string
}) {
  return (
    <Link to={to} className="tool-card">
      <span className="tool-card-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="tool-card-foot">
        {meta}
        <ArrowRightIcon size={16} className="tool-card-arrow" />
      </span>
    </Link>
  )
}
