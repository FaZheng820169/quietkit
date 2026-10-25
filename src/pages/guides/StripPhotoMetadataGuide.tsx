import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does removing metadata change the photo itself?',
    a: 'No. Metadata lives in labelled blocks next to the compressed image data. Stripping removes those blocks and leaves the pixels untouched — colours, sharpness and quality are identical, and the orientation tag is kept so portrait photos still display upright. The file usually shrinks by a few tens of kilobytes, which is the metadata leaving.',
  },
  {
    q: 'Don’t messaging apps and social sites strip metadata for me?',
    a: 'The big ones do — WhatsApp, Instagram and X re-encode uploads and drop EXIF. But marketplaces, forums, email attachments, cloud links and self-hosted galleries often serve the original file untouched. The question is not whether one platform strips, but whether every route the photo might take does. Cleaning the file itself works everywhere.',
  },
  {
    q: 'Is a screenshot a good enough privacy fix?',
    a: 'A screenshot drops most EXIF data, but it also drops resolution, keeps your screen size and status bar, and looks like a screenshot. Some phones even write new metadata into the screenshot. Stripping the original keeps full quality and removes the identifying fields at the same time.',
  },
  {
    q: 'Can stripped metadata be recovered from the cleaned file?',
    a: 'No — the EXIF and XMP segments are gone from the new file, not hidden. That is the point, and also the warning: keep the original if you might later need the timestamp or camera settings, for instance for insurance or copyright proof.',
  },
  {
    q: 'How do I know a cleaning tool is not uploading my photos?',
    a: 'Watch it work. Open the browser’s Network panel, drop a photo in, and strip it: an upload would appear as a POST carrying the file. A local tool shows no such request, and once loaded it keeps working with the network switched off — the strongest proof available.',
  },
]

export function StripPhotoMetadataGuide() {
  useSeo({
    ...routeMeta('/guides/remove-exif-metadata-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Metadata"
      title="Remove EXIF metadata from photos without uploading them"
      lede="A photo posted to sell a bike can carry the GPS coordinates of the garage it was taken in. The fix is a file-level clean — and it is one of the few privacy jobs a browser tab can do better than any app."
      updated="26 October 2026"
      toolTo="/tools/metadata-cleaner"
      toolLabel="Inspect and strip photo metadata"
    >
      <h2>The photo is not the whole file</h2>
      <p>
        A JPEG is a sequence of labelled segments. One set holds the compressed image; the others
        hold whatever the camera or editor wanted to remember. That second group is invisible when
        you look at the picture, but it travels with the file everywhere — every upload, every
        email attachment, every marketplace listing.
      </p>
      <p>
        Reading it before sending is the habit that matters. Most people have never seen what
        their own photos carry, and the first inspection is usually a surprise: dozens of fields,
        written automatically, attached to a picture that was only meant to show a bike.
      </p>

      <h2>The fields that actually expose you</h2>
      <p>
        <strong>GPS coordinates</strong> are the dangerous one. With location services on, every
        photo records latitude and longitude, often accurate to a few metres — a photo of your
        living room is a photo of your address. Altitude and the direction the lens faced come
        along for free.
      </p>
      <p>
        The rest identify you more quietly. The <strong>device model and serial number</strong>{' '}
        link photos from the same phone across different accounts and platforms. Second-level{' '}
        <strong>timestamps</strong> reveal your routine. <strong>Software tags</strong> show which
        editor touched the file. And the <strong>embedded thumbnail</strong> — a small preview
        stored inside the file — can survive a crop: crop a face out in an editor that forgets
        the thumbnail, and the original face is still inside the file.
      </p>

      <h2>Why the usual fixes fall short</h2>
      <p>
        Screenshots drop metadata but also resolution, and announce themselves. Messaging apps
        strip on upload, but only on their own pipeline — the same photo sent by email or listed
        on a marketplace keeps everything. Phone settings can stop recording location from now on,
        which does nothing for the ten thousand photos already in the library.
      </p>
      <p>
        Cleaning the file itself is the only fix that works for every photo down every route:
        the identifying blocks are removed from the bytes, so there is nothing left for any
        recipient to read, whichever platform carries it.
      </p>

      <h2>Folder scale, not photo scale</h2>
      <p>
        The real cleaning jobs are bulk ones — a resale listing with forty photos, a flat rental,
        a photo library leaving an old phone. One-at-a-time tools turn that into an afternoon. A
        local tool can take the whole folder, subfolders included, inspect every JPEG and PNG,
        flag which ones carry GPS coordinates, and hand back cleaned copies as a single ZIP.
      </p>
      <p>
        Doing it locally is what makes bulk cleaning practical at all: no upload queue, no
        twenty-file daily limit, no account, and no copy of the family photo archive on a
        stranger's server — which would defeat the purpose of the exercise.
      </p>

      <h2>Cleaning photos locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/metadata-cleaner">metadata cleaner</Link> and drop the photos
          in — or pick the whole folder.
        </li>
        <li>
          Read the inspection first: field counts, and a clear flag on every file that contains
          GPS coordinates. With one file you can browse every field, and see the coordinates on a
          map.
        </li>
        <li>
          Strip. The EXIF, XMP and IPTC blocks are removed; pixels and orientation are left
          alone, and cleaned files keep their names with a <code>-clean</code> suffix so
          originals stay untouched.
        </li>
        <li>
          Download individually or as a ZIP, and check the before-and-after sizes — the bytes
          that left are the metadata that left.
        </li>
      </ol>

      <h2>What stripping cannot do</h2>
      <ul>
        <li>
          <strong>Hide what the pixels show.</strong> A street sign, a face, a document on the
          desk — metadata removal does nothing about visible content.
        </li>
        <li>
          <strong>Fix copies already posted.</strong> Cleaning the local file does not reach the
          version uploaded last year; that one has to be replaced at the source.
        </li>
        <li>
          <strong>Clean HEIC directly.</strong> Convert it to JPEG first — the{' '}
          <Link to="/tools/image-converter">converter</Link> does that locally — then strip.
        </li>
        <li>
          <strong>Replace judgement about where to post.</strong> A clean photo on a public
          profile is still public.
        </li>
      </ul>
      <p>
        The neighbouring jobs are local too: <Link to="/tools/image-compressor">compress</Link>{' '}
        the cleaned photos before uploading them anywhere, or read the{' '}
        <Link to="/guides/exif-viewer">field-by-field guide to EXIF data</Link> to understand what
        each tag means before you strip it.
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
