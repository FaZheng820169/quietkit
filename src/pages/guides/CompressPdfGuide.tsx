import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Why do the big “compress PDF” sites upload my file?',
    a: 'Because real PDF compression — recompressing the images inside the file while keeping the text selectable — needs a full PDF toolkit, and that is far easier to run on a server than in a browser. The upload is a technical choice, but it means your contract, invoice or medical record passes through someone else’s infrastructure. A local tool redraws the pages instead, which is why it can promise the file never leaves your device.',
  },
  {
    q: 'How much smaller will my PDF get?',
    a: 'It depends entirely on what is inside. A scan at 300 DPI typically drops by a factor of three to six when rebuilt at 150 DPI — a 9 MB two-page scan became 583 KB in our own testing, and 179 KB at the most aggressive setting. A text-heavy PDF that is already efficient may not shrink at all; a good tool shows you the real before-and-after size instead of promising a number in advance.',
  },
  {
    q: 'Will the compressed PDF still be readable?',
    a: 'At 150 DPI, yes — on screen and in ordinary print. At 110 DPI small print starts to soften, so that setting is for long scans you only need to read on a laptop. At 200 DPI signatures, fine print and barcodes survive. Whatever you choose, open the download and check the smallest text you actually need before deleting the original.',
  },
  {
    q: 'Can I compress a PDF without losing the text?',
    a: 'Not with a purely local, browser-based tool — keeping selectable text means recompressing the images in place, which browsers cannot do without a server component. If the text layer matters more than privacy, flattening is the wrong choice. If privacy matters more, accept the trade: the pages look identical, but the words become pixels.',
  },
  {
    q: 'Is a compressed copy good enough for email limits?',
    a: 'Usually. The 20–25 MB attachment limit is exactly the case rebuilt page images handle well: a folder of 300 DPI scans of a signed contract, rebuilt at 150 DPI, almost always lands well under the limit. Check the result screen — it shows the exact size of the copy before you download it.',
  },
]

