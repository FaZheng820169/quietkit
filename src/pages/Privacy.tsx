import { routeMeta, useSeo } from '../lib/seo'

export function Privacy() {
  useSeo(routeMeta('/privacy'))

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Privacy</span>
          <h1>The short privacy policy</h1>
          <p>
            QuietKit has no file server. This page explains exactly what leaves your device — and
            what does not.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <p className="muted small mono">Last updated: 25 October 2026</p>

          <h2>1. Your files stay on your device</h2>
          <p>
            QuietKit tools read files with browser APIs (<code>FileReader</code>, Canvas,
            WebAssembly) and write the result straight to your downloads folder. There is no
            upload endpoint, no processing queue and no storage bucket containing user files.
            Closing or reloading the tab releases the files from memory.
          </p>

          <h2>2. What we do not collect</h2>
          <ul>
            <li>File contents, file names, or file sizes.</li>
            <li>Accounts, email addresses or payment details (no account exists).</li>
            <li>Precise location, contacts, or device identifiers.</li>
            <li>Behavioural advertising profiles derived from your files.</li>
          </ul>

          <h2>3. What is measured</h2>
          <p>
            We use a privacy-friendly analytics script that records aggregate page views (page
            path, referrer domain, country and device type). It does not use cookies, does not
            fingerprint your browser, and cannot identify you. This data is used to decide which
            tools to build next.
          </p>

          <h2>4. Advertising</h2>
          <p>
            QuietKit may display advertising to cover hosting costs. Ad slots, when enabled, are
            served by Google AdSense, which is governed by Google’s own privacy policy and may use
            cookies for frequency capping. Ads never receive your files, because the files never
            leave your browser.
          </p>

          <h2>5. Local storage</h2>
          <p>
            Preferences such as your last chosen image quality are stored in your browser’s local
            storage. Clearing site data removes them. No preference is ever sent to us.
          </p>

          <h2>6. Third parties</h2>
          <p>
            The site is served as static files from a content delivery network. Like any web
            request, the CDN sees your IP address and user agent in order to deliver the page.
            That is the full extent of third-party involvement in file processing: none.
          </p>

          <h2>7. Contact</h2>
          <p>
            Questions about this policy can be sent to the address listed on the{' '}
            <a href="../about">about page</a>.
          </p>
        </div>
      </section>
    </>
  )
}
