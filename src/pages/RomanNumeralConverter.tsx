import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { fromRoman, toRoman } from '../lib/roman'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

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

export function RomanNumeralConverter() {
  useSeo({
    ...routeMeta('/tools/roman-numeral-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Roman Numeral Converter',
          'Convert between integers and Roman numerals instantly. Type a number from 1 to 3999 or a Roman numeral and see the conversion as you type. Runs locally — nothing is uploaded.',
          '/tools/roman-numeral-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [number, setNumber] = useState('2024')
  const [roman, setRoman] = useState('MMXXIV')

  function onNumberChange(value: string) {
    setNumber(value)
    const num = Number(value)
    if (value !== '' && Number.isInteger(num) && num >= 1 && num <= 3999) {
      const r = toRoman(num)
      if (r !== null) setRoman(r)
    }
  }

  function onRomanChange(value: string) {
    setRoman(value.toUpperCase())
    const n = fromRoman(value)
    if (n !== null) setNumber(String(n))
  }

  const numValue = Number(number)
  const numberValid = number !== '' && Number.isInteger(numValue) && numValue >= 1 && numValue <= 3999
  const romanValid = fromRoman(roman) !== null

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Roman numerals, in either direction.</h1>
          <p>
            Convert between numbers and Roman numerals instantly — type in one and the other
            updates as you go. No account, no upload — your input stays in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Number (1–3999)</span>
                  <input
                    type="number"
                    min="1"
                    max="3999"
                    value={number}
                    onChange={(e) => onNumberChange(e.target.value)}
                    style={{ width: '100%' }}
                    data-testid="number-input"
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Roman numeral</span>
                  <input
                    type="text"
                    value={roman}
                    onChange={(e) => onRomanChange(e.target.value)}
                    placeholder="e.g. MMXXIV"
                    style={{ width: '100%', textTransform: 'uppercase' }}
                    data-testid="roman-input"
                  />
                </div>
              </div>

              <div
                data-testid="roman-output"
                style={{
                  marginTop: 22,
                  padding: '20px',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                }}
              >
                {numberValid && romanValid ? (
                  <>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {number} equals
                    </div>
                    <div className="mono" style={{ fontSize: 36, fontWeight: 600, marginTop: 4 }}>
                      {roman}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--muted)' }}>
                    Enter a whole number from 1 to 3999, or a valid Roman numeral.
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <AdSlot />
            </div>
          </div>

          <aside className="stack-md">
            <div className="panel">
              <span className="panel-title">What you get</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                {[
                  'Numbers to Roman numerals and back',
                  'Both directions update as you type',
                  'Standard subtractive notation (IV, IX, XL…)',
                  'Valid range 1 to 3999',
                  'Works offline — nothing leaves your device',
                ].map((item) => (
                  <li key={item} className="row" style={{ gap: 8 }}>
                    <CheckIcon size={15} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel">
              <span className="panel-title">Private by design</span>
              <p style={{ fontSize: 14, margin: 0 }}>
                <LockIcon size={14} /> Your input never leaves this tab. There is no server to
                log it, no request to inspect — the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/roman-numeral-converter-without-upload">
                    Guide: Roman numerals without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/unit-converter">Unit converter</Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
                <li>
                  <Link to="/tools/tip-calculator">Tip calculator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Seven symbols, one system</h2>
          <p>
            Roman numerals are built from seven symbols, each with a fixed value: I is 1, V is
            5, X is 10, L is 50, C is 100, D is 500 and M is 1000. To write a number you place
            symbols in descending order and add their values, so VII is 5 + 1 + 1 = 7 and XII is
            10 + 1 + 1 = 12. The converter works this way: it takes the largest symbol that fits
            the remaining value, appends it, subtracts its value, and repeats until nothing is
            left.
          </p>

          <h2>Why IV means 4</h2>
          <p>
            Writing four identical symbols in a row is awkward, so Roman numerals use
            subtractive notation for the values 4, 9, 40, 90, 400 and 900. A smaller symbol
            placed before a larger one means "subtract", so IV is 5 − 1 = 4 and IX is 10 − 1 =
            9. The same pattern gives XL for 40, XC for 90, CD for 400 and CM for 900. The
            Romans did not always use this shorthand — IIII appears on clocks and monuments —
            but IV is the standard modern form and the one this calculator produces.
          </p>

          <h2>The limit at 3999</h2>
          <p>
            With the seven standard symbols the largest number is 3999, written as MMMCMXCIX.
            There is no symbol for 5000, so going higher required either repeating Ms (which
            becomes hard to read) or drawing a bar over a symbol to multiply it by a thousand.
            Because there is no single agreed way to write 4000 and above, this calculator
            supports the standard range of 1 through 3999 and reports anything outside that
            range as invalid.
          </p>

          <h2>No zero, no decimals</h2>
          <p>
            Roman numerals have no symbol for zero and no way to write fractions or decimals,
            which is one reason the system was eventually replaced by Arabic numerals for
            mathematics and commerce. The word "nulla" was sometimes used for zero in
            calculations, but it was never a numeral. This means the converter only accepts
            positive whole numbers — anything with a decimal point, a zero or a negative sign
            is outside what Roman numerals can represent.
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
        </div>
      </section>
    </>
  )
}
