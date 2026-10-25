import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What is the difference between HEX, RGB and HSL?',
    a: 'HEX and RGB describe the same thing — red, green and blue channels from 0 to 255 — just written differently. HSL (hue, saturation, lightness) is a more human way to think about colour: hue is the position on the colour wheel, saturation is intensity, and lightness is how close to white or black it sits. Designers often pick in HSL and export in HEX for CSS.',
  },
  {
    q: 'Why does the same colour look different on my phone and laptop?',
    a: 'Different screens have different colour gamuts (sRGB, Display P3, etc.) and calibration. A colour converter gives you the same numbers everywhere, but the display hardware decides how those numbers actually look. For critical work, test on the target device.',
  },
  {
    q: 'What is a contrast ratio and why does 4.5:1 matter?',
    a: 'Contrast ratio measures the luminance difference between text and its background. WCAG AA requires 4.5:1 for normal text and 3:1 for large text; AAA requires 7:1. A ratio below 4.5:1 fails accessibility guidelines and can be unreadable for users with low vision.',
  },
  {
    q: 'What are complementary, analogous and triadic colours?',
    a: 'Complementary sits directly opposite on the colour wheel (180°) — high contrast, energetic. Analogous sits ±30° — harmonious, calm. Triadic splits the wheel into three (120° apart) — balanced but vibrant. These are starting points for building a palette, not strict rules.',
  },
  {
    q: 'Is my colour data uploaded when I use this tool?',
    a: 'No. All conversion maths runs in JavaScript inside this tab. The colour you type never leaves your device, which matters when you are working with unreleased brand colours.',
  },
]

export function ColorConverterGuide() {
  useSeo({
    ...routeMeta('/guides/color-converter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Design"
      title="Convert colours without uploading your brand palette"
      lede="HEX, RGB and HSL are three dialects of the same language. Here is what each one is for, why contrast ratios matter more than taste, and how to convert without sending your unreleased brand colours to a server."
      updated="26 October 2026"
      toolTo="/tools/color-converter"
      toolLabel="Convert a colour in your browser"
    >
      <h2>Three formats, one idea</h2>
      <p>
        Every colour on a screen is made of red, green and blue light. HEX and RGB are two ways to
        write the same recipe: HEX compresses three 0–255 numbers into six characters (#4f7cff),
        while RGB spells them out (rgb(79, 124, 255)). They are interchangeable — one is shorthand
        for the other.
      </p>
      <p>
        HSL is different. Instead of describing how much light to emit, it describes how the colour
        feels: where it sits on the colour wheel (hue), how vivid it is (saturation), and how close
        to white or black it is (lightness). This is how designers actually think. You pick a hue
        of 220°, decide on 80% saturation, and set lightness to 60% — then convert to HEX for the
        stylesheet.
      </p>

      <h2>Why the upload is a problem</h2>
      <p>
        Most online colour converters ask you to type or paste your colour, which is harmless. But
        some ask you to upload an image to extract its palette. That image — often a logo, a brand
        guide, or an unreleased product photo — goes to a server. A local converter keeps the file
        in the browser tab: the image is decoded by the browser, the pixels are sampled, and the
        numbers never leave your device.
      </p>

      <h2>Contrast ratio: the number that matters</h2>
      <p>
        A colour can be beautiful and still fail. WCAG accessibility guidelines require a minimum
        contrast ratio of 4.5:1 for normal text and 3:1 for large text. The ratio compares the
        luminance of the text colour against the luminance of the background. Pure black on pure
        white is 21:1. Light grey on white is often 2:1 — which fails.
      </p>
      <p>
        The converter shows the contrast ratio of your colour against both white and black. If you
        are designing text on a coloured background, convert both colours and check the ratio
        between them — not just against white or black.
      </p>

      <h2>Building a palette from one colour</h2>
      <ul>
        <li><strong>Complementary</strong> — the colour directly opposite on the wheel. High contrast, energetic, good for calls to action.</li>
        <li><strong>Analogous</strong> — the colours ±30° away. Harmonious, calm, good for backgrounds and secondary elements.</li>
        <li><strong>Triadic</strong> — three colours 120° apart. Balanced but vibrant, good for charts and data visualisation.</li>
      </ul>
      <p>
        These are starting points, not rules. A palette that passes contrast checks and feels right
        for the brand is better than a theoretically perfect wheel that nobody can read.
      </p>

      <h2>Practical workflow</h2>
      <p>
        Pick a base colour in HSL — it is easier to reason about. Check the contrast ratio. If it
        fails, adjust lightness until it passes. Convert to HEX for CSS, or keep the RGB values for
        canvas work. When the palette is ready, export the colours as a favicon set or a social
        media image using the other tools on this site. If you are documenting the brand for a
        team, write down the HEX values alongside the contrast ratios so developers do not have to
        reverse-engineer them from a screenshot. A shared palette file — even a simple text file
        with one colour per line — prevents the drift that happens when everyone picks their own
        version of "the blue".
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
