import { Link } from 'react-router-dom'
import { LockIcon } from './Icons'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="wordmark">
              <LockIcon className="wordmark-glyph" size={26} />
              QuietKit
            </Link>
            <p>
              Small, honest file tools that run inside your browser tab. Your photos and PDFs
              never touch a server — ours or anyone else's.
            </p>
          </div>

          <div className="footer-col">
            <h4>Tools</h4>
            <ul>
              <li>
                <Link to="/tools/image-compressor">Compress images</Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner">Remove photo metadata</Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge">Merge PDFs</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Status</h4>
            <ul>
              <li>No servers to go down</li>
              <li>No account required</li>
              <li>Runs offline once loaded</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} QuietKit. Built to be boring about your data.</span>
          <span className="mono">files processed locally · 0 uploads</span>
        </div>
      </div>
    </footer>
  )
}
