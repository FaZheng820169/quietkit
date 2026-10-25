import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is WebP better than JPEG?',
    a: 'For most photographs, yes: at the same visual quality a WebP file is typically 25–35% smaller, and it can also store transparency. JPEG wins in one place only — universal acceptance. Every browser supports WebP now, but plenty of desktop software, email clients and old upload forms still do not.',
  },
  {
    q: 'Can WebP have a transparent background?',
    a: 'Yes. WebP has an alpha channel, so it can replace PNG for logos and UI assets while being smaller. That is why most sites now serve a WebP version of every PNG they used to ship.',
  },
  {
    q: 'Why does my WebP file not open in Photoshop or Word?',
    a: 'Support arrived late in desktop software. Photoshop opens WebP from version 23 (2022); older copies and some Office versions cannot. If a document or a colleague needs the image, convert it to JPEG or PNG first — a five-second conversion beats an email thread about file formats.',
  },
  {
    q: 'Does converting WebP to JPEG lose quality?',
    a: 'Yes, twice: the WebP already discarded detail when it was encoded, and the JPEG discards a little more. At 90% quality the second loss is hard to see on a photo. Convert from the original source file whenever it still exists.',
  },
]

export function WhatIsWebp() {
  useSeo({ ...routeMeta('/guides/what-is-webp'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Formats"
      title="What is a WebP file, and when should you use one?"
      lede="WebP is the format most websites serve without you noticing. Here is what it actually is, where it beats JPEG and PNG, and the situations where it still causes trouble."
      updated="October 2026"
      toolTo="/tools/image-converter"
      toolLabel="Convert a WebP file"
    >
      <h2>One format, two encoders</h2>
      <p>
        WebP is a container from Google, published in 2010, that can hold either a lossy image
        (like JPEG) or a lossless one (like PNG) — plus transparency and animation. That
        flexibility is why it replaced both formats on many websites: one file type covers the
        photo and the logo next to it.
      </p>
      <p>
        The practical result: a 1200×800 photo that is 240 KB as JPEG at 85% is usually 150–180 KB
        as WebP at the same visual quality. A flat-colour graphic that is 40 KB as PNG is often 12
        KB as lossless WebP.
      </p>

      <h2>Where WebP is safe</h2>
      <ul>
        <li>
          <strong>Your own website.</strong> Every current browser — Chrome, Safari, Firefox, Edge —
          decodes WebP. If you still support very old browsers, serve JPEG as a fallback with the
          <code> &lt;picture&gt; </code> element.
        </li>
        <li>
          <strong>App and design assets.</strong> Transparency works, so icons and UI graphics can
          ship as WebP instead of PNG.
        </li>
        <li>
          <strong>E-commerce and CMS platforms.</strong> Shopify, WordPress and most page builders
          accept WebP uploads and often convert automatically.
        </li>
      </ul>

      <h2>Where WebP still breaks</h2>
      <ul>
        <li>
          <strong>Email attachments.</strong> Many clients preview WebP poorly or not at all.
          Attach JPEG or PNG.
        </li>
        <li>
          <strong>Print and documents.</strong> Word, older Photoshop, some PDF workflows and many
          print shops expect JPEG, PNG or TIFF.
        </li>
        <li>
          <strong>Government and job-portal forms.</strong> Their validators often list only JPG and
          PNG, and reject anything else regardless of what the browser can display.
        </li>
      </ul>
      <p>
        The rule is simple: WebP for the web, JPEG for photographs that must travel, PNG when
        transparency and lossless detail both matter and the destination is restrictive.
      </p>

      <h2>How to open a WebP file you received</h2>
      <ul>
        <li>
          <strong>Browser:</strong> drag the file into any tab. If it displays, you can right-click
          and copy the image, or convert it to a friendlier format.
        </li>
        <li>
          <strong>macOS:</strong> Preview opens WebP on Big Sur (macOS 11) and later; older versions
          cannot.
        </li>
        <li>
          <strong>Windows:</strong> the Photos app handles WebP on Windows 10 and 11 once the WebP
          Image Extension is installed — it usually is, but not always.
        </li>
      </ul>

      <h2>Converting without an upload</h2>
      <p>
        Use the <Link to="/tools/image-converter">local converter</Link> to turn WebP into JPEG or
        PNG, or to go the other way for your site. Files are decoded and re-encoded in the tab; no
        server receives them, which matters when the image is a document scan or something you were
        sent privately.
      </p>
      <p>
        If the output must fit a size limit, the <Link to="/tools/image-compressor">compressor</Link>{' '}
        can target a specific file size, and the{' '}
        <Link to="/guides/compress-image-to-100kb">100 KB guide</Link> explains the order of
        operations that actually works.
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
