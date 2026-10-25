import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { AdSlot } from '../../components/AdSlot'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is splitting a PDF lossless?',
    a: 'Yes, when the tool copies pages instead of rendering them. Each page object — text, fonts, images, annotations — is moved into a new document unchanged, so nothing is re-compressed. A split that makes the file noticeably smaller or blurrier has rasterised it.',
  },
  {
    q: 'Can I split at exactly one page?',
    a: 'Yes. Use page ranges and type 1-4, 5- . A 30-page file becomes two files: pages 1 to 4, and pages 5 to 30. If you need a cut at several points, list every resulting range, for example 1-3, 4-9, 10- .',
  },
  {
    q: 'Why do the parts download as a ZIP?',
    a: 'Because a browser that tries to save thirty files one by one will trigger thirty “keep this file?” prompts. A ZIP built in the tab is one download, and it also keeps the part names together. Single-part runs download the PDF directly.',
  },
  {
    q: 'Why is my password-protected PDF refused?',
    a: 'The page data inside an encrypted PDF is ciphertext. A tool can copy the pages, but the result would carry ciphertext without the encryption dictionary that makes it readable — a broken file. Save an unprotected copy in your PDF reader first, then split that copy.',
  },
  {
    q: 'Do bookmarks and links survive a split?',
    a: 'Links inside each part keep working, and a link that points to a page in the same part still resolves. A document-wide outline is not copied into the pieces, and fillable form fields may become non-fillable because the form dictionary lives at document level. The printed content is unaffected.',
  },
]

export function SplitPdfGuide() {
  useSeo({ ...routeMeta('/guides/split-pdf-without-upload'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Split a PDF without uploading it"
      lede="Cutting a scanned contract into pages is the kind of job people hand to the first website that ranks. It is also the simplest operation to do locally — if the tool copies pages instead of re-rendering them."
      updated="25 October 2026"
      toolTo="/tools/pdf-split"
      toolLabel="Split a PDF locally"
    >
      <h2>Why splitting is the safest PDF job</h2>
      <p>
        Splitting looks like editing, but mechanically it is copying. A PDF is a container of
        objects: pages, fonts, images and the instructions that place them. Cutting a document means
        opening the container, taking the pages you asked for, and writing them into a new one. No
        pixel is recalculated, and no file has to travel anywhere.
      </p>
      <p>
        That is why a split should never change quality. If the output is blurrier than the input,
        the tool rendered each page to an image before rebuilding it — a destructive shortcut that
        some online services take because it is easier to implement.
      </p>

      <h2>Three ways to cut, and when each one fits</h2>
      <ul>
        <li>
          <strong>Every page.</strong> One file per page. The right choice for a scanned bundle of
          invoices, receipts or signed forms that has to be filed one item at a time.
        </li>
        <li>
          <strong>Fixed chunks.</strong> Every N pages become a file. Useful when a portal rejects
          uploads over a page count, or when a 200-page manual should travel as ten chapters of
          twenty.
        </li>
        <li>
          <strong>Your own ranges.</strong> Type 1-4, 5-8, 9- and each range becomes a file, in the
          order you typed it. This is also how you cut at a single point: two ranges, two files.
        </li>
      </ul>

      <h2>What changes inside each part</h2>
      <p>
        The page content is untouched, but the document wrapper is new. Three consequences are worth
        knowing before you send a part to someone:
      </p>
      <ul>
        <li>
          <strong>The property block starts clean.</strong> A split part gets a fresh document
          dictionary, so an author name, company or software stamp from the original file does not
          follow the pages. If you need those fields gone everywhere, clean the source first with
          the <Link to="/tools/pdf-metadata">PDF metadata tool</Link>.
        </li>
        <li>
          <strong>Document-level extras stay behind.</strong> A bookmarks outline and a fillable
          form dictionary belong to the whole document, not to a page. The pieces keep the printed
          content; interactive fields may stop being fillable.
        </li>
        <li>
          <strong>Links that cross a cut stop resolving.</strong> A link from page 3 to page 9 still
          works while both pages are in the same part. Once they are in different files, there is
          nowhere for the link to go.
        </li>
      </ul>

      <h2>Naming and keeping track</h2>
      <p>
        A split is only useful if you can find the piece you need a week later. Name parts by the
        pages they contain — <code>invoice-1-4.pdf</code>, <code>invoice-5-8.pdf</code> — rather than
        by order of creation. QuietKit does this automatically from the source name, and puts every
        part in one ZIP so the naming survives the download.
      </p>

      <h2>When a split fails</h2>
      <p>
        There are only a few real failure modes. An <em>encrypted</em> PDF cannot be rebuilt safely,
        so it is refused rather than turned into a broken file. A <em>truncated</em> download — a
        file that was still copying when it was opened — usually fails at the first page. And a very
        large document split into hundreds of pieces can exhaust a browser tab&apos;s memory, which
        is why a single run is capped at 100 parts.
      </p>
      <p>
        If a file fails, open it once in a normal PDF reader. If the reader shows the pages, the
        file is intact and the tool is the problem; if the reader also refuses, the download is
        damaged and should be fetched again.
      </p>

      <h2>Checking that a splitter is local</h2>
      <ul>
        <li>Open the browser&apos;s developer tools, switch to Network, then run the split.</li>
        <li>If a request carries the document, it is being uploaded, whatever the page claims.</li>
        <li>Load the page, then turn off Wi-Fi. A local splitter keeps working; an upload service stops.</li>
        <li>Look for a file-size limit. Local tools have none beyond your memory; upload sites usually cap free files at 5–10 MB.</li>
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

      <div style={{ marginTop: 28 }}>
        <AdSlot />
      </div>
    </Article>
  )
}
