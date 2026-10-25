import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Do my numbers get uploaded to be converted?',
    a: 'No. Unit conversion is multiplication by a fixed ratio — sometimes the oldest arithmetic a computer does. An inch is 25.4 millimetres by international treaty since 1959, and a pound is 0.45359237 kilograms by the same agreement. There is nothing to look up, so there is nothing to send. The Network panel in your developer tools stays empty while you convert.',
  },
  {
    q: 'Are the conversion factors exact or approximate?',
    a: 'Exact, because the modern definitions are exact. Since the 1959 international yard and pound agreement, one inch is defined as exactly 25.4 mm and one pound as exactly 0.45359237 kg — the imperial units are defined in terms of metric, not measured against it. The same goes for a mile (1,609.344 m) and a foot (304.8 mm). This converter uses those definitional values, not approximations rounded from them.',
  },
  {
    q: 'Why is temperature different from the others?',
    a: 'Because temperature scales do not share a zero. Multiplying by a ratio converts length and weight because 0 mm and 0 inches are the same length — but 0°C and 0°F are different temperatures. Converting between them is an affine operation (multiply, then shift by an offset), which is why -40°F equals -40°C: it is the one point where the two scales cross. Kelvin shares Celsius\'s step size but starts at absolute zero, so °C to K is a pure shift.',
  },
  {
    q: 'What is the difference between MB and MiB?',
    a: 'A megabyte (MB) is exactly one million bytes — the SI prefix, what drive manufacturers print on the box. A mebibyte (MiB) is 2²⁰ bytes, 1,048,576 — the binary quantity operating systems traditionally reported while mislabelling it "MB". The 7% gap between them at gigabyte scale is why a "500 GB" drive shows up as 465 "GB" in an OS that means GiB. This converter lists both families side by side and never confuses them.',
  },
  {
    q: 'Why does the result sometimes show many decimals?',
    a: 'Because the honest answer often is not round. One kilogram is 2.2046226218… pounds, and rounding that to 2.2 loses 0.2% — fine for a recipe, wrong for a shipping manifest. The converter shows up to 12 significant digits with floating-point noise trimmed, so 0.1 + 0.2 displays as 0.3 rather than 0.30000000000000004. Round further yourself if your context needs fewer digits; the exact value is the right starting point.',
  },
]

export function UnitConverterGuide() {
  useSeo({
    ...routeMeta('/guides/unit-conversion-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Convert units without uploading your numbers"
      lede="Unit conversion is the oldest arithmetic a computer does — multiply by a ratio fixed by treaty in 1959. Yet online converters treat every query as data to log: your weight, your room dimensions, the price you're comparing. Here is why the factors are exact rather than approximate, what makes temperature special, and how to keep the whole job on your own machine."
      updated="26 October 2026"
      toolTo="/tools/unit-converter"
      toolLabel="Convert units in your browser"
    >
      <h2>The factors were settled in 1959</h2>
      <p>
        There is a persistent myth that imperial-to-metric conversion is inherently fuzzy — that
        an inch is "about" 25.4 millimetres. The truth is cleaner: since the international yard
        and pound agreement of 1959, the imperial units are <em>defined</em> as exact metric
        quantities. One inch is exactly 25.4 mm. One pound is exactly 0.45359237 kg. One mile is
        exactly 1,609.344 m. The definitions were chosen to end ambiguity, and they did.
      </p>
      <p>
        The practical consequence is that a converter using "2.2 pounds per kilo" is not
        simplifying the definition — it is departing from it by 0.2%. For a recipe that hardly
        matters; for a shipping manifest priced by the kilo it matters directly. The converter on
        this site multiplies by the definitional values and shows up to twelve significant
        digits, trimming floating-point noise so 0.1 + 0.2 displays as 0.3 rather than
        0.30000000000000004. If your context needs fewer digits, round from the exact value —
        never the reverse.
      </p>

      <h2>Temperature refuses to behave</h2>
      <p>
        Every other common conversion is a ratio: 0 mm and 0 inches are the same length, 0 g and
        0 oz are the same mass, so converting is a single multiplication. Temperature breaks the
        pattern because the scales disagree about zero. 0°C is freezing; 0°F is considerably
        colder. Converting between them is multiply-then-shift — an affine operation, not a
        ratio.
      </p>
      <p>
        The affine shape answers the classic trivia question on its own: −40°F equals −40°C
        because −40 is the unique point where the two lines cross. And Kelvin, the scientist's
        scale, keeps Celsius's step size but starts at absolute zero, so °C to K is a pure shift
        of 273.15 with no multiplication at all. One category, three different shapes of formula —
        a converter that treats temperature as just another ratio gets it wrong at every point
        except −40.
      </p>

      <h2>The MB and MiB schism</h2>
      <p>
        Buy a "500 GB" drive and the operating system reports 465 "GB". Nothing is missing — the
        two sides are speaking different units. Drive manufacturers sell decimal gigabytes: 10⁹
        bytes, the SI definition, the honest marketing number. Operating systems traditionally
        report binary gibibytes: 2³⁰ bytes, because memory and file systems think in powers of
        two. The gap is 7.4%, and the OS's habit of labelling GiB as "GB" turned a unit
        difference into a consumer complaint.
      </p>
      <p>
        The IEC standardised distinct names for the binary family in 1998 — KiB, MiB, GiB — so
        the two could never be confused again. The industry mostly ignored it. A converter that
        lists only "KB, MB, GB" while quietly using binary factors repeats the original sin. This
        one lists both families side by side, labels each with its true base (10³ or 2¹⁰), and
        converts between them exactly.
      </p>

      <h2>What an online converter logs</h2>
      <p>
        A conversion query looks harmless — "72 kg in lb". But queries accumulate into a profile:
        someone converting their weight is tracking it; someone converting 12 feet to metres is
        measuring a room; someone converting 49,900 dollars' worth of units at an exchange
        boundary is pricing something. None of this is sensitive in isolation, and all of it is
        unnecessary to disclose, because the answer requires no data centre. Multiplication by a
        constant is the cheapest operation a processor performs.
      </p>
      <p>
        The converter on this site runs entirely in the tab. Load the page, switch off the
        network, and it keeps converting — the strongest privacy guarantee is the one you can
        verify yourself by watching the Network panel stay empty.
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
