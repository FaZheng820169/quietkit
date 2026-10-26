import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'How do you convert between number bases?',
    a: 'To convert from any base to decimal, multiply each digit by the base raised to the power of its position from the right and add them up. For example, the binary number 1011 is 1×8 + 0×4 + 1×2 + 1×1 = 11. To go from decimal to another base, divide repeatedly by the target base and read the remainders from last to first. The converter does this for you and updates all four bases at once.',
  },
  {
    q: 'Why are there different number bases?',
    a: 'Each base suits a different purpose. Decimal (base 10) is what humans use every day, probably because we have ten fingers. Binary (base 2) is what computers use because electronic circuits have two states, on and off. Hexadecimal (base 16) is a compact way to write binary, since one hex digit equals four binary digits. Octal (base 8) groups binary in threes and is still used in some Unix file permissions.',
  },
  {
    q: 'What is the largest number I can convert?',
    a: 'JavaScript handles integers up to 2^53 - 1 exactly, which is about 9 quadrillion. In practice you can convert any number you are likely to need for programming or study. Very large numbers may lose precision beyond that point, but for binary, hex and octal values you would type by hand the result is always exact.',
  },
  {
    q: 'Does the letter case matter for hexadecimal?',
    a: 'No. Hex digits A through F can be uppercase or lowercase — the calculator accepts both and always displays uppercase. So "ff" and "FF" both mean 255. Binary uses only 0 and 1, octal uses 0 through 7, and decimal uses 0 through 9, so case only matters for hex.',
  },
  {
    q: 'Does the converter store what I type?',
    a: 'No. The number you type lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and it is gone — the privacy policy explains in detail.',
  },
]

export function BaseConverterGuide() {
  useSeo({
    ...routeMeta('/guides/base-converter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Convert between number bases without a server"
      lede="How binary, octal, decimal and hexadecimal relate, why programmers use each one, and how to convert between them locally in the browser."
      updated="26 October 2026"
      toolTo="/tools/base-converter"
      toolLabel="Open the base converter"
    >
      <h2>One number, four ways to write it</h2>
      <p>
        A number is the same no matter which base you write it in; only the digits change. The
        decimal number 255 is the binary 11111111, the octal 377 and the hexadecimal FF. The
        base tells you how many distinct digits the system uses and what each position is
        worth. In decimal, the rightmost digit is the ones place, the next is tens, then
        hundreds, and so on — each step is multiplied by ten. In binary each step is multiplied
        by two, in octal by eight, and in hexadecimal by sixteen.
      </p>
      <p>
        To convert from any base into decimal, multiply each digit by the base raised to the
        power of its position from the right and add the results. For the binary number 1011
        that is 1×8 + 0×4 + 1×2 + 1×1 = 11. To go from decimal into another base, divide the
        number repeatedly by the target base and read the remainders from last to first. The
        converter uses decimal as the intermediate step, so changing any one field immediately
        recomputes the other three.
      </p>

      <h2>Why we use more than one base</h2>
      <p>
        Decimal is the everyday base because humans have ten fingers, but computers think in
        binary because a circuit is either on or off. A single bit can hold only two values, so
        numbers become long strings of zeros and ones — the decimal 255 needs eight bits.
        Binary is hard for people to read, so programmers group the bits. Four bits make one
        hexadecimal digit, which is why a byte is always written as two hex digits, and three
        bits make one octal digit.
      </p>
      <p>
        Hexadecimal is the most common shorthand. Colours in CSS and image files are written as
        six hex digits, two for each of red, green and blue, so pure red is FF0000. Memory
        addresses and hash values are also hex, because a long binary value becomes a quarter
        of the length. Octal survives mainly in Unix file permissions, where each digit
        represents the read, write and execute bits for the owner, group and others.
      </p>

      <h2>How the conversion stays exact</h2>
      <p>
        Integers convert exactly between bases because the representation is just a different
        way of writing the same value. There is no rounding and no loss, as long as the number
        fits within the range that the underlying number type can represent exactly. JavaScript
        keeps integers exact up to 2^53 − 1, which is roughly nine quadrillion. For the kinds
        of values a person types by hand — a byte, a colour, a permission mask, a memory
        address — the result is always exact, and the four fields always agree.
      </p>

      <h2>Reading and writing each base</h2>
      <p>
        Binary uses only the digits 0 and 1. Octal uses 0 through 7. Decimal uses 0 through 9.
        Hexadecimal needs sixteen digits, so after 9 it uses A for 10, B for 11, C for 12, D
        for 13, E for 14 and F for 15. The calculator accepts hex letters in either case and
        always shows them uppercase, so "ff" and "FF" both convert to 255. If a digit is not
        valid for the base you typed it into, the converter leaves the other fields unchanged
        rather than guessing.
      </p>

      <h2>Why your input should stay local</h2>
      <p>
        A number you convert is not sensitive on its own, but the same privacy principle applies
        to every tool on this site: if a calculation can be done in the browser, it should be.
        A server-side base converter logs every value that passes through it, and even
        innocuous logs can be matched with other data later to build a profile of what someone
        is working on. The local alternative needs none of that — the conversion is a single
        parse and a few calls to the built-in number formatter, and the whole thing finishes
        inside the tab without a single network request. Load the converter once, switch off
        the Wi-Fi, and it still gives you the correct value in every base, because the answer
        was always going to come from your own machine.
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
