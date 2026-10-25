import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does adding page numbers rebuild the PDF?',
    a: 'No. The numbers are stamped as a small extra layer of content on each page — the original text, images and fonts are not re-encoded, so nothing softens or shifts. That is also why the operation is fast: the pages are copied, not redrawn.',
  },
  {
    q: 'Should the cover page get a number?',
    a: 'Conventionally, no. Reports, theses and books count the cover as page 1 but print nothing on it, so the first visible number is 2 on the second page. A skip-the-first-page option does exactly that: the count includes the cover, the stamp does not appear on it.',
  },
  {
    q: 'Which corner should the number go in?',
    a: 'Bottom-centre or bottom-outer corner is the convention for bound documents, because the number survives a reader flipping pages quickly. Top corners are fine for stapled handouts. The only real rule is consistency with any header or footer the document already has — a page number that collides with existing text looks worse than none.',
  },
  {
    q: 'Why not just type numbers into the PDF with a text editor?',
    a: 'Manual numbering breaks the moment a page is added or removed, and forty pages of hand-typed numbers is forty chances to be wrong. A stamping pass derives every number from the page position, so it cannot drift — and it can be redone in seconds after the document changes.',
  },
  {
    q: 'Is it safe to number a contract or medical report online?',
    a: 'Only with a tool that never uploads the file. The documents that most often need page numbers — contracts, filings, reports — are exactly the ones that should not pass through a server. A local stamper draws the numbers inside your browser tab; the Network panel shows nothing leaving, and the tool works with the network switched off.',
  },
]

export function PageNumbersGuide() {
  useSeo({
    ...routeMeta('/guides/add-page-numbers-to-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Add page numbers to a PDF without uploading it"
      lede="Forty pages of merged scans, a thesis going to the printer, a contract nobody wants to miscount — page numbers are a two-minute job, and the document that needs them is usually not one to hand to a server."
      updated="26 October 2026"
      toolTo="/tools/pdf-page-numbers"
      toolLabel="Add page numbers in your browser"
    >
      <h2>Why numbering is always a last-minute job</h2>
      <p>
        Nobody numbers pages while writing. The need appears at the end: the chapters were merged
        into one file, the appendix was attached, and now a reader on page 23 needs to say “look
        at page 23” and be right. It is a small, mechanical job with a hard deadline — which is
        precisely why it so often ends with the document uploaded to the first site the search
        engine offered.
      </p>
      <p>
        The mechanic matters more than the tool. A proper numbering pass does not rebuild the PDF:
        it stamps a small amount of extra content onto each page and copies the rest untouched.
        Text stays text, fonts stay embedded, images keep their resolution. Anything that
        re-renders your pages to add a number is doing far more than the job requires — and
        usually charging quality for it.
      </p>

      <h2>The three decisions, in order</h2>
      <p>
        <strong>Format.</strong> A bare number — “7” — is enough for most documents. “7 / 24”
        helps when pages might be separated and you want each one to prove the total. “Page 7 of
        24” reads formally and suits filings and certificates. Pick the shortest form that still
        answers the reader's question.
      </p>
      <p>
        <strong>Position.</strong> Bottom-centre is the safe default; bottom-outer corners are the
        book convention and survive fast flipping. The one thing to check is what the document
        already carries — a number that lands on top of an existing footer looks worse than no
        number at all. A live preview of the first page settles this in one glance.
      </p>
      <p>
        <strong>Starting point.</strong> The convention for anything with a cover: the cover
        counts as page 1 but shows nothing, so page 2 carries the first visible number. Skipping
        the first page without skipping it in the count is a single option, not a workaround.
      </p>

      <h2>Why a stamp beats a text editor</h2>
      <p>
        Typing numbers in by hand works until the document changes — and documents that need
        numbering always change. One inserted page silently renumbers everything after it, and
        hand-placed numbers cannot be trusted again without checking every page. A stamped pass
        derives each number from the page's position: it cannot drift, it cannot skip, and after
        the next revision it is redone in seconds rather than re-checked for an hour.
      </p>

      <h2>Numbering a PDF locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-page-numbers">page numbering tool</Link> and drop the PDF
          in.
        </li>
        <li>
          Choose the format and the corner; the first page previews the stamp live, so collisions
          with existing headers are visible before anything is written.
        </li>
        <li>
          If the first page is a cover, enable the cover skip — it counts but stays clean.
        </li>
        <li>
          Download. The pages are copied with the numbers drawn on top; nothing was re-encoded,
          and nothing left the tab.
        </li>
      </ol>

      <h2>What a numbering pass cannot do</h2>
      <ul>
        <li>
          <strong>Number a scan as text.</strong> The stamp lands on the page fine, but the
          document still has no searchable text — that needs OCR, a different job.
        </li>
        <li>
          <strong>Match an existing numbering scheme.</strong> A document whose front matter is
          numbered i, ii, iii and whose body restarts at 1 needs those ranges set deliberately,
          not a single stamp from 1 to n.
        </li>
        <li>
          <strong>Remove an old footer.</strong> Stamping adds; it does not erase. If the document
          already carries wrong numbers, they have to be cut out of the source first.
        </li>
        <li>
          <strong>Fix the document itself.</strong> Numbering is the last step:{' '}
          <Link to="/tools/pdf-merge">merge</Link>,{' '}
          <Link to="/tools/pdf-remove-pages">remove</Link> and{' '}
          <Link to="/tools/pdf-reorder">reorder</Link> first, number once, last.
        </li>
      </ul>
      <p>
        And if the finished document also needs a status mark, a{' '}
        <Link to="/tools/pdf-watermark">watermark</Link> stamps the same way — on top, without
        rebuilding the pages.
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
