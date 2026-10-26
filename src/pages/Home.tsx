import { Link } from 'react-router-dom'
import { ToolCard } from '../components/ToolCard'
import { AdSlot } from '../components/AdSlot'
import { FileIcon, ImageIcon, ShieldIcon, PinIcon, BoltIcon, LockIcon, CheckIcon, QrIcon } from '../components/Icons'
import { faqJsonLd, routeMeta, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Do my files get uploaded anywhere?',
    a: 'No. Every tool on QuietKit uses browser APIs — Canvas, FileReader and WebAssembly — to read and rewrite your file in memory. There is no upload endpoint to send it to.',
  },
  {
    q: 'How can I verify that?',
    a: 'Open your browser dev tools, switch to the Network tab, then drop a file into any tool. You will see no request carrying your file. You can also load a tool once and switch off your Wi-Fi; it still works.',
  },
  {
    q: 'Is QuietKit really free?',
    a: 'The tools are free with no watermark, no account and no file limits. Future pro features (saved presets, a desktop app) will be paid, but the current tools stay free.',
  },
  {
    q: 'Which browsers are supported?',
    a: 'Current versions of Chrome, Edge, Firefox and Safari on desktop and mobile. Very large files (over 200 MB) depend on how much memory your device has.',
  },
  {
    q: 'What happens to my files after I close the tab?',
    a: 'They are gone. QuietKit keeps the file only in the memory of the open tab and releases it when you close or reload the page.',
  },
]

