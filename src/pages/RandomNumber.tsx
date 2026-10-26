import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import { generateDecimals, generateIntegers } from '../lib/random'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Are these numbers really random?',
    a: 'As random as your browser can make them. By default the generator pulls bytes from crypto.getRandomValues — the same cryptographically secure pseudo-random number generator (CSPRNG) your browser uses for TLS session keys and WebAuthn. It is seeded from the operating system entropy pool, not from the clock, so it is not predictable the way Math.random is. The only exception is when you enter a seed: then the sequence is deterministic by design, so you can reproduce it.',
  },
  {
    q: "What's wrong with Math.random?",
    a: 'Math.random is fast but not cryptographically secure. Its output is predictable given enough previous values, which makes it fine for animations and games but wrong for passwords, security tokens, shuffle-a-deck-for-money, or any draw where someone could gain from guessing the next number. crypto.getRandomValues is unpredictable by design. This tool uses crypto by default and Math.random only as a fallback on environments that lack it.',
  },
  {
    q: 'What does the "no repeats" option do?',
    a: 'It draws without replacement, like pulling tickets from a hat. Each number in the range can appear at most once. If you ask for more unique numbers than the range contains, the tool refuses rather than repeat — ten unique numbers from 1 to 5 is impossible, and it tells you so. Internally it shuffles the whole range (Fisher-Yates) and takes the first few, which is the honest way to guarantee a uniform draw without bias.',
  },
  {
    q: 'Why would I want a seed?',
    a: 'A seed makes the sequence reproducible. That is useful for tests, for game replays, for shuffling a playlist the same way twice, or for any fixture that needs to look random but stay stable across runs. A seeded draw is not secure — anyone who knows the seed can reproduce the whole sequence — so do not use it for passwords or security. For those, leave the seed blank and get true CSPRNG output.',
  },
  {
    q: 'Can I generate decimals?',
    a: 'Yes. Switch to decimals and choose how many decimal places — 0 to 10. The result is uniformly distributed across the range and rounded to the precision you asked for. Decimals cannot be drawn "without repeats" in any meaningful way (the space is effectively continuous), so the unique option applies only to integers.',
  },
]

type Mode = 'integers' | 'decimals'

