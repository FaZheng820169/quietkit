import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Why does my computer say it cannot open a HEIC file?',
    a: 'HEIC stores images with the HEVC video codec, and HEVC is licensed separately from the JPEG decoder every system ships. Windows needs the HEIF Image Extensions plus the HEVC Video Extensions from the Microsoft Store; many older Android apps and most browsers have no decoder at all. The file is fine — the software is missing a codec.',
  },
  {
    q: 'Does converting HEIC to JPG lose quality?',
    a: 'Slightly, because JPEG is lossy and re-encoding always costs something. QuietKit decodes at near-maximum quality and writes JPEG at 92%, which is visually indistinguishable on a phone screen and at normal print sizes. The practical loss is much smaller than the loss from screenshotting the photo, which also crops it to your screen.',
  },
  {
    q: 'Does the converted JPEG keep the location data?',
    a: 'No. HEIC files carry EXIF, including GPS coordinates, but the browser decoder rebuilds the image pixel by pixel and the encoder writes a fresh JPEG without the original metadata block. That is usually what you want for a photo you are about to post; if you need the metadata kept, use an app that copies EXIF across.',
  },
  {
    q: 'Can I convert a whole folder of HEIC photos at once?',
    a: 'Yes. Drop all of them into the converter, choose JPEG, and download a single ZIP. The decoder is downloaded once per session, so the second file onwards is fast. Batch size is limited by your device memory, not by an upload quota — nothing is transmitted.',
  },
  {
    q: 'How do I stop my iPhone from saving HEIC in the first place?',
    a: 'Settings → Camera → Formats → Most Compatible. New photos are then captured as JPEG. It does not convert the photos you already have, and it makes each photo roughly twice as large on disk, so it is a trade-off rather than a free fix.',
  },
]

export function HeicToJpg() {
  useSeo({ ...routeMeta('/guides/heic-to-jpg'), jsonLd: faqJsonLd(faqs) })

  return (
    <Article
      eyebrow="Guide · Images"
      title="How to convert HEIC to JPG without uploading your photos"
      lede="Every iPhone since 2017 saves photos in a format half the world cannot open. Here is why HEIC exists, where it breaks, and how to convert it — on the phone, on a computer, or in the browser with nothing uploaded."
      updated="October 2026"
      toolTo="/tools/image-converter"
      toolLabel="Open the HEIC converter"
    >
      <h2>What HEIC actually is</h2>
      <p>
        HEIC stands for High Efficiency Image Container. It is the file extension Apple uses for
        images stored in HEIF, an ISO standard (ISO/IEC 23008-12) that wraps still images encoded
        with HEVC — the same compression family as 4K video. Compared with JPEG at matched visual
        quality, HEIC is commonly 40–50% smaller, which is why Apple switched the iPhone camera
        default to it in iOS 11.
      </p>
      <p>
        The catch is licensing and codecs. JPEG decoding is effectively free and built into
        everything. HEVC decoding is not, so support is uneven: Safari and macOS read HEIC
        natively, Windows needs two Store extensions, Chrome, Edge and Firefox generally cannot,
        and older Android apps and web forms often refuse the file outright.
      </p>

      <h2>Where HEIC breaks in practice</h2>
      <ul>
        <li>
          <strong>Upload forms.</strong> Job portals, visa applications and marketplace listings
          frequently accept only JPG or PNG and show a generic "invalid file" error.
        </li>
        <li>
          <strong>Windows PCs.</strong> Without the HEIF and HEVC extensions, Photos shows a blank
          tile and Explorer cannot generate a thumbnail.
        </li>
        <li>
          <strong>Websites and email templates.</strong> Browsers other than Safari cannot render a
          HEIC image at all, so a HEIC attachment is a broken image for most recipients.
        </li>
        <li>
          <strong>Older editing software.</strong> Anything released before roughly 2018 has no
          HEVC decoder and will not import the file.
        </li>
      </ul>

      <h2>Four ways to convert, honestly compared</h2>
      <h3>1. In the browser, without uploading</h3>
      <p>
        Drop the HEIC files into the <Link to="/tools/image-converter">local converter</Link>,
        choose JPEG at 90–92% quality, and download them individually or as one ZIP. The decoder
        runs as WebAssembly inside the tab; the first HEIC file costs a one-off download of about
        1 MB and nothing else is sent anywhere. This is the only method here that works the same
        on Windows, Linux, ChromeOS and an old Mac.
      </p>
      <h3>2. On the iPhone itself</h3>
      <p>
        Open the photo, tap Share, and choose Mail or Messages — iOS silently converts to JPEG for
        those targets. AirDrop does the same when the receiving device is set to "Automatic".
        Saving to the Files app does not convert. To stop future photos being HEIC, go to
        Settings → Camera → Formats → Most Compatible.
      </p>
      <h3>3. On macOS</h3>
      <p>
        Preview opens HEIC directly. Choose <em>File → Export</em>, set the format to JPEG and pick
        a quality. For a folder, select all images, open them together and use{' '}
        <em>File → Export Selected Images</em>. macOS keeps the original, which is what you want.
      </p>
      <h3>4. On Windows</h3>
      <p>
        Install <em>HEIF Image Extensions</em> and <em>HEVC Video Extensions</em> from the Microsoft
        Store, then open the photo in Paint and save as JPEG. This is the slowest route and the
        HEVC extension is a paid item in some regions — the browser method above avoids both
        problems.
      </p>

      <h2>What happens to quality and metadata</h2>
      <p>
        Converting is a re-encode, not a rename. You gain compatibility and you lose a little
        detail, plus the EXIF block: GPS coordinates, camera model and capture time are not copied
        into the new JPEG by the browser route. Treat that as a feature when posting photos
        publicly, and as a limitation when you are archiving.
      </p>
      <p>
        Do not convert by screenshotting. A screenshot is cropped to your screen, downsampled to
        its resolution, and carries a fresh set of "screenshot" metadata — it is the most common
        way people accidentally destroy a photo while trying to make it compatible.
      </p>

      <h2>When to keep HEIC</h2>
      <p>
        If the photo stays inside Apple's ecosystem — iCloud Photos, a Mac, an iPad — HEIC is the
        better format: smaller files, same visual quality, and it can hold depth maps and Live
        Photo data that JPEG has no place for. Convert a copy for the destination that needs it,
        and keep the original untouched.
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
