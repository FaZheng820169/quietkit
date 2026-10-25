import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does removing a page really delete its contents?',
    a: 'Yes — when the page is removed by rebuilding the document. The surviving pages are copied into a brand-new PDF and the unwanted ones are never copied, so their text, images and embedded data simply do not exist in the new file. That is fundamentally different from drawing a white box over content, which hides it visually while leaving it fully selectable and recoverable.',
  },
  {
    q: 'What is the difference between deleting and extracting pages?',
    a: 'Deleting removes the pages you name and keeps everything else; extracting does the opposite, keeping only the pages you name. Use delete to drop a few pages from a long document, and extract to pull one signature page or one statement out of a large file. Both produce a new PDF — the original is never modified.',
  },
  {
    q: 'Will my bookmarks and links still work after pages are removed?',
    a: 'Mostly. Bookmarks pointing at surviving pages keep working; bookmarks and internal links that pointed at a removed page lose their target. Links to external websites are unaffected. If the document is heavily cross-referenced, click through the result once before sending it.',
  },
  {
    q: 'Can I remove page 87 from a 200-page PDF?',
    a: 'Yes. Type 87 in the range box — or 87-87 if you prefer explicit ranges. Ranges like 1-3, 7, 10- can be combined with commas, an open range like 10- runs to the end of the document, and anything outside the real page count is rejected with an honest error instead of a broken file.',
  },
  {
    q: 'Is it safe to remove pages from a bank statement online?',
    a: 'Only with a tool that never uploads the file. Most online page removers send the document to a server, which means your statement sits on someone else’s disk under a retention policy you have not read. A local tool rebuilds the PDF inside your browser tab — open the Network panel while you work and you will see the file never leaves.',
  },
]

