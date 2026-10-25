import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon } from '../components/Icons'
import { CATEGORIES, convert, formatResult, getCategory, type UnitCategory } from '../lib/convert'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

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

export function UnitConverter() {
  useSeo({
    ...routeMeta('/tools/unit-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Unit Converter',
          'Convert between metric and imperial with exact legal definitions: inches to millimetres, pounds to kilograms, Fahrenheit to Celsius, and decimal versus binary data sizes. Runs locally — nothing is uploaded.',
          '/tools/unit-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [categoryId, setCategoryId] = useState<UnitCategory>('length')
  const [value, setValue] = useState('1')
  const [fromId, setFromId] = useState('in')
  const [toId, setToId] = useState('mm')
  const [copied, setCopied] = useState(false)

  const category = getCategory(categoryId)

  const parsed = useMemo(() => {
    const n = Number(value)
    return value.trim() !== '' && Number.isFinite(n) ? n : null
  }, [value])

  const result = useMemo(
    () => (parsed === null ? null : convert(parsed, fromId, toId, categoryId)),
    [parsed, fromId, toId, categoryId],
  )

  const fromUnit = category.units.find((u) => u.id === fromId)!
  const toUnit = category.units.find((u) => u.id === toId)!

  const switchCategory = (id: UnitCategory) => {
    const next = getCategory(id)
    setCategoryId(id)
    setFromId(next.units[0].id)
    setToId(next.units[1].id)
  }

  const swap = () => {
    setFromId(toId)
    setToId(fromId)
  }

  const copyResult = async () => {
    if (result === null) return
    await navigator.clipboard.writeText(`${formatResult(result)} ${toUnit.symbol}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Everyday</span>
          <h1>Unit conversion with the exact definitions, not approximations</h1>
          <p>
            An inch is exactly 25.4 mm by treaty since 1959; a pound is exactly 0.45359237 kg.
            Length, weight, temperature and data size — converted in this tab, with the
            definitional factors.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Category</span>
                <div className="segmented">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      aria-pressed={categoryId === c.id}
                      onClick={() => switchCategory(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="split" style={{ gap: 14, marginTop: 18, alignItems: 'end' }}>
                <div className="field">
                  <span className="field-label">Value</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    aria-label="Value to convert"
                    style={{ width: '100%', fontSize: 16, padding: '8px 10px' }}
                  />
                </div>
                <div className="field">
                  <span className="field-label">From</span>
                  <select
                    value={fromId}
                    onChange={(e) => setFromId(e.target.value)}
                    aria-label="From unit"
                    style={{ width: '100%', padding: '8px 10px' }}
                  >
                    {category.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ flex: '0 0 auto' }}>
                  <button
                    className="btn"
                    onClick={swap}
                    aria-label="Swap units"
                    style={{ padding: '8px 12px' }}
                  >
                    ⇄
                  </button>
                </div>
                <div className="field">
                  <span className="field-label">To</span>
                  <select
                    value={toId}
                    onChange={(e) => setToId(e.target.value)}
                    aria-label="To unit"
                    style={{ width: '100%', padding: '8px 10px' }}
                  >
                    {category.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="panel"
                style={{ marginTop: 18, background: 'var(--paper-2)' }}
                data-testid="convert-result"
              >
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {parsed === null ? 'Enter a value' : `${parsed} ${fromUnit.symbol} =`}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: 26, marginTop: 4, wordBreak: 'break-word' }}
                    >
                      {result === null ? '—' : `${formatResult(result)} ${toUnit.symbol}`}
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 13, flex: '0 0 auto' }}
                    onClick={() => void copyResult()}
                    disabled={result === null}
                  >
                    <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {categoryId === 'data' && (
                <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                  Decimal (KB/MB/GB) and binary (KiB/MiB/GiB) units are both listed and never
                  confused — the 7% gap between them at GB scale is exactly why a “500 GB” drive
                  reports as 465 GiB.
                </p>
              )}
              {categoryId === 'temperature' && (
                <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                  Temperature converts through kelvin as an affine operation — which is why −40 is
                  the one value where °F and °C agree.
                </p>
              )}
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
                  'Definitional factors: 1 in = 25.4 mm exactly',
                  'Length, weight, temperature and data size',
                  'MB vs MiB listed honestly, never conflated',
                  'Up to 12 significant digits, FP noise trimmed',
                  'One-tap copy with the unit symbol attached',
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
                <LockIcon size={14} /> The numbers people convert are rarely abstract — a body
                weight, a room dimension, a quote being priced, a drive being sized. Conversion is
                multiplication; it should not leave the tab.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/unit-conversion-without-upload">
                    Guide: convert units without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/color-converter">Color converter</Link>
                </li>
                <li>
                  <Link to="/tools/word-counter">Word counter</Link>
                </li>
                <li>
                  <Link to="/tools/slug-generator">Slug generator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>The inch is a metric unit in disguise</h2>
          <p>
            Since 1959 the imperial system has been defined in terms of metric, not the other way
            round. One inch is not “about 25.4 millimetres” — it is exactly 25.4 mm, by
            international agreement, full stop. One pound is exactly 0.45359237 kg. One mile is
            exactly 1,609.344 m. Which means every imperial-to-metric conversion is exact
            arithmetic, and any converter showing a rounded factor is departing from the
            definition, not approaching it. This one multiplies by the definitional values.
          </p>

          <h2>Temperature is the odd one out</h2>
          <p>
            Length, weight and data size are ratio conversions: 0 of one unit equals 0 of the
            other, so converting is a single multiplication. Temperature is not like that. 0°C and
            0°F are different temperatures, so the scales are related by multiply-and-shift — an
            affine operation. That is also the answer to the classic trivia question: −40°F equals
            −40°C because −40 is the unique point where the two lines cross. Kelvin keeps
            Celsius's step size but starts at absolute zero, so °C to K is a pure shift by
            273.15.
          </p>

          <h2>MB and MiB are not the same thing</h2>
          <p>
            Drive manufacturers sell decimal gigabytes — 10⁹ bytes, the SI definition. Operating
            systems traditionally report binary gibibytes — 2³⁰ bytes — while labelling them "GB".
            The gap is 7.4%, which is precisely why a “500 GB” drive appears as 465 “GB”. The
            1998 IEC standard gave the binary quantities their own names (KiB, MiB, GiB) to end
            the confusion; the industry mostly ignored it. This converter lists both families side
            by side and never mistakes one for the other.
          </p>

          <h2>Why converting is a local job</h2>
          <p>
            A unit converter needs no database, no model and no network. The factors were fixed by
            treaty in 1959 and have not changed since. The numbers people convert, though, are
            often personal: a weight, a recipe scaled for a gathering, dimensions of a room being
            renovated, a price being compared. None of that belongs in a server's access log to
            answer a multiplication. Everything here happens in this tab, and the Network panel
            stays empty while you type.
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
