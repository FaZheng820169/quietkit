import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Why can I not select or copy text in my PDF reader?',
    a: 'Two common causes. The page may be a scan — a photograph of text with no real text underneath — or the file was exported with copy protection flags set. A text extractor reads the PDF’s own text layer directly, bypassing the reader’s selection quirks, but it cannot invent text that a scan never had.',
  },
  {
    q: 'How do I know if my PDF has real text or is a scan?',
    a: 'Try selecting a word in any viewer. If a highlight appears, the text layer exists. You can also open the file in the extractor: a page with a text layer returns its words; a scan reports that the page contains no text instead of silently handing back nothing.',
  },
  {
    q: 'Will the extracted text keep the layout and tables?',
    a: 'No — extraction gives you the words in reading order, not the design. Columns usually come out interleaved line by line, and tables arrive as plain rows of values. For reformatting or quoting that is exactly what you want; for preserving layout, keep the PDF.',
  },
  {
    q: 'Can I extract text from a scanned document?',
    a: 'Not without OCR — optical character recognition that looks at the pixels and guesses the letters. That is a different, heavier job. An honest extractor tells you the page is a scan rather than returning an empty file and letting you assume the PDF was empty.',
  },
  {
    q: 'Is my PDF uploaded to extract its text?',
    a: 'No. The PDF engine already inside your browser parses the file in the tab’s memory and hands the text back to you. Nothing is transmitted — verifiable in the Network panel, and the page works offline once loaded.',
  },
]

export function ExtractPdfTextGuide() {
  useSeo({
    ...routeMeta('/guides/extract-text-from-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Extract text from a PDF without uploading it"
      lede="The quote you need is locked inside a PDF, the reader will not let you select it, and the obvious web tools all want a copy of the document first. The text layer is yours to read — locally."
      updated="26 October 2026"
      toolTo="/tools/pdf-text"
      toolLabel="Extract PDF text in your browser"
    >
      <h2>Why “just copy it” often fails</h2>
      <p>
        A PDF is not a paragraph; it is a set of drawing instructions. The words on the page exist
        as positioned glyph runs — “draw these letters at these coordinates” — and whether a reader
        lets you select them depends on how it reconstructs reading order from those positions.
        Some readers do it well, some give up on multi-column pages, and some respect an
        extraction-forbidden flag the exporter set.
      </p>
      <p>
        An extractor skips the reader entirely and reads the text layer directly, page by page, in
        content-stream order. That is why it succeeds where click-and-drag produces nothing or a
        jumbled half-column.
      </p>

      <h2>The text layer — and the scan that does not have one</h2>
      <p>
        Every PDF page is one of two things. A <strong>real text page</strong> carries that layer of
        positioned glyphs: extractable, searchable, selectable. A <strong>scan</strong> is a
        photograph of a document flattened into an image — the letters you see are pixels, and no
        amount of copying will find words in them. Many real-world files are mixed: a born-digital
        contract with a scanned signature page at the end.
      </p>
      <p>
        Turning pixels back into words is OCR, a recognition step that guesses letters from shapes.
        It is genuinely useful and genuinely error-prone — but it is a different job from
        extraction, and an honest tool keeps the two separate: pages with a text layer hand over
        their words, and pages without one say so, instead of silently returning an empty file that
        looks like an empty page.
      </p>

      <h2>What you get, and what you give up</h2>
      <p>
        Extraction returns the words in reading order as plain text. What it deliberately drops is
        the design: fonts, sizes, colours, column geometry. Headings arrive as ordinary lines;
        tables arrive as rows of values separated by spaces; a two-column page usually interleaves
        line by line. For quoting a clause, feeding a search box, or diffing two versions of a
        document, plain words are exactly the right shape. For preserving how the page looks, the
        PDF itself is the right format — that is what it is for.
      </p>

      <h2>Why extraction belongs on your machine</h2>
      <p>
        The documents people extract text from are contracts being quoted, invoices being
        reconciled, research papers being cited, bank statements being searched. Upload-based
        extractors copy the whole document to a server to perform an operation your browser already
        contains: the PDF engine that renders the page is the same engine that reads its text
        layer. The round trip buys nothing except exposure.
      </p>
      <p>
        Locally, the file is parsed in the tab’s memory and the text never leaves the machine. As
        always with local tools, you do not have to take anyone’s word for it: open the Network
        panel, drop the file, and watch that no request carries it.
      </p>

      <h2>Extracting text locally, in three steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-text">PDF text extractor</Link> and drop the file in.
        </li>
        <li>
          Page through to check the text reads sensibly — the word count under each page is a quick
          honesty check, and a scan page reports itself instead of going quiet.
        </li>
        <li>
          Copy the page you need, or download the whole document as one plain-text file.
        </li>
      </ol>

      <h2>What extraction cannot do</h2>
      <ul>
        <li>
          <strong>Read a scan.</strong> No text layer means no text — OCR is a separate tool, and
          any service that “extracts” from scans is doing recognition, with its error rate.
        </li>
        <li>
          <strong>Preserve tables.</strong> Values arrive in reading order; the grid is gone.
          Rebuild the table from the rows, or work from the source spreadsheet.
        </li>
        <li>
          <strong>Recover redacted text.</strong> Properly redacted content is removed from the
          file, not hidden under a black box — there is nothing left to extract, which is the point
          of redaction.
        </li>
        <li>
          <strong>Fix a corrupted file.</strong> A damaged PDF that will not parse needs repair
          first; extraction starts from a readable document.
        </li>
      </ul>
      <p>
        Once you have the text, the rest of the workflow is local too: check what else the file says
        about itself with the <Link to="/tools/pdf-metadata">metadata inspector</Link>,{' '}
        <Link to="/tools/pdf-remove-pages">pull the pages you need</Link> into a smaller file, or{' '}
        <Link to="/tools/pdf-compare">compare two versions</Link> of the document itself.
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