export function RemovePdfPagesGuide() {
  useSeo({
    ...routeMeta('/guides/remove-pdf-pages-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Remove pages from a PDF without uploading it"
      lede="The blank page three, the appendix with last year’s prices, the one statement page your accountant actually asked for — cutting pages out of a PDF is usually a disclosure decision, and the file involved is usually one you should not upload."
      updated="26 October 2026"
      toolTo="/tools/pdf-remove-pages"
      toolLabel="Remove PDF pages in your browser"
    >
      <h2>Removing pages is a decision about disclosure</h2>
      <p>
        Nobody deletes a page by accident of filing. Pages come out of a PDF because the recipient
        should not see them: the appendix with old pricing, the medical letter’s second page, the
        blank sheet the scanner insists on adding, the ninety pages of a bank statement that are
        not the one page requested. The common thread is that the document matters — and that is
        exactly why the editing should happen on your own machine.
      </p>
      <p>
        There is also the mirror image of the task: not deleting ninety pages, but keeping one.
        Extracting turns “send me page 12 of the contract” into a two-page file instead of a
        twelve-megabyte attachment with instructions.
      </p>

      <h2>Delete or extract: pick the direction first</h2>
      <p>
        Both operations produce a new PDF, and both leave the original untouched. The difference is
        which pages you name.
      </p>
      <p>
        <strong>Delete</strong> names what goes away. The document stays whole minus what you
        listed — the right choice when a few pages need to disappear from a long file. Deleting
        page 3 from a 40-page report keeps 39 pages.
      </p>
      <p>
        <strong>Extract</strong> names what stays. Everything else goes — the right choice when the
        recipient needs a fragment: one signed page, one certificate, one month out of a year of
        statements. Extracting page 12 from the same report produces a one-page file.
      </p>
      <p>
        Naming pages is done with ranges rather than one click per page: <code>5</code> is one
        page, <code>1-3</code> is a closed range, <code>10-</code> runs from page 10 to the end of
        the document however long it is, and commas combine as many ranges as you need —{' '}
        <code>1-3, 7, 10-</code> is a valid answer to a complicated request.
      </p>

      <h2>Gone means gone — and hidden does not</h2>
      <p>
        There are two ways people “remove” content from a PDF, and only one of them removes
        anything. Drawing a white rectangle over a paragraph, or covering a page with a blank
        image, hides the content visually. The text is still in the file: selectable, searchable,
        and one copy-paste away from the reader you were hiding it from. Leaked documents are
        regularly “redacted” this way, and regularly un-redacted by journalists.
      </p>
      <p>
        Rebuilding the document is the honest version. The pages that survive are copied into a
        brand-new PDF; the pages that do not are never copied. Their text, images and embedded data
        are not hidden in the new file — they are absent from it. Check the result the way a
        recipient would: search for a word that only appeared on the removed page, and it should
        find nothing.
      </p>

      <h2>What a rebuild keeps, and what it costs</h2>
      <p>
        Surviving pages are copied rather than re-rendered, so text stays selectable, vector
        graphics stay sharp and image quality is untouched — the file is not passed through a
        printer driver. The document’s metadata and outline come along, with one honest caveat:
        bookmarks and internal links that pointed at a removed page lose their target. Links to
        the web are unaffected. For a heavily cross-referenced document, click through the result
        once before sending it.
      </p>
      <p>
        If the goal is also a smaller file, removing pages helps less than people expect — the
        remaining pages carry the same bytes they always did. Shrinking what is left is the job of
        the <Link to="/tools/pdf-compress">PDF compressor</Link>, and the{' '}
        <Link to="/guides/compress-pdf-without-upload">compression guide</Link> explains which
        files respond and which refuse to.
      </p>

      <h2>Why “online PDF page remover” is a bad place for these files</h2>
      <p>
        Contracts, statements, medical letters, ID scans — the documents that need pages removed
        are the ones privacy policies were invented for, and most online tools upload them to a
        server because that is how their infrastructure works. The file sits on someone else’s
        disk, under a retention policy you have not read, and “deleted after one hour” is a
        promise rather than a mechanism.
      </p>
      <p>
        A local tool makes no promise because it makes no copy. The PDF is parsed by your browser,
        the surviving pages are rebuilt in the tab’s memory, and the new file is saved from there.
        You can verify rather than trust: open the Network panel before dropping the file and
        watch — no request carries the document. Once the page has loaded, the tool also works
        with the network switched off entirely.
      </p>

      <h2>Removing pages locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-remove-pages">page removal tool</Link> and drop the PDF in.
        </li>
        <li>
          Choose delete or extract, depending on whether you are naming what goes or what stays.
        </li>
        <li>
          Type the pages as ranges — <code>3</code>, <code>87-89</code>, <code>10-</code> — and
          check the running count before continuing.
        </li>
        <li>
          Download the new PDF, then search it for a word that only appeared on a removed page.
          Nothing found means nothing left.
        </li>
      </ol>

      <h2>What removing pages cannot do</h2>
      <ul>
        <li>
          <strong>Remove part of a page.</strong> The unit is the whole page; covering one
          paragraph is redaction, and it needs an editor that truly deletes, not a white box.
        </li>
        <li>
          <strong>Shrink what remains.</strong> Surviving pages keep their bytes — run the result
          through the <Link to="/tools/pdf-compress">compressor</Link> if size is the problem.
        </li>
        <li>
          <strong>Fix the order.</strong> If the pages are all right but in the wrong sequence, the{' '}
          <Link to="/tools/pdf-reorder">reorder tool</Link> renumbers them without removing
          anything.
        </li>
        <li>
          <strong>Fix the orientation.</strong> A sideways scan needs the{' '}
          <Link to="/tools/pdf-rotate">rotate tool</Link>, not deletion.
        </li>
        <li>
          <strong>Split one file into many.</strong> Removing pages keeps one document; cutting it
          into separate parts is the <Link to="/tools/pdf-split">split tool</Link>’s job, and the{' '}
          <Link to="/guides/split-pdf-without-upload">split guide</Link> covers the three ways to
          cut.
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