export function Home() {
  useSeo({ ...routeMeta('/'), jsonLd: faqJsonLd(faqs) })

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Browser-local file tools</span>
            <h1>
              Your files never leave <em>this tab</em>.
            </h1>
            <p className="hero-lede">
              Compress photos, remove the location data hiding inside them, and merge or read
              PDFs — without uploading a single byte to anyone.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/tools/image-compressor">
                Compress an image
              </Link>
              <Link className="btn btn-lg" to="/tools">
                Browse all tools
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <i className="dot" /> No uploads
              </span>
              <span>
                <i className="dot" /> No account
              </span>
              <span>
                <i className="dot" /> Works offline
              </span>
            </div>
          </div>

          <div className="hero-panel" aria-hidden="true">
            <div className="hero-panel-bar">
              <i />
              <i />
              <i />
              <span className="hero-panel-title">network monitor</span>
            </div>
            <div className="hero-panel-body">
              <div>
                <strong>POST /upload</strong> … <span className="warn">never called</span>
              </div>
              <div>
                <strong>holiday-photo.jpg</strong> 4.8 MB · processed <span className="ok">in memory</span>
              </div>
              <div>
                <strong>metadata</strong> 38 fields stripped <span className="ok">✓</span>
              </div>
              <div>
                bytes sent to a server <span className="ok">0 B</span>
              </div>
              <div>
                download <span className="ok">ready — 812 KB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'end', marginBottom: 34 }}>
            <div>
              <span className="eyebrow">Fifty-five tools, no filler</span>
              <h2 style={{ fontSize: 34, marginTop: 14 }}>Fix a file in under a minute.</h2>
            </div>
            <p className="muted" style={{ maxWidth: '46ch' }}>
              We build one small tool at a time, only when it can be done properly in the
              browser. Nothing is “uploaded to our Cloudflare bucket” — there is no bucket.
            </p>
          </div>

          <div className="card-grid">
            <ToolCard
              to="/tools/image-compressor"
              icon={<ImageIcon size={22} />}
              title="Compress images"
              description="Shrink JPEG, PNG and WebP photos by 60–90% with a live before/after preview and a size target."
              meta="JPEG · PNG · WebP"
            />
            <ToolCard
              to="/tools/image-converter"
              icon={<ImageIcon size={22} />}
              title="Convert images"
              description="Turn an iPhone HEIC into JPEG, PNG into JPEG, or a whole folder into WebP — in a single pass, without uploading."
              meta="HEIC · JPG · PNG · WebP"
            />
            <ToolCard
              to="/tools/avif-converter"
              icon={<ImageIcon size={22} />}
              title="Convert AVIF"
              description="AVIF to JPG, PNG or WebP that any software can open — or JPG and PNG back to AVIF, in batches."
              meta="AVIF · JPG · PNG"
            />
            <ToolCard
              to="/tools/image-resizer"
              icon={<ImageIcon size={22} />}
              title="Resize images"
              description="Exact pixels for a post, banner or passport photo — one file or a whole folder, crop to fill or fit."
              meta="1080×1080 · folder"
            />
            <ToolCard
              to="/tools/metadata-cleaner"
              icon={<PinIcon size={22} />}
              title="Remove photo metadata"
              description="See the GPS coordinates, camera model and timestamps hidden in your photos, then strip one file or an entire folder."
              meta="EXIF · GPS · XMP"
            />
            <ToolCard
              to="/tools/pdf-metadata"
              icon={<PinIcon size={22} />}
              title="Inspect PDF metadata"
              description="See who a PDF says wrote it, which program produced it and when — then download a copy with the property block emptied."
              meta="Author · XMP · Dates"
            />
            <ToolCard
              to="/tools/pdf-compress"
              icon={<FileIcon size={22} />}
              title="Compress a PDF"
              description="Rebuild a 20 MB scan at a lower resolution and compare the real sizes before keeping the copy — locally, page by page."
              meta="110 · 150 · 200 DPI"
            />
            <ToolCard
              to="/tools/pdf-compare"
              icon={<FileIcon size={22} />}
              title="Compare PDFs"
              description="Two versions of a quote, contract or report, side by side — page through in lockstep and highlight what changed."
              meta="Side by side · Diff"
            />
            <ToolCard
              to="/tools/pdf-merge"
              icon={<FileIcon size={22} />}
              title="Merge PDFs"
              description="Combine contracts, scans and exports into a single PDF in the order you choose. No page limits."
              meta="Any number of pages"
            />
            <ToolCard
              to="/tools/pdf-remove-pages"
              icon={<FileIcon size={22} />}
              title="Remove PDF pages"
              description="Cut a blank page, or extract a signed page into its own file — using ranges like 1-3, 7, 10-."
              meta="Pages · Ranges"
            />
            <ToolCard
              to="/tools/pdf-rotate"
              icon={<FileIcon size={22} />}
              title="Rotate PDF pages"
              description="A scanner fed the wrong way leaves every page sideways. Turn them 90° or 180°, all or just the wrong ones."
              meta="90° · 180° · ranges"
            />
            <ToolCard
              to="/tools/pdf-reorder"
              icon={<FileIcon size={22} />}
              title="Reorder PDF pages"
              description="Signature page at the end? Type “4, 1-3, 5” and the order is fixed without dragging thumbnails."
              meta="Order · Ranges"
            />
            <ToolCard
              to="/tools/jpg-to-pdf"
              icon={<ImageIcon size={22} />}
              title="JPG to PDF"
              description="Receipts, scans and phone photos into one PDF — ordered, A4 or Letter, GPS removed."
              meta="Photos · One PDF"
            />
            <ToolCard
              to="/tools/pdf-text"
              icon={<FileIcon size={22} />}
              title="Extract PDF text"
              description="Copy the words out of a PDF page by page, or download the whole document as plain text."
              meta="Copy · .txt"
            />
            <ToolCard
              to="/tools/pdf-page-numbers"
              icon={<FileIcon size={22} />}
              title="Add PDF page numbers"
              description="Stamp a number in any corner, start at any number, and see the first page before you download."
              meta="Preview · Any format"
            />
            <ToolCard
              to="/tools/pdf-watermark"
              icon={<FileIcon size={22} />}
              title="Watermark a PDF"
              description="Put a draft or confidential mark across every page, or just the pages you pick — centred or tiled, and faint enough to read through."
              meta="Diagonal · Tiled"
            />
            <ToolCard
              to="/tools/pdf-resize"
              icon={<FileIcon size={22} />}
              title="Resize PDF pages"
              description="Make every page one sheet — A4, Letter or A3 — fitted to show the whole page or filled to cover it."
              meta="Print · One sheet"
            />
            <ToolCard
              to="/tools/pdf-split"
              icon={<FileIcon size={22} />}
              title="Split a PDF"
              description="Cut one document into a file per page, equal chunks or your own ranges, and take the parts away as a ZIP."
              meta="Any pages · ZIP"
            />
            <ToolCard
              to="/tools/pdf-to-jpg"
              icon={<ImageIcon size={22} />}
              title="PDF to JPG"
              description="Turn pages into JPEGs at 150, 200 or 300 DPI — one per page, white background, ZIP for a whole document."
              meta="150–300 DPI · ZIP"
            />
            <ToolCard
              to="/tools/batch"
              icon={<BoltIcon size={22} />}
              title="Batch a folder"
              description="One folder in, one ZIP out: photos cleaned, converted and compressed; PDFs merged, numbered and resized — in a single pass."
              meta="Folder · ZIP"
            />
            <ToolCard
              to="/tools/image-ocr"
              icon={<ImageIcon size={22} />}
              title="Image to text (OCR)"
              description="Turn a screenshot, receipt or scanned page into plain text with an OCR engine that runs on your device — English, no upload."
              meta="OCR · English"
            />
            <ToolCard
              to="/tools/pdf-form-fill"
              icon={<FileIcon size={22} />}
              title="Fill a PDF form"
              description="Type into the fields, tick the boxes and pick the options of a real PDF form — then download it flattened or still editable."
              meta="Forms · Flatten"
            />
            <ToolCard
              to="/tools/pdf-sign"
              icon={<FileIcon size={22} />}
              title="Sign a PDF"
              description="Draw or type a signature, click where it belongs, download the signed copy — document and signature never leave the tab."
              meta="Sign · Local"
            />
            <ToolCard
              to="/tools/qr-code"
              icon={<QrIcon size={22} />}
              title="QR code generator"
              description="Type a link or text, watch the code draw itself, download PNG or SVG. Static codes — no redirect service, no expiry, no tracking."
              meta="Everyday · PNG / SVG"
            />
            <ToolCard
              to="/tools/favicon"
              icon={<ImageIcon size={22} />}
              title="Favicon generator"
              description="Drop one logo and get a full favicon set — ICO, Apple touch icon, Android Chrome icons and a web manifest — ready to unzip into your site root."
              meta="Images · ICO / PNG / manifest"
            />
            <ToolCard
              to="/tools/password-generator"
              icon={<LockIcon size={22} />}
              title="Password generator"
              description="Strong random passwords from your browser's own crypto source — 12 to 64 characters, batches of five or ten, one click to copy."
              meta="Security · Local crypto"
            />
            <ToolCard
              to="/tools/image-watermark"
              icon={<ImageIcon size={22} />}
              title="Image watermark"
              description="Drop a photo, type the text, preview the watermark, download. Tiled or centred, one image or a whole folder as ZIP."
              meta="Images · JPEG / PNG / WebP"
            />
            <ToolCard
              to="/tools/color-converter"
              icon={<ImageIcon size={22} />}
              title="Color converter"
              description="Type a HEX code or pick a colour, see RGB and HSL instantly, check contrast against white and black, grab a palette."
              meta="Design · HEX / RGB / HSL"
            />
            <ToolCard
              to="/tools/json-formatter"
              icon={<FileIcon size={22} />}
              title="JSON formatter"
              description="Paste JSON, see if it parses, format it with two spaces or tabs, minify it for production, sort keys for a clean diff."
              meta="Developer · Validation / format"
            />
            <ToolCard
              to="/tools/hash-generator"
              icon={<LockIcon size={22} />}
              title="Hash generator"
              description="Drop a file or paste text, get SHA-256 and SHA-512 instantly. Verify a download without uploading it to a checker."
              meta="Security · SHA / integrity"
            />
            <ToolCard
              to="/tools/markdown-preview"
              icon={<FileIcon size={22} />}
              title="Markdown preview"
              description="Write Markdown and see it rendered live. Copy or download clean HTML — drafts never leave your device."
              meta="Writer · Markdown"
            />
            <ToolCard
              to="/tools/text-diff"
              icon={<FileIcon size={22} />}
              title="Text diff"
              description="Two versions of a contract or config, pasted side by side — every changed line and word highlighted, with a unified diff to export."
              meta="Compare · Unified diff"
            />
            <ToolCard
              to="/tools/base64"
              icon={<FileIcon size={22} />}
              title="Base64 encoder & decoder"
              description="Text or files to Base64 and back — Unicode-safe, URL-safe variant, honest errors on invalid or binary input."
              meta="Developer · Encode / decode"
            />
            <ToolCard
              to="/tools/url-encoder"
              icon={<FileIcon size={22} />}
              title="URL encoder & decoder"
              description="Percent-encode a value for a link or decode it back — component and full-URL modes, plus a query-string parser."
              meta="Developer · Encode / decode"
            />
            <ToolCard
              to="/tools/word-counter"
              icon={<FileIcon size={22} />}
              title="Word counter"
              description="Count words, characters, sentences and paragraphs — with reading and speaking time, keyword density, and correct CJK counts."
              meta="Writing · Count / analyse"
            />
            <ToolCard
              to="/tools/case-converter"
              icon={<FileIcon size={22} />}
              title="Case converter"
              description="All nine case styles at once — UPPER, lower, Title, Sentence, camel, Pascal, snake, kebab, CONSTANT — with acronyms handled."
              meta="Writing · Transform"
            />
            <ToolCard
              to="/tools/slug-generator"
              icon={<FileIcon size={22} />}
              title="Slug generator"
              description="Titles to clean URL slugs — accents folded, emoji stripped, contractions joined. One title or a whole list, line by line."
              meta="Writing · URL"
            />
            <ToolCard
              to="/tools/uuid-generator"
              icon={<LockIcon size={22} />}
              title="UUID generator"
              description="Random v4 UUIDs in batches of up to 1,000 — standard, plain, braced or URN, with honest collision odds."
              meta="Developer · Random ids"
            />
            <ToolCard
              to="/tools/unit-converter"
              icon={<FileIcon size={22} />}
              title="Unit converter"
              description="Inches, pounds, Fahrenheit, gigabytes — exact definitional factors, and MB versus MiB never conflated."
              meta="Everyday · Exact ratios"
            />
            <ToolCard
              to="/tools/lorem-ipsum"
              icon={<FileIcon size={22} />}
              title="Lorem ipsum generator"
              description="Classic placeholder text by the word, sentence or paragraph — with the traditional opening and optional <p> wrapping."
              meta="Design · Placeholder text"
            />
            <ToolCard
              to="/tools/timestamp-converter"
              icon={<FileIcon size={22} />}
              title="Unix timestamp converter"
              description="Epoch to human date, both directions — seconds or milliseconds, UTC and local, ISO 8601 and RFC 2822."
              meta="Developer · Time"
            />
            <ToolCard
              to="/tools/aspect-ratio"
              icon={<FileIcon size={22} />}
              title="Aspect ratio calculator"
              description="Pixels to ratio, or ratio plus one dimension to the other — fit, fill, scale and diagonal, no distortion."
              meta="Design · Layout"
            />
            <ToolCard
              to="/tools/random-number"
              icon={<FileIcon size={22} />}
              title="Random number generator"
              description="Integers or decimals, any range, no repeats optional — from crypto.getRandomValues with a seed mode for reproducible draws."
              meta="Developer · Randomness"
            />
            <ToolCard
              to="/tools/tip-calculator"
              icon={<FileIcon size={22} />}
              title="Tip calculator"
              description="Bill, tip percentage and people — preset rates, custom percentage, and honest rounding that does not leave a stray cent on the table."
              meta="Everyday · Split the bill"
            />
            <ToolCard
              to="/tools/percentage-calculator"
              icon={<FileIcon size={22} />}
              title="Percentage calculator"
              description="Four modes — of, is, change and reverse — with honest divide-by-zero handling and instant results."
              meta="Everyday · Math"
            />
            <ToolCard
              to="/tools/age-calculator"
              icon={<FileIcon size={22} />}
              title="Age calculator"
              description="Years, months and days from a birth date, plus total days and weeks lived and the next-birthday countdown — leap days handled correctly."
              meta="Everyday · Date"
            />
            <ToolCard
              to="/tools/px-to-rem"
              icon={<FileIcon size={22} />}
              title="px to rem converter"
              description="Pixels to rems and back with a configurable root size — single values or a whole CSS snippet, converted in place."
              meta="Developer · CSS"
            />
            <ToolCard
              to="/tools/date-calculator"
              icon={<FileIcon size={22} />}
              title="Date calculator"
              description="Days, weeks and weekdays between two dates, or add and subtract days, weeks, months and years — leap years and month lengths handled correctly."
              meta="Everyday · Date"
            />
            <ToolCard
              to="/tools/bmi-calculator"
              icon={<FileIcon size={22} />}
              title="BMI calculator"
              description="Body Mass Index in metric or imperial units, with the WHO category and range. Runs locally — your height and weight never leave your browser."
              meta="Health · Calculator"
            />
            <ToolCard
              to="/tools/calorie-calculator"
              icon={<FileIcon size={22} />}
              title="Calorie calculator"
              description="BMR via Mifflin-St Jeor, TDEE across five activity levels, and targets for losing or gaining weight. Runs locally — your details never leave your browser."
              meta="Health · Calculator"
            />
            <ToolCard
              to="/tools/loan-calculator"
              icon={<FileIcon size={22} />}
              title="Loan calculator"
              description="Monthly payment, total interest and amortization for any loan or mortgage. Runs locally — your loan details never leave your browser."
              meta="Finance · Calculator"
            />
            <ToolCard
              to="/tools/grade-calculator"
              icon={<FileIcon size={22} />}
              title="Grade calculator"
              description="Score needed on your final exam, or a weighted average across assignments. Runs locally — your grades never leave your browser."
              meta="Education · Calculator"
            />
            <ToolCard
              to="/tools/height-converter"
              icon={<FileIcon size={22} />}
              title="Height converter"
              description="Centimetres to feet and inches, both directions, as you type. Runs locally — your height never leaves your browser."
              meta="Everyday · Converter"
            />
            <ToolCard
              to="/tools/gpa-calculator"
              icon={<FileIcon size={22} />}
              title="GPA calculator"
              description="Cumulative GPA on a 4.0 scale from courses and credit hours. Runs locally — your grades never leave your browser."
              meta="Education · Calculator"
            />
            <ToolCard
              to="/tools/roman-numeral-converter"
              icon={<FileIcon size={22} />}
              title="Roman numeral converter"
              description="Numbers to Roman numerals and back, both directions, as you type. Runs locally — nothing leaves your browser."
              meta="Everyday · Converter"
            />
          </div>

          <div style={{ marginTop: 26 }}>
            <AdSlot />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'end', marginBottom: 30 }}>
            <div>
              <span className="eyebrow">Guides</span>
              <h2 style={{ fontSize: 32, marginTop: 14 }}>If you want to understand it first.</h2>
            </div>
            <Link className="btn" to="/guides">
              All guides
            </Link>
          </div>
          <div className="card-grid">
            {[
              {
                to: '/guides/heic-to-jpg',
                title: 'Convert HEIC to JPG',
                body: 'Why iPhones save HEIC, where it breaks, and how to convert it without uploading photos.',
              },
              {
                to: '/guides/avif-to-jpg',
                title: 'Convert AVIF to JPG',
                body: 'The format browsers read and nothing else does — which target to pick, and how to convert locally.',
              },
              {
                to: '/guides/remove-location-from-photo',
                title: 'Remove location data from a photo',
                body: 'What GPS in a JPEG actually is, and the exact steps on iPhone, Android and Windows.',
              },
              {
                to: '/guides/compress-image-to-100kb',
                title: 'Compress an image to 100 KB',
                body: 'Resize first, then lower quality, then change format — with real size numbers.',
              },
              {
                to: '/guides/merge-pdf-without-upload',
                title: 'Merge PDFs without uploading',
                body: 'Why contracts and IDs should stay on your machine, and how to verify a tool is local.',
              },
              {
                to: '/guides/split-pdf-without-upload',
                title: 'Split a PDF, properly',
                body: 'Three ways to cut a document, what each part keeps, and what a split silently drops.',
              },
              {
                to: '/guides/pdf-to-jpg-without-upload',
                title: 'PDF pages as JPGs',
                body: 'What a page loses when it becomes pixels, the DPI that fits each job, and why margins turn black.',
              },
              {
                to: '/guides/watermark-pdf-without-upload',
                title: 'Watermark a PDF, properly',
                body: 'Status, ownership and protection marks want different settings — and why a text layer beats flattening.',
              },
              {
                to: '/guides/compress-pdf-without-upload',
                title: 'Compress a PDF, honestly',
                body: 'Which files shrink and which refuse to, what a rebuilt copy drops — with real before-and-after numbers.',
              },
              {
                to: '/guides/remove-pdf-metadata',
                title: 'Strip PDF metadata',
                body: 'The author, company and dates a PDF carries invisibly — and how to take the luggage tag off.',
              },
              {
                to: '/guides/jpg-to-pdf-without-upload',
                title: 'Photos into one PDF',
                body: 'Receipts and signed forms photographed on a phone — page size, order and HEIC, handled locally.',
              },
              {
                to: '/guides/compare-pdf-without-upload',
                title: 'Compare two PDFs',
                body: 'Side-by-side reading versus pixel comparison — and why contracts should stay on your device.',
              },
              {
                to: '/guides/exif-viewer',
                title: 'What an EXIF viewer shows',
                body: 'The metadata families, the risky fields, and what f-stop, ISO and focal length mean.',
              },
              {
                to: '/guides/convert-png-to-jpg',
                title: 'Convert PNG to JPG, properly',
                body: 'What transparency costs you, which quality to pick, and how to batch it.',
              },
              {
                to: '/guides/what-is-webp',
                title: 'What is a WebP file?',
                body: 'Where WebP wins, and the email and print workflows where it still fails.',
              },
              {
                to: '/guides/social-media-image-sizes',
                title: 'Social media image sizes',
                body: 'One table for every platform, and why your subject keeps getting cropped.',
              },
              {
                to: '/guides/resize-image-without-upload',
                title: 'Resize to exact pixels',
                body: 'Crop versus fit, why pixels are the only unit, and how to do a whole folder at once.',
              },
              {
                to: '/guides/remove-pdf-pages-without-upload',
                title: 'Remove PDF pages, really',
                body: 'Delete versus extract, why a rebuilt file beats a white box, and what survives.',
              },
              {
                to: '/guides/rotate-pdf-without-upload',
                title: 'Fix sideways scans',
                body: 'What the /Rotate flag actually changes, which angle to pick, and how to fix only the wrong pages.',
              },
              {
                to: '/guides/reorder-pdf-pages-without-upload',
                title: 'Reorder pages by typing',
                body: 'Why a written order beats dragging thumbnails, and what survives a rebuilt document.',
              },
              {
                to: '/guides/extract-text-from-pdf-without-upload',
                title: 'Copy text out of a PDF',
                body: 'What the text layer is, why scans stay silent, and what plain text keeps.',
              },
              {
                to: '/guides/convert-images-without-upload',
                title: 'Convert images locally',
                body: 'What JPEG, PNG and WebP each keep, why HEIC needs a decoder, and how to convert a folder.',
              },
              {
                to: '/guides/remove-exif-metadata-without-upload',
                title: 'Strip photo metadata',
                body: 'The fields that expose you, why screenshots fall short, and how to clean a whole folder.',
              },
              {
                to: '/guides/add-page-numbers-to-pdf-without-upload',
                title: 'Number PDF pages',
                body: 'Format, position and starting number — why a stamp beats typing, and why it comes last.',
              },
              {
                to: '/guides/resize-pdf-pages-without-upload',
                title: 'One sheet size, every page',
                body: 'How mixed page sizes happen, fit versus fill, and why vector text stays sharp.',
              },
              {
                to: '/guides/batch-process-folder-without-upload',
                title: 'Batch a whole folder, locally',
                body: 'Photos cleaned and compressed, PDFs merged and numbered — one ZIP, nothing uploaded.',
              },
              {
                to: '/guides/ocr-image-without-upload',
                title: 'OCR an image, locally',
                body: 'How an OCR engine reads characters on your device, which images work, and why handwriting fails.',
              },
              {
                to: '/guides/fill-pdf-form-without-upload',
                title: 'Fill a PDF form, locally',
                body: 'AcroForm versus flat pages, editable versus flattened, and why identity numbers stay on your device.',
              },
              {
                to: '/guides/sign-pdf-without-upload',
                title: 'Sign a PDF, locally',
                body: 'Electronic versus digital signatures, what makes one valid, and why the file and the signature stay on your device.',
              },
              {
                to: '/guides/qr-code-without-upload',
                title: 'QR codes without tracking',
                body: 'Static versus dynamic codes, why free generators expire, and how to print a code that answers to nobody.',
              },
              {
                to: '/guides/favicon-without-upload',
                title: 'Favicons without the upload',
                body: 'What a modern favicon set contains, why a local generator beats a server, and how to install the files.',
              },
              {
                to: '/guides/password-generator-without-upload',
                title: 'Passwords without the upload',
                body: 'Why server-side generators see your password first, what makes one strong, and how to verify a generator is local.',
              },
              {
                to: '/guides/watermark-image-without-upload',
                title: 'Watermark photos without the upload',
                body: 'Why online watermarking defeats the point, tiled versus centred, and how to protect a whole folder locally.',
              },
              {
                to: '/guides/color-converter-without-upload',
                title: 'Convert colours without the upload',
                body: 'What HEX, RGB and HSL are each for, why contrast ratios matter, and how to build a palette locally.',
              },
              {
                to: '/guides/json-formatter-without-upload',
                title: 'Format JSON without the upload',
                body: 'Why a server-side formatter sees every byte, how to read a parse error, and what a local formatter gives you.',
              },
              {
                to: '/guides/hash-generator-without-upload',
                title: 'Hash files without the upload',
                body: 'Why a file you want to verify is often one you do not want to share, and which algorithm to trust.',
              },
              {
                to: '/guides/markdown-preview-without-upload',
                title: 'Preview Markdown without a server',
                body: 'Drafts are the most sensitive text you write — render them locally, with raw HTML shown as text.',
              },
              {
                to: '/guides/text-diff-without-upload',
                title: 'Compare two texts without a server',
                body: 'Contracts and configs are exactly what you should not paste into a website — diff them locally instead.',
              },
              {
                to: '/guides/base64-without-upload',
                title: 'Base64 without a server',
                body: 'Why btoa breaks on Unicode, what the URL-safe variant changes, and why credentials should never go through an online encoder.',
              },
              {
                to: '/guides/url-encoding-without-upload',
                title: 'URL encoding without a server',
                body: 'encodeURIComponent vs encodeURI, why %zz breaks a decoder, and why tracking links should not go through an online decoder.',
              },
              {
                to: '/guides/word-count-without-upload',
                title: 'Word counting without a server',
                body: 'What a word really is to a computer, how reading time is estimated, and why an unpublished draft should never go through an online counter.',
              },
              {
                to: '/guides/case-conversion-without-upload',
                title: 'Case conversion without a server',
                body: 'Why acronyms break naive converters, which words Title Case keeps small, and why re-lettering text is a local job.',
              },
              {
                to: '/guides/slug-generator-without-upload',
                title: 'Slugs without a server',
                body: 'Why don’t becomes dont, how accents fold, why hyphens beat underscores — and why an unpublished title should not be uploaded to be hyphenated.',
              },
              {
                to: '/guides/uuid-generator-without-upload',
                title: 'UUIDs without a server',
                body: 'What the 122 random bits in a v4 UUID mean, how likely a collision really is, and why an id you are about to use should not pass through an API.',
              },
              {
                to: '/guides/unit-conversion-without-upload',
                title: 'Unit conversion without a server',
                body: 'Why an inch is exactly 25.4 mm, what makes temperature affine, and the honest 7% gap between MB and MiB.',
              },
              {
                to: '/guides/lorem-ipsum-without-upload',
                title: 'Lorem ipsum without a server',
                body: 'Where the 69 classic words come from, when to generate words versus sentences versus paragraphs, and why filler text must stay meaningless.',
              },
              {
                to: '/guides/timestamp-converter-without-upload',
                title: 'Timestamps without a server',
                body: 'What the epoch actually counts, why seconds and milliseconds both appear, and why the Unix clock deliberately ignores leap seconds.',
              },
              {
                to: '/guides/aspect-ratio-without-upload',
                title: 'Aspect ratios without a server',
                body: 'Why 16:9 won the screen, how fit and fill differ, and why resizing two dimensions independently always distorts.',
              },
              {
                to: '/guides/random-number-without-upload',
                title: 'Random numbers without a server',
                body: 'Why crypto.random beats Math.random, what modulo bias is, how no-repeats draws really work, and when a seed is the right call.',
              },
              {
                to: '/guides/tip-calculator-without-upload',
                title: 'Tips and splitting the bill',
                body: 'Why pre-tax tipping is the honest default, what each percentage means, and how to split a bill without a stray cent vanishing.',
              },
              {
                to: '/guides/percentage-calculator-without-upload',
                title: 'Percentages without a server',
                body: 'The four percentage questions people actually ask, the one formula behind all of them, and why divide-by-zero deserves an honest answer.',
              },
              {
                to: '/guides/age-calculator-without-upload',
                title: 'Age without a server',
                body: 'Why age is not a simple subtraction, how leap days and the 31st are handled, and why a birth date should never leave your device.',
              },
              {
                to: '/guides/px-to-rem-without-upload',
                title: 'px to rem without a server',
                body: 'What a rem actually is, why the root font size is a contract, and how to convert a whole CSS snippet in one pass.',
              },
              {
                to: '/guides/date-calculator-without-upload',
                title: 'Calculate dates without a server',
                body: 'How many days are really between two dates, why adding a month is not 30 days, and how leap years change the math.',
              },
              {
                to: '/guides/bmi-calculator-without-upload',
                title: 'Calculate BMI without a server',
                body: 'What BMI measures, how metric and imperial formulas differ, which WHO categories apply, and why your numbers should never leave your device.',
              },
              {
                to: '/guides/calorie-calculator-without-upload',
                title: 'Calculate calories without a server',
                body: 'How the Mifflin-St Jeor equation estimates BMR, what an activity factor does to TDEE, and which calorie targets match weight goals.',
              },
              {
                to: '/guides/loan-calculator-without-upload',
                title: 'Calculate loan payments without a server',
                body: 'How the amortization formula turns principal, rate and term into a monthly payment, where the interest goes each month, and why your details stay local.',
              },
              {
                to: '/guides/grade-calculator-without-upload',
                title: 'Calculate grades without a server',
                body: 'How the final-grade formula finds the exam score you need, how weighted averages work, and why your grades stay local.',
              },
              {
                to: '/guides/height-converter-without-upload',
                title: 'Convert height without a server',
                body: 'How the inch-to-centimetre ratio converts height between metric and imperial, and why your height should stay local.',
              },
              {
                to: '/guides/gpa-calculator-without-upload',
                title: 'Calculate your GPA without a server',
                body: 'How the 4.0 scale and credit-hour weighting work, why plus and minus grades matter, and why your grades stay local.',
              },
              {
                to: '/guides/roman-numeral-converter-without-upload',
                title: 'Convert Roman numerals without a server',
                body: 'How the seven symbols and subtractive notation work, why the range stops at 3999, and why conversions should stay local.',
              },
            ].map((article) => (
              <Link key={article.to} to={article.to} className="tool-card">
                <h3 style={{ fontSize: 19 }}>{article.title}</h3>
                <p>{article.body}</p>
                <span className="tool-card-foot">Read the guide</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--paper-2)' }}>
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">How it works</span>
              <h2 style={{ fontSize: 30, margin: '14px 0 10px' }}>Drop. Process. Download.</h2>
              <p className="muted">
                The loop is deliberately short. There is no queue, no waiting for an upload
                progress bar, and nothing to clean up afterwards.
              </p>
            </div>
            <div className="stack-md">
              {[
                {
                  icon: <BoltIcon size={18} />,
                  title: '1 · Drop a file',
                  body: 'The browser hands the bytes straight to the page. Nothing is transmitted.',
                },
                {
                  icon: <ShieldIcon size={18} />,
                  title: '2 · It is processed locally',
                  body: 'Canvas and WebAssembly re-encode the file in your tab, using your device.',
                },
                {
                  icon: <CheckIcon size={18} />,
                  title: '3 · Download and close',
                  body: 'The result is written straight to your disk. Reload the page and the file is gone.',
                },
              ].map((step) => (
                <div key={step.title} className="row" style={{ alignItems: 'flex-start' }}>
                  <span className="tool-card-icon" style={{ width: 34, height: 34, borderRadius: 9 }}>
                    {step.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 18 }}>{step.title}</h3>
                    <p className="muted small" style={{ marginTop: 4 }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">The honest comparison</span>
          <h2 style={{ fontSize: 32, margin: '14px 0 22px' }}>What “free online converter” usually means.</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>QuietKit</th>
                  <th>Typical upload site</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your file leaves your device</td>
                  <td className="yes">Never</td>
                  <td className="no">Always</td>
                </tr>
                <tr>
                  <td>Account or email required</td>
                  <td className="yes">No</td>
                  <td className="no">Usually</td>
                </tr>
                <tr>
                  <td>Daily conversion limits</td>
                  <td className="yes">None</td>
                  <td className="no">2–5 files</td>
                </tr>
                <tr>
                  <td>Watermark on the result</td>
                  <td className="yes">Never</td>
                  <td className="no">On the free tier</td>
                </tr>
                <tr>
                  <td>Works with the network switched off</td>
                  <td className="yes">Yes, once loaded</td>
                  <td className="no">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">Questions</span>
              <h2 style={{ fontSize: 30, margin: '14px 0 8px' }}>Straight answers.</h2>
              <p className="muted">
                Still unsure? Read the <Link to="/privacy" style={{ color: 'var(--forest)' }}>privacy policy</Link>,
                which is short because there is very little to disclose.
              </p>
            </div>
            <div className="faq">
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <div className="faq-body">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            className="panel"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 30,
              background: 'var(--forest)',
              borderColor: 'var(--forest)',
              color: '#f4faf7',
            }}
          >
            <div>
              <h2 style={{ fontSize: 28, color: '#fff' }}>Start with the photo on your desktop.</h2>
              <p style={{ marginTop: 8, color: '#cfe6dd', maxWidth: '52ch' }}>
                Most photos carry the exact coordinates where they were taken. It takes about
                four seconds to remove them.
              </p>
            </div>
            <div className="row">
              <Link className="btn btn-lg" to="/tools/metadata-cleaner" style={{ background: '#fff6e8', borderColor: '#fff6e8', color: '#14140f' }}>
                <LockIcon size={17} /> Clean a photo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
