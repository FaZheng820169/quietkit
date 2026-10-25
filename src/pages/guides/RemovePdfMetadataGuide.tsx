import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What metadata does a PDF actually carry?',
    a: 'More than most people expect: the author’s name, the company from the Office install that made it, the software and version, creation and modification dates, sometimes the original file path, and on a scanned document the scanner model. Word exports often add the template name and the last person who saved the file. None of it is visible on the page — all of it travels with the file.',
  },
  {
    q: 'Is removing metadata the same as redacting?',
    a: 'No. Redaction removes visible content — blacking out a line on the page. Metadata is the invisible property block around the content. Stripping metadata does nothing to the words on the page, and redacting the page does nothing to the author’s name in the properties. A sensitive document often needs both.',
  },
  {
    q: 'Does stripping metadata change how the PDF looks or prints?',
    a: 'Not at all. The property block is never rendered. Removing the title, author and dates leaves every page, font, image and link exactly as it was — the file is identical to read and to print, just quieter about who made it.',
  },
  {
    q: 'Why does the creation date matter?',
    a: 'Because it tells a story you may not want told. A contract “signed today” whose metadata says it was created three weeks ago raises questions. A CV modified minutes before the deadline is visible to anyone who checks. Dates are not accusations, but they are data you did not choose to share.',
  },
  {
    q: 'Can I check what a PDF reveals before I send it?',
    a: 'Yes — that is half the point of a metadata tool. Open the file and read the property table first; decide what should not travel; then strip and download a clean copy. Doing it locally means the inspection itself never leaves your machine either.',
  },
]

export function RemovePdfMetadataGuide() {
  useSeo({
    ...routeMeta('/guides/remove-pdf-metadata'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Remove metadata from a PDF before you send it"
      lede="Every PDF carries a property block most senders never look at: author, company, software, dates. It goes to everyone the file goes to. Here is what is in it, when it matters, and how to strip it locally."
      updated="26 October 2026"
      toolTo="/tools/pdf-metadata"
      toolLabel="Inspect and clean PDF metadata"
    >
      <h2>The property block nobody reads, until someone does</h2>
      <p>
        Open any PDF and press File → Properties in Acrobat, Preview or Edge. A small table appears:
        Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modified Date. Most
        people have never looked at it. Every recipient of every PDF you send can.
      </p>
      <p>
        The block is filled in automatically by whatever made the file. Word writes your Office user
        name and your company. A scanner writes its model. A template keeps the original author long
        after you bought it. None of this appears on the page, which is exactly why it leaks: there
        is nothing to proofread.
      </p>

      <h2>When it genuinely matters</h2>
      <ul>
        <li>
          <strong>Sending a CV.</strong> The author field may carry a former employer’s name or a
          nickname from an old Office install. Recruiters do check properties more often than you
          would think.
        </li>
        <li>
          <strong>Selling a template or a report.</strong> The buyer can see the tool and version
          you made it with — and sometimes the original file path on your machine.
        </li>
        <li>
          <strong>Legal and client work.</strong> Dates tell a story: when the document was really
          drafted, how many times it was touched, whose name was on the file before yours.
        </li>
        <li>
          <strong>Anything scanned at home.</strong> Scanner model and software version are mild,
          but they are still information you did not choose to share.
        </li>
      </ul>

      <h2>What stripping does and does not do</h2>
      <p>
        Stripping metadata rewrites the property block: title, author, subject, keywords, creator,
        producer and dates are cleared or replaced with neutral values. The pages are not touched —
        every word, image, font and link is byte-for-byte the same content, and the file prints
        identically.
      </p>
      <p>
        It is not redaction. If a name is visible on the page, no metadata tool will remove it; that
        is a different job, done by blacking out content or rebuilding the page. And it is not
        encryption: the clean copy opens exactly like the original, anywhere. Think of it as taking
        the luggage tag off, not locking the suitcase.
      </p>

      <h2>The fields worth knowing about</h2>
      <p>
        <strong>Author</strong> is the leak that matters most often — it is your name as your
        computer knows it. <strong>Creator</strong> and <strong>Producer</strong> name the software
        chain, which can reveal a cracked or outdated install. <strong>CreationDate</strong> and{' '}
        <strong>ModDate</strong> are the quiet storytellers. <strong>Title</strong> occasionally
        keeps the working title you renamed before sending. <strong>XMP metadata</strong> — a second,
        XML-based block inside many PDFs — can repeat all of it, which is why a proper strip clears
        both blocks, not just the visible table.
      </p>

      <h2>Doing it locally, in three steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-metadata">PDF metadata tool</Link> and drop the file in. The
          property table is read in the tab — nothing is uploaded, so even the inspection stays
          private.
        </li>
        <li>
          Read what the file currently says about you. Decide which fields should not travel.
        </li>
        <li>
          Strip and download the clean copy. The original on your disk is never modified, so you
          keep the full record and send the quiet one.
        </li>
      </ol>
      <p>
        If the document is also a heavy scan, note the order of operations: run it through the{' '}
        <Link to="/tools/pdf-compress">compressor</Link> and the rebuilt copy drops the old property
        block on its own — two jobs in one pass.
      </p>

      <h2>Verify it before you trust it</h2>
      <p>
        Whatever tool you use, check the result the way a recipient would: open the clean copy,
        look at Properties, and confirm the table is empty or neutral. If the tool runs in a
        browser, also open the Network panel and confirm the file never left — a metadata stripper
        that uploads your document to “process” it has missed the point of the exercise.
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
