import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is an electronic signature legally binding?',
    a: 'For ordinary agreements, in most jurisdictions, yes. The US ESIGN Act and UETA, the EU’s eIDAS regulation and similar laws in the UK, Canada, Australia and elsewhere all say a contract is not invalid merely because it was signed electronically. The exceptions are specific and written into statute: wills, some property transfers, certain family-law and court documents. For a freelance agreement, an offer letter or an approval form, an electronic signature is the normal way business is done.',
  },
  {
    q: 'Is a drawn signature the same as a digital signature?',
    a: 'No, and the vocabulary matters. A drawn or typed signature is an electronic signature — evidence that you agreed. A digital signature is cryptography: a certificate bound to the file that proves who signed and breaks visibly if anything changes afterwards. Everyday contracts need the first; a bank or government portal that needs the second will issue or demand a specific certificate and say so.',
  },
  {
    q: 'Is it safe to sign a PDF on an upload-based site?',
    a: 'Consider what the site receives: the unsigned document, the signed document, and an image of your signature — which is itself reusable on other documents. Even a service that deletes files promptly has held three sensitive artefacts on infrastructure you cannot audit. Local signing keeps all three on your device, which is why the approach matters more than the brand.',
  },
  {
    q: 'Why does my signature look pasted on?',
    a: 'Usually size or placement. A signature spanning the full width of the line reads as a stamp; about two-thirds of the line width looks written. Sit the baseline of the signature on the printed line rather than floating above it, and use blue ink if the document will be printed — black signatures vanish into black form text.',
  },
  {
    q: 'Should I sign before or after filling the rest of the form?',
    a: 'After, always. A signature attests to the document as it stands; any field changed afterwards technically invalidates what the signature was certifying. Fill every field, verify the dates and amounts, then sign the final copy — and keep that signed copy unmodified.',
  },
]

export function SignPdfGuide() {
  useSeo({
    ...routeMeta('/guides/sign-pdf-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Sign a PDF without uploading it — or your signature"
      lede="The document is a contract, a consent form or a lease — and the signature is a sample of your handwriting. Neither belongs on a stranger's server. Here is what electronic signing actually involves, what makes it valid, and how to do the whole job on your own device."
      updated="26 October 2026"
      toolTo="/tools/pdf-sign"
      toolLabel="Sign a PDF in your browser"
    >
      <h2>The strange ritual of online signing</h2>
      <p>
        The typical web signing service asks for three things in sequence: your document, your
        signature, and your trust. The document uploads first — the employment contract with your
        salary, the medical release with your diagnosis, the lease with your address. Then you
        draw your signature, and that image uploads too, because the server composes the final
        file. What comes back is a signed PDF; what stays behind is a copy of everything,
        including a clean image of the mark you use to agree to things.
      </p>
      <p>
        None of those steps needs a server. A PDF is a structured file that a browser can read;
        drawing an image onto a page is arithmetic; saving the result is a download. The entire
        job fits inside a tab, which is where QuietKit does it — the document is parsed in
        memory, the signature you draw is trimmed and stamped onto the pages you choose, and a
        signed copy is assembled locally. The Network panel confirms it: nothing carries the file
        or the signature anywhere.
      </p>

      <h2>Electronic versus digital: two things called “e-signature”</h2>
      <p>
        The terms get blurred in marketing, so it is worth separating them. An{' '}
        <strong>electronic signature</strong> is any mark that shows agreement — a drawn squiggle,
        a typed name in a script font, even a clicked “I agree” checkbox with a paper trail. Its
        strength is evidence: who made the mark, when, and in what context. A{' '}
        <strong>digital signature</strong> is a cryptographic mechanism: a certificate issued to
        a verified identity, bound to the exact bytes of the document, so any later edit visibly
        breaks the seal. It answers tampering, not just agreement.
      </p>
      <p>
        Everyday life runs on the first kind. Offer letters, NDAs, freelance contracts, school
        permissions, approval forms — all are routinely signed with an image, and laws like the
        US ESIGN Act and the EU's eIDAS regulation make that binding for ordinary agreements.
        The second kind appears where institutions say so explicitly: a tax portal that issues
        you a certificate, a bank with its own signing flow, a notary with a regulated process.
        If a counterparty needs a digital signature, they will name the certificate or platform —
        “just sign it” means an image is fine.
      </p>

      <h2>What the law actually asks for</h2>
      <p>
        Signature law is less about the ink and more about intent and records. For an electronic
        signature to hold, the usual requirements are that you intended to sign, that you
        consented to doing business electronically, and that the signed record is kept and
        reproducible. A PDF you signed deliberately, saved and emailed satisfies all three in
        ordinary commerce. The carve-outs are statutory and narrow: wills and codicils, some
        real-estate transfers, adoption and divorce papers, certain court orders, and documents
        a specific regulation ties to wet ink or a witness. When one of those is in front of you,
        the requesting institution will almost always spell out the process it requires.
      </p>

      <h2>Making the signature look signed</h2>
      <p>
        Two habits separate a signature from a pasted image. The first is proportion: a signature
        should cover roughly two-thirds of its line, not span it edge to edge — start near 140 pt
        wide and judge against the preview. The second is seating: the baseline of the signature
        should rest on the printed line, the way ink would. Draw the mark rather than typing it
        when you can; the small irregularities of a real stroke are exactly what a typed script
        lacks. And if the document will be printed and initialled in a stack of paper, sign in
        blue — on a printout, blue ink is visibly a signature, while black hides among the form's
        own black text.
      </p>

      <h2>Order of operations: sign last</h2>
      <p>
        A signature certifies the document as it is at that moment, so it belongs on the finished
        version. Fill every field first — with the{' '}
        <Link to="/tools/pdf-form-fill">form filler</Link> if the PDF has interactive fields —
        check dates, amounts and names, and only then sign. Editing a signed document means
        signing again, which is precisely the point of the ritual. Two finishing touches are
        worth the seconds: run the signed copy through the{' '}
        <Link to="/tools/pdf-metadata">metadata cleaner</Link> if you do not want the file's
        property block carrying someone else's author name, and through the{' '}
        <Link to="/tools/pdf-compress">compressor</Link> if the signed scan is too heavy for the
        email limit you are up against.
      </p>

      <h2>What local signing will not do</h2>
      <ul>
        <li>
          <strong>Provide a certificate.</strong> This is an image signature — the everyday,
          legally ordinary kind — not a cryptographic digital signature.
        </li>
        <li>
          <strong>Prove identity to a sceptical third party.</strong> If a dispute reaches the
          point of forensic analysis, what matters is the surrounding evidence trail: who the
          file was emailed from, when, and in what thread.
        </li>
        <li>
          <strong>Sign a locked PDF.</strong> A file that demands a password to open cannot be
          read, let alone signed, until you unlock it yourself.
        </li>
        <li>
          <strong>Replace a notary.</strong> Documents whose statute demands witnesses or
          notarisation need exactly that, whatever tool places the ink.
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