export function CompressPdfGuide() {
  useSeo({
    ...routeMeta('/guides/compress-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Compress a PDF without uploading it"
      lede="“Compress PDF” is one of the most searched file tasks on the web — and nearly every top result starts by uploading your document to a server you know nothing about. Here is what compression actually does, which files it helps, and how to do the whole thing locally."
      updated="26 October 2026"
      toolTo="/tools/pdf-compress"
      toolLabel="Compress a PDF in your browser"
    >
      <h2>Why the upload is the first thing to question</h2>
      <p>
        The document you want to shrink is usually the document you should not share: a signed
        contract too big for email, a scan of an ID, a medical report, a year of bank statements.
        The popular compressors are free because the file passes through their servers, where it is
        processed, sometimes retained, and always exposed to a privacy policy you have not read.
      </p>
      <p>
        The test for any tool is simple. Open your browser’s Network panel, drop the file in, and
        watch. If a request carries the document anywhere, the tool is not local, whatever the
        landing page says. A genuinely local compressor will show no upload at all — because the
        work happens in the tab.
      </p>

      <h2>What “compressing” a PDF actually means</h2>
      <p>
        A PDF is a container. Inside it, photographs are stored as images, text as glyphs with font
        references, and drawings as vectors — each compressed in its own way already. There are two
        ways to make the container smaller:
      </p>
      <ul>
        <li>
          <strong>Recompress the parts.</strong> Downsample the photographs, drop unused fonts,
          discard duplicate objects. Text stays selectable. This is what server-side tools do,
          because it needs a full PDF library.
        </li>
        <li>
          <strong>Rebuild the pages.</strong> Draw every page at a lower resolution and put those
          images into a new PDF. Text becomes pixels. This is what a local tool can do, and it is
          exactly right for the most common case: a scan that is already just pictures of paper.
        </li>
      </ul>
      <p>
        Knowing which one a tool does tells you what to expect. If a scan is the input, rebuilding
        loses nothing you were using. If a contract made of real text is the input, rebuilding
        trades the text layer away — and an honest tool says so before you press the button.
      </p>

      <h2>The three knobs that decide the result</h2>
      <p>
        <strong>Resolution (DPI)</strong> is the big one. A page scanned at 300 DPI on A4 holds
        about 2480 × 3508 pixels; at 150 DPI the same page is 1240 × 1754 — a quarter of the
        pixels. Most of the size saving comes from this single choice. <strong>JPEG quality</strong>{' '}
        decides how hard the codec works on what is left: 60 is visibly soft on gradients, 72 is
        the usual balance, 82 keeps fine detail at a cost. <strong>Page count</strong> is the quiet
        one — halving the pages halves the file, so splitting out the pages you actually need
        before compressing is free savings.
      </p>
      <p>
        Real numbers, from a two-page 300 DPI scan of an invoice: the original was 9.3 MB. Rebuilt
        at 150 DPI and quality 72 it came out at 583 KB — 94% smaller, and indistinguishable at
        normal reading size. At 110 DPI and quality 60, the same document was 179 KB.
      </p>

      <h2>Which files shrink, and which refuse to</h2>
      <p>
        Scans shrink. Anything that started life as a photograph of paper — contracts, receipts,
        certificates, forms — is stored in the PDF as large images, and images respond well to
        lower resolutions. Noisy, yellowed, speckled scans shrink the most in absolute terms,
        because noise is what JPEG finds expensive.
      </p>
      <p>
        Text documents refuse. A PDF exported from Word or a billing system is already efficient:
        vector text and a small embedded font. Rebuilding it as page images adds pixels where there
        were vectors, and the copy can come out <em>larger</em> than the original. That is not a
        bug — it is the honest answer to the wrong question. If your 200 KB invoice does not need
        to change, keep it.
      </p>

      <h2>What the rebuilt copy keeps, and what it drops</h2>
      <p>
        Kept: page count, page order, page dimensions, and the way every page looks. Dropped:
        selectable text, links, form fields, bookmarks, attachments and accessibility tags — all of
        which live in the PDF’s structure rather than in the page picture. Hidden metadata such as
        the author’s name is not carried over either, which for a document about to be emailed is
        usually a feature, not a loss.
      </p>
      <p>
        If you need the text back afterwards, the pages are still legible to any OCR tool. But plan
        on the copy being a reading document, not an editing one.
      </p>

      <h2>Doing it locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-compress">PDF compressor</Link> and drop the file in. It is
          read in the tab — there is no progress bar because there is no upload.
        </li>
        <li>
          Read the notice. The tool checks whether your PDF is made of scans or of selectable text,
          and tells you what flattening will cost before anything happens.
        </li>
        <li>
          Pick a preset — Balanced for almost everything, Smallest for a long scan you will only
          read on screen, Sharper when signatures and fine print matter.
        </li>
        <li>
          Compress, then look at the before-and-after sizes. If the copy is bigger — which happens
          with already-efficient text files — keep the original and walk away. The download is a
          separate file; the original is never modified.
        </li>
      </ol>

      <h2>When the email limit is the whole problem</h2>
      <p>
        A 25 MB attachment limit against a 40 MB scan feels like a compression problem, but two
        cheaper moves often solve it first. Split the document and send the pages that matter —
        most recipients need the signature page, not the forty pages around it. And check whether
        the scan is needlessly high resolution: a phone “scan” at 600 DPI of a typed letter is pure
        waste at any quality setting. Compress after those two, and Balanced will usually get you
        home.
      </p>

      <h2>On a phone</h2>
      <p>
        The same page works in a phone browser, and a phone is where scans are usually made. Pick
        the file, choose Balanced, and the result lands in Files on iOS or Downloads on Android.
        Judge fine print on the download rather than the thumbnail — a phone screen hides softness
        that a laptop screen will show.
      </p>

      <h2>Before you send the smaller file</h2>
      <ul>
        <li>Open the download and read the smallest text you need — a date, an amount, a signature line.</li>
        <li>Check that no link or form field you relied on has gone; they do not survive the rebuild.</li>
        <li>Keep the original. The compressed copy is a separate file, never an edit in place.</li>
        <li>
          If the document still carries a name in its properties, strip it with the{' '}
          <Link to="/tools/pdf-metadata">PDF metadata tool</Link> — or let the rebuild do it for
          you, since hidden metadata is not carried into the copy.
        </li>
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
