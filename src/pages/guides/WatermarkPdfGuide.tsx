import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does a watermark increase the file size much?',
    a: 'Almost nothing. The mark is stored as text — a font reference and a few numbers per line — so a whole document gains a few kilobytes at most. A logo stamped as a picture would be heavier, because every page would carry its own copy of the image.',
  },
  {
    q: 'Can I watermark only some pages?',
    a: 'Yes. Leave the page field empty to mark the whole document, or give ranges such as 1-4, 7- to skip a cover or a signature page. The preview follows the first page in the range, so you see what will actually be stamped.',
  },
  {
    q: 'Why does the mark look grey instead of black?',
    a: 'It is drawn in a dark grey and then faded with an opacity setting. The combination keeps the mark visible without turning the page into a wall of text: around 10% you see it as a label, around 20% it reads at arm’s length, and above 50% it starts to compete with the body text.',
  },
  {
    q: 'Can the watermark be removed afterwards?',
    a: 'By anyone with a PDF editor, yes — it is a normal text object, not encryption. That is true of essentially every text watermark you will meet online. Treat it as a visible statement of status, not as copy protection; for proof of origin, use a digital signature or a hash of the file.',
  },
  {
    q: 'Does watermarking reduce the quality of the pages?',
    a: 'No. The existing page content is copied through untouched and one text layer is added on top. Nothing is re-rendered or re-compressed, so a scanned page stays a scan and a vector contract stays vector.',
  },
]

export function WatermarkPdfGuide() {
  useSeo({
    ...routeMeta('/guides/watermark-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Watermark a PDF without uploading it"
      lede="Sending a draft, a confidential report or an evaluation copy usually means putting a label on it first. The mark itself is simple; deciding how visible it should be, and where it belongs, is the part worth thinking about."
      updated="26 October 2026"
      toolTo="/tools/pdf-watermark"
      toolLabel="Watermark a PDF in your browser"
    >
      <h2>Start with the job the mark has to do</h2>
      <p>
        “Watermark” covers three different jobs, and they want different settings. A <strong>status
        mark</strong> says this is a draft, a sample, or not for distribution — it should be seen at
        a glance but not fight the page. A <strong>ownership mark</strong> names the person or
        company the copy was issued to, which makes a leaked copy traceable. A <strong>protection
        mark</strong> tries to make the file awkward to reuse, and is the one most likely to
        disappoint: a visible text layer can be deleted by anyone with an editor.
      </p>
      <p>
        Being clear about which of the three you need stops you from over-marking the page. A status
        mark at 10% is plenty. An ownership mark wants your name and a date, not just a generic
        word. And if you genuinely need protection, a watermark is the wrong tool — restrict who
        receives the file, or use a signature.
      </p>

      <h2>The settings that matter, in order</h2>
      <ul>
        <li>
          <strong>Text.</strong> Short beats clever. “DRAFT”, “CONFIDENTIAL”, “SAMPLE — NOT FOR
          DISTRIBUTION”, or “Issued to Acme Ltd · 26 Oct 2026”. A long sentence is hard to read at
          a slant and covers more of the page.
        </li>
        <li>
          <strong>Placement.</strong> One mark in the centre is the clean look. Tiled repeats it on
          a grid, so a screenshot of part of the page still carries the mark — at the cost of a
          busier page.
        </li>
        <li>
          <strong>Opacity.</strong> 10% for a status label, 20% when it has to read from a metre
          away, 35% and above only for copies that will be rephotographed or scanned again. Past
          50% the mark starts to compete with the text underneath.
        </li>
        <li>
          <strong>Size and angle.</strong> 36 pt diagonal is the usual watermark; 48–64 pt only if
          the phrase is short. Horizontal suits a mark that sits in a clear band, such as above a
          title. Vertical is for narrow columns and landscape forms.
        </li>
        <li>
          <strong>Pages.</strong> Marking everything is usually right. Exclude a cover, a signature
          page, or an exhibit that will be filed separately.
        </li>
      </ul>

      <h2>Recipes that work</h2>
      <p>
        For a <strong>review draft</strong>: “DRAFT”, diagonal, 36 pt, 10%, tiled if the file may be
        screenshotted, centred if it will be read on screen. For a <strong>confidential
        document</strong>: “CONFIDENTIAL”, diagonal, 48 pt, 20%, tiled. For an <strong>issued
        copy</strong>: the recipient’s name and the date, diagonal, 36 pt, 15%, tiled — it is legible
        in any crop. For a <strong>sample or preview</strong>: “SAMPLE”, horizontal, 64 pt, 35%,
        centred on every page except the cover.
      </p>

      <h2>What happens to the pages underneath</h2>
      <p>
        The mark is added as one text object per occurrence, on a page that already exists. The words
        and images already on the page are not touched, decoded or re-encoded. That matters more than
        it sounds: tools that flatten a page to an image to “apply” a watermark quietly turn your
        selectable text into a picture and often multiply the file size. This one adds a layer.
      </p>
      <p>
        A practical consequence is that the watermark is itself selectable text. A reader can copy it,
        and a search for “CONFIDENTIAL” finds every marked page. If you would rather the mark were not
        machine-readable, that is a different job — and it means accepting a page image, with all the
        quality and accessibility trade-offs that brings.
      </p>

      <h2>Doing it locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-watermark">PDF watermark tool</Link> and drop the file in.
          It is read in the tab; there is no upload progress bar because there is no upload.
        </li>
        <li>
          Type the text and set placement, angle, size and opacity. The preview is drawn at the same
          scale and position as the download, so what you see is where the mark lands.
        </li>
        <li>
          Optionally restrict the pages, for example <code>2-</code> to leave the cover clean.
        </li>
        <li>
          Add the watermark, then download the new file. The original on your disk is never modified.
        </li>
      </ol>
      <p>
        To check the claim rather than take it on trust, open your browser’s Network panel before
        dropping the file and watch it while the mark is applied: no request carries the document.
        You can also load the page once, disconnect from the network, and stamp a file offline.
      </p>

      <h2>On a phone, and in a hurry</h2>
      <p>
        The same page works on a phone browser. Pick the file from Files or Photos, set the text, and
        download — on iOS the result lands in Files, on Android in Downloads. A phone screen makes
        faint marks hard to judge, so check the download at full size before sending it, or open the
        result on a desktop.
      </p>

      <h2>A last check before sending</h2>
      <ul>
        <li>Open the download and look at the first and last marked page, not just the preview.</li>
        <li>Make sure the mark clears any signature, stamp or barcode you need to keep.</li>
        <li>Keep the unmarked original for your own records — they are two separate files.</li>
        <li>If the document also carries someone’s name in its properties, strip that too with the <Link to="/tools/pdf-metadata">PDF metadata tool</Link>.</li>
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
