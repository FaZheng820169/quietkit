import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is a batch tool less safe than doing files one at a time?',
    a: 'Not when the work happens locally. The risk in batch tools comes from upload queues: a whole folder sent to a server is a bigger prize than one file, and you have no way to see it being deleted afterwards. A browser-local batch reads the folder with your own machine’s File API and never opens a connection — fifty files carry exactly the same risk as one: none.',
  },
  {
    q: 'Why does the photo lane re-encode instead of just deleting metadata?',
    a: 'Because re-encoding is the stronger guarantee. Deleting EXIF blocks keeps the original compressed image and surgically removes the metadata — good when pixels must stay identical. Re-encoding rebuilds the file from raw pixels, so the metadata, the embedded thumbnail and the edit history simply do not exist in the output. For a folder heading to a listing or a client, the second behaviour is usually what you actually want.',
  },
  {
    q: 'In what order should PDF steps run?',
    a: 'Merge first, stamp numbers second, resize last. Numbering before merging would restart the count in every file; resizing before numbering would risk the stamp landing in a cropped area. The batch chain is fixed in that order for exactly that reason.',
  },
  {
    q: 'What happens to files the batch does not understand?',
    a: 'They are listed by name as skipped and left out of the ZIP. Nothing is silently dropped, and nothing unexpected is included. A PDF that asks for a password is treated the same way: flagged, excluded, and the rest of the folder finishes without it.',
  },
  {
    q: 'How big a folder is too big?',
    a: 'There is no fixed limit, because there is no server quota — the ceiling is your device’s memory. A few hundred photos or a few dozen PDFs are routine on a modern laptop. If a run feels slow, split the folder in two; the work is local, so a second pass costs nothing.',
  },
]

export function BatchFolderGuide() {
  useSeo({
    ...routeMeta('/guides/batch-process-folder-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Workflow"
      title="Process a whole folder of files without uploading anything"
      lede="Cleaning a holiday's worth of photos, or assembling a client's worth of PDFs, is the same five steps repeated fifty times. Here is how to run them once — on your own machine, with nothing leaving it."
      updated="26 October 2026"
      toolTo="/tools/batch"
      toolLabel="Batch a folder in your browser"
    >
      <h2>File chores arrive in folders, not files</h2>
      <p>
        Nobody takes one photo. A flat listing is thirty photos; a visa application is nine PDFs;
        a product handover is a folder of images, receipts and a contract. The work is never
        “compress this image” — it is “clean all of these, make them small, and put the paperwork
        in order”. Done file by file, that is an afternoon of repetitive clicking with a real
        chance of missing one — and the one you miss is the photo with your home coordinates in
        it.
      </p>
      <p>
        The obvious answer is a batch tool, and the obvious problem is what most batch tools do:
        ask you to upload the entire folder. A folder is the worst thing to upload — it is the
        complete set, the originals, often the only copies. The right shape for the job is a
        batch that runs where the files already are.
      </p>

      <h2>One drop, two lanes</h2>
      <p>
        A sensible folder batch is not one tool run fifty times; it is a small pipeline that
        knows what it is holding. Drop a mixed folder and the photos go down one lane while the
        PDFs go down another, because the two kinds of file need opposite treatment.
      </p>
      <p>
        <strong>The photo lane</strong> decodes each image, applies its rotation into the pixels,
        caps the dimensions at the size you chose, and re-encodes — as JPEG, WebP or PNG. That
        single re-encode does three jobs at once: it converts the format, it compresses to the
        quality you set, and it strips every metadata block, because the EXIF, the GPS
        coordinates, the XMP history and the embedded thumbnail are not pixels and do not survive
        the trip. What comes out is a clean, small, correctly-rotated copy.
      </p>
      <p>
        <strong>The PDF lane</strong> treats the files as one document in waiting. They are sorted
        by name — which is why <code>01-cv.pdf</code> beats <code>cv.pdf</code> — merged without
        re-rendering a page, then stamped with page numbers, then rebuilt onto a uniform sheet if
        you asked for one. The order is deliberate, and the next section explains why.
      </p>
      <p>
        Everything arrives back as a single ZIP: the cleaned photos under their original names,
        the finished PDF as <code>combined.pdf</code>. Anything that is neither a photo nor a PDF
        is listed as skipped — named, not silently dropped.
      </p>

      <h2>Why the PDF steps run in that order</h2>
      <p>
        The chain is merge → number → resize, and the order is load-bearing. Stamp numbers before
        merging and every file restarts at page 1 — nine PDFs, nine “page 1”s. Resize after
        numbering and the stamp is scaled with the page, which is fine; resize <em>before</em>{' '}
        numbering and a page that gets cropped or margined can carry the number into the wrong
        place. Merge last and you have numbered and resized files you then cannot easily combine,
        because the merged result would need the steps run all over again. Fixed order, no
        decisions, no surprises.
      </p>

      <h2>What “cleaned by re-encoding” really means</h2>
      <p>
        It is worth being precise, because the alternative — deleting the metadata blocks while
        keeping the original compressed image, which the{' '}
        <Link to="/tools/metadata-cleaner">metadata cleaner</Link> does — is the right choice when
        pixels must stay bit-identical. Re-encoding is the right choice when the file is leaving
        your control anyway. It guarantees that nothing invisible rides along, because the output
        file is built from scratch. The trade is that it is lossy by definition: at quality 82 a
        photo is visibly unchanged, but it is not the same bytes. Keep the originals; send the
        copies.
      </p>

      <h2>What a batch cannot do</h2>
      <ul>
        <li>
          <strong>Open a locked PDF.</strong> A file that asks for a password is flagged and
          skipped, not cracked. Unlock it yourself first, or leave it out.
        </li>
        <li>
          <strong>Recover a damaged file.</strong> A photo that will not decode or a PDF that will
          not parse is reported and skipped; the rest of the folder finishes.
        </li>
        <li>
          <strong>Guarantee a size target.</strong> A quality setting aims, it does not promise. If
          a form demands “under 100 KB”, compress individually with the{' '}
          <Link to="/tools/image-compressor">image compressor</Link>, which searches for the
          quality that fits.
        </li>
        <li>
          <strong>Keep folders inside the ZIP.</strong> Output is flat, with duplicates renamed.
          If you need the directory tree preserved, run subfolders separately.
        </li>
      </ul>

      <h2>When to batch and when not to</h2>
      <p>
        Batch when the same decision applies to everything: all photos cleaned and capped at
        1920 px, all PDFs merged and numbered. Reach for a single-file tool when the decision is
        per-file — this page rotated, that paragraph watermarked, one image to an exact pixel
        size. The two approaches are the same engine; the batch just removes the repetition. And
        whichever you use, the rule holds: if you can watch the Network tab while it runs and see
        nothing leave, the folder never had to travel at all. Related reading:{' '}
        <Link to="/guides/remove-exif-metadata-without-upload">what photo metadata reveals</Link>,{' '}
        <Link to="/guides/merge-pdf-without-upload">merging PDFs locally</Link>, and{' '}
        <Link to="/guides/resize-pdf-pages-without-upload">one sheet size for every page</Link>.
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
