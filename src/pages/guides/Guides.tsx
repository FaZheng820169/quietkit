import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../../components/Icons'
import { routeMeta, useSeo } from '../../lib/seo'

const articles = [
  {
    to: '/guides/remove-location-from-photo',
    title: 'Remove location data from a photo',
    description:
      'iPhone, Android and Windows steps, plus why a screenshot is not a real fix.',
    tag: 'Photos',
  },
  {
    to: '/guides/compress-image-to-100kb',
    title: 'Compress an image to 100 KB',
    description:
      'The order that works — resize, then quality, then format — with real numbers.',
    tag: 'Images',
  },
  {
    to: '/guides/merge-pdf-without-upload',
    title: 'Merge PDFs without uploading them',
    description:
      'Why contract and ID merges should never leave your machine, and how to check a tool.',
    tag: 'Documents',
  },
  {
    to: '/guides/split-pdf-without-upload',
    title: 'Split a PDF without uploading it',
    description:
      'Three ways to cut a document, what each part keeps, and how to verify a splitter is local.',
    tag: 'Documents',
  },
  {
    to: '/guides/pdf-to-jpg-without-upload',
    title: 'PDF to JPG without uploading it',
    description:
      'What you give up when a page becomes pixels, which DPI to pick, and why some pages turn black.',
    tag: 'Documents',
  },
  {
    to: '/guides/watermark-pdf-without-upload',
    title: 'Watermark a PDF without uploading it',
    description:
      'The settings that fit a draft, a confidential report or an issued copy — and what a text layer does to the page.',
    tag: 'Documents',
  },
  {
    to: '/guides/compress-pdf-without-upload',
    title: 'Compress a PDF without uploading it',
    description:
      'Which files shrink and which refuse to, what a rebuilt copy keeps — with real before-and-after numbers.',
    tag: 'Documents',
  },
  {
    to: '/guides/remove-pdf-metadata',
    title: 'Remove metadata from a PDF',
    description:
      'Author, company, software and dates — what the property block reveals, and how to strip it without touching a page.',
    tag: 'Documents',
  },
  {
    to: '/guides/jpg-to-pdf-without-upload',
    title: 'Turn photos into a PDF',
    description:
      'Receipts and ID scans photographed on a phone — page size, order and HEIC, assembled locally.',
    tag: 'Documents',
  },
  {
    to: '/guides/compare-pdf-without-upload',
    title: 'Compare two PDFs, locally',
    description:
      'What changed between two versions — side-by-side reading, pixel comparison and mismatched page counts.',
    tag: 'Documents',
  },
  {
    to: '/guides/exif-viewer',
    title: 'What an EXIF viewer shows you',
    description:
      'The metadata families, the fields that expose your location, and what the numbers mean.',
    tag: 'Metadata',
  },
  {
    to: '/guides/convert-png-to-jpg',
    title: 'Convert PNG to JPG without uploading',
    description:
      'What you lose when transparency goes away, which quality setting to pick, and how to do it in batches.',
    tag: 'Formats',
  },
  {
    to: '/guides/what-is-webp',
    title: 'What is a WebP file?',
    description:
      'Where WebP beats JPEG and PNG, and the places — email, print, forms — where it still fails.',
    tag: 'Formats',
  },
  {
    to: '/guides/social-media-image-sizes',
    title: 'Social media image sizes',
    description:
      'One table for Instagram, X, LinkedIn, YouTube and the rest — plus why your subject gets cropped.',
    tag: 'Sizes',
  },
  {
    to: '/guides/heic-to-jpg',
    title: 'Convert HEIC to JPG',
    description:
      'Why iPhones save HEIC, the four ways to convert it, and what happens to quality and GPS data.',
    tag: 'Formats',
  },
  {
    to: '/guides/avif-to-jpg',
    title: 'Convert AVIF to JPG',
    description:
      'The format browsers read and nothing else does — JPG versus PNG versus WebP, and how to convert locally.',
    tag: 'Formats',
  },
  {
    to: '/guides/resize-image-without-upload',
    title: 'Resize to exact pixels, locally',
    description:
      'Crop versus fit, why pixels are the only unit that matters, and how to resize a whole folder in one pass.',
    tag: 'Images',
  },
  {
    to: '/guides/remove-pdf-pages-without-upload',
    title: 'Remove pages from a PDF',
    description:
      'Delete versus extract, why a rebuilt file beats a white box, and what survives a rebuild.',
    tag: 'Documents',
  },
  {
    to: '/guides/rotate-pdf-without-upload',
    title: 'Rotate a PDF without uploading it',
    description:
      'Why scans come out sideways, what the /Rotate flag changes, and how to fix only the wrong pages.',
    tag: 'Documents',
  },
  {
    to: '/guides/reorder-pdf-pages-without-upload',
    title: 'Reorder PDF pages, locally',
    description:
      'Why a written order beats dragging thumbnails, and what survives a rebuilt document.',
    tag: 'Documents',
  },
  {
    to: '/guides/extract-text-from-pdf-without-upload',
    title: 'Extract text from a PDF',
    description:
      'What the text layer is, why scans stay silent, and what plain text keeps and drops.',
    tag: 'Documents',
  },
  {
    to: '/guides/convert-images-without-upload',
    title: 'Convert images without uploading them',
    description:
      'HEIC, PNG, WebP, JPEG — what each format keeps, why files can grow, and how to convert a folder locally.',
    tag: 'Formats',
  },
  {
    to: '/guides/remove-exif-metadata-without-upload',
    title: 'Strip photo metadata, locally',
    description:
      'The fields that expose you, why screenshots fall short, and how to clean a whole folder in one pass.',
    tag: 'Metadata',
  },
  {
    to: '/guides/add-page-numbers-to-pdf-without-upload',
    title: 'Add page numbers to a PDF',
    description:
      'Format, position and starting number — why a stamp beats typing, and why numbering comes last.',
    tag: 'Documents',
  },
  {
    to: '/guides/resize-pdf-pages-without-upload',
    title: 'Resize PDF pages to one sheet',
    description:
      'How mixed page sizes happen, fit versus fill, and why vector text stays sharp at any size.',
    tag: 'Documents',
  },
  {
    to: '/guides/batch-process-folder-without-upload',
    title: 'Batch a whole folder, locally',
    description:
      'Clean and compress the photos, merge and number the PDFs, one ZIP back — why the two lanes and their order matter.',
    tag: 'Workflow',
  },
  {
    to: '/guides/ocr-image-without-upload',
    title: 'OCR an image without uploading it',
    description:
      'How an OCR engine reads characters inside your browser, which images work well, and why handwriting stays out of reach.',
    tag: 'Images',
  },
  {
    to: '/guides/fill-pdf-form-without-upload',
    title: 'Fill a PDF form without uploading it',
    description:
      'The two kinds of PDF form, editable versus flattened copies, and why identity numbers belong on your own device.',
    tag: 'Documents',
  },
  {
    to: '/guides/sign-pdf-without-upload',
    title: 'Sign a PDF without uploading it',
    description:
      'Electronic versus digital signatures, what makes one valid, and why the document and the signature stay on your device.',
    tag: 'Documents',
  },
  {
    to: '/guides/qr-code-without-upload',
    title: "Make a QR code that doesn't track people — or expire",
    description:
      'Static versus dynamic codes, why free generators expire, and how to print a code that answers to nobody.',
    tag: 'Everyday',
  },
  {
    to: '/guides/favicon-without-upload',
    title: 'Favicons without uploading your logo',
    description:
      'What a modern favicon set contains, why a local generator beats a server, and how to install the files on your site.',
    tag: 'Images',
  },
  {
    to: '/guides/password-generator-without-upload',
    title: 'Generate passwords without uploading them',
    description:
      'Why a server-side generator has to see your password first, what actually makes a password strong, and how to verify a generator is local.',
    tag: 'Security',
  },
  {
    to: '/guides/watermark-image-without-upload',
    title: 'Watermark photos without uploading them',
    description:
      'Why online watermarking defeats the point, how to choose tiled or centred, and how to protect a whole folder locally.',
    tag: 'Images',
  },
  {
    to: '/guides/color-converter-without-upload',
    title: 'Convert colours without uploading your brand palette',
    description:
      'What HEX, RGB and HSL are each for, why contrast ratios matter more than taste, and how to build a palette locally.',
    tag: 'Design',
  },
  {
    to: '/guides/json-formatter-without-upload',
    title: 'Format JSON without pasting it into a server',
    description:
      'Why a server-side formatter sees every byte you paste, how to read a parse error, and what a local formatter gives you instead.',
    tag: 'Developer',
  },
  {
    to: '/guides/hash-generator-without-upload',
    title: 'Hash files without uploading them',
    description:
      'Why a file you want to verify is often one you do not want to share, which algorithm to trust, and how to check a download locally.',
    tag: 'Security',
  },
  {
    to: '/guides/markdown-preview-without-upload',
    title: 'Preview Markdown without pasting drafts into a server',
    description:
      'Drafts are the most sensitive text you write — render them locally, with raw HTML shown as text and clean HTML to copy.',
    tag: 'Writing',
  },
  {
    to: '/guides/text-diff-without-upload',
    title: 'Compare two texts without uploading either one',
    description:
      'Contracts, configs and drafts are exactly what you should not paste into a server — how line diffing works, what a unified diff is, and how to compare locally.',
    tag: 'Documents',
  },
  {
    to: '/guides/base64-without-upload',
    title: 'Base64 encode and decode without pasting data into a server',
    description:
      'Why btoa breaks on Unicode, what the URL-safe variant changes, when decoding fails honestly — and why credentials should never go through an online encoder.',
    tag: 'Developer',
  },
  {
    to: '/guides/url-encoding-without-upload',
    title: 'URL-encode and decode without pasting links into a server',
    description:
      'encodeURIComponent vs encodeURI, why %zz breaks a decoder, what + really means in a query string — and why tracking links should not go through an online decoder.',
    tag: 'Developer',
  },
  {
    to: '/guides/word-count-without-upload',
    title: 'Count words without pasting your draft into a server',
    description:
      'What a word really is to a computer — CJK text, emoji and contractions — how reading time is estimated, and why an unpublished draft should never go through an online counter.',
    tag: 'Writing',
  },
  {
    to: '/guides/case-conversion-without-upload',
    title: 'Convert text case without pasting it into a server',
    description:
      'What separates camelCase from PascalCase, how title case decides which words stay small, why acronyms break naive converters — and how to do every conversion locally.',
    tag: 'Writing',
  },
  {
    to: '/guides/slug-generator-without-upload',
    title: 'Generate URL slugs without pasting titles into a server',
    description:
      'What makes a good URL slug, how accents and apostrophes should fold, why hyphens beat underscores — and how to slug a whole list of titles locally.',
    tag: 'Writing',
  },
  {
    to: '/guides/uuid-generator-without-upload',
    title: 'Generate UUIDs without a server knowing them',
    description:
      'What a version 4 UUID actually is, how likely a collision really is, and why an id you are about to use should not pass through an API.',
    tag: 'Developer',
  },
  {
    to: '/guides/unit-conversion-without-upload',
    title: 'Convert units without uploading your numbers',
    description:
      'Why an inch is exactly 25.4 mm, what makes temperature conversion affine, the honest difference between MB and MiB — and why converting is a local job.',
    tag: 'Everyday',
  },
  {
    to: '/guides/lorem-ipsum-without-upload',
    title: 'Generate lorem ipsum without a server watching',
    description:
      'Where lorem ipsum comes from, when to use words versus sentences versus paragraphs, why placeholder text should not look like real sentences — and how to generate it locally.',
    tag: 'Design',
  },
  {
    to: '/guides/timestamp-converter-without-upload',
    title: 'Convert Unix timestamps without sending them anywhere',
    description:
      'What a Unix timestamp actually counts, why seconds and milliseconds both appear, how the leap-second-free epoch works, and how to convert in both directions entirely in your browser.',
    tag: 'Developer',
  },
  {
    to: '/guides/aspect-ratio-without-upload',
    title: 'Calculate aspect ratios without a server',
    description:
      'What a ratio actually is, why 16:9 won the screen, the difference between fit and fill, and how to solve any width-height pair entirely in your browser.',
    tag: 'Design',
  },
  {
    to: '/guides/random-number-without-upload',
    title: 'Generate random numbers without a server',
    description:
      'Where randomness comes from in a browser, why crypto.random beats Math.random, how to draw without repeats, and why a reproducible seed is sometimes what you want.',
    tag: 'Developer',
  },
  {
    to: '/guides/tip-calculator-without-upload',
    title: 'Calculate tips and split the bill without a server',
    description:
      'What the tip percentage really means, why pre-tax tipping is the honest default, how rounding splits a bill cleanly, and why a local calculator is right for a receipt.',
    tag: 'Everyday',
  },
  {
    to: '/guides/percentage-calculator-without-upload',
    title: 'Calculate percentages without a server',
    description:
      'The four percentage questions people actually ask, the one formula behind all of them, how percentage change keeps its direction, and why the answer is always local.',
    tag: 'Everyday',
  },
  {
    to: '/guides/age-calculator-without-upload',
    title: 'Calculate age without a server',
    description:
      'Why age is not a simple subtraction, how leap-day birthdays are handled, why the 31st maps to month-end, and why a birth date should never leave your device.',
    tag: 'Everyday',
  },
  {
    to: '/guides/px-to-rem-without-upload',
    title: 'Convert px to rem without a server',
    description:
      'What a rem actually is, why the root font size is a contract, when to use rem instead of px, and how to convert a whole CSS snippet in one pass.',
    tag: 'Developer',
  },
  {
    to: '/guides/date-calculator-without-upload',
    title: 'Calculate dates without a server',
    description:
      'How many days are really between two dates, why adding a month is not 30 days, how leap years and month lengths change the math, and why a date calculation should never leave your device.',
    tag: 'Everyday',
  },
  {
    to: '/guides/bmi-calculator-without-upload',
    title: 'Calculate BMI without a server',
    description:
      'What BMI actually measures, how the metric and imperial formulas differ, which category boundaries the WHO uses, and why your height and weight should never leave your device.',
    tag: 'Health',
  },
  {
    to: '/guides/calorie-calculator-without-upload',
    title: 'Calculate calories without a server',
    description:
      'How the Mifflin-St Jeor equation estimates BMR, what an activity factor does to your TDEE, which calorie targets match common weight goals, and why your details should never leave your device.',
    tag: 'Health',
  },
  {
    to: '/guides/loan-calculator-without-upload',
    title: 'Calculate loan payments without a server',
    description:
      'How the amortization formula turns a principal, rate and term into a monthly payment, where the interest goes each month, and why your loan details should never leave your device.',
    tag: 'Finance',
  },
  {
    to: '/guides/grade-calculator-without-upload',
    title: 'Calculate grades without a server',
    description:
      'How the final-grade formula finds the exam score you need, how weighted averages work, what letter grades mean, and why your grades should never leave your device.',
    tag: 'Education',
  },
]

export function Guides() {
  useSeo(routeMeta('/guides'))

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Guides</span>
          <h1>Short answers to real file problems</h1>
          <p>
            Each guide explains the mechanism first, then points at the tool that handles it. No
            filler, no twenty-slide carousel.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card-grid">
            {articles.map((article) => (
              <Link key={article.to} to={article.to} className="tool-card">
                <span className="tool-card-foot" style={{ paddingTop: 0, marginBottom: 4 }}>
                  {article.tag}
                </span>
                <h3 style={{ fontSize: 20 }}>{article.title}</h3>
                <p>{article.description}</p>
                <span className="tool-card-foot">
                  Read the guide
                  <ArrowRightIcon size={16} className="tool-card-arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
