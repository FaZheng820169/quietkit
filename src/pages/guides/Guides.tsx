import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../../components/Icons'
import { useSeo } from '../../lib/seo'

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
    to: '/guides/exif-viewer',
    title: 'What an EXIF viewer shows you',
    description:
      'The metadata families, the fields that expose your location, and what the numbers mean.',
    tag: 'Metadata',
  },
]

export function Guides() {
  useSeo({
    title: 'Guides — plain answers about files, metadata and privacy | QuietKit',
    description:
      'Practical guides on photo metadata, image compression and local PDF handling. Short, specific, and linked to a tool that does the work.',
    path: '/guides',
  })

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
