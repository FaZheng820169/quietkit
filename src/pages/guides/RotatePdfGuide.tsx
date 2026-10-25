import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does rotating a PDF lower its quality?',
    a: 'No. A PDF page stores its orientation as a single number, the /Rotate entry. Turning a page means changing that number; the text, images and vector lines on the page are not touched, re-rendered or re-compressed. A rotated contract is byte-for-byte as sharp as the original.',
  },
  {
    q: 'Which angle do I need: 90, 180 or 270?',
    a: 'Read the page as it currently appears. If the text runs top-to-bottom down the right side, the page needs 90° clockwise. If it runs bottom-to-top, it needs 90° counter-clockwise (270°). If everything is upside down, 180°. When in doubt, rotate once and check the first page of the download.',
  },
  {
    q: 'Can I fix only the pages that are wrong?',
    a: 'Yes, and you should — rotating every page to fix one sideways scan turns the other 39 pages sideways. Select a range like 4, 12-14 and the rest of the document is left exactly as it was.',
  },
  {
    q: 'Why does the file still look sideways in one program after rotating?',
    a: 'A small number of older viewers, print drivers and thumbnail scripts ignore the /Rotate instruction or apply it on top of an orientation the scanner already baked in. Every mainstream viewer — browsers, Preview, Acrobat, phone readers — honours it. If the destination is a fussy print workflow, export one page to an image first to confirm.',
  },
  {
    q: 'Is it safe to rotate a confidential PDF online?',
    a: 'Only if the tool never uploads it. A local rotation reads the file into your browser tab, edits the page objects in memory and hands you a download; you can watch the Network panel and see that no request carries the document. An upload-based tool asks you to trust a retention policy you have not read.',
  },
]

export function RotatePdfGuide() {
  useSeo({
    ...routeMeta('/guides/rotate-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Rotate a PDF without uploading it"
      lede="The scanner fed the pages in sideways, the phone app guessed the orientation wrong, and now a 40-page document reads like a neck exercise. Fixing it takes seconds — and the file never has to leave your machine."
      updated="26 October 2026"
      toolTo="/tools/pdf-rotate"
      toolLabel="Rotate PDF pages in your browser"
    >
      <h2>Why pages come out sideways</h2>
      <p>
        A flatbed scanner records the paper as it sits on the glass, not as you intend to read it.
        Feed a landscape form short-edge first and every page arrives rotated 90°. Phone scanning
        apps add their own twist: the app detects the page, rotates the photo to save space, then
        the PDF builder applies a second rotation on top — and the two disagree.
      </p>
      <p>
        The result is a document where every page is technically fine and practically unreadable, or
        worse, a long file where exactly three pages in the middle went in sideways. Both are the
        same one-line fix.
      </p>

      <h2>What “rotating” actually changes</h2>
      <p>
        Every page in a PDF carries a dictionary entry called <code>/Rotate</code> — a multiple of
        90 that tells the viewer which way to turn the page before drawing it. Rotating a document
        means rewriting those numbers. Nothing on the page is redrawn: text stays searchable and
        selectable, images keep their original compression, vector lines stay vector. The operation
        is instant, lossless and reversible — rotating four times by 90° returns the page to exactly
        where it started.
      </p>
      <p>
        Desktop editors also offer “rotate and flatten”, which transforms the page content itself so
        even a viewer that ignores <code>/Rotate</code> shows it upright. That is heavier, can
        subtly shift how the page lands on printed paper, and is almost never necessary in 2026 —
        every mainstream viewer honours the flag.
      </p>

      <h2>All pages, or just the wrong ones</h2>
      <p>
        The common case is a batch scan that went in sideways: select all pages, one angle, done.
        The sneakier case is the mixed document — page 4 upside down, pages 12 to 14 sideways — left
        by a feeder that grabbed two sheets at once. Rotating everything to fix those pages breaks
        the rest, so the fix is a range: <code>4, 12-14</code>, rotated once, leaving the other
        pages untouched.
      </p>
      <p>
        Pages already carry a rotation value, and a good tool adds to it rather than overwriting it.
        That is what makes “rotate twice” behave the way you expect: a page at 180° turned by
        another 180° comes back to 0°.
      </p>

      <h2>Why “rotate PDF online” is a bad trade</h2>
      <p>
        The documents that arrive sideways are scans — signed contracts, medical reports, ID
        copies, bank statements — precisely the files that should not pass through a stranger’s
        server. Most rotation sites upload the document, edit it on their machine and give you a
        link back, because that is how their infrastructure works. “Deleted after one hour” is a
        promise about a copy you cannot see.
      </p>
      <p>
        A local rotation makes no promise because it makes no copy. The PDF engine is already inside
        your browser; the file is read into the tab, the rotation values are edited in memory, and a
        new copy downloads straight back to you. You can verify rather than trust: open the Network
        panel before dropping the file and watch — no request carries the document. Once the page
        has loaded, it even works with the network switched off.
      </p>

      <h2>Rotating a PDF locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-rotate">PDF rotation tool</Link> and drop the file in.
        </li>
        <li>
          Pick the angle — 90° clockwise for the usual sideways scan, 180° for upside-down pages.
        </li>
        <li>
          Leave <em>All pages</em> selected, or switch to <em>Selected pages</em> and type a range
          like <code>4, 12-14</code>.
        </li>
        <li>
          Rotate, download, and open the first page of the new file to confirm it reads upright.
        </li>
      </ol>

      <h2>What rotation cannot fix</h2>
      <ul>
        <li>
          <strong>A page that was scanned crooked.</strong> If the paper sat at a slight angle on
          the glass, the skew is baked into the image. Rotation works in 90° steps; deskewing a
          3° tilt means re-scanning or a dedicated image tool.
        </li>
        <li>
          <strong>Content that is genuinely laid out sideways.</strong> Some reports print wide
          tables as rotated pages on purpose. Turning them upright makes the table sideways instead
          — check before you “fix” it.
        </li>
        <li>
          <strong>The one stubborn viewer.</strong> Rare old tools ignore the rotation flag. If a
          print shop’s system shows the file sideways, export a page to an image with{' '}
          <Link to="/tools/pdf-to-jpg">PDF to JPG</Link> to confirm what their machine will see.
        </li>
      </ul>
      <p>
        Once the pages all face the right way, the rest of the cleanup is local too:{' '}
        <Link to="/tools/pdf-remove-pages">drop the blank page</Link> the feeder added,{' '}
        <Link to="/tools/pdf-reorder">fix the page order</Link>, or{' '}
        <Link to="/tools/pdf-merge">merge the scan with the rest of the paperwork</Link>.
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
