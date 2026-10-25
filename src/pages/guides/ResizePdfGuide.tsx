import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does resizing PDF pages make the text blurry?',
    a: 'No, when it is done properly. Resizing a PDF page means scaling its contents — and text and line art in a PDF are vectors, which scale without losing sharpness at any size. The result stays crisp on A4 or A3 alike. Only scanned pages, which are images inside, can soften, and only when scaled up.',
  },
  {
    q: 'What is the difference between fit and fill?',
    a: 'Fit scales the page until the whole original is visible on the new sheet, leaving margins on two sides when the proportions differ — nothing is lost. Fill scales until the new sheet is completely covered, cropping whatever overflows. Fit is right for documents; fill is right for artwork where a white margin would look wrong.',
  },
  {
    q: 'Why do mixed page sizes matter for printing?',
    a: 'A printer driver asked to put a Letter page on A4 paper guesses, and its guesses — scale to 94%, crop the margins, or refuse duplex alignment — vary by driver and by mood. Normalising every page to one sheet size beforehand takes the decision away from the driver, so the stack that comes out matches the preview you approved.',
  },
  {
    q: 'Will resizing fix a page that was scanned sideways?',
    a: 'It normalises the rotation flag as part of the rebuild, so pages arrive upright on the new sheet. If the underlying scan itself is crooked inside the page, that is a rotation job — rotate those pages first, then resize.',
  },
  {
    q: 'Is it safe to resize a legal document on an online tool?',
    a: 'Only if the file never leaves your device. Upload-based resizers send the whole document to a server under a retention policy you have not read. A local resizer rebuilds the pages inside your browser tab — nothing is transmitted, and once loaded it works with the network switched off.',
  },
]

export function ResizePdfGuide() {
  useSeo({
    ...routeMeta('/guides/resize-pdf-pages-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Resize PDF pages to A4 or Letter without uploading the file"
      lede="The contract is Letter, the appendix is A4, the scan is 12 centimetres wide — and the print shop wants one sheet size. Normalising page sizes is a five-minute job, if the file never has to leave your desk."
      updated="26 October 2026"
      toolTo="/tools/pdf-resize"
      toolLabel="Resize PDF pages in your browser"
    >
      <h2>How documents end up with mixed pages</h2>
      <p>
        Nobody designs a document with five page sizes. It accumulates: the main report exported
        from Word as A4, a signed page scanned back as Letter, a certificate from a government
        portal at its own peculiar size, a receipt photographed and converted. Individually each
        page is fine. Together they are a stack that prints wrong — margins cropped on one page,
        tiny centred content on the next, duplex alignment that drifts page by page.
      </p>
      <p>
        The fix is not to re-print the awkward pages. It is to put every page of the finished PDF
        on one sheet size — A4 for most of the world, Letter for North America, A3 for posters and
        drawings — so the printer driver has no decisions left to make.
      </p>

      <h2>What resizing a PDF page actually means</h2>
      <p>
        A PDF page is not a picture; it is a list of drawing instructions with a declared width
        and height. Resizing creates a new page of the target size and scales the original
        contents onto it. Because text and line art are vectors, they scale mathematically —
        sharp at any size, in either direction. The words in the resized file are still real text:
        selectable, searchable, and unchanged.
      </p>
      <p>
        This is the honest difference from the cheap approach — rendering each page to an image
        and pasting that onto a new sheet. That flattens text into pixels, balloons the file, and
        kills search. A proper resize keeps the vector content and only touches the page box and
        the scale.
      </p>

      <h2>Fit or fill: the one decision that matters</h2>
      <p>
        <strong>Fit</strong> scales until the whole original page is visible on the new sheet.
        When the proportions differ — Letter onto A4, a square scan onto either — two margins
        appear. Nothing is cropped, which is what documents want: a signature or a footer that
        disappears is worse than a white edge.
      </p>
      <p>
        <strong>Fill</strong> scales until the new sheet is completely covered, cropping whatever
        overflows. That is the right choice for artwork, covers and photos, where a white margin
        reads as a mistake. For anything with content near the edges, check the preview before
        committing — fill will quietly trim a header that sits too close.
      </p>

      <h2>Normalising a document locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-resize">PDF resize tool</Link> and drop the file in.
        </li>
        <li>
          Pick the target sheet — A4, Letter, Legal, A5 or A3. Match the paper the destination
          printer actually holds.
        </li>
        <li>
          Choose fit for documents, fill for artwork; the first page previews the result before
          anything is written.
        </li>
        <li>
          Download. Every page is now the same size, rotation normalised, text still vector — and
          the file never left the tab.
        </li>
      </ol>

      <h2>What resizing cannot do</h2>
      <ul>
        <li>
          <strong>Fix crooked scans.</strong> Rotation is normalised, but a scan that is skewed
          inside its page needs <Link to="/tools/pdf-rotate">rotation</Link> first.
        </li>
        <li>
          <strong>Sharpen images.</strong> Vector text scales perfectly; a low-resolution scan
          scaled up to A3 is still a low-resolution scan, just bigger.
        </li>
        <li>
          <strong>Shrink the file.</strong> Resizing changes dimensions, not weight — that is{' '}
          <Link to="/tools/pdf-compress">compression</Link>, a different pass.
        </li>
        <li>
          <strong>Choose the paper for the print shop.</strong> Ask which sheet the job prints on
          before normalising; resizing twice to two standards serves nobody.
        </li>
      </ul>
      <p>
        With the pages on one sheet, the finishing steps are local too:{' '}
        <Link to="/tools/pdf-page-numbers">number the pages</Link> so the binder order survives,
        or <Link to="/tools/pdf-merge">merge</Link> the normalised file with the rest of the
        paperwork.
      </p>

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
