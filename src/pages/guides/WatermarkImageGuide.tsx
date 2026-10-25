import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Will the watermark survive cropping or screenshots?',
    a: 'A tiled watermark across the whole image is the hardest to remove — cropping cuts off some copies but leaves others. A single centred watermark is easier to crop out. For sensitive documents, use tiled mode with low opacity so the text is visible but does not obscure the content.',
  },
  {
    q: 'What opacity should I use?',
    a: 'For a draft or internal document, 0.12–0.18 is enough to claim ownership without annoying the reader. For a photo you are sending to a client, 0.25–0.35 makes removal harder. Above 0.4 the watermark starts to hide the image itself.',
  },
  {
    q: 'Can I watermark a whole folder at once?',
    a: 'Yes. Drop multiple images and the tool applies the same text, size, angle and opacity to every file, then downloads them all as a ZIP. Each file keeps its original format — JPEG stays JPEG, PNG stays PNG.',
  },
  {
    q: 'Does the watermark change the image quality?',
    a: 'The image is re-encoded once after the watermark is drawn. JPEG output is saved at 92% quality, which is visually identical to the original for photos. PNG and WebP keep their lossless or original compression. The watermark text itself is drawn as sharp vector shapes.',
  },
  {
    q: 'Is my image uploaded to add the watermark?',
    a: 'No. The image is decoded by the browser, the watermark is drawn on a canvas, and the result is encoded back to a file — all in memory. Open the Network panel and drop a photo: nothing is sent anywhere.',
  },
]

export function WatermarkImageGuide() {
  useSeo({
    ...routeMeta('/guides/watermark-image-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Watermark photos without uploading them"
      lede="A watermark is supposed to stop an image from being reused — but if you upload the photo to add the watermark, you have already shared it. Here is how to choose the right watermark style and apply it locally."
      updated="26 October 2026"
      toolTo="/tools/image-watermark"
      toolLabel="Watermark an image in your browser"
    >
      <h2>The privacy problem with online watermarking</h2>
      <p>
        Watermarks are usually applied to images that are not ready to be public: client proofs,
        pre-release product shots, internal reports, legal documents. Every online watermarking
        service asks you to upload the file first. That means the unreleased image sits on someone
        else's server, in a log, in a backup, or in a training dataset — before the watermark even
        exists. The tool that was supposed to protect the image becomes the leak.
      </p>
      <p>
        A local watermarking tool keeps the file in the browser tab. The image is decoded by the
        browser's own image pipeline, the text is drawn on a canvas, and the result is re-encoded
        to JPEG or PNG. No network request is involved, so the only copy of the image is the one
        on your device.
      </p>

      <h2>Tiled or centred: which watermark to choose</h2>
      <p>
        A <strong>tiled watermark</strong> repeats the text across the whole image at a shallow
        angle. It is the standard for proofs and confidential documents because cropping cannot
        remove every copy, and the repetition makes automated removal harder. Use it when the
        image must not be reused without permission.
      </p>
      <p>
        A <strong>centred watermark</strong> places the text once in the middle. It is better for
        portfolio photos, social media posts and marketing images where the image itself is the
        point and the watermark is a subtle copyright notice. It is easier to crop out, so use it
        when the goal is attribution rather than prevention.
      </p>

      <h2>Opacity, size and angle</h2>
      <ul>
        <li><strong>Opacity</strong> — 12–18% for documents, 25–35% for photos. Above 40% the watermark starts to hide the image.</li>
        <li><strong>Size</strong> — 5–7% of the image width works for most cases. Smaller text disappears when the image is scaled down for web or social media.</li>
        <li><strong>Angle</strong> — -30° is the standard diagonal for tiled watermarks. Horizontal (0°) works for a single centred mark. Vertical (-90°) is useful for narrow images like phone screenshots.</li>
      </ul>

      <h2>What to put in the watermark</h2>
      <p>
        The most common choices are a copyright notice (© 2026 Your Name), a status label
        (CONFIDENTIAL, DRAFT, PROOF), or a company name. For client work, include the client's
        name or project code — it makes the watermark useless to anyone else. Avoid long sentences;
        three words or fewer is the practical limit before the text becomes unreadable at small
        sizes.
      </p>

      <h2>File format and quality</h2>
      <p>
        The tool preserves the original format: a JPEG stays JPEG, a PNG stays PNG. JPEG output is
        saved at 92% quality, which is visually identical to the original for photographs. PNG
        output is lossless, so screenshots and graphics with sharp edges stay crisp. The watermark
        text itself is drawn as vector shapes on the canvas, so it does not introduce compression
        artifacts of its own.
      </p>

      <h2>Batch watermarking a folder</h2>
      <p>
        Drop a whole folder of images and the same watermark settings are applied to every file.
        The results download as a single ZIP, with "-watermarked" added to each filename. This is
        the fastest way to protect a photo shoot before sending proofs to a client, or to mark a
        batch of internal screenshots before a presentation. If the folder contains a mix of JPEG
        and PNG files, each one keeps its original format in the ZIP — no conversion happens unless
        you ask for it.
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
