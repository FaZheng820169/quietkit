import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What is an aspect ratio?',
    a: "It is the relationship between an image or screen's width and its height, written as width:height. A 16:9 ratio means the width is 16 units for every 9 units of height — the shape of a modern TV. The actual pixels do not matter to the ratio; 1920x1080, 1280x720 and 3840x2160 are all 16:9 because they divide down to the same pair.",
  },
  {
    q: 'Why is 16:9 the default for everything?',
    a: 'Because it was the compromise that won. Early televisions were 4:3; early cinema was wider. When HDTV was standardised in the 1980s, engineers picked 16:9 as the geometric mean of 4:3 and the common cinema ratios — wide enough to show films without huge black bars, narrow enough that 4:3 content did not look tiny. Every screen since then inherited it, and the web followed the screens.',
  },
  {
    q: 'What is the difference between fit and fill?',
    a: 'Fit (also called contain) makes the whole content visible inside the box, leaving empty space if the ratios differ. Fill (also called cover) makes the content cover the whole box, cropping whatever spills outside. A 16:9 photo into a 1:1 social post: fit shows the whole photo with bars top and bottom; fill fills the square and crops the sides. Which one you want depends on whether cropping or empty space is the smaller evil.',
  },
  {
    q: 'Does the calculator handle portrait ratios?',
    a: 'Yes. A ratio is just width:height, so 9:16 is portrait and 16:9 is landscape — the same numbers, swapped. This calculator does not care which way round they are; it solves for the missing dimension either way and reports whether the result is landscape, portrait or square.',
  },
  {
    q: 'How do I resize without stretching?',
    a: 'Never change width and height independently — that distorts the image. Always lock the ratio and change one dimension, letting the calculator give you the other. Scaling by a factor (half, double) does the same thing: both dimensions move together, so the shape stays the same and nothing stretches.',
  },
]

export function AspectRatioGuide() {
  useSeo({
    ...routeMeta('/guides/aspect-ratio-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Design"
      title="Calculate aspect ratios without a server"
      lede="An aspect ratio is just width divided by height — and yet people upload screenshots to calculators to get it. Here is what the ratio actually means, why 16:9 won the screen, how fit and fill differ, and how to solve any width-height pair on your own machine."
      updated="26 October 2026"
      toolTo="/tools/aspect-ratio"
      toolLabel="Calculate aspect ratios in your browser"
    >
      <h2>A ratio is a fraction with a colon</h2>
      <p>
        An aspect ratio is width divided by height. That is the whole idea. 1920 ÷ 1080 = 1.777…,
        and 16 ÷ 9 = 1.777…, so 1920x1080 and 16:9 are the same shape. Reducing a pixel size to its
        ratio is just dividing both numbers by their greatest common divisor — 1920 and 1080 share
        a factor of 120, so divide both by 120 and you get 16:9.
      </p>
      <p>
        The pixel count is irrelevant to the shape. A phone photo at 1080x1920 and a 4K cinema frame
        at 4096x2160 are both 16:9, because they reduce to the same pair. The ratio describes the
        rectangle, not its size — which is why you can talk about a 16:9 screen without saying how
        big it is and still be perfectly understood.
      </p>

      <h2>How 16:9 became the default rectangle</h2>
      <p>
        16:9 was not the most beautiful ratio; it was the most diplomatic. When HDTV was being
        standardised in the 1980s, broadcast television was 4:3 and cinema was wider. The committee
        picked 16:9 as the geometric mean of 4:3 and the common cinema ratios — wide enough that
        films lost little to letterboxing, narrow enough that old 4:3 content did not look absurdly
        small. It was the ratio that offended the fewest people, and that is how compromises win.
      </p>
      <p>
        Every screen, monitor and laptop since then inherited the decision, and the web inherited
        the screens. You still see 4:3 in square-ish social posts, 9:16 in vertical video, and 21:9
        on ultrawide monitors, but the default rectangle of the internet — the one your laptop,
        your TV and your streaming box all assume — is 16:9.
      </p>

      <h2>Fit and fill, the two ways to put one rectangle in another</h2>
      <p>
        Fit (also called contain) scales the content until the whole thing fits inside the box,
        leaving empty space wherever the ratios do not match. Fill (also called cover) scales until
        the box is completely covered, cropping whatever spills outside. A 16:9 photo into a 1:1
        Instagram post: fit shows the whole photo with white bars top and bottom; fill fills the
        square and crops the left and right edges.
      </p>
      <p>
        Neither is correct in the abstract. You choose based on whether cropping or empty space is
        the smaller evil for that image in that place. A product photo with the subject dead centre
        can usually be filled without losing anything important. A group photo where faces sit near
        the edges almost always needs to be fit. The calculator gives you both numbers so you can
        decide with the real image in front of you.
      </p>

      <h2>Resizing without stretching</h2>
      <p>
        The one mistake that always shows. Change a 16:9 image's width without touching its height
        and the result stretches — circles become ovals, faces look wrong, text distorts. To resize
        without distortion, change one dimension and solve the other from the ratio, or scale both
        dimensions by the same factor. Both operations keep the fraction width/height constant, so
        the shape stays the same and nothing stretches.
      </p>
      <p>
        The diagonal is useful here: it is the single number that captures how big the rectangle
        actually is, independent of its shape. Two images can have the same diagonal and different
        ratios, or the same ratio and different diagonals — checking the diagonal before and after
        a resize tells you whether the resize actually changed the size or just the shape.
      </p>

      <h2>Why this stays on your machine</h2>
      <p>
        An aspect ratio is two numbers divided. There is no image to upload, no lookup table to
        consult, nothing a server could add except latency and a log of which ratios you are
        working on. The calculator on this site does the division in the tab you are looking at —
        load it, pull the network cable, and it still reduces 1920x1080 to 16:9 without noticing
        anything changed.
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
