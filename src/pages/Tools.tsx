import { ToolCard } from '../components/ToolCard'
import { FileIcon, ImageIcon, PinIcon } from '../components/Icons'
import { useSeo } from '../lib/seo'

export function Tools() {
  useSeo({
    title: 'All tools — private, browser-local file utilities | QuietKit',
    description:
      'The full QuietKit toolbox: compress images, remove EXIF and GPS metadata, and merge PDFs. Every tool runs locally in your browser.',
    path: '/tools',
  })

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">The toolbox</span>
          <h1>Three tools. Zero uploads.</h1>
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
              to="/tools/metadata-cleaner"
              icon={<PinIcon size={22} />}
              title="Remove photo metadata"
              description="Inspect EXIF, GPS and XMP fields inside a photo, then rewrite the file without them."
              meta="Privacy"
            />
            <ToolCard
              to="/tools/pdf-merge"
              icon={<FileIcon size={22} />}
              title="Merge PDFs"
              description="Combine any number of PDF files in the order you choose, without re-rendering pages."
              meta="Documents"
            />
          </div>

          <div className="panel" style={{ marginTop: 26 }}>
            <span className="panel-title">On the workbench</span>
            <div className="split" style={{ gap: 24 }}>
              <p className="small muted">
                Next up: splitting and rotating PDF pages, HEIC to JPEG conversion, and batch
                metadata cleaning for whole folders. These need more browser support than the
                current three, so they take longer to do properly.
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
