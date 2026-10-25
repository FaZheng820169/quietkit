import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Do QR codes track the people who scan them?',
    a: 'A static QR code cannot track anyone — the destination is stored in the pattern, and the phone opens it directly. Tracking enters through dynamic codes, where the pattern points to the vendor’s server and that server logs every scan before redirecting. If a generator asks you to create an account before downloading, assume the code routes through them.',
  },
  {
    q: 'Why did my printed QR code stop working?',
    a: 'Almost always one of three causes: the code was dynamic and the service behind it ended or paywalled your link; the URL it encodes changed or died; or the physical print degraded — sun-faded ink, a peeling sticker, a scuffed laminate. A static code pointing at a URL you control fails only when the URL itself does.',
  },
  {
    q: 'Is it safe to scan QR codes from strangers?',
    a: 'Treat a QR code like a shortened link: you cannot see the destination until you scan. Most phones now show the URL before opening it — read it. Be wary of codes stuck over legitimate signage (a classic parking-meter scam), and never enter payment details on a page a random code opened.',
  },
  {
    q: 'Can I put a logo in the middle of my QR code?',
    a: 'Yes, if the code uses High (30%) error correction and the logo covers no more than about a quarter of the area, centred. Keep the logo simple, keep it off the three corner finder squares, and test with several phones before printing. The redundancy is doing the work — do not combine a big logo with a low correction level.',
  },
  {
    q: 'What is the minimum size to print a QR code?',
    a: 'The working rule is 2 × 2 cm for something held in the hand, growing roughly one centimetre of width per metre of scanning distance — a poster read from three metres wants a code around 5 cm wide. Short payloads print smaller because their patterns are coarser; dense codes need more room for the phone to resolve the modules.',
  },
]

export function QrCodeGuide() {
  useSeo({
    ...routeMeta('/guides/qr-code-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Make a QR code that doesn't track people — or expire"
      lede="The free QR generator you found on a search engine probably does not give you your code. It gives you its code, pointing at your link — a redirect that logs every scan and dies when the free trial does. Here is how QR codes actually work, where the traps are, and how to make one that answers to nobody."
      updated="26 October 2026"
      toolTo="/tools/qr-code"
      toolLabel="Generate a QR code in your browser"
    >
      <h2>Your code, or theirs?</h2>
      <p>
        A QR code is just text turned into squares. If the text is{' '}
        <code>https://your-site.com/menu</code>, any phone that scans the pattern reads those exact
        characters and opens them. There is no server in the middle because there is nothing for a
        server to do. This is a <strong>static</strong> code, and it is what the QR standard was
        designed to produce.
      </p>
      <p>
        The trouble is that static codes make a poor business. So most “free QR generator” sites
        quietly do something else: they encode <em>their own</em> short URL —{' '}
        <code>qr.vendor.com/x7f2</code> — which redirects to yours. They call it a{' '}
        <strong>dynamic</strong> code and sell it as a feature: editable destinations, scan
        analytics, dashboards. What it means in practice is that every person who scans your poster
        first tells the vendor who they are, where they are, and when they scanned. And the day the
        subscription lapses, the redirect stops and your printed codes become decoration.
      </p>
      <p>
        You can spot the arrangement before you print: if the site wants an account before it will
        let you download, if the download is labelled “dynamic”, or if scanning a test code briefly
        shows a domain you do not own, the code is not really yours.
      </p>

      <h2>Why a generator should be local</h2>
      <p>
        Generating a QR code is pure arithmetic — Reed–Solomon error correction over your bytes,
        laid out in a grid. It needs no database, no account and no network. Which raises a fair
        question of any site that asks for all three: what exactly is the upload for? In the worst
        cases the payload itself is the harvest. People encode Wi-Fi passwords, private Google
        Drive links, unlisted event pages, phone numbers. Typed into a server-side generator, all of
        it lands in someone else's logs.
      </p>
      <p>
        A local generator keeps the whole job in the tab. QuietKit encodes the pattern with an
        open-source library running on your device; the Network panel stays empty while you type;
        the downloaded PNG or SVG is assembled in memory. You can pull the network cable and the
        page keeps working — the surest test that nothing is being sent anywhere.
      </p>

      <h2>Error correction is a printing decision</h2>
      <p>
        Every QR code carries redundant data — between 7% and 30% depending on the level — so the
        pattern survives damage. This is not an abstract setting; it is a decision about where the
        code will live. A code that only appears on screens can use Low: screens do not scratch.
        A code printed on a café table, a product box or a conference badge will be scuffed,
        splashed and photographed at an angle, and that is what Medium and Quartile are for. High —
        the 30% level — is what makes the designer's trick of dropping a logo in the centre
        possible: the logo is damage, and the redundancy absorbs it.
      </p>
      <p>
        The cost is density. Higher correction packs the same text into more modules, which means
        smaller squares at the same printed size, which means an older phone struggles from across
        the counter. When a code looks uncomfortably dense, the right fix is almost always a
        shorter payload — link to a page that says the rest — rather than a lower correction level.
      </p>

      <h2>The quiet zone is part of the code</h2>
      <p>
        The blank margin around the pattern is not wasted paper; scanners use it to find where the
        code ends and the world begins. The standard asks for four modules of quiet zone on every
        side. Codes fail in the wild mostly because a layout designer cropped the margin to make
        the code “fit nicely”, or printed it edge-to-edge on a textured background. The generator
        here includes the quiet zone in every download — leave it in place when you paste the
        image into a design.
      </p>

      <h2>Size, distance, and the two-metre rule</h2>
      <p>
        A phone camera resolves a QR module at roughly a fixed angle, so the math is simple: a
        hand-held card works at 2&nbsp;cm wide, and you add about a centimetre of width for every
        extra metre of scanning distance. A poster read from three metres wants a 5&nbsp;cm code; a
        banner across a hall wants 10&nbsp;cm or more, plus a short payload to keep the modules
        coarse. Always test the printed artefact with the oldest phone likely to scan it — a code
        that your flagship resolves instantly can be mush to a five-year-old camera.
      </p>

      <h2>A workflow that keeps you independent</h2>
      <ul>
        <li>Encode a URL you control — your own domain, not a link-in-bio you might leave.</li>
        <li>Pick Medium correction for screens, High for print or anything with a logo.</li>
        <li>Download SVG for print (it scales to a billboard without softening) and PNG for screens.</li>
        <li>Test from paper, at the real distance, with a mid-range phone — then order the five hundred stickers.</li>
      </ul>
      <p>
        Do that and the code is yours in the way a printed sentence is yours: no account, no
        analytics you never asked for, no expiry date quietly set by a company you have never met.
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
