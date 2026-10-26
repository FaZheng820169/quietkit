import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'How do you convert a number to Roman numerals?',
    a: 'Roman numerals use seven symbols: I for 1, V for 5, X for 10, L for 50, C for 100, D for 500 and M for 1000. To build a number, you take the largest symbol that fits and subtract its value, repeating until you reach zero. For numbers like 4 and 9, subtractive notation is used: IV means 5 minus 1, and IX means 10 minus 1. The same pattern applies to 40 (XL), 90 (XC), 400 (CD) and 900 (CM).',
  },
  {
    q: 'Why is 4 written as IV and not IIII?',
    a: 'Subtractive notation is a shorthand that avoids writing four identical symbols in a row. IIII is valid in the sense that it equals 4, but the standard form is IV, where the smaller symbol before the larger one means "subtract". The Romans themselves used both forms — IIII appears on many Roman clocks and monuments — but IV is the standard convention used in modern texts and by this calculator.',
  },
  {
    q: 'What is the largest number you can write in Roman numerals?',
    a: 'With the standard seven symbols and subtractive notation, the largest number is 3999, written as MMMCMXCIX. The Romans did not have a symbol for 5000 or above, so numbers of 4000 or more required either repeated Ms (which gets unwieldy) or a bar over a symbol to mean "times a thousand". This calculator uses the standard form and supports 1 through 3999.',
  },
  {
    q: 'Is there a Roman numeral for zero?',
    a: 'No. The Roman numeral system has no symbol for zero, which is one reason it is awkward for arithmetic. The Romans used the word "nulla" (meaning nothing) when they needed to refer to zero in a calculation, but it was not part of the numeral system itself. This is why the calculator only accepts positive integers from 1 to 3999.',
  },
  {
    q: 'Does the converter store what I type?',
    a: 'No. The number or Roman numeral you type lives only in the memory of this browser tab while the page is open. There is no server, no account and no analytics event tied to your input. Close the tab and it is gone — the privacy policy explains in detail.',
  },
]

export function RomanNumeralConverterGuide() {
  useSeo({
    ...routeMeta('/guides/roman-numeral-converter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Everyday"
      title="Convert Roman numerals without a server"
      lede="How Roman numerals work, why subtractive notation matters, what the valid range is, and how to convert between numbers and Roman numerals locally in the browser."
      updated="26 October 2026"
      toolTo="/tools/roman-numeral-converter"
      toolLabel="Open the Roman numeral converter"
    >
      <h2>Seven symbols, one system</h2>
      <p>
        Roman numerals are built from seven symbols, each with a fixed value: I is 1, V is 5, X
        is 10, L is 50, C is 100, D is 500 and M is 1000. To write a number you place symbols
        in descending order and add their values, so VII is 5 + 1 + 1 = 7 and XII is 10 + 1 + 1
        = 12. The converter works the same way: it takes the largest symbol whose value is less
        than or equal to the remaining number, appends it, subtracts its value, and repeats
        until nothing is left.
      </p>
      <p>
        This greedy approach always produces the shortest valid representation because the
        symbol table is built in descending value order and includes the subtractive pairs. For
        1994 the largest fitting symbol is M (1000), leaving 994; then CM (900), leaving 94;
        then XC (90), leaving 4; then IV (4). The result is MCMXCIV, which is the standard form.
      </p>

      <h2>Why IV means 4</h2>
      <p>
        Writing four identical symbols in a row is awkward, so Roman numerals use subtractive
        notation for the values 4, 9, 40, 90, 400 and 900. A smaller symbol placed before a
        larger one means "subtract", so IV is 5 − 1 = 4 and IX is 10 − 1 = 9. The same pattern
        gives XL for 40, XC for 90, CD for 400 and CM for 900. The Romans did not always use
        this shorthand — IIII appears on clocks and monuments — but IV is the standard modern
        form.
      </p>
      <p>
        Reading a Roman numeral back into a number works the other way around. You can either
        scan left to right and subtract when a smaller symbol precedes a larger one, or scan
        right to left and subtract any symbol that is smaller than the one to its right. Both
        methods give the same answer, and the converter verifies its result by converting the
        number back to Roman form and checking that it matches, which catches malformed inputs
        like IL or IIX that happen to add up to a number but are not valid notation.
      </p>

      <h2>The limit at 3999</h2>
      <p>
        With the seven standard symbols the largest number is 3999, written as MMMCMXCIX. There
        is no symbol for 5000, so going higher required either repeating Ms (which becomes hard
        to read beyond three or four) or drawing a horizontal bar, called a vinculum, over a
        symbol to multiply it by a thousand. Because there is no single universally agreed way
        to write 4000 and above, this calculator supports the standard range of 1 through 3999
        and reports anything outside that range as invalid.
      </p>

      <h2>No zero, no decimals</h2>
      <p>
        Roman numerals have no symbol for zero and no way to write fractions or decimals, which
        is one reason the system was eventually replaced by Arabic numerals for mathematics and
        commerce. The word "nulla" was sometimes used for zero in calculations, but it was
        never a numeral. This means the converter only accepts positive whole numbers —
        anything with a decimal point, a zero or a negative sign is outside what Roman numerals
        can represent, and the input is left unconverted rather than guessing.
      </p>

      <h2>Why a converter should stay local</h2>
      <p>
        A Roman numeral is not sensitive data, but the same privacy principle applies to every
        tool on this site: if a calculation can be done in the browser, it should be. A
        server-side converter logs every number that passes through it, and even innocuous
        logs can be matched with other data later. The local alternative needs none of that —
        the conversion is a small lookup table and a loop, and the whole thing finishes inside
        the tab without a single network request. Load the converter once, switch off the
        Wi-Fi, and it still gives you the correct Roman numeral, because the answer was always
        going to come from your own machine.
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
