import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { AdSlot } from '../../components/AdSlot'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does converting to JPG make the file bigger?',
    a: 'Usually yes, because a PDF stores text as instructions and a JPEG stores every pixel of the page. A four-page text-only invoice might be 60 KB as a PDF and 1.2 MB as four JPEGs at 200 DPI. Lower the resolution or the quality if size matters; the page will still look right on screen.',
  },
  {
    q: 'Can I get the text back out of the JPG?',
    a: 'Only with OCR, and OCR guesses. The conversion is one-way: a page that was text becomes a picture of text. If you only need the words, extract them from the PDF first — the text tool reads the actual characters, including the ones behind a scanned page when the scanner added a text layer.',
  },
  {
    q: 'Why did my page come out with a black background?',
    a: 'Because the page was transparent and the converter encoded it without laying down a background. JPEG has no alpha channel, so “transparent” has to become some colour, and some tools choose black. QuietKit paints every page white before drawing, which matches what a printer or photo viewer expects.',
  },
  {
    q: 'What DPI should I choose?',
    a: '150 DPI for reading on screen or sending in a chat. 200 DPI for forms, receipts and anything that may be printed at A4. 300 DPI for real printing, at roughly 2480 × 3508 px for an A4 page — and roughly twice the file size of 200 DPI.',
  },
  {
    q: 'Is my document uploaded to convert it?',
    a: 'Not with this tool. The pages are drawn into a canvas in your tab and encoded to JPEG in memory, then handed to your download folder. Open the Network panel while you convert: no request carries the file.',
  },
]

export function PdfToJpgGuide() {
  useSeo({ ...routeMeta('/guides/pdf-to-jpg-without-upload'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="PDF to JPG without uploading the document"
      lede="A form that only accepts images, a slide that needs a page thumbnail, a chat that will not preview a PDF — turning a page into a JPEG is a common errand. It is also one of the few conversions that is genuinely destructive, so it is worth knowing what you trade away."
      updated="25 October 2026"
      toolTo="/tools/pdf-to-jpg"
      toolLabel="Convert PDF pages to JPG"
    >
      <h2>What the conversion actually does</h2>
      <p>
        A PDF page is a list of instructions: draw this glyph in this font here, place this image
        there. A JPEG is a grid of coloured pixels. Converting means asking a renderer to follow the
        instructions and paint the result at a chosen resolution — the same thing your PDF reader
        does when it draws the page on screen, except the output is saved.
      </p>
      <p>
        Everything follows from that. The page looks exactly as it looked, fonts included, without
        needing the font installed. But the words are no longer words: they cannot be selected,
        searched, copied or read out loud. A 300-word page becomes a picture of 300 words.
      </p>

      <h2>Resolution is the only setting that really matters</h2>
      <p>
        DPI here means “pixels per inch of paper”. An A4 page is 8.27 × 11.69 inches, so the pixel
        count is the paper size multiplied by the DPI:
      </p>
      <ul>
        <li>
          <strong>150 DPI</strong> → about 1240 × 1754 px. Fine for reading on a phone or in an
          email. Small files.
        </li>
        <li>
          <strong>200 DPI</strong> → about 1654 × 2339 px. The sensible default for forms, receipts
          and screenshots of documents that may be printed at A4.
        </li>
        <li>
          <strong>300 DPI</strong> → about 2480 × 3508 px. Print quality. Roughly twice the pixels
          of 200 DPI in each direction, so expect much larger files.
        </li>
      </ul>
      <p>
        Resolution is not the same as quality. Quality decides how aggressively the encoder throws
        away detail it thinks you will not miss; resolution decides how much detail there was to
        begin with. Raising quality on a 150 DPI page makes a bigger file, not a sharper one.
      </p>

      <h2>Why the background has to become white</h2>
      <p>
        JPEG has no transparency. A PDF page, on the other hand, is transparent by default — the
        “paper” you see in a viewer is the viewer's background. When such a page is encoded, the
        transparent areas have to become a colour, and tools that skip this step produce pages with
        black where the margin should be. Painting white first is what makes the result look like
        paper.
      </p>
      <p>
        This also means a conversion flattens layers, annotations drawn as overlays and form-field
        appearances into one image. If a signature field was empty on screen, it is empty in the
        JPEG — there is nothing left to fill in.
      </p>

      <h2>Rotated pages come out rotated</h2>
      <p>
        A scanner often stores a sideways page as an upright page plus a rotation flag. A good
        converter honours the flag, so a landscape page becomes a landscape image with the width
        and height swapped. If a tool ignores it, the page arrives sideways and you have to rotate
        the picture afterwards — a sign that it was reading the raw page box rather than the page as
        displayed.
      </p>

      <h2>One page or the whole document</h2>
      <p>
        A single page is a single download, which is what you want for a form upload. Several pages
        are more awkward: browsers ask for confirmation once per file, so twenty pages mean twenty
        prompts. A ZIP built inside the tab is one download and keeps the page names in order,
        named after the PDF — <code>invoice-3.jpg</code> for page 3 of <code>invoice.pdf</code>.
      </p>
      <p>
        Very long documents are worth splitting into runs. QuietKit converts up to 100 pages at a
        time and says so before you start, rather than failing halfway through with a tab that has
        run out of memory.
      </p>

      <h2>How to tell whether a converter is local</h2>
      <p>
        Open the browser's developer tools, switch to the Network tab, and convert a document.
        A local tool makes no request that carries the file — at most it fetches its own script.
        Then try the stronger test: load the page once, disconnect from the network, and convert
        again. If it still works, the file never had anywhere to go.
      </p>
      <p>
        That test matters here more than for most conversions. The documents people turn into
        images are disproportionately the ones they would rather not hand to a stranger: IDs,
        invoices, medical letters, signed contracts.
      </p>

      <p>
        Ready to try it? <Link to="/tools/pdf-to-jpg">Convert a PDF to JPG</Link> in your browser,
        or read about <Link to="/tools/pdf-resize">resizing the pages</Link> first if the sheet size
        is wrong.
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

      <div style={{ marginTop: 28 }}>
        <AdSlot />
      </div>
    </Article>
  )
}
