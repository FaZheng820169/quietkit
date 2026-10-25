import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Why is a converted file sometimes bigger than the original?',
    a: 'Conversion is re-encoding, not compression. A JPEG turned into PNG becomes lossless and grows; a HEIC photo turned into JPEG often doubles, because HEIC is simply the more efficient format. Going the other way — PNG screenshot to JPEG — usually shrinks the file by 70–90%. Judge each file by the real before-and-after size, not by a promise on the button.',
  },
  {
    q: 'What happens to transparent pixels when I convert PNG to JPEG?',
    a: 'JPEG has no alpha channel, so the transparency has to go somewhere: the transparent areas are filled with a solid colour, conventionally white. That is correct for photos and documents and wrong for a logo meant for a dark background. If the image needs transparency, convert to PNG or WebP instead.',
  },
  {
    q: 'How can a browser convert an iPhone HEIC photo at all?',
    a: 'Browsers cannot decode HEIC natively, so the converter loads a small WebAssembly decoder — roughly 1 MB, downloaded once — the first time a HEIC file appears. From then on the photo is decoded and re-encoded inside the tab like any other image, and nothing is sent anywhere.',
  },
  {
    q: 'Does converting an image remove its EXIF metadata?',
    a: 'Not reliably. Some encoders copy the metadata block into the new file, some drop it, and “maybe” is not good enough when the metadata contains your home coordinates. If location data must go, run the file through a metadata stripper explicitly rather than trusting the conversion to do it as a side effect.',
  },
  {
    q: 'Is it safe to convert personal photos on an online converter?',
    a: 'Only when the converter never uploads them. Most “free online converters” send every file to a server, because their business model is the upload: your photos pass through machines you cannot see, under a retention policy you have not read. A local converter does the decode and re-encode in your own tab — verifiable in the Network panel, and it still works with the network switched off.',
  },
]

export function ConvertImagesGuide() {
  useSeo({
    ...routeMeta('/guides/convert-images-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Convert images between formats without uploading them"
      lede="HEIC that nobody can open, a PNG the form rejects, a folder of photos that should be WebP — format conversion is a thirty-second job, and the files involved are usually personal ones that should never leave the device."
      updated="26 October 2026"
      toolTo="/tools/image-converter"
      toolLabel="Convert images in your browser"
    >
      <h2>The job that should not need a server</h2>
      <p>
        The request is always small: turn this HEIC into a JPEG the visa form accepts, turn this
        screenshot into a WebP for the website, turn fifty PNGs into something smaller. What is
        being converted, though, is rarely small in the ways that matter — product photos not yet
        announced, scans of documents, family pictures. Handing them to a stranger's server to
        change a file header is a bad trade, and an unnecessary one.
      </p>
      <p>
        Every current browser already contains the machinery a conversion needs: an image decoder,
        the Canvas API for re-encoding, and enough memory to hold a photo. A local converter simply
        uses what is installed — the file is decoded in the tab, written out in the new format, and
        offered back as a download. There is no queue and no upload progress bar because there is
        no upload.
      </p>

      <h2>What a conversion actually changes</h2>
      <p>
        A format is a promise about what the file can hold. <strong>JPEG</strong> stores a
        photograph with lossy compression: small, universally readable, no transparency, and it
        softens a little more each time it is re-saved. <strong>PNG</strong> is lossless and keeps
        every pixel and the alpha channel: correct for logos, screenshots and text, heavy for
        photos. <strong>WebP</strong> does both jobs, typically 25–35% smaller than JPEG at the
        same visual quality, and every current browser reads it — but older email clients, print
        shops and form uploads still reject it.
      </p>
      <p>
        Converting changes the container and the encoder settings — nothing more. It cannot add
        detail that was thrown away by an earlier save, cannot sharpen a soft photo, and cannot
        make a small image large without blur. Pick the format for the destination: JPEG where
        only JPEG is accepted, PNG where transparency or sharp text matters, WebP where you control
        the audience's browser.
      </p>

      <h2>The HEIC special case</h2>
      <p>
        iPhones save photos as HEIC because it halves storage, and Windows, web forms and most of
        the non-Apple world cannot open it. Browsers have no HEIC decoder built in, so a local
        converter loads a WebAssembly decoder the first time a HEIC file appears — a one-off
        download of about 1 MB — then treats the photo like any other image. Every file after the
        first is fast, and the decoded photo still never leaves the tab.
      </p>

      <h2>Two side effects worth knowing</h2>
      <p>
        <strong>Transparency.</strong> JPEG cannot hold an alpha channel, so PNG-to-JPEG fills
        transparent areas with white — right for a scanned page, wrong for a logo on a dark site.
        If the result looks wrong, the answer is a different target format, not a different
        converter.
      </p>
      <p>
        <strong>Metadata.</strong> Whether EXIF data survives a conversion depends on the encoder,
        and “sometimes” is not a privacy strategy. When the GPS coordinates must go, strip them
        deliberately with the <Link to="/tools/metadata-cleaner">metadata cleaner</Link> instead of
        hoping the conversion drops them.
      </p>

      <h2>Converting a folder locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/image-converter">image converter</Link> and drop the files in —
          HEIC, JPEG, PNG and WebP mix freely.
        </li>
        <li>
          Pick the target format; for JPEG and WebP, leave the quality at 90% unless the file must
          be smaller — 90% is visually lossless for photos.
        </li>
        <li>
          Read the before-and-after size on each row. Conversions that grow the file are marked
          honestly, so you can keep or discard each result on evidence.
        </li>
        <li>
          Download one file, or take the whole batch as a ZIP. Reload the tab and everything is
          gone — there is nothing stored to clean up.
        </li>
      </ol>

      <h2>What conversion cannot do</h2>
      <ul>
        <li>
          <strong>Recover lost detail.</strong> A JPEG saved at 40% quality stays soft as a PNG.
        </li>
        <li>
          <strong>Upscale.</strong> A 600-pixel image does not become a sharp 2400-pixel one; that
          is a different problem, solved by <Link to="/tools/image-resizer">resizing down</Link>,
          not up.
        </li>
        <li>
          <strong>Guarantee metadata removal.</strong> Use the{' '}
          <Link to="/tools/metadata-cleaner">metadata cleaner</Link> when location data must go.
        </li>
        <li>
          <strong>Shrink a photo by itself.</strong> If size is the goal rather than the format,{' '}
          <Link to="/tools/image-compressor">compress the image</Link> instead.
        </li>
      </ul>
      <p>
        And if the end goal is a document rather than an image — receipts for expenses, a signed
        form photographed on a phone — skip the conversion and{' '}
        <Link to="/tools/jpg-to-pdf">assemble the photos into a PDF</Link> directly.
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
