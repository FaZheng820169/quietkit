import { ToolCard } from '../components/ToolCard'
import { FileIcon, ImageIcon, PinIcon } from '../components/Icons'
import { routeMeta, useSeo } from '../lib/seo'

export function Tools() {
  useSeo(routeMeta('/tools'))

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">The toolbox</span>
          <h1>Eight tools. Zero uploads.</h1>
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
              to="/tools/image-resizer"
              icon={<ImageIcon size={22} />}
              title="Resize images"
              description="Hit an exact pixel size — social presets, custom dimensions, crop to fill or fit whole image."
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
              to="/tools/jpg-to-pdf"
              icon={<ImageIcon size={22} />}
              title="JPG to PDF"
              description="Combine receipts, scans or photos into one PDF, in the order you choose, with GPS stripped."
              meta="Photos · Documents"
            />
          </div>

          <div className="panel" style={{ marginTop: 26 }}>
            <span className="panel-title">On the workbench</span>
            <div className="split" style={{ gap: 24 }}>
              <p className="small muted">
                Next up: reordering PDF pages and batch metadata cleaning for whole folders. JPG to
                PDF, page rotation and HEIC decoding all ship — each one runs entirely in the tab.
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
