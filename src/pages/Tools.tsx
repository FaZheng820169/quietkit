import { ToolCard } from '../components/ToolCard'
import { FileIcon, ImageIcon, LockIcon, PinIcon, QrIcon } from '../components/Icons'
import { routeMeta, useSeo } from '../lib/seo'

export function Tools() {
  useSeo(routeMeta('/tools'))

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">The toolbox</span>
          <h1>Fifty-four tools. Zero uploads.</h1>
          <p>
            QuietKit grows slowly and deliberately. A tool ships only when it can run entirely in
            your browser without a server behind it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card-grid">
            <ToolCard
              to="/tools/image-compressor"
              icon={<ImageIcon size={22} />}
              title="Compress images"
              description="Resize and re-encode JPEG, PNG and WebP files with a live size report and batch download."
              meta="Images"
            />
            <ToolCard
              to="/tools/image-converter"
              icon={<ImageIcon size={22} />}
              title="Convert images"
              description="Turn PNG into JPEG, screenshots into WebP, or a folder of mixed files into one format."
              meta="Images"
            />
            <ToolCard
              to="/tools/avif-converter"
              icon={<ImageIcon size={22} />}
              title="Convert AVIF"
              description="AVIF to JPG, PNG or WebP that anything can open — or JPG and PNG back to space-saving AVIF, in batches."
              meta="Images · AVIF"
            />
            <ToolCard
              to="/tools/image-resizer"
              icon={<ImageIcon size={22} />}
              title="Resize images"
              description="Hit an exact pixel size — social presets, custom dimensions, crop to fill or fit whole image — for one file or an entire folder."
              meta="Images"
            />
            <ToolCard
              to="/tools/metadata-cleaner"
              icon={<PinIcon size={22} />}
              title="Remove photo metadata"
              description="Inspect EXIF, GPS and XMP fields in one photo or a whole folder, then rewrite every file without them."
              meta="Privacy"
            />
            <ToolCard
              to="/tools/pdf-metadata"
              icon={<PinIcon size={22} />}
              title="Inspect PDF metadata"
              description="Read the author, producer, dates and XMP packet a PDF carries, then download a copy with the property block emptied."
              meta="Privacy · Documents"
            />
            <ToolCard
              to="/tools/pdf-compress"
              icon={<FileIcon size={22} />}
              title="Compress a PDF"
              description="Rebuild heavy scans at 110–200 DPI and see the real before-and-after size. Text becomes pixels; links and forms are dropped."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-compare"
              icon={<FileIcon size={22} />}
              title="Compare PDFs"
              description="Put two versions side by side, page through them together and highlight what changed, pixel by pixel."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-merge"
              icon={<FileIcon size={22} />}
              title="Merge PDFs"
              description="Combine any number of PDF files in the order you choose, without re-rendering pages."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-remove-pages"
              icon={<FileIcon size={22} />}
              title="Remove PDF pages"
              description="Delete a blank or sensitive page, or extract a range into its own file, using ranges like 1-3, 7."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-rotate"
              icon={<FileIcon size={22} />}
              title="Rotate PDF pages"
              description="Turn every page, or only the sideways scans, by 90° or 180°. Text and images stay vector."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-reorder"
              icon={<FileIcon size={22} />}
              title="Reorder PDF pages"
              description="Type the order you want — 4, 1-3, 5 — instead of dragging thumbnails. Pages keep their quality."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-text"
              icon={<FileIcon size={22} />}
              title="Extract PDF text"
              description="Copy a paragraph or the whole document as plain text. Scanned pages are reported as scans, not fake text."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-page-numbers"
              icon={<FileIcon size={22} />}
              title="Add PDF page numbers"
              description="Stamp numbers in the corner you choose, from a starting number you set, with a live preview of the first page."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-watermark"
              icon={<FileIcon size={22} />}
              title="Watermark a PDF"
              description="Stamp a diagonal, horizontal or vertical text mark — centred or tiled, faint or bold, across every page or a range you choose."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-resize"
              icon={<FileIcon size={22} />}
              title="Resize PDF pages"
              description="Put every page on one sheet — A4, Letter, Legal, A5 or A3 — fitted to show it all or filled to cover it."
              meta="Documents · Print"
            />
            <ToolCard
              to="/tools/pdf-split"
              icon={<FileIcon size={22} />}
              title="Split a PDF"
              description="Cut one document into a file per page, fixed-size chunks, or your own ranges — then download the parts as a ZIP."
              meta="Documents"
            />
            <ToolCard
              to="/tools/pdf-to-jpg"
              icon={<FileIcon size={22} />}
              title="PDF to JPG"
              description="Render pages to JPEG at 150, 200 or 300 DPI — one image per page, white background, ZIP when you need several."
              meta="Documents · Images"
            />
            <ToolCard
              to="/tools/jpg-to-pdf"
              icon={<ImageIcon size={22} />}
              title="JPG to PDF"
              description="Combine receipts, scans or photos into one PDF, in the order you choose, with GPS stripped."
              meta="Photos · Documents"
            />
            <ToolCard
              to="/tools/batch"
              icon={<PinIcon size={22} />}
              title="Batch a folder"
              description="Drop a whole folder: photos are cleaned of metadata, converted and compressed; PDFs are merged, numbered and resized. One ZIP back."
              meta="Photos + Documents · ZIP"
            />
            <ToolCard
              to="/tools/image-ocr"
              icon={<ImageIcon size={22} />}
              title="Image to text (OCR)"
              description="Read the words out of screenshots, receipts and scanned pages with an OCR engine that runs on your device — English text, plain-text output."
              meta="Images · Text out"
            />
            <ToolCard
              to="/tools/pdf-form-fill"
              icon={<FileIcon size={22} />}
              title="Fill a PDF form"
              description="Type into the fields, tick the boxes and pick the options of a real PDF form, then download a filled copy — flattened or still editable."
              meta="Forms · Flatten"
            />
            <ToolCard
              to="/tools/pdf-sign"
              icon={<FileIcon size={22} />}
              title="Sign a PDF"
              description="Draw or type your signature and click where it belongs — one page or every page, with a live preview. Document and signature stay on your device."
              meta="Sign · No upload"
            />
            <ToolCard
              to="/tools/qr-code"
              icon={<QrIcon size={22} />}
              title="QR code generator"
              description="Turn a link, Wi-Fi password or any text into a static QR code with live preview — PNG or SVG, no redirect service in the middle."
              meta="Everyday · PNG / SVG"
            />
            <ToolCard
              to="/tools/favicon"
              icon={<ImageIcon size={22} />}
              title="Favicon generator"
              description="Turn one logo into a complete favicon set — multi-resolution ICO, Apple touch icon, Android Chrome icons and a web manifest."
              meta="Images · ICO / PNG / manifest"
            />
            <ToolCard
              to="/tools/password-generator"
              icon={<LockIcon size={22} />}
              title="Password generator"
              description="Cryptographically random passwords with configurable length and character sets. Strength meter, batch output, copy to clipboard — nothing uploaded."
              meta="Security · Local crypto"
            />
            <ToolCard
              to="/tools/image-watermark"
              icon={<ImageIcon size={22} />}
              title="Image watermark"
              description="Add a tiled or centred text watermark to photos and screenshots. Preview the result, batch a whole folder, download as ZIP — all in your browser."
              meta="Images · JPEG / PNG / WebP"
            />
            <ToolCard
              to="/tools/color-converter"
              icon={<ImageIcon size={22} />}
              title="Color converter"
              description="Convert between HEX, RGB and HSL. Check WCAG contrast ratios, see complementary and analogous palettes, copy CSS-ready values."
              meta="Design · HEX / RGB / HSL"
            />
            <ToolCard
              to="/tools/json-formatter"
              icon={<FileIcon size={22} />}
              title="JSON formatter"
              description="Validate, format and minify JSON with precise error locations. Sort keys alphabetically, copy or download the result — all locally."
              meta="Developer · Validation / format"
            />
            <ToolCard
              to="/tools/hash-generator"
              icon={<LockIcon size={22} />}
              title="Hash generator"
              description="Compute SHA-256, SHA-512, SHA-384 and SHA-1 hashes of text or files. Verify downloads and check integrity — nothing is uploaded."
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
              description="Paste two versions of a contract, config or draft and see exactly what changed — line by line, word by word, with a unified diff to export."
              meta="Documents · Compare"
            />
            <ToolCard
              to="/tools/base64"
              icon={<FileIcon size={22} />}
              title="Base64 encoder & decoder"
              description="Encode text or files to Base64 and decode them back — Unicode-safe, with a URL-safe variant for tokens and links."
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
              description="UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE — all nine at once."
              meta="Writing · Transform"
            />
            <ToolCard
              to="/tools/slug-generator"
              icon={<FileIcon size={22} />}
              title="Slug generator"
              description="Turn titles into clean URL slugs — accents folded, emoji stripped, contractions joined, with separator and length control. Line by line."
              meta="Writing · URL"
            />
            <ToolCard
              to="/tools/uuid-generator"
              icon={<LockIcon size={22} />}
              title="UUID generator"
              description="RFC 4122 v4 UUIDs from crypto.getRandomValues — batches of up to 1,000, in standard, plain, braced or URN form."
              meta="Developer · Random ids"
            />
            <ToolCard
              to="/tools/unit-converter"
              icon={<FileIcon size={22} />}
              title="Unit converter"
              description="Length, weight, temperature and data size with exact definitional factors — and MB versus MiB kept honestly distinct."
              meta="Everyday · Exact ratios"
            />
            <ToolCard
              to="/tools/lorem-ipsum"
              icon={<FileIcon size={22} />}
              title="Lorem ipsum generator"
              description="The classic Cicero word pool by exact word, sentence or paragraph count — optional traditional opening, optional HTML wrapping."
              meta="Design · Placeholder text"
            />
            <ToolCard
              to="/tools/timestamp-converter"
              icon={<FileIcon size={22} />}
              title="Unix timestamp converter"
              description="Epoch to human date, both directions — seconds or milliseconds, UTC and your local zone, ISO 8601 and RFC 2822."
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
              description="Integers or decimals in any range, with or without repeats — from crypto.getRandomValues, with an optional seed for reproducibility."
              meta="Developer · Randomness"
            />
            <ToolCard
              to="/tools/tip-calculator"
              icon={<FileIcon size={22} />}
              title="Tip calculator"
              description="Bill, tip percentage and number of people — preset rates, custom percentage, and honest rounding that does not leave a stray cent on the table."
              meta="Everyday · Split the bill"
            />
            <ToolCard
              to="/tools/percentage-calculator"
              icon={<FileIcon size={22} />}
              title="Percentage calculator"
              description="Four modes — what is X% of Y, X is what % of Y, percentage change from X to Y, and X% of what is Y — with honest handling of divide-by-zero."
              meta="Everyday · Math"
            />
            <ToolCard
              to="/tools/age-calculator"
              icon={<FileIcon size={22} />}
              title="Age calculator"
              description="Years, months and days from a birth date, plus total days, weeks and months lived, and the countdown to the next birthday — leap days and the 31st handled correctly."
              meta="Everyday · Date"
            />
            <ToolCard
              to="/tools/px-to-rem"
              icon={<FileIcon size={22} />}
              title="px to rem converter"
              description="Convert pixels to rems and back with a configurable root font size. Single values or a whole CSS snippet — every px and rem token converted in place."
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
              description="Body Mass Index in metric (kg/cm) or imperial (lb/ft+in) units, with the WHO category and the range it covers. Private — your numbers stay in this tab."
              meta="Health · Calculator"
            />
            <ToolCard
              to="/tools/calorie-calculator"
              icon={<FileIcon size={22} />}
              title="Calorie calculator"
              description="BMR via the Mifflin-St Jeor equation, TDEE across five activity levels, and calorie targets for maintaining, losing or gaining weight. Private — nothing leaves your browser."
              meta="Health · Calculator"
            />
            <ToolCard
              to="/tools/loan-calculator"
              icon={<FileIcon size={22} />}
              title="Loan calculator"
              description="Monthly payment, total payment and total interest for any loan or mortgage, plus the first 12 months of the amortization schedule. Private — your details never leave your browser."
              meta="Finance · Calculator"
            />
            <ToolCard
              to="/tools/grade-calculator"
              icon={<FileIcon size={22} />}
              title="Grade calculator"
              description="Find the score you need on your final to hit a target grade, or calculate your weighted average across assignments. Private — your grades never leave your browser."
              meta="Education · Calculator"
            />
            <ToolCard
              to="/tools/height-converter"
              icon={<FileIcon size={22} />}
              title="Height converter"
              description="Convert between centimetres and feet and inches, in both directions, as you type. Exact 2.54 cm per inch. Private — your height never leaves your browser."
              meta="Everyday · Converter"
            />
            <ToolCard
              to="/tools/gpa-calculator"
              icon={<FileIcon size={22} />}
              title="GPA calculator"
              description="Calculate your cumulative GPA on a 4.0 scale from courses and credit hours. Enter each grade and watch the average update instantly. Private — your grades never leave your browser."
              meta="Education · Calculator"
            />
          </div>

          <div className="panel" style={{ marginTop: 26 }}>
            <span className="panel-title">On the workbench</span>
            <div className="split" style={{ gap: 24 }}>
              <p className="small muted">
                Shipped from the bench: a batch workflow that runs several tools over one folder
                in a single pass, an OCR reader that turns pictures of words into plain text,
                a form filler that types into a PDF's fields and flattens the answers, an
                AVIF converter that works in both directions, a signing tool that stamps a
                drawn or typed signature onto the pages you pick, a QR generator whose
                static codes answer to no redirect server, and a favicon builder that turns
                one logo into a full ICO/PNG/manifest set.
                Comparison, watermarking, compression, PDF to JPG rendering,
                splitting, page-size rebuilding, metadata inspection, page numbering, folder-wide
                resizing and metadata cleaning, text extraction, page reorder, rotation, JPG to
                PDF and HEIC decoding all ship — each runs entirely in the tab.
              </p>
              <p className="small muted">
                Want a specific tool? The fastest way to get it built is to ask for it — every
                QuietKit tool so far started as a request.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
