import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { AdSlot } from '../../components/AdSlot'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'How do I view EXIF data on a Mac or PC?',
    a: 'Windows: right-click the file, choose Properties, then the Details tab. macOS: open the image in Preview and use Tools → Show Inspector. Both show a partial list; a browser-based viewer reads the full EXIF, XMP and IPTC blocks.',
  },
  {
    q: 'Can EXIF tell where a photo was taken?',
    a: 'Yes, if location services were enabled for the camera. The GPS block stores latitude, longitude, altitude and often the direction of the lens. Viewers convert that to a map link, which makes the exposure obvious in one click.',
  },
  {
    q: 'Does deleting EXIF reduce image quality?',
    a: 'No. EXIF is a separate block of bytes attached to the image. Removing it does not re-encode the picture, so pixels, sharpness and colour are identical.',
  },
  {
    q: 'What is the difference between EXIF, XMP and IPTC?',
    a: 'EXIF is written by the camera at capture time. XMP is Adobe’s format for edit history and ratings, often added by Lightroom or Photoshop. IPTC is the older press-agency standard for captions, keywords and credits. All three can contain identifying information.',
  },
]

export function ExifGuide() {
  useSeo({ ...routeMeta('/guides/exif-viewer'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Metadata"
      title="What an EXIF viewer shows you"
      lede="Every photo carries a hidden record: the device, the moment, the settings — and often the coordinates. This is what those fields mean and which ones you should care about."
      updated="25 October 2026"
      toolTo="/tools/metadata-cleaner"
      toolLabel="View a photo’s metadata"
    >
      <h2>The three metadata families</h2>
      <p>
        Photo metadata is not one thing. Three standards are usually present, and they were written
        by different industries for different reasons.
      </p>
      <ul>
        <li>
          <strong>EXIF</strong> — written by the camera. Camera make and model, lens, aperture,
          shutter speed, ISO, orientation, timestamp, and the GPS block if location was on.
        </li>
        <li>
          <strong>XMP</strong> — written by editing software. Adjustment history, ratings, keywords,
          sometimes the original filename and the application used.
        </li>
        <li>
          <strong>IPTC</strong> — written by publishing tools. Captions, bylines, copyright notices
          and location fields used by news agencies.
        </li>
      </ul>

      <h2>The fields worth checking before sharing</h2>
      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table className="compare">
          <thead>
            <tr>
              <th>Field</th>
              <th>What it reveals</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GPS latitude / longitude</td>
              <td>Where the photo was taken, to within metres</td>
              <td className="no">High</td>
            </tr>
            <tr>
              <td>DateTimeOriginal</td>
              <td>The exact second of capture</td>
              <td className="no">Medium</td>
            </tr>
            <tr>
              <td>Make and model</td>
              <td>Links photos taken on the same device</td>
              <td className="no">Medium</td>
            </tr>
            <tr>
              <td>Software / edit history</td>
              <td>Which apps you use, how you edited</td>
              <td className="no">Low</td>
            </tr>
            <tr>
              <td>Thumbnail</td>
              <td>An older version that may survive a crop</td>
              <td className="no">Low</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Reading the data without uploading the photo</h2>
      <p>
        Most “EXIF viewer” sites are upload services: your photo is sent to a server, parsed there,
        and returned to your screen. The trade is the same one you make with any converter. Since
        the file is what you are trying to inspect, sending it somewhere is an odd way to start.
      </p>
      <p>
        The <Link to="/tools/metadata-cleaner">metadata cleaner</Link> reads the JPEG and PNG
        segment structure directly in the tab. It lists every tag it can map — including the GPS
        block, converted to decimal coordinates with a map link — then lets you download a copy
        with the metadata removed.
      </p>

      <h2>What the numbers mean</h2>
      <ul>
        <li>
          <strong>f/1.8</strong> — aperture; lower numbers mean a wider opening and a shallower
          depth of field.
        </li>
        <li>
          <strong>1/125 s</strong> — shutter speed; anything below about 1/60 risks hand-shake blur.
        </li>
        <li>
          <strong>ISO 400</strong> — sensor sensitivity; higher values mean more noise in low light.
        </li>
        <li>
          <strong>26 mm</strong> — focal length; useful for telling a wide phone lens from a
          telephoto crop.
        </li>
      </ul>

      <h2>One thing to remember</h2>
      <p>
        Metadata removal is permanent for that copy. If the capture date or location has value to
        you — for a photo library, an insurance claim, a travel log — keep the original file and
        share the cleaned copy.
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
