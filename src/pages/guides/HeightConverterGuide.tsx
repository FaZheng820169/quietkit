import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'How do you convert centimetres to feet and inches?',
    a: 'One inch is exactly 2.54 centimetres, so divide the centimetre value by 2.54 to get total inches, then split that into feet and inches. For example, 175 cm divided by 2.54 is 68.9 inches, which is 5 feet and 8.9 inches. The calculator does this for you and rounds inches to one decimal place.',
  },
  {
    q: 'How do you convert feet and inches to centimetres?',
    a: 'Multiply the number of feet by 12 and add the remaining inches to get total inches, then multiply by 2.54 to get centimetres. For example, 5 feet 9 inches is 69 inches, and 69 × 2.54 = 175.26 centimetres. The calculator rounds the result to one decimal place.',
  },
  {
    q: 'Why is the conversion factor exactly 2.54?',
    a: 'In 1959 the international yard and pound agreement fixed one inch as exactly 2.54 centimetres, ending a long history of slightly different definitions in different countries. Before that, the inch varied by a tiny amount between the United States and the United Kingdom, which could cause errors in precision work. The 2.54 value is now universal, so conversions are exact rather than approximate.',
  },
  {
    q: 'Can I convert very tall or very short heights?',
    a: 'Yes. The converter handles any positive height, from well below 1 foot to far above 7 feet, because the formula is just multiplication and division. There is no built-in range restriction, and the result is rounded to a sensible number of decimal places. Even extreme values convert correctly.',
  },
  {
    q: 'Does the converter store the height I enter?',
    a: 'No. The height you type lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and the number is gone — the privacy policy explains in detail.',
  },
]

export function HeightConverterGuide() {
  useSeo({
    ...routeMeta('/guides/height-converter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Convert height without a server"
      lede="How the inch-to-centimetre ratio lets you convert between metric and imperial height, why feet and inches are still used, and why your height should never leave your device."
      updated="26 October 2026"
      toolTo="/tools/height-converter"
      toolLabel="Open the height converter"
    >
      <h2>One inch is exactly 2.54 centimetres</h2>
      <p>
        Converting height between metric and imperial is a single multiplication or division,
        because one inch is defined as exactly 2.54 centimetres. To go from centimetres to
        feet and inches, divide the centimetre value by 2.54 to get total inches, then split
        those inches into groups of 12 for the feet and the remainder for the inches. For
        example, 175 cm divided by 2.54 is 68.9 inches, which is 5 feet and 8.9 inches.
      </p>
      <p>
        The reverse is just as simple. Multiply the feet by 12 and add the remaining inches to
        get the total number of inches, then multiply by 2.54. For 5 feet 9 inches that is 69
        inches times 2.54, which is 175.26 centimetres. The relationship is exact because it is
        defined that way — there is no approximation in the conversion factor itself, only in
        how many decimal places you choose to round the answer to.
      </p>

      <h2>Why 2.54 and not some other number</h2>
      <p>
        The inch was not always exactly 2.54 cm. For centuries it had slightly different
        definitions in different countries — the United States used one value, the United
        Kingdom another, and surveyors used a third. These differences were small, often less
        than a hundredth of an inch, but they mattered for precision engineering and land
        surveying. In 1959 the international yard and pound agreement fixed the inch at exactly
        2.54 centimetres everywhere, ending the confusion.
      </p>
      <p>
        The only remaining exception is the US survey foot, which uses a slightly different
        value of about 2.540005 cm per inch for legacy land surveying. This keeps old property
        boundaries consistent with the measurements used when they were originally surveyed.
        For everyday height conversion, though, the 2.54 factor is universal and the result is
        exact.
      </p>

      <h2>Why feet and inches are still used</h2>
      <p>
        Most of the world uses centimetres for height, but the United States still uses feet
        and inches in everyday life, and the United Kingdom uses them informally despite having
        officially adopted metric. This means anyone who travels, watches international media
        or fills out forms across borders needs to convert between the two systems regularly.
        Height is one of the most common conversions people make, which is why a fast,
        reliable converter is useful.
      </p>

      <h2>Rounding and precision</h2>
      <p>
        The conversion factor is exact, but the result usually has more decimal places than are
        useful. A height of 175 cm is 68.8976 inches, which rounds to 5 feet 8.9 inches — the
        extra digits are noise for everyday purposes. The calculator rounds inches to one
        decimal place and centimetres to one decimal place, which is enough precision for
        stating a height and avoids the misleading appearance of accuracy that ten decimal
        places would give.
      </p>

      <h2>Why your height should stay local</h2>
      <p>
        Height is not a secret, but it is still a piece of identifying information. Combined
        with a rough location and a time of day it can help narrow down a specific person, and
        health data of any kind is valuable to insurers, employers and advertisers who would
        pay to know who is tall, short or in between. Server-side height converters log every
        value that passes through them, and that log can be matched to other data later.
      </p>
      <p>
        The local alternative needs none of that. The conversion is a single multiplication or
        division, and the whole calculation finishes inside the tab without a single network
        request. Load the converter once, switch off the Wi-Fi, and it still gives you the
        correct height in the other unit — because the answer was always going to come from
        your own machine. Nothing is sent, nothing is stored, and the Network panel stays
        empty the whole time.
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
