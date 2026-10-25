import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does turning photos into a PDF reduce their quality?',
    a: 'The images are embedded as they are — the PDF is a container, not a re-save. A photo placed on a PDF page keeps its pixels; what changes is only how large it prints on the page. If you need the untouched originals later, keep the photos themselves as well as the PDF.',
  },
  {
    q: 'Should I pick A4, Letter or Fit?',
    a: 'A4 for printing almost everywhere in the world, Letter for the US and Canada, and Fit when the PDF will be read on screen rather than printed. Fit sizes each page exactly to its image, so there are no white bars — but a mixed batch produces pages of different sizes, which looks odd in a print queue.',
  },
  {
    q: 'What happens to a portrait photo on a landscape image batch?',
    a: 'Each page is oriented to its own image: wide photos get landscape pages, tall photos get portrait ones, and every image is centred and scaled to fit inside the margins. Nothing is cropped and nothing is rotated against its will.',
  },
  {
    q: 'Can I mix JPG, PNG and HEIC in one PDF?',
    a: 'Yes. HEIC photos from an iPhone are decoded in the browser first, then all three formats are placed in the order you chose. The phone never needs to convert anything before you start.',
  },
  {
    q: 'Is this safe for scans of ID or medical documents?',
    a: 'That is precisely the case it is built for. The pages are assembled in the tab and the finished PDF goes straight to your downloads folder — no upload, no processing queue, no copy on someone else’s server. You can watch the Network panel while it runs to confirm.',
  },
]

export function JpgToPdfGuide() {
  useSeo({
    ...routeMeta('/guides/jpg-to-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Turn photos into a PDF without uploading them"
      lede="Receipts for an expense claim, scanned documents for a visa application, a signed form photographed on a phone — “JPG to PDF” is how paper enters email. The photos are usually the last thing you should hand to a stranger’s server."
      updated="26 October 2026"
      toolTo="/tools/jpg-to-pdf"
      toolLabel="Combine images into a PDF in your browser"
    >
      <h2>Why this task is more sensitive than it looks</h2>
      <p>
        People reach for “JPG to PDF” when paper has to become an attachment: a passport photo for
        an application, a signed contract photographed at a kitchen table, a stack of receipts at
        month end. These are identity documents and financial records. The popular converters upload
        them by default, because that is how their servers are built — your photos pass through
        infrastructure you cannot see, under a retention policy you have not read.
      </p>
      <p>
        The alternative is not a different server with a nicer policy. It is no server at all: the
        pages are assembled in the browser tab, and the finished PDF is written straight to your
        downloads folder.
      </p>

      <h2>The only three decisions that matter</h2>
      <p>
        <strong>Page size.</strong> A4 if the PDF will be printed outside North America, Letter if
        it will be printed there, Fit if it will live on screens. Print sizes give you consistent,
        punchable pages with margins; Fit makes every page exactly the shape of its photo, which
        reads better on a phone and worse in a print queue.
      </p>
      <p>
        <strong>Margin.</strong> On A4 and Letter the image is scaled to fit inside the margins and
        centred, so nothing is ever cropped. A narrow margin shows more of the photo; a wide margin
        leaves room for a hole punch and a handwritten note.
      </p>
      <p>
        <strong>Order.</strong> The PDF keeps the order you give it. For an expense claim, that
        means receipts in date order before you start; renaming files with a leading number
        (01-parking.jpg, 02-train.jpg) is the reliable way to make the selection order obvious.
      </p>

      <h2>Phone photos, including HEIC</h2>
      <p>
        An iPhone saves photos as HEIC by default, and many converters choke on the format or make
        you change a phone setting first. A local tool can decode HEIC in the browser, so the photos
        go straight from the share sheet into the PDF. Wide photos get landscape pages and tall ones
        get portrait pages automatically — a batch of mixed orientations comes out readable without
        you rotating anything.
      </p>
      <p>
        One honest limitation: PDF is a container for the images, not an archive format. The photos
        keep their pixels inside the document, but if the originals matter, keep them alongside.
        And since the photos came from a phone, they may carry GPS coordinates — strip that first
        with the <Link to="/tools/metadata-cleaner">metadata cleaner</Link> if the location of your
        kitchen table is not the recipient’s business.
      </p>

      <h2>Doing it locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/jpg-to-pdf">JPG to PDF tool</Link> and drop the photos in —
          JPG, PNG and HEIC can be mixed.
        </li>
        <li>Arrange them in the order the recipient should read them.</li>
        <li>
          Choose A4 or Letter with a margin for anything that will be printed, or Fit for something
          that will be read on screen.
        </li>
        <li>
          Build the PDF and download it. The photos never left the tab, and the originals on your
          device are untouched.
        </li>
      </ol>
      <p>
        To verify the privacy claim rather than trust it, open the browser’s Network panel before
        dropping the photos and watch while the PDF is built: no request carries an image. The page
        also works offline once loaded, which is the strongest proof a web tool can give.
      </p>

      <h2>When the result is too big to email</h2>
      <p>
        A dozen phone photos make a heavy PDF, because phone cameras produce far more pixels than a
        printed page can show. Two fixes, in order: first resize the photos to a sensible size with
        the <Link to="/tools/image-resizer">image resizer</Link> — a page at 150 DPI needs roughly
        1240 × 1754 pixels, and anything beyond that is weight without visible benefit. Then, if the
        PDF is still over the line, run it through the{' '}
        <Link to="/tools/pdf-compress">PDF compressor</Link>, which rebuilds the pages at a chosen
        resolution and shows you the real before-and-after size.
      </p>

      <h2>Before you send it</h2>
      <ul>
        <li>Flip through every page in the download, in order, the way the recipient will.</li>
        <li>Check no photo is sideways and no receipt is duplicated.</li>
        <li>Strip location metadata from phone photos before they go into the PDF.</li>
        <li>If the document is sensitive, confirm the file size and page count match what you intended to send — then keep the originals.</li>
      </ul>

      <h2>FAQ</h2>
      <div className="faq">
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <div className="faq-body">{item.a}</div>
          </details>
        ))}
      </div>
    </Article>
  )
}
