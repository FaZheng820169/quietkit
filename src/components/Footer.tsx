import { Link } from 'react-router-dom'
import { LockIcon } from './Icons'

const YEAR = new Date().getFullYear()

export function Footer() {
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
                <Link to="/tools/image-converter">Convert images</Link>
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
            <h4>Guides</h4>
            <ul>
              <li>
                <Link to="/guides/remove-location-from-photo">Remove photo location</Link>
              </li>
              <li>
                <Link to="/guides/compress-image-to-100kb">Compress to 100 KB</Link>
              </li>
              <li>
                <Link to="/guides/merge-pdf-without-upload">Merge PDFs locally</Link>
              </li>
              <li>
                <Link to="/guides/exif-viewer">Read EXIF data</Link>
              </li>
              <li>
                <Link to="/guides/convert-png-to-jpg">Convert PNG to JPG</Link>
              </li>
              <li>
                <Link to="/guides/what-is-webp">What is WebP</Link>
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
        </div>

        <div className="footer-bottom">
          <span>© {YEAR} QuietKit. Built to be boring about your data.</span>
          <span className="mono">files processed locally · 0 uploads</span>
        </div>
      </div>
    </footer>
  )
}