export function RandomNumber() {
  useSeo({
    ...routeMeta('/tools/random-number'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Random Number Generator',
          'Generate cryptographically random integers or decimals in any range, singly or in batches, with an optional no-repeats mode and a seed for reproducible sequences. Runs locally — nothing is uploaded.',
          '/tools/random-number',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<Mode>('integers')
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState('1')
  const [unique, setUnique] = useState(false)
  const [decimals, setDecimals] = useState('2')
  const [seed, setSeed] = useState('')
  const [nonce, setNonce] = useState(0)

  const seedNum = seed.trim() === '' ? undefined : Number(seed)

  const result = useMemo(() => {
    const lo = Number(min)
    const hi = Number(max)
    const n = Number(count)
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || !Number.isFinite(n)) {
      return { values: [] as number[], error: 'Enter numbers for the range and count.' }
    }
    if (min === '' || max === '' || count === '') {
      return { values: [] as number[], error: '' }
    }
    try {
      void nonce
      if (mode === 'integers') {
        const values = generateIntegers(n, lo, hi, unique, seedNum)
        return { values, error: '' }
      }
      const values = generateDecimals(n, lo, hi, Number(decimals), seedNum)
      return { values, error: '' }
    } catch (e) {
      return { values: [] as number[], error: (e as Error).message }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, min, max, count, unique, decimals, seed, nonce])

  const regenerate = () => setNonce((n) => n + 1)

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>Random numbers from your browser's CSPRNG</h1>
          <p>
            Integers or decimals, any range, with or without repeats — drawn from
            crypto.getRandomValues, the same source as your TLS keys. Nothing is sent anywhere.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="field">
                <span className="field-label">Type</span>
                <div className="segmented">
                  <button aria-pressed={mode === 'integers'} onClick={() => setMode('integers')}>Integers</button>
                  <button aria-pressed={mode === 'decimals'} onClick={() => setMode('decimals')}>Decimals</button>
                </div>
              </div>

              <div className="split" style={{ gap: 12, marginTop: 16 }}>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Min</span>
                  <input type="number" value={min} onChange={(e) => setMin(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">Max</span>
                  <input type="number" value={max} onChange={(e) => setMax(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span className="field-label">How many</span>
                  <input type="number" min={1} max={10000} value={count} onChange={(e) => setCount(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div className="row" style={{ gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                {mode === 'integers' && (
                  <label className="row" style={{ gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={unique}
                      onChange={(e) => setUnique(e.target.checked)}
                    />
                    No repeats
                  </label>
                )}
                {mode === 'decimals' && (
                  <div className="field">
                    <span className="field-label">Decimal places</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={decimals}
                      onChange={(e) => setDecimals(e.target.value)}
                      style={{ width: 70 }}
                    />
                  </div>
                )}
                <div className="field">
                  <span className="field-label">Seed (optional)</span>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="blank = true random"
                    style={{ width: 160 }}
                  />
                </div>
                <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 13.5 }} onClick={regenerate}>
                  Generate
                </button>
              </div>

              {result.error ? (
                <div className="notice notice-error" style={{ marginTop: 16 }}>{result.error}</div>
              ) : result.values.length > 0 ? (
                <div
                  data-testid="random-output"
                  className="mono"
                  style={{
                    marginTop: 16,
                    padding: '14px 16px',
                    maxHeight: 360,
                    overflowY: 'auto',
                    fontSize: 15,
                    lineHeight: 1.9,
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  {result.values.join(', ')}
                </div>
              ) : null}

              {result.values.length > 0 && (
                <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                  {result.values.length} {result.values.length === 1 ? 'number' : 'numbers'} · range{' '}
                  {Math.min(...result.values)} – {Math.max(...result.values)}
                  {seed.trim() !== '' && ' · seeded (reproducible)'}
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
                  'Integers or decimals in any range',
                  'Batches of up to 10,000',
                  'No-repeats (unique) draws for integers',
                  'Optional seed for reproducible sequences',
                  'CSPRNG by default — crypto.getRandomValues',
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
                <LockIcon size={14} /> Randomness is generated inside this tab from your operating
                system's entropy pool. There is no server to log the draw, no request to inspect —
                the Network panel stays empty.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/random-number-without-upload">
                    Guide: random numbers without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/password-generator">Password generator</Link>
                </li>
                <li>
                  <Link to="/tools/uuid-generator">UUID generator</Link>
                </li>
                <li>
                  <Link to="/tools/hash-generator">Hash generator</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Two kinds of random</h2>
          <p>
            Not all randomness is equal. <code>Math.random()</code> is fast and convenient, but it
            is a non-cryptographic generator: given enough of its output, an attacker can predict
            the next value. That is fine for animating a loading spinner; it is wrong for a
            password, a security token, or a shuffle where money is on the line. This generator
            uses <code>crypto.getRandomValues()</code> by default — the CSPRNG your browser also
            uses for TLS session keys and WebAuthn — so the numbers are unpredictable the way real
            randomness should be.
          </p>

          <h2>Uniform, with no modulo bias</h2>
          <p>
            The naive way to make a random integer in a range is <code>Math.floor(Math.random() * range)</code>.
            That introduces modulo bias: because the random source has a fixed number of possible
            values and the range rarely divides it evenly, some outcomes are slightly more likely
            than others. This generator discards the values that would map unevenly (rejection
            sampling) so every number in the range has exactly equal probability. The difference is
            small for large ranges, but for a dice roll or a raffle draw, equal is what you want.
          </p>

          <h2>Drawing without repeats</h2>
          <p>
            "No repeats" is a draw without replacement, like pulling tickets from a hat. The
            correct way to do it is the Fisher-Yates shuffle: write down every number in the range,
            swap each element with a random one, and take the first however many you asked for.
            That gives a uniform sample with no bias and no retries. The alternative — generate
            numbers and throw away duplicates — works but slows to a crawl as the sample size
            approaches the range size, so this tool shuffles instead. If you ask for more unique
            numbers than the range contains, it tells you the truth rather than looping forever.
          </p>

          <h2>When a seed is the right call</h2>
          <p>
            A seed turns randomness into determinism: the same seed always produces the same
            sequence. That is exactly what you want for a unit test that needs a random-looking
            fixture, for a game replay, or for shuffling a playlist the same way on two devices.
            It is exactly what you do not want for a password — a seeded sequence is reproducible
            by anyone who knows the seed. Leave the seed blank for true CSPRNG output; fill it in
            only when you explicitly want reproducibility.
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
