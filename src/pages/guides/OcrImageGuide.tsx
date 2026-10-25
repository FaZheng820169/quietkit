import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does OCR in the browser really keep the image private?',
    a: 'Yes, when the engine itself is local. QuietKit ships Tesseract compiled to WebAssembly: the engine, the English language data and your image are all handled inside the tab. Open the Network tab in dev tools during a run — the only requests are the engine files from this site, and they happen once, before any image is read.',
  },
  {
    q: 'Why does the engine download files on the first run?',
    a: 'An OCR engine is a real program, not a script: the WebAssembly core and the language data total about 7 MB. They are fetched once from this site and cached by the browser, so later visits — and offline runs — start instantly. Downloading the engine is the opposite of uploading the image: the work comes to the file, not the other way round.',
  },
  {
    q: 'Which images give the best results?',
    a: 'Screenshots, flatbed scans and photos of printed pages taken square-on in good light. Dark text on a light background, roughly 300 DPI or better, is the sweet spot. Receipts photographed at an angle, low-contrast thermal paper and decorative fonts degrade any engine — crop tighter, straighten, and try again.',
  },
  {
    q: 'Can it read handwriting or languages other than English?',
    a: 'No on both counts, for now. Handwriting recognition needs a different class of model than printed-text OCR, and each extra language adds megabytes of data. English printed text covers the most common jobs — error messages, receipts, scanned letters — and more languages may follow with the same local-only guarantee.',
  },
  {
    q: 'What do I get back?',
    a: 'Plain text, per image: copy it to the clipboard, download a .txt per file, or download everything as one combined text file. Layout — columns, tables, fonts — is not preserved; OCR returns the words, not the design.',
  },
]

export function OcrImageGuide() {
  useSeo({
    ...routeMeta('/guides/ocr-image-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Extract text from an image without uploading it"
      lede="A screenshot of an error, a photographed receipt, a scanned page of a letter — the words are locked inside pixels. Here is how an OCR engine unlocks them on your own device, and how to check that nothing left it."
      updated="26 October 2026"
      toolTo="/tools/image-ocr"
      toolLabel="OCR an image in your browser"
    >
      <h2>The words in a photo are not text yet</h2>
      <p>
        A screenshot of an error message looks like text, but to the computer it is a grid of
        coloured dots. You cannot search it, paste it into a bug report or quote it in an email
        until something reads the shapes and decides which characters they form. That something
        is optical character recognition — OCR — and the usual way to get it is to upload the
        image to a service, which is a strange price to pay for reading your own screenshot.
      </p>
      <p>
        The privacy problem is sharper than it looks, because the images people OCR are exactly
        the ones that leak: error dialogs that contain file paths and account names, receipts
        with card digits and addresses, scanned letters with signatures. Sending them to a
        stranger's server to get plain text back trades convenience for a copy of the document
        you can never retrieve.
      </p>

      <h2>How an OCR engine reads</h2>
      <p>
        Modern OCR engines such as Tesseract — the one QuietKit ships — work in stages. First
        the image is normalised: converted to grayscale, contrast-adjusted, and split into
        regions that look like lines of text rather than decoration. Then each line is cut into
        candidate characters, and a neural network scores every candidate against the shapes it
        was trained on, one character at a time but aware of its neighbours — which is how it
        tells <code>rn</code> from <code>m</code>. Finally a language model cleans up the
        implausible sequences: “recieve” becomes “receive” because the dictionary votes.
      </p>
      <p>
        All three stages are arithmetic on pixels, and arithmetic does not need a server.
        Tesseract compiled to WebAssembly runs inside the browser sandbox at close to native
        speed, reading the image straight from memory. The engine and its English language data
        — about 7 MB in total — are downloaded from this site once and cached, like any other
        static asset. After that first load, recognition works with the network switched off
        entirely.
      </p>

      <h2>What a good input looks like</h2>
      <p>
        OCR accuracy is mostly decided before the engine runs. The reliable inputs are
        screenshots, flatbed scans and phone photos of printed pages taken square-on in even
        light — dark text, light background, characters at least a couple of dozen pixels tall.
        The unreliable ones are equally predictable: handwriting, which printed-text models are
        not trained for; thermal receipts fading to grey; photos taken at a steep angle, which
        shear the character shapes; and decorative or condensed fonts that squeeze letters
        together.
      </p>
      <p>
        When a result comes back scrambled, the fix is almost always in the image, not the
        engine: crop to the text block, straighten the page, raise the contrast, or re-shoot
        with the camera parallel to the paper. Large photos are downscaled in memory before
        recognition, so a 12-megapixel shot costs no extra patience.
      </p>

      <h2>What OCR cannot do</h2>
      <ul>
        <li>
          <strong>Read handwriting.</strong> Printed text and handwriting are different problems;
          this engine solves the first. A handwritten note will mostly return noise.
        </li>
        <li>
          <strong>Preserve layout.</strong> The output is plain text. Columns become a reading
          order, tables lose their grid, fonts and sizes are gone. If you need the layout, keep
          the image.
        </li>
        <li>
          <strong>Guarantee every character.</strong> Expect to proofread numbers, punctuation
          and unusual names even on clean scans. Confidence is highest at 300 DPI or better.
        </li>
        <li>
          <strong>Read languages beyond English.</strong> Only English language data ships today,
          to keep the download small. Other scripts will return garbage.
        </li>
      </ul>

      <h2>Verify it is local, then trust it</h2>
      <p>
        The claim that an image never leaves your device is checkable, not a promise. Open the
        browser's dev tools, switch to the Network tab, clear it, and run a recognition. You
        will see the engine files — <code>worker.min.js</code>, the WebAssembly core,{' '}
        <code>eng.traineddata.gz</code> — fetched from this exact site, once, and you will see
        no request that carries your image. Run it a second time and the engine comes from the
        cache; pull the network cable and it still works. A tool that uploads your file cannot
        survive that test, which is why it is worth running once on any OCR site you use.
      </p>
      <p>
        When the job is the reverse — a scan that is already a PDF — the text you want may
        already exist as a layer inside the file, and the{' '}
        <Link to="/tools/pdf-text">PDF text extractor</Link> will find it without any OCR at
        all. When the images are headed somewhere public, strip their metadata first with the{' '}
        <Link to="/tools/metadata-cleaner">metadata cleaner</Link>. Related reading:{' '}
        <Link to="/guides/extract-text-from-pdf-without-upload">copying text out of a PDF</Link>,{' '}
        <Link to="/guides/remove-exif-metadata-without-upload">what photo metadata reveals</Link>,
        and <Link to="/guides/compress-image-to-100kb">shrinking an image to a size limit</Link>.
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
