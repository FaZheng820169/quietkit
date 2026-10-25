import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Do these sizes still apply in 2026?',
    a: 'Platforms change their layouts, but the upload dimensions above have been stable for years because they are tied to the compressed image the platform serves, not the interface around it. When something does change, it usually gets larger, not smaller — so uploading at these sizes stays safe.',
  },
  {
    q: 'Is a bigger image always safer?',
    a: 'Only up to about twice the target width. Beyond that you are wasting upload time and storage, and some platforms re-compress aggressively anyway. Uploading 4000 px for a 1080 px slot gains nothing visible and can even soften the result after re-encoding.',
  },
  {
    q: 'Why does my story look cropped after posting?',
    a: 'Because the safe area is smaller than the canvas. Interface elements cover roughly the top 250 px and bottom 250 px of a 1080×1920 story. Keep text and faces inside the middle band and the same file will look right on every phone.',
  },
  {
    q: 'What image should I use for link previews?',
    a: '1200×630 pixels, JPEG or PNG, under about 300 KB. That is the de facto standard for Open Graph images used by Facebook, LinkedIn, Slack, WhatsApp and most messaging apps. Anything smaller is upscaled and looks soft in the card.',
  },
]

const rows = [
  { platform: 'Instagram feed', size: '1080 × 1080', ratio: '1:1', note: 'Classic square post' },
  { platform: 'Instagram portrait', size: '1080 × 1350', ratio: '4:5', note: 'Tallest allowed in feed' },
  { platform: 'Instagram story / reel', size: '1080 × 1920', ratio: '9:16', note: 'Keep text in the middle band' },
  { platform: 'X (Twitter) post', size: '1600 × 900', ratio: '16:9', note: 'Single image in timeline' },
  { platform: 'Facebook / link preview', size: '1200 × 630', ratio: '1.91:1', note: 'Open Graph standard' },
  { platform: 'LinkedIn shared image', size: '1200 × 627', ratio: '1.91:1', note: 'Same shape as link cards' },
  { platform: 'LinkedIn company banner', size: '1584 × 396', ratio: '4:1', note: 'Wide, thin crop' },
  { platform: 'YouTube thumbnail', size: '1280 × 720', ratio: '16:9', note: '2 MB maximum' },
  { platform: 'Pinterest pin', size: '1000 × 1500', ratio: '2:3', note: 'Tall pins travel further' },
  { platform: 'TikTok cover', size: '1080 × 1920', ratio: '9:16', note: 'Same as story' },
  { platform: 'Profile picture', size: '400 × 400', ratio: '1:1', note: 'Displayed as a circle' },
  { platform: 'Print, 2×2 in at 300 DPI', size: '600 × 600', ratio: '1:1', note: 'Passport-style photos' },
]

export function SocialMediaImageSizes() {
  useSeo({ ...routeMeta('/guides/social-media-image-sizes'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Social media image sizes, and why they keep getting cropped"
      lede="One table with the pixel sizes that actually matter, the ratio behind each one, and the two settings that decide whether your subject survives the upload."
      updated="October 2026"
      toolTo="/tools/image-resizer"
      toolLabel="Open the resizer"
    >
      <h2>The table</h2>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th>Where</th>
              <th>Pixels</th>
              <th>Ratio</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.platform}>
                <td>{row.platform}</td>
                <td className="mono">{row.size}</td>
                <td className="mono">{row.ratio}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Why a correct file still gets cropped</h2>
      <p>
        Every platform stores your upload at a fixed shape, then draws it into several different
        containers: the timeline, the grid, the profile page, the share sheet. A 4:5 portrait post
        is shown almost fully in the feed but cut to a square in the grid. There is no single file
        that is optimal everywhere — the practical approach is to pick the container that matters
        most and protect the subject inside it.
      </p>
      <p>
        That is what the two sizing modes in the resizer are for. <strong>Crop to fill</strong>{' '}
        guarantees edge-to-edge coverage at the cost of the outer margins.{' '}
        <strong>Fit whole image</strong> guarantees nothing is lost at the cost of white bars. For
        text-heavy images, fit; for photos, crop.
      </p>

      <h2>Three rules that prevent most bad uploads</h2>
      <ul>
        <li>
          <strong>Leave a margin.</strong> Keep text at least 5% away from every edge; profile
          avatars and badges intrude on the corners.
        </li>
        <li>
          <strong>Upload once, at the target size.</strong> Repeatedly re-uploading a re-saved
          image compounds compression. Keep the original and regenerate from it.
        </li>
        <li>
          <strong>Check the file size limit.</strong> YouTube thumbnails cap at 2 MB; most other
          platforms accept 5–8 MB but re-compress anything large. A 400–800 KB JPEG at the correct
          dimensions is the safe zone.
        </li>
      </ul>

      <h2>How to produce one without uploading</h2>
      <p>
        The <Link to="/tools/image-resizer">resizer</Link> has these presets built in — pick one,
        choose crop or fit, download. Processing happens in the tab, which is the point when the
        image is a photo of you, your ID or an unreleased product.
      </p>
      <p>
        If the platform also enforces a size limit, send the result through the{' '}
        <Link to="/tools/image-compressor">compressor</Link> with a target of 500 KB or 1 MB. The{' '}
        <Link to="/guides/compress-image-to-100kb">100 KB guide</Link> covers the harder cases.
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
