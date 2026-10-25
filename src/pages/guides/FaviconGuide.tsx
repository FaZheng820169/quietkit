import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Do I still need a .ico file?',
    a: 'Yes, for the widest compatibility. Internet Explorer and some RSS readers only look for /favicon.ico, and Windows uses the multi-resolution .ico when a site is pinned. Modern browsers prefer the PNG files and the web manifest, but the .ico inside this package keeps the old clients happy.',
  },
  {
    q: 'Why does the package include six different sizes?',
    a: 'Each consumer asks for a different square. Browsers use 16×16 and 32×32 in tabs and bookmarks. iOS uses 180×180 for the home screen. Android Chrome uses 192×192 and 512×512 for the app drawer and splash screen. One source image can cover them all — you only upload once.',
  },
  {
    q: 'Can I use an SVG logo as the source?',
    a: 'Yes. Drop an SVG, PNG, JPG or WebP file and the browser rasterises it to each size. SVG is ideal because it stays sharp at every resolution, but a 512×512 PNG also works perfectly.',
  },
  {
    q: 'Where do I put the files after downloading?',
    a: 'Unzip the package into the root of your website — the same folder as index.html. Reference them with a few link tags: <link rel="icon" href="/favicon.ico" sizes="any">, <link rel="icon" href="/favicon-32x32.png" type="image/png">, <link rel="apple-touch-icon" href="/apple-touch-icon.png">, and <link rel="manifest" href="/site.webmanifest">.',
  },
  {
    q: 'Is the image uploaded to generate the icons?',
    a: 'No. The source image is decoded by the browser, resized on a canvas at each target size, and packed into a ZIP entirely in memory. Open the Network panel and drop the file — nothing is sent anywhere.',
  },
]

export function FaviconGuide() {
  useSeo({
    ...routeMeta('/guides/favicon-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Images"
      title="Favicons without uploading your logo"
      lede="A favicon is seven files in four formats, and most online generators want you to upload your logo to their server. Here is what each file does, why the set matters, and how to build it locally from one image."
      updated="26 October 2026"
      toolTo="/tools/favicon"
      toolLabel="Build the favicon set in your browser"
    >
      <h2>What a modern favicon actually is</h2>
      <p>
        The little image next to your tab title is not a single file any more. Browsers, operating
        systems and mobile platforms each ask for a different size and format. Windows and Internet
        Explorer still look for a .ico file. Safari on iOS wants a 180×180 PNG called
        apple-touch-icon.png. Android Chrome wants 192×192 and 512×512 PNGs, and it reads a JSON
        manifest to know how to display the site on the home screen. Modern desktop browsers prefer
        PNGs at 16×16 and 32×32. One source logo, seven files, four formats.
      </p>

      <h2>Why a server-side generator is a bad idea</h2>
      <p>
        Your logo is often your brand before you launch. Dropping it into a remote converter means
        it travels to someone else's server, gets stored in their logs, and may be processed by a
        service that reuses uploaded images for training or watermarking. There is no technical
        reason a favicon needs a server: resizing a square image is what a browser canvas does in a
        few milliseconds. The only reason generators are online is to show you ads while they do it.
      </p>
      <p>
        A local generator keeps the logo in the browser tab. The image is decoded, drawn onto
        several canvases at different sizes, and packed into a ZIP. The Network panel shows no
        outbound request — not even a fetch for a script — because the processing code ships with
        the page.
      </p>

      <h2>What each file in the package does</h2>
      <ul>
        <li><strong>favicon.ico</strong> — Multi-resolution container with 16, 32 and 48 px versions. Internet Explorer and older Windows use it. The .ico is still requested by some RSS readers and bookmark importers.</li>
        <li><strong>favicon-16x16.png and 32x32.png</strong> — Modern browser tabs and bookmarks. The 32 px version is displayed on retina screens and in Windows taskbar previews.</li>
        <li><strong>apple-touch-icon.png (180×180)</strong> — iOS Safari uses this when a user adds the site to the home screen. It also appears in some shared-link previews on macOS.</li>
        <li><strong>android-chrome-192x192.png and 512x512.png</strong> — Android Chrome uses the 192 px icon for the app drawer and the 512 px icon for the splash screen. Both are declared in the manifest.</li>
        <li><strong>site.webmanifest</strong> — A JSON file that tells Android Chrome the display mode (standalone or browser), the background colour and the theme colour. You edit the name fields after downloading.</li>
      </ul>

      <h2>SVG is the ideal source</h2>
      <p>
        If your logo exists as an SVG, use it. SVG is resolution-independent — the browser
        rasterises it at exactly 16 px, 32 px, 180 px and every other size without interpolation
        blur. A 512×512 PNG is the next best thing; anything smaller will soften on high-density
        screens because the up-scaler invents pixels that were not in the original.
      </p>

      <h2>How to install the package</h2>
      <p>
        Unzip the download into the root directory of your website — the same folder that contains
        index.html. Then add four link tags to the &lt;head&gt; of every page. The order matters:
        browsers read from top to bottom and pick the first icon they understand, so declare the
        PNG first and the .ico as a fallback with sizes="any".
      </p>

      <h2>Testing that it worked</h2>
      <p>
        After uploading, open your site in a private tab and watch the Network panel. You should
        see requests for favicon-32x32.png and apple-touch-icon.png. The .ico is only fetched by
        browsers that do not recognise the PNG link. On Android, open Chrome, tap the menu, and
        choose "Add to Home screen" — if the manifest is correct, you will see your icon and site
        name in the prompt.
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
