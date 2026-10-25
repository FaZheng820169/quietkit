import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does resizing an image change its quality?',
    a: 'Making an image smaller keeps it looking sharp — you are throwing away detail nobody can display. Enlarging is the risky direction: the new pixels are invented by interpolation, so a small photo stretched to banner size turns soft. Resize down freely; resize up only as far as you must.',
  },
  {
    q: 'What is the difference between crop and fit?',
    a: 'Crop fills the target frame exactly and cuts whatever overflows — the output is always the precise size you asked for, but the edges of the photo may be lost. Fit shrinks the whole image until it fits inside the frame and pads the leftover with white — nothing is cut, but the output contains a border. Use crop for avatars and banners, fit for product shots and documents.',
  },
  {
    q: 'Should I resize before or after compressing?',
    a: 'Before. A 4032-pixel photo compressed at low quality still carries pixels nobody will see; resizing it to 1080 pixels first removes most of the data, so the compressor has far less work to do. Resize, then compress, then — if the file is still too large — lower the quality one step at a time.',
  },
  {
    q: 'Why do platforms keep cropping my photo?',
    a: 'Because the frame is fixed and your photo rarely matches it. A landscape photo in a square feed gets the sides cut off, usually centred on the middle of the frame — which is not always where your subject is. Resizing to the platform’s exact dimensions first means you choose what gets cut instead of the algorithm choosing for you.',
  },
  {
    q: 'Is it safe to resize personal photos with an online tool?',
    a: 'Only if the tool never uploads them. Most resizers send your photo to a server, resize it there and hand it back — which means your pictures pass through machines you cannot see. A local resizer does the work inside your browser tab; open the Network panel while you work and you will see no request carrying your image.',
  },
]

export function ResizeImageGuide() {
  useSeo({
    ...routeMeta('/guides/resize-image-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Resize an image to exact pixels without uploading it"
      lede="1080×1080 for the feed, 1584×396 for the banner, 600×600 for the avatar — every platform wants its own numbers, and handing a folder of personal photos to a stranger’s server to hit them is a bad trade."
      updated="26 October 2026"
      toolTo="/tools/image-resizer"
      toolLabel="Resize images in your browser"
    >
      <h2>The frame is fixed, the photo is not</h2>
      <p>
        Every platform publishes the dimensions it displays, and every phone camera ignores them. A
        modern phone shoots at 4032×3024 or larger; the feed shows 1080×1080, the profile header
        wants 1584×396, the marketplace listing expects a square. Something has to give, and if you
        do not resize the photo yourself, the platform does it for you.
      </p>
      <p>
        That matters for two reasons. The first is cropping: a landscape photo forced into a square
        loses its left and right edges, and the automatic crop centres on the middle of the frame —
        which is where your subject is only sometimes. The second is quality: many platforms
        re-encode anything they have to resize, and every re-encode throws a little detail away.
        Resizing first means you make both decisions yourself.
      </p>

      <h2>Pixels are the only unit that matters</h2>
      <p>
        Screen images do not have a physical size, so centimetres, inches and DPI settings are
        beside the point — a 1080×1080 image displays as 1080×1080 pixels whatever its metadata
        claims the DPI is. When a form asks for a “2-inch photo at 300 DPI”, multiply: 2 inches at
        300 pixels per inch is a 600×600 pixel file. The number in the requirement is always a
        pixel count in disguise.
      </p>
      <p>
        The practical order is always the same: find the platform’s published pixel dimensions,
        resize to exactly those numbers, then worry about file size. A correctly-sized image that is
        still over the upload limit is a job for the{' '}
        <Link to="/tools/image-compressor">compressor</Link>, not for a second resize.
      </p>

      <h2>Crop or fit: the one decision that changes the result</h2>
      <p>
        When the photo’s shape and the target’s shape disagree, one of two things must happen.
      </p>
      <p>
        <strong>Crop to fill</strong> scales the photo until it covers the whole frame, then cuts
        the overflow. The output is always exactly the size you asked for, with no borders — the
        right choice for avatars, banners and feed posts, where a white margin looks like a mistake.
        The cost is that whatever falls outside the frame is gone, so check where the crop lands.
      </p>
      <p>
        <strong>Fit inside</strong> shrinks the photo until it sits entirely within the frame and
        pads the remainder with white. Nothing is cut, which makes it the right choice for product
        photos, scanned documents and anything where the edges carry information. The cost is the
        border: on a coloured feed background the padding is visible.
      </p>

      <h2>One photo is a task; a folder is a chore</h2>
      <p>
        Resizing one avatar is a minute’s work. Resizing eighty product photos to the marketplace’s
        square format is an afternoon — unless the tool batches. A batch resizer takes a whole
        folder, applies the same dimensions and mode to every file, and hands the results back as
        one ZIP. The settings you would have repeated eighty times are entered once.
      </p>
      <p>
        Batching is also where upload-based tools get expensive in a second currency: time. Eighty
        photos at a few megabytes each means hundreds of megabytes up to a server and back down,
        plus whatever the server does with them in between. A local batch never leaves the machine,
        so the folder is resized at the speed of your own hardware.
      </p>

      <h2>Why “upload to resize” is the expensive option</h2>
      <p>
        Product photos before a launch, family pictures for a shared album, the headshot you have
        not published yet — the photos people resize are often the ones they least want circulating.
        An upload-based resizer sends every one of them to a server, and “we delete files after one
        hour” is a promise about policy, not a mechanism you can check.
      </p>
      <p>
        A local resizer makes no promise because it makes no copy. The image is decoded by the
        browser, redrawn at the new size on a canvas, and re-encoded in the tab’s memory. You can
        verify rather than trust: open the Network panel before dropping a file and watch — no
        request carries your photo. Once the page has loaded it also works with the network off,
        the strongest proof a web tool can give.
      </p>

      <h2>Resizing to exact pixels, in four steps</h2>
      <ol>
        <li>
          Find the platform’s published dimensions — the{' '}
          <Link to="/guides/social-media-image-sizes">image sizes guide</Link> has the current
          numbers for the major networks.
        </li>
        <li>
          Open the <Link to="/tools/image-resizer">resize tool</Link> and drop in one photo or a
          whole folder.
        </li>
        <li>
          Enter the exact width and height, then choose crop for a filled frame or fit to keep every
          edge.
        </li>
        <li>
          Download the resized file — or the ZIP, for a batch — and check it against the
          requirement before uploading anywhere.
        </li>
      </ol>

      <h2>What resizing cannot fix</h2>
      <ul>
        <li>
          <strong>A photo that is too small.</strong> Enlarging invents pixels by interpolation; a
          400-pixel photo stretched to 1200 turns soft. Reshoot, or find a larger source.
        </li>
        <li>
          <strong>The wrong subject position.</strong> Crop mode centres the frame; a subject near
          the edge needs a manual crop before resizing.
        </li>
        <li>
          <strong>A file that is still too large.</strong> Resizing fixes dimensions, not bytes —
          run the result through the <Link to="/tools/image-compressor">compressor</Link> next.
        </li>
        <li>
          <strong>The wrong format.</strong> If the platform demands JPEG and you have a WebP,
          convert it with the <Link to="/tools/image-converter">format converter</Link> — resizing
          keeps the format you started with.
        </li>
      </ul>
      <p>
        And if the photo is headed somewhere public, remember it still carries its metadata: the
        GPS coordinates and camera details survive a resize, so strip them with the{' '}
        <Link to="/tools/metadata-cleaner">metadata cleaner</Link> before the file leaves your
        hands.
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
