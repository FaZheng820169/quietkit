import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is filling a PDF form in the browser actually private?',
    a: 'It is when the whole job runs locally. QuietKit parses the PDF with pdf-lib inside the tab, writes your answers into the document in memory and saves a fresh copy to your disk — no request ever carries the file. The Network tab in dev tools settles it: fill a form while it is open and nothing leaves.',
  },
  {
    q: 'Why do some PDFs type and others do not?',
    a: 'Because there are two kinds of “PDF form”. An AcroForm carries real interactive fields with names and values; a flat form is a printed page whose boxes are just lines. Both look the same on screen, but only the first has anywhere to store an answer. QuietKit tells you which kind you are holding instead of pretending.',
  },
  {
    q: 'Should I flatten the form before sending it?',
    a: 'Yes, almost always. Flattening bakes your answers into the page as ordinary text: the file opens identically everywhere, shrinks a little, and nobody can re-type your answers by accident. Keep an unflattened copy for yourself if you will reuse the form — a monthly expense claim, for example.',
  },
  {
    q: 'Can it sign the form too?',
    a: 'No, and deliberately so. A digital signature field expects a certificate that proves your identity; drawing a picture of a signature is annotation, not signing. Signature placeholders and buttons are listed but left untouched.',
  },
  {
    q: 'What if the form is password-protected?',
    a: 'A form that merely restricts editing can usually be filled and saved. A form that demands a password to open cannot be read at all without it — there is nothing to fill until you unlock it yourself.',
  },
]

export function FillPdfFormGuide() {
  useSeo({
    ...routeMeta('/guides/fill-pdf-form-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Fill in a PDF form without uploading it"
      lede="Rental applications, tax forms, school permissions — the forms worth filling are exactly the ones carrying your identity number and salary. Here is how to type into them on your own device, and how to send the result safely."
      updated="26 October 2026"
      toolTo="/tools/pdf-form-fill"
      toolLabel="Fill a PDF form in your browser"
    >
      <h2>The forms that matter are the sensitive ones</h2>
      <p>
        Nobody needs help filling a feedback survey. The PDF forms that arrive in real life are a
        landlord's application with your salary and previous addresses, a government declaration
        with your identity number, an insurance claim with a diagnosis. The standard advice —
        “upload it to a free online filler” — asks you to hand the completed document, or worse
        the blank one you then type into, to a server you know nothing about. The filled copy, the
        blank copy and every keystroke in between are all copies you cannot take back.
      </p>
      <p>
        Filling a form is an editing job, and editing jobs do not need a server. A PDF's
        interactive fields are a small dictionary inside the file: names, types, current values.
        Reading that dictionary, writing new values and saving the document is arithmetic on
        bytes — work a browser tab does comfortably, which is exactly where QuietKit does it.
      </p>

      <h2>Two kinds of PDF form</h2>
      <p>
        Before anything else, it helps to know what you are holding. An <strong>AcroForm</strong>{' '}
        is a PDF with genuine interactive fields: text boxes, checkboxes, radio groups, dropdowns,
        each stored as a named object in the file. Type into one and the value is saved inside
        the document; reopen it next year and the answer is still there. The other kind is a{' '}
        <strong>flat form</strong> — a scan or an export where the boxes are printed lines and
        nothing more. Both look identical in a viewer, which is why people discover the
        difference only when the cursor refuses to appear.
      </p>
      <p>
        No software can type into a flat form, because there is nowhere for the text to go; the
        honest options are print-and-pen, or an editor that stamps new text onto the page.
        QuietKit reads the field dictionary first and tells you which kind you have — and when
        the answer is “flat”, it says so rather than returning an identical file with a confident
        message.
      </p>

      <h2>Editable versus flattened</h2>
      <p>
        A filled AcroForm can be saved two ways, and the choice matters. Kept{' '}
        <strong>editable</strong>, the fields still work: useful for a template you reuse, risky
        for a document you send, because the recipient's viewer lets them change your answers —
        by curiosity or by accident, and you will never know. <strong>Flattened</strong>, every
        field is baked into the page and the answers become ordinary text: nothing to re-type,
        nothing to mis-render, and a slightly smaller file. The working rule is simple: flatten
        the copy that leaves, keep the editable one for yourself.
      </p>
      <p>
        One small caveat: viewers show field values using appearance instructions stored in the
        file, and a form built around an exotic font may render its answers in a plain fallback
        typeface after filling. The text is correct; open the download once in a second viewer
        before sending, the same five-second check you would give any important attachment.
      </p>

      <h2>What a local filler will not do</h2>
      <ul>
        <li>
          <strong>Sign the form.</strong> Signature fields expect a certificate, not typed text.
          They are listed for completeness and left alone.
        </li>
        <li>
          <strong>Type into a flat page.</strong> No fields means nothing to fill — the tool says
          so plainly.
        </li>
        <li>
          <strong>Open a locked file.</strong> A password-to-open PDF cannot be read without the
          password, full stop.
        </li>
        <li>
          <strong>Check your answers.</strong> Required flags are respected, but whether a date is
          real or a box number is correct is between you and the form's author.
        </li>
      </ul>

      <h2>Before the form goes out</h2>
      <p>
        Two finishing habits are worth the seconds they cost. First, metadata: a form that has
        passed through several editors can carry their names in its property block, so run the
        flattened copy through the <Link to="/tools/pdf-metadata">metadata cleaner</Link> if the
        author field is not yours to share. Second, size: a form that came as a heavy scan may
        need the <Link to="/tools/pdf-compress">PDF compressor</Link> before an email server will
        accept it. And if the application asks for attachments — ID, proof of address — the{' '}
        <Link to="/tools/pdf-merge">merger</Link> puts everything in one document, in the order
        you choose. Related reading:{' '}
        <Link to="/guides/remove-pdf-metadata">what a PDF's property block reveals</Link>,{' '}
        <Link to="/guides/compress-pdf-without-upload">compressing a PDF honestly</Link>, and{' '}
        <Link to="/guides/merge-pdf-without-upload">merging PDFs without uploading them</Link>.
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
