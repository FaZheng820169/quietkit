import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { parseBase, toBase, type Base } from '../lib/base'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

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

const FIELDS: { key: Base; label: string; placeholder: string }[] = [
  { key: 2, label: 'Binary (base 2)', placeholder: 'e.g. 11111111' },
  { key: 8, label: 'Octal (base 8)', placeholder: 'e.g. 377' },
  { key: 10, label: 'Decimal (base 10)', placeholder: 'e.g. 255' },
  { key: 16, label: 'Hexadecimal (base 16)', placeholder: 'e.g. FF' },
]

export function BaseConverter() {
  useSeo({
    ...routeMeta('/tools/base-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Base Converter',
          'Convert between binary, decimal, hexadecimal and octal instantly. Type a value in any base and see the others update as you type. Runs locally — nothing is uploaded.',
          '/tools/base-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [binary, setBinary] = useState('11111111')
  const [octal, setOctal] = useState('377')
  const [decimal, setDecimal] = useState('255')
  const [hex, setHex] = useState('FF')

  const values: Record<Base, string> = { 2: binary, 8: octal, 10: decimal, 16: hex }
  const setters: Record<Base, (v: string) => void> = {
    2: setBinary,
    8: setOctal,
    10: setDecimal,
    16: setHex,
  }

  function onInputChange(base: Base, value: string) {
    setters[base](base === 16 ? value.toUpperCase() : value)
    const n = parseBase(value, base)
    if (n !== null) {
      for (const b of [2, 8, 10, 16] as Base[]) {
        if (b !== base) setters[b](toBase(n, b))
      }
    }
  }

  const decValue = parseBase(decimal, 10)
  const isValidNumber = decValue !== null

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>Four bases, one number.</h1>
          <p>
            Convert between binary, octal, decimal and hexadecimal instantly — type in any base
            and the others update as you go. No account, no upload — your input stays in this
            tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div style={{ display: 'grid', gap: 12 }}>
                {FIELDS.map((f) => (
                  <div className="field" key={f.key}>
                    <span className="field-label">{f.label}</span>
                    <input
                      type="text"
                      value={values[f.key]}
                      onChange={(e) => onInputChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{ width: '100%', fontFamily: 'var(--mono, monospace)' }}
                      data-testid={`base-${f.key}`}
                      inputMode={f.key === 10 ? 'numeric' : 'text'}
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </div>
                ))}
              </div>

              <div
                data-testid="base-output"
                style={{
                  marginTop: 22,
                  padding: '20px',
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                }}
              >
                {isValidNumber ? (
                  <>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Decimal value
                    </div>
                    <div className="mono" style={{ fontSize: 36, fontWeight: 600, marginTop: 4 }}>
                      {decValue}
                    </div>
                    <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                      = {binary}₂ = {octal}₈ = {hex}₁₆
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--muted)' }}>
                    Enter a valid number in any base to see all four conversions.
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
                  'Binary, octal, decimal and hexadecimal',
                  'All four bases update as you type',
                  'Accepts uppercase or lowercase hex',
                  'Exact integer conversion',
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
                  <Link to="/guides/base-converter-without-upload">
                    Guide: number bases without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/percentage-calculator">Percentage calculator</Link>
                </li>
                <li>
                  <Link to="/tools/random-number">Random number generator</Link>
                </li>
                <li>
                  <Link to="/tools/uuid-generator">UUID generator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>From one base to every base</h2>
          <p>
            A number is the same no matter which base you write it in; only the digits change.
            The decimal number 255 is the binary 11111111, the octal 377 and the hexadecimal
            FF. To convert any base into decimal, multiply each digit by the base raised to the
            power of its position from the right and add the results. To convert decimal into
            another base, divide repeatedly by that base and read the remainders from last to
            first. The converter uses decimal as the intermediate step, so changing any one
            field immediately recomputes the other three.
          </p>

          <h2>Why we use more than one base</h2>
          <p>
            Decimal is the everyday base because humans have ten fingers, but computers think
            in binary because a circuit is either on or off. Binary is hard for people to read,
            so programmers group the bits: four bits make one hexadecimal digit, and three bits
            make one octal digit. Hexadecimal is the most common shorthand — two hex digits make
            a byte, and colours in CSS are written as six hex digits, such as FF0000 for red.
            Octal survives in Unix file permissions, where each digit represents read, write
            and execute bits.
          </p>

          <h2>How the conversion stays exact</h2>
          <p>
            Integers convert exactly between bases because the representation is just a
            different way of writing the same value. The converter parses the input into a
            JavaScript number and then renders it in each base, so there is no loss of
            precision as long as the number fits within the exact-integer range. For the kinds
            of values a person types by hand — a byte, a colour, a permission mask, a memory
            address — the result is always exact.
          </p>

          <h2>Why your input should stay local</h2>
          <p>
            A number you convert is not sensitive on its own, but the same privacy principle
            applies to every tool on this site: if a calculation can be done in the browser, it
            should be. A server-side base converter logs every value that passes through it,
            and even innocuous logs can be matched with other data later. The local alternative
            needs none of that — the conversion is a single parse and a few calls to the
            built-in number formatter, and the whole thing finishes inside the tab without a
            single network request.
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
