import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What is the difference between px and rem?',
    a: 'A pixel (px) is a fixed unit — 1px is always one device pixel (after any scaling). A rem is relative to the root font size of the page, which defaults to 16px in every browser. So 1rem = 16px by default, 2rem = 32px, and so on. The point of rem is that if a user changes their browser font-size setting, everything measured in rem scales with it; px values stay fixed and can become unreadable.',
  },
  {
    q: 'Why does the root font size matter?',
    a: 'Because a rem is defined as the font size of the root element — the <html> tag. If you set html { font-size: 10px } in your stylesheet, then 1rem becomes 10px instead of 16px, and every rem value in your codebase changes proportionally. The converter defaults to 16px (the browser default) but lets you change it so the math matches your actual stylesheet.',
  },
  {
    q: 'Can I convert a whole CSS snippet at once?',
    a: 'Yes. Paste any block of CSS into the batch box and every px value becomes rem and every rem value becomes px, in place. Property names, selectors, comments and numbers without a unit are left exactly as they were. This is the fastest way to convert a component from one unit system to the other without doing each value by hand.',
  },
  {
    q: 'When should I use rem instead of px?',
    a: 'Use rem for font sizes, spacing, padding and margins — anything that should scale when the user changes their browser font size. Use px for things that should stay a fixed size regardless of font settings, like borders, shadows and sometimes icon dimensions. The common modern recommendation is rem for typography and layout, px for thin decorative lines.',
  },
  {
    q: 'Does the converter store the CSS I paste?',
    a: 'No. The snippet you paste lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the CSS is gone — the privacy policy explains in detail.',
  },
]

export function PxToRemGuide() {
  useSeo({
    ...routeMeta('/guides/px-to-rem-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Convert px to rem without a server"
      lede="A rem is just the root font size expressed as a unit. Here is what that means, why the root size is a contract, when to use rem instead of px, how to convert a whole CSS snippet in one pass, and why a style value should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/px-to-rem"
      toolLabel="Open the px to rem converter"
    >
      <h2>rem is a ratio, not a number</h2>
      <p>
        A rem is the font size of the root element, nothing more. With the browser default of
        16px, 1rem = 16px, 2rem = 32px and 0.5rem = 8px. Change the root font size to 10px and
        the same rem values become 10, 20 and 5px. The conversion is always
        <code> rem = px / root </code>
        in one direction and
        <code> px = rem × root </code>
        in the other. There is no rounding trick, no browser-specific behavior — just a ratio
        with the root font size as the denominator.
      </p>
      <p>
        The name "rem" stands for "root em", and it is a deliberate simplification of the older
        "em" unit. An em is relative to the font size of the current element, which compounds
        when elements nest — a 0.5em font inside a 2em element becomes 1em relative to the
        root, and tracking that by hand is error-prone. A rem removes the nesting by always
        referring to the root, so 1.5rem means the same thing everywhere in the stylesheet.
      </p>

      <h2>Why rem exists at all</h2>
      <p>
        Pixels are absolute. A 16px font is always 16 device pixels tall, regardless of what
        the user has set their browser font size to. For users who bump their default font size
        up because they need larger text, a px-based layout does not scale — the text stays
        tiny. rem solves this by tying every measurement to the root font size, so the whole
        layout scales proportionally when the user changes their setting. Accessibility is the
        original reason rem exists, and it is still the best one.
      </p>
      <p>
        The practical effect is that a stylesheet written in rem respects the user's font-size
        preference, while one written in px overrides it. For most content that difference
        matters: body text, headings, spacing and padding should all scale with the user's
        setting. For a few things it does not — a 1px border should stay 1px regardless of
        font size, and a 4px shadow should stay 4px. The line between the two is usually
        obvious once you start thinking about whether the value should look the same for
        everyone or scale with the reader's preference.
      </p>

      <h2>The root font size is a contract</h2>
      <p>
        Once you pick a root font size, every rem value in your codebase depends on it. Change
        it from 16px to 10px and a 1.5rem padding that was 24px becomes 15px. This is powerful
        — it lets you rescale an entire interface by editing one number — but it means the root
        size is a contract between the stylesheet and every component. Break the contract and
        the layout changes everywhere at once, which is either exactly what you want or a
        debugging nightmare depending on whether you meant to do it.
      </p>
      <p>
        The most common choice is to leave the root at the browser default of 16px and write
        all values in rem relative to that. Some teams set the root to 62.5% (which makes 1rem
        = 10px) so the mental math is easier — 1.6rem = 16px, 2.4rem = 24px — but this changes
        the user's default font-size experience and is controversial. The converter defaults to
        16px because that is the browser default and the most common choice, but it lets you
        change it so the math matches your actual stylesheet rather than an assumed default.
      </p>

      <h2>Batch conversion and what it leaves alone</h2>
      <p>
        Pasting a CSS snippet into the batch box converts every px token to rem and every rem
        token to px, in place. Property names, selectors, hex colors, percentages, comments and
        numbers without a unit are left exactly as they were — only values with a px or rem
        unit are touched. This makes it safe to convert a whole component or stylesheet in one
        pass rather than editing each value by hand, and it means the output is valid CSS you
        can paste straight back into your editor.
      </p>
      <p>
        The batch mode is also useful for sanity-checking a conversion. If you have a spacing
        scale defined in px and want to know what it looks like in rem, paste the scale and
        read off the converted values. If you are migrating a legacy stylesheet from px to rem,
        run it through the batch converter and review the output rather than retyping each
        line. The conversion is mechanical; the review is where the design decisions happen.
      </p>

      <h2>When px is still the right answer</h2>
      <p>
        rem is not a replacement for px everywhere. Borders are the classic case: a 1px border
        should stay 1px regardless of the user's font size, because making it thicker would
        change the visual weight of the element. Box shadows are similar — a 4px shadow offset
        is a visual detail, not a text-size decision. Small icon dimensions, stroke widths and
        hairline dividers all belong in px. The rule of thumb is: if the value should scale
        with text, use rem; if it should stay visually constant, use px.
      </p>
      <p>
        There are also cases where neither unit is ideal. Viewport units (vw, vh) scale with
        the window size rather than the font size, which is useful for hero text and full-screen
        layouts. Container queries and container query units add another axis for components
        that should scale with their parent rather than the viewport. rem is the right default
        for most of a stylesheet, but it is one tool among several.
      </p>

      <h2>Why a style value should stay local</h2>
      <p>
        A CSS snippet is not usually secret, but it is still work in progress — a component
        you have not shipped, a spacing scale you are still deciding on, a design system that
        is not public yet. Sending it to a server-side converter means it gets logged, stored
        and possibly analyzed somewhere you cannot see. Even if the converter promises to
        delete it, the promise is hard to verify and the data has already left your control.
      </p>
      <p>
        The local alternative needs none of that. A px-to-rem conversion is a single division,
        and the whole stylesheet converts in a few milliseconds inside the tab without a single
        network request. Load the converter once, switch off the Wi-Fi, and it still converts
        16px to 1rem correctly — because the answer was always going to come from your own
        machine.
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
