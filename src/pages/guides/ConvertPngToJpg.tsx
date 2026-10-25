import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does converting PNG to JPG reduce quality?',
    a: 'Yes, but you choose how much. JPEG is lossy, so each save discards some detail. At 90% quality the difference is invisible on photos; at 60% you start to see smearing around edges and text. Convert once from the original PNG and keep that original — repeated conversions stack the loss.',
  },
  {
    q: 'Will I lose transparency?',
    a: 'JPEG cannot store transparency, so transparent pixels must become a solid colour. QuietKit fills them with white. If the image is a logo, an icon or a screenshot with rounded corners, converting to JPEG will leave white blocks where the background used to show through. Keep PNG, or use WebP, which supports transparency.',
  },
  {
    q: 'Can I convert many PNG files at once?',
    a: 'Yes. Drop the whole folder into the converter, pick JPEG, and download a single ZIP. Conversion runs in your browser, so batch size is limited only by your memory, not by an upload quota.',
  },
  {
    q: 'Is there a built-in way to do this on Mac or Windows?',
    a: 'On macOS, Preview → File → Export lets you pick JPEG and a quality slider. On Windows, Paint can save as JPEG but always at a fixed quality, and it strips nothing. Neither lets you batch, and both require opening each file. The converter here is scriptable-free and handles batches in one pass.',
  },
  {
    q: 'Does converting remove the photo metadata?',
    a: 'Not necessarily. Some encoders copy EXIF into the new file, some drop it. If location data matters, use the metadata cleaner afterwards and check the result rather than assuming.',
  },
]

export function ConvertPngToJpg() {
  useSeo({ ...routeMeta('/guides/convert-png-to-jpg'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Convert PNG to JPG without uploading the file"
      lede="Screenshots, exports and design files often arrive as PNG. When a form only accepts JPG, here is how to convert properly — and what you give up when you do."
      updated="October 2026"
      toolTo="/tools/image-converter"
      toolLabel="Open the converter"
    >
      <h2>Why PNG files are so large</h2>
      <p>
        PNG is a lossless format: it stores every pixel exactly, then compresses the result
        without throwing anything away. That is ideal for screenshots, charts and images with
        text, where a lossy encoder would blur the edges. It is wasteful for photographs, where
        neighbouring pixels are similar and a lossy encoder can throw away a lot without the eye
        noticing.
      </p>
      <p>
        A 1920×1080 screenshot of a web page is commonly 1.5–3 MB as PNG. The same image as JPEG at
        90% quality is typically 150–350 KB. That is roughly a tenfold difference, which is why
        upload forms with a 2 MB limit reject PNGs that look perfectly ordinary.
      </p>

      <h2>The three things that actually change</h2>
      <ul>
        <li>
          <strong>Transparency disappears.</strong> JPEG has no alpha channel. Transparent areas
          become a solid colour — white in QuietKit, and in most converters. This is correct for
          documents on white paper and wrong for logos placed on dark backgrounds.
        </li>
        <li>
          <strong>Sharp edges soften.</strong> Text and line art are exactly where JPEG is weakest.
          At 90% the softening is small; below 70% you will see halos around letters.
        </li>
        <li>
          <strong>The file gets smaller — usually.</strong> A photograph shrinks dramatically. A
          flat-colour graphic may not shrink at all, because JPEG is not designed for large areas
          of one colour. Check the reported before and after size rather than assuming.
        </li>
      </ul>

      <h2>When you should not convert</h2>
      <p>
        If the image is a logo, an icon, a screenshot of text, or anything that will be composited
        over a non-white background, keep it as PNG and find a way to send it as PNG. Many
        platforms accept PNG even when their help text only mentions JPG. Converting first and
        discovering the white box later is the common mistake.
      </p>
      <p>
        If the destination accepts WebP, that is usually the better choice: it supports
        transparency and is 25–35% smaller than JPEG at matched visual quality.
      </p>

      <h2>How to convert, by device</h2>
      <h3>Browser, any device, in batches</h3>
      <p>
        Use the <Link to="/tools/image-converter">local converter</Link>: drop one file or a
        hundred, choose JPEG, set quality to 90%, and download each file or a single ZIP. The
        conversion happens in this tab, so nothing is uploaded and nothing needs an account.
      </p>
      <h3>macOS</h3>
      <p>
        Open the PNG in Preview, choose <em>File → Export</em>, set the format to JPEG and use the
        quality slider. Preview exports one file at a time; for a folder, the converter is faster.
      </p>
      <h3>Windows</h3>
      <p>
        Open the image in Paint, choose <em>File → Save as → JPEG picture</em>. Paint applies a
        fixed quality and cannot batch. For several files, use the converter instead.
      </p>
      <h3>iPhone and Android</h3>
      <p>
        iOS does not convert PNG to JPEG from the share sheet directly; the reliable route is to
        open the file in a converter on the web and save the result to Photos. On Android,
        Google Photos can export a copy as JPEG from the edit menu.
      </p>

      <h2>Quality settings in one line each</h2>
      <ul>
        <li><strong>95%</strong> — archiving a photo you may print; still much smaller than PNG.</li>
        <li><strong>85–90%</strong> — the default for uploads; visually indistinguishable on screen.</li>
        <li><strong>70–75%</strong> — web thumbnails and previews where size matters more than detail.</li>
        <li><strong>Below 60%</strong> — avoid unless the limit is brutal; artefacts become obvious.</li>
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
