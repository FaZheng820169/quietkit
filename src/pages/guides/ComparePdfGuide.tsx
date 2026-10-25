import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is comparing two PDFs pixel by pixel reliable?',
    a: 'For spotting that something on a page changed, yes — any edit a reader could see changes pixels, so it lights up. What it cannot do is tell you which word was edited, and it assumes both files came from the same source. Two scans of the same paper document made at different resolutions will speckle everywhere.',
  },
  {
    q: 'Why not just compare the text of the two files?',
    a: 'Text comparison finds edited words and nothing else. It is blind to a replaced logo, a chart redrawn with different numbers, a signature block that moved two centimetres, or a stamp that appeared. The page is what a reader signs off on, so the page is the honest thing to compare.',
  },
  {
    q: 'The revised file has more pages than the original. Now what?',
    a: 'Compare page by page as far as the shorter document goes, then read the extra pages on their own — a page with no counterpart is itself a change. The comparison tool marks pages that exist in only one file instead of skipping them silently.',
  },
  {
    q: 'Both files are contracts. Is it safe to compare them online?',
    a: 'Only if the tool never uploads them. A local comparison renders both files inside your browser tab and sends nothing anywhere; you can watch the Network panel while you work, or switch the network off entirely after the page loads. An upload-based comparator asks you to trust a retention policy you have not read.',
  },
  {
    q: 'Can a comparison prove two PDFs are identical?',
    a: 'Visually, yes: if every page renders to exactly the same image, no reader will ever see a difference. That is weaker than a byte-for-byte checksum — the files can still differ in metadata, fonts or structure — but for “did the content change”, a clean visual comparison is the answer that matters.',
  },
]

export function ComparePdfGuide() {
  useSeo({
    ...routeMeta('/guides/compare-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Compare two PDFs without uploading either one"
      lede="The revised quote, the returned lease, the reissued certificate — “what changed?” is one of the most common questions in document work, and the two files involved are usually the last ones you should hand to a stranger’s server."
      updated="26 October 2026"
      toolTo="/tools/pdf-compare"
      toolLabel="Compare two PDFs in your browser"
    >
      <h2>The question is always the same</h2>
      <p>
        Version two of a document arrives as an attachment with a one-line message: “small edits,
        please confirm.” Somewhere in twelve pages, a number moved. Reading both files line by line
        is how a changed bank account or a new clause gets missed — the eye is good at reading and
        terrible at spotting.
      </p>
      <p>
        The reliable method is to stop reading and start comparing: put the two pages next to each
        other, or better, let the computer mark every pixel that differs. What used to need a desktop
        diff tool now runs in a browser tab.
      </p>

      <h2>Two honest ways to compare</h2>
      <p>
        <strong>Side by side, in lockstep.</strong> Both files open at the same page and turn
        together. Your eye does the comparing — slow, but it catches meaning: a reworded sentence
        reads differently even where a machine sees only moved pixels.
      </p>
      <p>
        <strong>Pixel comparison.</strong> Both versions of a page are rendered at the same size and
        compared channel by channel. Anything a reader could see — an edited word, a replaced logo, a
        chart with new numbers, a stamp that appeared — changes pixels and lights up. A page that
        survived the revision untouched compares clean and says so, which is what makes paging
        through a long document fast.
      </p>
      <p>
        The pixel method has one honest blind spot: it shows <em>where</em> something changed, not{' '}
        <em>which word</em> was edited. Read the red region in both files to see the actual edit.
      </p>

      <h2>When the page counts disagree</h2>
      <p>
        Revised documents gain and lose pages. A comparison that silently stops at the shorter file
        hides exactly the change you were looking for. Page through as far as the longer document
        goes; pages that exist in only one file should be marked as missing on the other side, not
        skipped. A page with no counterpart is a change in itself — an added appendix, a removed
        pricing sheet.
      </p>

      <h2>Why “online PDF compare” is usually a bad trade</h2>
      <p>
        The documents worth comparing are contracts, quotes, medical reports and certificates — the
        files privacy policies were invented for. Most comparison sites upload both files to a
        server, because that is how their infrastructure works: your documents pass through machines
        you cannot see, under a retention policy you have not read, and “deleted after one hour” is
        a promise, not a mechanism.
      </p>
      <p>
        A local comparison makes no such promise because it makes no copy. Both PDFs are rendered by
        the PDF engine already inside your browser, and the comparison runs in the tab’s memory. You
        can verify rather than trust: open the Network panel before dropping the files and watch —
        no request carries either document. Once the page has loaded it also works offline, the
        strongest proof a web tool can give.
      </p>

      <h2>Comparing two PDFs locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-compare">PDF comparison tool</Link> and drop the original
          into A and the revised version into B.
        </li>
        <li>
          Stay in the side-by-side view and page through once, watching for moved blocks and changed
          numbers.
        </li>
        <li>
          Switch to <em>Highlight differences</em> and page through again — unchanged pages report
          themselves pixel-identical, so you can move quickly; stop where red appears.
        </li>
        <li>
          For every red region, read that part of both pages to see what the edit actually says.
        </li>
      </ol>

      <h2>What a comparison cannot tell you</h2>
      <ul>
        <li>
          <strong>Which word changed.</strong> Pixels show location, not language — read the red
          region in both files.
        </li>
        <li>
          <strong>Whether a move matters.</strong> A paragraph shifted down looks like a deletion
          plus an insertion; only reading settles it.
        </li>
        <li>
          <strong>Anything about differently-sourced files.</strong> Two scans of the same paper at
          different resolutions speckle everywhere. Compare exports from the same source.
        </li>
        <li>
          <strong>Byte-level identity.</strong> A clean visual comparison proves the pages look
          identical, not that the files are — metadata and structure can still differ. To see what a
          file says about itself, open it in the{' '}
          <Link to="/tools/pdf-metadata">PDF metadata inspector</Link>.
        </li>
      </ul>
      <p>
        Once the comparison is done and one version wins, the rest of the paperwork is local too:{' '}
        <Link to="/tools/pdf-merge">merge</Link> the files you keep,{' '}
        <Link to="/tools/pdf-remove-pages">drop the pages</Link> nobody should see, or{' '}
        <Link to="/tools/pdf-compress">shrink the result</Link> for email.
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
