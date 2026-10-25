import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { AdSlot } from '../../components/AdSlot'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does turning off location for the camera delete the location from photos I already took?',
    a: 'No. It only stops new photos from recording a position. Photos already on your phone keep the coordinates that were written at the moment you pressed the shutter, until something rewrites the file.',
  },
  {
    q: 'Does sending a photo through WhatsApp or iMessage remove the location?',
    a: 'Usually the messaging app strips most metadata from the compressed copy it sends, but not always: sending as a “document” or “file” preserves the original bytes, including the GPS tags. Do not rely on a messaging app as a privacy filter.',
  },
  {
    q: 'Do screenshots keep GPS data?',
    a: 'No — a screenshot is a new image of the screen, so it carries no camera EXIF. The trade-off is that you lose resolution and the photo looks like a screenshot, which is rarely what you want for a marketplace listing or a portfolio.',
  },
  {
    q: 'Is posting to Instagram safe?',
    a: 'Instagram strips EXIF from the version it serves publicly, but it receives the original file first, and the app itself can read the location. If the photo matters, strip it before uploading anything.',
  },
  {
    q: 'How accurate is the GPS in a photo?',
    a: 'Typically within 5–20 metres outdoors, and it usually includes altitude and the direction the phone was facing. That is precise enough to identify a single building, and often a specific flat.',
  },
]

export function RemoveLocationPhoto() {
  useSeo({ ...routeMeta('/guides/remove-location-from-photo'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Photos"
      title="How to remove location data from a photo"
      lede="Every photo taken with a phone can carry the exact coordinates where it was shot. Here is how to check, and how to delete that data before you post the photo anywhere."
      updated="25 October 2026"
      toolTo="/tools/metadata-cleaner"
      toolLabel="Strip metadata from a photo"
    >
      <h2>What is actually stored in the photo</h2>
      <p>
        When a phone camera saves a JPEG, it attaches an EXIF block next to the image. That block
        records the camera model, the exposure settings, the timestamp — and, if location access
        was granted, the latitude, longitude and altitude. The data is invisible in every photo
        viewer, which is why people are surprised by it.
      </p>
      <p>
        Two details matter. First, the coordinates are written at the moment of capture, so they
        follow the file when you copy it to a laptop, email it, or upload it. Second, they are
        precise: a typical phone fix is accurate to within about 10 metres, enough to identify a
        building rather than a street.
      </p>

      <h2>Stop new photos from recording a location</h2>
      <h3>iPhone and iPad</h3>
      <ol>
        <li>Open <strong>Settings → Privacy &amp; Security → Location Services</strong>.</li>
        <li>Scroll to <strong>Camera</strong> and set it to <strong>Never</strong>.</li>
        <li>Photos already in your library keep their existing GPS tags — this only affects new shots.</li>
      </ol>

      <h3>Android</h3>
      <ol>
        <li>Open <strong>Settings → Apps → Camera → Permissions → Location</strong>.</li>
        <li>Choose <strong>Don’t allow</strong>.</li>
        <li>On Samsung and Pixel devices, the camera app also has a “Location tags” switch in its own settings — turn that off as well.</li>
      </ol>

      <h2>Delete the location from photos you already have</h2>
      <h3>The reliable way: rewrite the file</h3>
      <p>
        Open the <Link to="/tools/metadata-cleaner">metadata cleaner</Link>, drop the photo in, and
        you will see every tag the file contains — including the coordinates, with a map link so
        you can confirm what is exposed. One click writes a new copy with the EXIF, XMP and IPTC
        blocks removed, and downloads it. The image pixels are untouched: same resolution, same
        colour, same crop. Only the hidden data is gone.
      </p>

      <h3>Windows</h3>
      <ol>
        <li>Right-click the photo → <strong>Properties → Details</strong>.</li>
        <li>Click <strong>Remove Properties and Personal Information</strong>.</li>
        <li>Choose <strong>Create a copy with all possible properties removed</strong>.</li>
      </ol>
      <p>
        This works, but Windows only removes properties it recognises. The cleaner above rewrites
        the whole metadata section, so nothing gets left behind by accident.
      </p>

      <h3>macOS</h3>
      <p>
        Preview shows limited EXIF in <strong>Tools → Show Inspector</strong>, but it cannot delete
        GPS tags. Use the cleaner, or export through Photos with “Include location information”
        unchecked.
      </p>

      <h2>Why screenshots are not a real fix</h2>
      <p>
        A screenshot does drop the metadata, because it is a fresh capture of the screen. It also
        drops half your resolution, bakes in whatever the screen was displaying, and makes the
        photo look amateur. For a flat listing, a marketplace item or a portfolio shot, rewriting
        the metadata keeps the original file quality and removes only the part you did not want to
        share.
      </p>

      <h2>Before you post anywhere</h2>
      <ul>
        <li>
          <strong>Marketplace and rental listings</strong> — the classic mistake: a photo of a
          living room that publishes the address of the flat.
        </li>
        <li>
          <strong>Dating apps</strong> — coordinates can reveal a home or workplace, and the
          timestamp reveals a routine.
        </li>
        <li>
          <strong>Public social accounts</strong> — even when the platform strips EXIF from the
          public copy, the original is uploaded first.
        </li>
        <li>
          <strong>Job applications and portfolios</strong> — harmless, but there is no reason to
          hand over device identifiers.
        </li>
      </ul>

      <div className="notice notice-ok" style={{ marginTop: 22 }}>
        Keep the original somewhere if you might need the capture date or location later. Removing
        metadata is not reversible.
      </div>

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
