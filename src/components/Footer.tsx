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
                <Link to="/tools/image-resizer">Resize images</Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner">Remove photo metadata</Link>
              </li>
              <li>
                <Link to="/tools/pdf-merge">Merge PDFs</Link>
              </li>
              <li>
                <Link to="/tools/pdf-remove-pages">Remove PDF pages</Link>
              </li>
              <li>
                <Link to="/tools/pdf-rotate">Rotate PDF pages</Link>
              </li>
              <li>
                <Link to="/tools/pdf-reorder">Reorder PDF pages</Link>
              </li>
              <li>
                <Link to="/tools/pdf-text">Extract PDF text</Link>
              </li>
              <li>
                <Link to="/tools/pdf-page-numbers">Add PDF page numbers</Link>
              </li>
              <li>
                <Link to="/tools/pdf-watermark">Watermark a PDF</Link>
              </li>
              <li>
                <Link to="/tools/pdf-compress">Compress a PDF</Link>
              </li>
              <li>
                <Link to="/tools/pdf-compare">Compare PDFs</Link>
              </li>
              <li>
                <Link to="/tools/pdf-split">Split a PDF</Link>
              </li>
              <li>
                <Link to="/tools/pdf-to-jpg">PDF to JPG</Link>
              </li>
              <li>
                <Link to="/tools/pdf-resize">Resize PDF pages</Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata">Inspect PDF metadata</Link>
              </li>
              <li>
                <Link to="/tools/jpg-to-pdf">JPG to PDF</Link>
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
                <Link to="/guides/split-pdf-without-upload">Split PDFs locally</Link>
              </li>
              <li>
                <Link to="/guides/pdf-to-jpg-without-upload">PDF to JPG locally</Link>
              </li>
              <li>
                <Link to="/guides/watermark-pdf-without-upload">Watermark a PDF</Link>
              </li>
              <li>
                <Link to="/guides/compress-pdf-without-upload">Compress a PDF</Link>
              </li>
              <li>
                <Link to="/guides/remove-pdf-metadata">Strip PDF metadata</Link>
              </li>
              <li>
                <Link to="/guides/jpg-to-pdf-without-upload">Photos to PDF</Link>
              </li>
              <li>
                <Link to="/guides/compare-pdf-without-upload">Compare two PDFs</Link>
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
              <li>
                <Link to="/guides/social-media-image-sizes">Image sizes</Link>
              </li>
              <li>
                <Link to="/guides/heic-to-jpg">HEIC to JPG</Link>
              </li>
              <li>
                <Link to="/guides/resize-image-without-upload">Resize to exact pixels</Link>
              </li>
              <li>
                <Link to="/guides/remove-pdf-pages-without-upload">Remove PDF pages</Link>
              </li>
              <li>
                <Link to="/guides/rotate-pdf-without-upload">Rotate a PDF</Link>
              </li>
              <li>
                <Link to="/guides/reorder-pdf-pages-without-upload">Reorder PDF pages</Link>
              </li>
              <li>
                <Link to="/guides/extract-text-from-pdf-without-upload">Extract PDF text</Link>
              </li>
              <li>
                <Link to="/guides/convert-images-without-upload">Convert images locally</Link>
              </li>
              <li>
                <Link to="/guides/remove-exif-metadata-without-upload">Strip photo metadata</Link>
              </li>
              <li>
                <Link to="/guides/add-page-numbers-to-pdf-without-upload">Number PDF pages</Link>
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
