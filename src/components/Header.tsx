import { NavLink, Link } from 'react-router-dom'
import { LockIcon } from './Icons'

const links = [
  { to: '/tools', label: 'Tools' },
  { to: '/guides', label: 'Guides' },
  { to: '/pricing', label: 'Pricing', hideOnSmall: true },
  { to: '/privacy', label: 'Privacy', hideOnMobile: true },
]

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="wordmark" aria-label="QuietKit home">
          <LockIcon className="wordmark-glyph" size={26} />
          QuietKit
        </Link>
        <nav className="nav" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={[link.hideOnMobile && 'nav-hide', link.hideOnSmall && 'nav-hide-sm']
                .filter(Boolean)
                .join(' ') || undefined}
            >
              {link.label}
            </NavLink>
          ))}
          <Link className="btn btn-primary btn-sm header-cta" to="/tools/image-compressor">
            Open a tool
          </Link>
        </nav>
      </div>
    </header>
  )
}
