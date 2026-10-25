import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Why did my phone or a website give me an AVIF file?',
    a: 'Because it is the most efficient mainstream image format: the AV1 codec stores the same picture in roughly half the bytes of JPEG. Websites serve AVIF to load faster, and newer Android and iPhone cameras can shoot it. You only notice when something — an editor, a form, an older Windows — refuses to open the result.',
  },
  {
    q: 'Is converting AVIF to JPG a quality loss?',
    a: 'A small one, in theory: both formats are lossy, so the pixels are decoded and compressed again. At 90% quality the difference is invisible on photos. What is not preserved is metadata — the converted JPEG is pixels only, with no EXIF block carried across, which for most sharing is a feature rather than a bug.',
  },
  {
    q: 'JPG, PNG or WebP — which one should I pick?',
    a: 'JPG when the destination is a form, an email or older software and the image is a photo. PNG when the AVIF has transparency or sharp text and you can afford a file several times larger. WebP when the target is a website or a current app: it keeps transparency, stays small, and every current browser reads it.',
  },
  {
    q: 'Can I go the other way — JPG to AVIF?',
    a: 'Yes, if your browser includes an AVIF encoder, which today means current Chrome or Edge. Firefox and Safari decode AVIF but cannot write it yet. The converter tests the encoder for real and disables that direction with an explanation when it is absent — you never get a broken file with the right name.',
  },
  {
    q: 'How do I know the conversion really happened on my device?',
    a: 'Open the browser’s developer tools, switch to the Network tab, then convert a file. No request carries the image, because decoding and encoding are done by the Canvas API in the tab itself. Stronger still: load the page once, disconnect from the network, and the conversion still works.',
  },
]

export function AvifToJpgGuide() {
  useSeo({
    ...routeMeta('/guides/avif-to-jpg'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Formats"
      title="Convert AVIF to JPG without uploading the file"
      lede="You saved an image from a website or received one from a new phone, and nothing on your computer will open it — the file ends in .avif. Here is what that format is, which format to convert it to, and how to do the job without handing the picture to a server."
      updated="26 October 2026"
      toolTo="/tools/avif-converter"
      toolLabel="Convert AVIF in your browser"
    >
      <h2>The file that opens in a browser and nowhere else</h2>
      <p>
        AVIF is the still-image form of AV1, the video codec built for the streaming era. Its one
        job is efficiency: the same photograph in 30–50% fewer bytes than JPEG, with transparency
        and HDR support that JPEG never had. That is why websites serve AVIF — smaller files load
        faster — and why newer Samsung, Google and Apple phones can shoot it. Browsers have read
        AVIF for years, so the image displays perfectly when you save it.
      </p>
      <p>
        The trouble starts the moment the file leaves the browser. Windows Photos on older builds
        shrugs at it. Editors a version or two behind refuse the import. The upload form for a job
        application, a visa photo or a marketplace listing wants JPEG or PNG, full stop. You are
        holding a format designed for the network in a world of software that still speaks JPEG.
      </p>

      <h2>What converting actually does</h2>
      <p>
        Conversion is two steps: decode the AVIF back to raw pixels, then encode those pixels in
        the format you need. Both steps are arithmetic — and a browser tab is already excellent at
        the first one, because decoding AVIF is what it does every time such an image appears on a
        page. The same engine that showed you the picture can hand its pixels to a new encoder,
        which is how the whole job happens locally.
      </p>
      <p>
        Choosing the target format is the only real decision. <strong>JPEG</strong> is the
        compatibility answer: it opens in every piece of software made this century, and at 90%
        quality it is visually indistinguishable for photos. Its limits are structural — no
        transparency, so any transparent areas must be filled (white is the conventional choice),
        and lossy re-compression, so a heavily compressed AVIF stays exactly as soft as it was.{' '}
        <strong>PNG</strong> is the fidelity answer: lossless, keeps the alpha channel, correct
        for graphics with sharp text — and routinely five to ten times larger than the AVIF you
        started with. <strong>WebP</strong> is the middle: transparency, small files, universal
        browser support, patchy support in older desktop software.
      </p>

      <h2>Going the other way, and why it depends on the browser</h2>
      <p>
        Sometimes AVIF is what you want to produce — for your own website, where its size is the
        point. Writing AVIF needs an encoder, and browsers are split: current Chrome and Edge
        include one, Firefox and Safari do not yet. A careful converter has no honest way around
        that split, so it should test the encoder and say plainly when the direction is
        unavailable. QuietKit does exactly that — and it verifies the bytes it produces, because a
        browser without an encoder quietly returns a PNG wearing an .avif name, which is a worse
        outcome than an error message.
      </p>

      <h2>What a local converter will not do</h2>
      <ul>
        <li>
          <strong>Recover detail.</strong> Whatever the AVIF encoder compressed away is gone;
          converting to PNG preserves the pixels, not the lost fidelity.
        </li>
        <li>
          <strong>Keep transparency in JPEG.</strong> The format cannot hold it; transparent pixels
          are filled with white.
        </li>
        <li>
          <strong>Carry metadata across.</strong> The output is pixels only. If a copy with the
          EXIF block stripped is what you wanted anyway, that is done — otherwise reach for the{' '}
          <Link to="/tools/metadata-cleaner">metadata cleaner</Link> deliberately.
        </li>
        <li>
          <strong>Work without a decoder.</strong> A browser old enough to lack AVIF decoding
          cannot read the file at all; updating the browser is the fix.
        </li>
      </ul>

      <h2>After the conversion</h2>
      <p>
        Two follow-ups are common. If the destination has a size limit — a 100 KB form upload, a
        mail attachment — run the new JPEG through the{' '}
        <Link to="/tools/image-compressor">image compressor</Link>, which searches for the quality
        that fits. And if the AVIF was only one of several formats on your desk, the{' '}
        <Link to="/tools/image-converter">general converter</Link> handles HEIC, PNG, WebP and JPEG
        in the same local way. Related reading:{' '}
        <Link to="/guides/what-is-webp">what a WebP file is</Link>,{' '}
        <Link to="/guides/heic-to-jpg">converting HEIC from an iPhone</Link>, and{' '}
        <Link to="/guides/compress-image-to-100kb">hitting a 100 KB limit</Link>.
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
