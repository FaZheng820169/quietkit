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
          <h1>Twenty-two tools. Zero uploads.</h1>
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
          </div>

          <div className="panel" style={{ marginTop: 26 }}>
            <span className="panel-title">On the workbench</span>
            <div className="split" style={{ gap: 24 }}>
              <p className="small muted">
                Shipped from the bench: a batch workflow that runs several tools over one folder
                in a single pass, an OCR reader that turns pictures of words into plain text,
                a form filler that types into a PDF's fields and flattens the answers, and an
                AVIF converter that works in both directions.
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
