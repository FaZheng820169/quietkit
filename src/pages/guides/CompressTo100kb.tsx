import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { AdSlot } from '../../components/AdSlot'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Can I compress to an exact size, like 100 KB?',
    a: 'Not in one pass — encoders cannot predict output size from a quality number. The practical method is to pick a quality, look at the resulting size, and adjust: lower quality or smaller dimensions until you land under the limit. QuietKit shows the size after every change automatically.',
  },
  {
    q: 'Does resizing or compressing break the upload rules?',
    a: 'No. Portals check resolution and file size, not encoding. A photo resized to 1200 px and saved at 75% quality usually passes the same checks as the original.',
  },
  {
    q: 'What is the smallest a photo can get before it looks bad?',
    a: 'For a 1200 px image at 70–75% quality, most photos land between 100 and 250 KB with no visible artefacts at normal viewing size. Below 50% quality, gradients and skin tones start to band.',
  },
  {
    q: 'Is compressing the same as resizing?',
    a: 'No, and resizing usually saves more. Quality reduces the number of bytes per pixel; resizing reduces the number of pixels. A 4000 px photo shown at 1200 px is discarding five sixths of its data for nothing.',
  },
]

export function CompressTo100kb() {
  useSeo({ ...routeMeta('/guides/compress-image-to-100kb'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Images"
      title="How to compress an image to 100 KB"
      lede="Job portals, visa forms, email attachments and marketplace uploads all impose file-size limits. Here is how to hit them without turning your photo into a blurry mess."
      updated="25 October 2026"
      toolTo="/tools/image-compressor"
      toolLabel="Compress an image now"
    >
      <h2>First, understand what the limit is really asking</h2>
      <p>
        A file-size limit is almost always a storage limit, not a quality requirement. The portal
        wants a 100 KB upload because it stores millions of them. Nothing about the rule cares how
        the bytes were produced — so the goal is simply: the smallest file that still looks
        correct at the size it will be displayed.
      </p>

      <h2>The order that actually works</h2>
      <h3>1. Resize before you touch quality</h3>
      <p>
        This is the step people skip, and it is the one that saves the most. A modern phone photo
        is roughly 4000 × 3000 pixels. If the form displays it at 400 px wide, you are carrying
        thirty times more pixels than needed. Resizing the longest side to 1200–1600 px typically
        cuts the file by 80–90% with no perceptible change at viewing size.
      </p>

      <h3>2. Then lower quality until you are under the limit</h3>
      <p>
        JPEG quality is a dial from 0 to 100. Most photos are indistinguishable from the original
        at 75–80, still good at 65, and visibly degraded below 50. Work downwards in steps of five
        and watch the reported size after each change — the <Link to="/tools/image-compressor">compressor</Link>{' '}
        re-encodes instantly, so you can see the number before downloading.
      </p>

      <h3>3. Switch format if the file is still too big</h3>
      <p>
        WebP encodes the same visual quality in roughly 25–35% fewer bytes than JPEG. If the
        destination accepts WebP, it is the easiest win available. If it does not — most government
        and job portals do not — stay with JPEG.
      </p>

      <h2>Typical results</h2>
      <p>
        Numbers from ordinary phone photos, converted to JPEG at 75% quality with the longest side
        resized:
      </p>
      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table className="compare">
          <thead>
            <tr>
              <th>Source</th>
              <th>Resize to</th>
              <th>Typical result</th>
              <th>Use case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12 MP phone photo, 4.2 MB</td>
              <td>1600 px</td>
              <td>180–320 KB</td>
              <td>Email, portfolio</td>
            </tr>
            <tr>
              <td>12 MP phone photo, 4.2 MB</td>
              <td>1280 px</td>
              <td>120–220 KB</td>
              <td>LinkedIn, CV photo</td>
            </tr>
            <tr>
              <td>12 MP phone photo, 4.2 MB</td>
              <td>800 px</td>
              <td>60–120 KB</td>
              <td>Forms with a 100 KB cap</td>
            </tr>
            <tr>
              <td>48 MP photo, 12 MB</td>
              <td>1280 px</td>
              <td>150–260 KB</td>
              <td>Marketplace listing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>When PNG is the wrong answer</h2>
      <p>
        PNG is lossless, so it cannot be tuned down to a target size — a photographic PNG is often
        several times larger than the JPEG version of the same picture. Keep PNG only for logos,
        screenshots with text, and anything with transparency. If you convert a photo to PNG to
        “preserve quality” and then need it under 100 KB, you have made the problem harder.
      </p>

      <h2>A note on portals that re-compress</h2>
      <p>
        Some application systems process your upload again on their side, which can push a file
        that passed the check into a second, harsher compression. It is worth keeping a little
        headroom: if the cap is 100 KB, aim for 80–90 KB rather than 99 KB.
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

      <div style={{ marginTop: 28 }}>
        <AdSlot />
      </div>
    </Article>
  )
}
