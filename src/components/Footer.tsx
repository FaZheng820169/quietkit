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
                <Link to="/tools/avif-converter">Convert AVIF</Link>
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
              <li>
                <Link to="/tools/batch">Batch a folder</Link>
              </li>
              <li>
                <Link to="/tools/image-ocr">Image to text</Link>
              </li>
              <li>
                <Link to="/tools/pdf-form-fill">Fill a PDF form</Link>
              </li>
              <li>
                <Link to="/tools/pdf-sign">Sign a PDF</Link>
              </li>
              <li>
                <Link to="/tools/qr-code">QR code generator</Link>
              </li>
              <li>
                <Link to="/tools/favicon">Favicon generator</Link>
              </li>
              <li>
                <Link to="/tools/password-generator">Password generator</Link>
              </li>
              <li>
                <Link to="/tools/image-watermark">Image watermark</Link>
              </li>
              <li>
                <Link to="/tools/color-converter">Color converter</Link>
              </li>
              <li>
                <Link to="/tools/json-formatter">JSON formatter</Link>
              </li>
              <li>
                <Link to="/tools/hash-generator">Hash generator</Link>
              </li>
              <li>
                <Link to="/tools/markdown-preview">Markdown preview</Link>
              </li>
              <li>
                <Link to="/tools/text-diff">Text diff</Link>
              </li>
              <li>
                <Link to="/tools/base64">Base64 encoder</Link>
              </li>
              <li>
                <Link to="/tools/url-encoder">URL encoder</Link>
              </li>
              <li>
                <Link to="/tools/word-counter">Word counter</Link>
              </li>
              <li>
                <Link to="/tools/case-converter">Case converter</Link>
              </li>
              <li>
                <Link to="/tools/slug-generator">Slug generator</Link>
              </li>
              <li>
                <Link to="/tools/uuid-generator">UUID generator</Link>
              </li>
              <li>
                <Link to="/tools/unit-converter">Unit converter</Link>
              </li>
              <li>
                <Link to="/tools/lorem-ipsum">Lorem ipsum</Link>
              </li>
              <li>
                <Link to="/tools/timestamp-converter">Unix timestamp converter</Link>
              </li>
              <li>
                <Link to="/tools/aspect-ratio">Aspect ratio calculator</Link>
              </li>
              <li>
                <Link to="/tools/random-number">Random number generator</Link>
              </li>
              <li>
                <Link to="/tools/tip-calculator">Tip calculator</Link>
              </li>
              <li>
                <Link to="/tools/percentage-calculator">Percentage calculator</Link>
              </li>
              <li>
                <Link to="/tools/age-calculator">Age calculator</Link>
              </li>
              <li>
                <Link to="/tools/px-to-rem">px to rem converter</Link>
              </li>
              <li>
                <Link to="/tools/date-calculator">Date calculator</Link>
              </li>
              <li>
                <Link to="/tools/bmi-calculator">BMI calculator</Link>
              </li>
              <li>
                <Link to="/tools/calorie-calculator">Calorie calculator</Link>
              </li>
              <li>
                <Link to="/tools/loan-calculator">Loan calculator</Link>
              </li>
              <li>
                <Link to="/tools/grade-calculator">Grade calculator</Link>
              </li>
              <li>
                <Link to="/tools/height-converter">Height converter</Link>
              </li>
              <li>
                <Link to="/tools/gpa-calculator">GPA calculator</Link>
              </li>
              <li>
                <Link to="/tools/roman-numeral-converter">Roman numeral converter</Link>
              </li>
              <li>
                <Link to="/tools/base-converter">Base converter</Link>
              </li>
              <li>
                <Link to="/tools/time-zone-converter">Time zone converter</Link>
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
                <Link to="/guides/avif-to-jpg">AVIF to JPG</Link>
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
              <li>
                <Link to="/guides/resize-pdf-pages-without-upload">Resize PDF pages</Link>
              </li>
              <li>
                <Link to="/guides/batch-process-folder-without-upload">Batch a folder</Link>
              </li>
              <li>
                <Link to="/guides/ocr-image-without-upload">OCR an image</Link>
              </li>
              <li>
                <Link to="/guides/fill-pdf-form-without-upload">Fill a PDF form</Link>
              </li>
              <li>
                <Link to="/guides/sign-pdf-without-upload">Sign a PDF locally</Link>
              </li>
              <li>
                <Link to="/guides/qr-code-without-upload">QR codes without tracking</Link>
              </li>
              <li>
                <Link to="/guides/favicon-without-upload">Favicons without the upload</Link>
              </li>
              <li>
                <Link to="/guides/password-generator-without-upload">Passwords without the upload</Link>
              </li>
              <li>
                <Link to="/guides/watermark-image-without-upload">Watermark photos without the upload</Link>
              </li>
              <li>
                <Link to="/guides/color-converter-without-upload">Convert colours without the upload</Link>
              </li>
              <li>
                <Link to="/guides/json-formatter-without-upload">Format JSON without the upload</Link>
              </li>
              <li>
                <Link to="/guides/hash-generator-without-upload">Hash files without the upload</Link>
              </li>
              <li>
                <Link to="/guides/markdown-preview-without-upload">Preview Markdown without a server</Link>
              </li>
              <li>
                <Link to="/guides/text-diff-without-upload">Compare texts without a server</Link>
              </li>
              <li>
                <Link to="/guides/base64-without-upload">Base64 without a server</Link>
              </li>
              <li>
                <Link to="/guides/url-encoding-without-upload">URL encoding without a server</Link>
              </li>
              <li>
                <Link to="/guides/word-count-without-upload">Word counting without a server</Link>
              </li>
              <li>
                <Link to="/guides/case-conversion-without-upload">Case conversion without a server</Link>
              </li>
              <li>
                <Link to="/guides/slug-generator-without-upload">Slugs without a server</Link>
              </li>
              <li>
                <Link to="/guides/uuid-generator-without-upload">UUIDs without a server</Link>
              </li>
              <li>
                <Link to="/guides/unit-conversion-without-upload">Units without a server</Link>
              </li>
              <li>
                <Link to="/guides/lorem-ipsum-without-upload">Lorem ipsum without a server</Link>
              </li>
              <li>
                <Link to="/guides/timestamp-converter-without-upload">Timestamps without a server</Link>
              </li>
              <li>
                <Link to="/guides/aspect-ratio-without-upload">Aspect ratios without a server</Link>
              </li>
              <li>
                <Link to="/guides/random-number-without-upload">Random numbers without a server</Link>
              </li>
              <li>
                <Link to="/guides/tip-calculator-without-upload">Tips without a server</Link>
              </li>
              <li>
                <Link to="/guides/percentage-calculator-without-upload">Percentages without a server</Link>
              </li>
              <li>
                <Link to="/guides/age-calculator-without-upload">Age without a server</Link>
              </li>
              <li>
                <Link to="/guides/px-to-rem-without-upload">px to rem without a server</Link>
              </li>
              <li>
                <Link to="/guides/date-calculator-without-upload">Calculate dates without a server</Link>
              </li>
              <li>
                <Link to="/guides/bmi-calculator-without-upload">Calculate BMI without a server</Link>
              </li>
              <li>
                <Link to="/guides/calorie-calculator-without-upload">Calculate calories without a server</Link>
              </li>
              <li>
                <Link to="/guides/loan-calculator-without-upload">Calculate loan payments without a server</Link>
              </li>
              <li>
                <Link to="/guides/grade-calculator-without-upload">Calculate grades without a server</Link>
              </li>
              <li>
                <Link to="/guides/height-converter-without-upload">Convert height without a server</Link>
              </li>
              <li>
                <Link to="/guides/gpa-calculator-without-upload">Calculate your GPA without a server</Link>
              </li>
              <li>
                <Link to="/guides/roman-numeral-converter-without-upload">Convert Roman numerals without a server</Link>
              </li>
              <li>
                <Link to="/guides/base-converter-without-upload">Convert between number bases without a server</Link>
              </li>
              <li>
                <Link to="/guides/time-zone-converter-without-upload">Time zones, converted without a server</Link>
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
