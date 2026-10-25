import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, LockIcon } from '../components/Icons'
import {
  entropyBits,
  generatePasswords,
  strengthLabel,
  type PasswordOptions,
} from '../lib/password'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Is it safe to generate a password on a website?',
    a: 'Only if the generator runs entirely in your browser. This page uses crypto.getRandomValues — the same source of randomness your operating system uses — and never sends the password anywhere. You can switch off Wi-Fi after loading the page and it still works.',
  },
  {
    q: 'How long should my password be?',
    a: 'For an important account, 16 characters with all character sets enabled is the practical minimum. For a password manager master password, use 20 or more. Length matters more than complexity: a 20-character lowercase password is stronger than a 10-character one with symbols.',
  },
  {
    q: 'What does “exclude ambiguous characters” do?',
    a: 'It removes characters that look alike in many fonts: 0 and O, 1 and l and I, and the pipe |. Use this when you will read the password aloud, type it from a printed sheet, or dictate it over the phone. It slightly reduces entropy, so add a couple of extra characters if you use it.',
  },
  {
    q: 'Why not just use a password manager?',
    a: 'You should — for most accounts. But you still need one strong master password you can remember, and you occasionally need a password for a device or service that cannot use autofill. This generator is for those cases. The passwords it makes are random, not memorable, so store them somewhere safe.',
  },
  {
    q: 'Can I generate several passwords at once?',
    a: 'Yes. Choose “5” or “10” and the page generates a fresh batch. Each one is independently random — picking from a batch does not weaken any of them.',
  },
]

const LENGTHS = [12, 16, 20, 24, 32]

export function PasswordGenerator() {
  useSeo({
    ...routeMeta('/tools/password-generator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Password Generator',
          'Generate strong random passwords locally in your browser with configurable length, character sets and batch output. Nothing is uploaded.',
          '/tools/password-generator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [length, setLength] = useState(16)
  const [lowercase, setLowercase] = useState(true)
  const [uppercase, setUppercase] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [count, setCount] = useState(1)
  const [nonce, setNonce] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  const opts: PasswordOptions = useMemo(
    () => ({ length, lowercase, uppercase, digits, symbols, excludeAmbiguous }),
    [length, lowercase, uppercase, digits, symbols, excludeAmbiguous],
  )

  const passwords = useMemo(() => {
    // nonce lets the "New batch" button force a fresh draw without touching settings.
    void nonce
    try {
      return generatePasswords(opts, count)
    } catch {
      return []
    }
  }, [opts, count, nonce])

  const bits = useMemo(() => entropyBits(opts), [opts])
  const strength = strengthLabel(bits)

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  const regenerate = () => {
    setCopied(null)
    setNonce((n) => n + 1)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Security</span>
          <h1>Password generator that never sees your password</h1>
          <p>
            Cryptographically random passwords built with your browser's own random source. No
            upload, no account, no history.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <span className="panel-title">Settings</span>

            <div className="field" style={{ marginTop: 14 }}>
              <span className="field-label">Length — {length} characters</span>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                {LENGTHS.map((n) => (
                  <button
                    key={n}
                    className="btn"
                    style={{ padding: '4px 10px', fontSize: 13 }}
                    onClick={() => setLength(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginTop: 18 }}>
              <span className="field-label">Character sets</span>
              <div className="stack-sm" style={{ marginTop: 8 }}>
                {[
                  { label: 'Lowercase (a-z)', value: lowercase, set: setLowercase },
                  { label: 'Uppercase (A-Z)', value: uppercase, set: setUppercase },
                  { label: 'Digits (0-9)', value: digits, set: setDigits },
                  { label: 'Symbols (!@#$…)', value: symbols, set: setSymbols },
                ].map((row) => (
                  <label key={row.label} className="row" style={{ gap: 8, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={row.value}
                      onChange={(e) => row.set(e.target.checked)}
                    />
                    {row.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label className="row" style={{ gap: 8, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                />
                Exclude ambiguous characters (0/O, 1/l/I, |)
              </label>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <span className="field-label">How many</span>
              <div className="segmented">
                {[1, 5, 10].map((n) => (
                  <button key={n} aria-pressed={count === n} onClick={() => setCount(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="row" style={{ marginTop: 18, justifyContent: 'space-between' }}>
              <div className="row" style={{ gap: 10 }}>
                <span className={`strength strength-${strength}`}>{strength}</span>
                <span className="small muted">{bits} bits of entropy</span>
              </div>
              <button className="btn" onClick={regenerate}>
                New batch
              </button>
            </div>
          </div>

          {passwords.length > 0 ? (
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Your passwords</span>
              <div className="stack-sm" style={{ marginTop: 12 }}>
                {passwords.map((pw) => (
                  <div
                    key={pw}
                    className="row"
                    style={{
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      background: 'var(--paper-2)',
                    }}
                  >
                    <code style={{ fontSize: 15, wordBreak: 'break-all' }}>{pw}</code>
                    <button
                      className="btn"
                      style={{ padding: '6px 12px', fontSize: 13 }}
                      onClick={() => copy(pw)}
                    >
                      {copied === pw ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="notice notice-error" style={{ marginTop: 20 }}>
              Select at least one character set.
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">Why local generation matters</span>
            <p className="small muted">
              A password is only secret if nobody else has seen it. Server-side generators log the
              password they send you — by design, because they have to transmit it. Here the
              password is born inside your browser tab and never leaves it.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/password-generator-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: passwords without the upload
                </Link>
              </li>
              <li>
                <Link to="/tools/qr-code" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Share a Wi-Fi password as a QR code
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-sign" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Sign the document the password protects
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-metadata" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Check a PDF for hidden author data
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What makes a password strong</h2>
          <p>
            Strength is entropy: the number of guesses an attacker needs, on average, to find your
            password. Each character you add multiplies the search space by the size of the
            character set. A 16-character password using lowercase, uppercase, digits and symbols
            has about 95 bits of entropy — beyond the reach of any brute-force attack. A
            10-character password with the same sets has about 60 bits, which a determined attacker
            with a GPU cluster can crack in months.
          </p>

          <h2>Why “random” is not enough</h2>
          <p>
            Humans are terrible random generators. We pick words, names, keyboard patterns and
            dates — all of which appear in cracking dictionaries within the first million guesses.
            A true random generator like this one uses your operating system's entropy pool, the
            same source that generates cryptographic keys. The output looks meaningless because it
            is.
          </p>

          <h2>When to use which setting</h2>
          <ul>
            <li><strong>16 characters, all sets</strong> — the default for any account that matters.</li>
            <li><strong>20+ characters, all sets</strong> — password manager master passwords, disk encryption, root accounts.</li>
            <li><strong>Exclude ambiguous</strong> — when you will read the password aloud or type it from paper.</li>
            <li><strong>No symbols</strong> — for systems that reject special characters, or when typing on a phone keyboard.</li>
          </ul>

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
