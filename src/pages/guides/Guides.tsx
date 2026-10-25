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
