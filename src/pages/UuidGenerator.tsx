import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon } from '../components/Icons'
import { collisionOdds, generateUuids, UUID_FORMATS, type UuidFormat } from '../lib/uuid'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Does a server see the UUIDs I generate?',
    a: 'No — and that is the entire point. A UUID usually becomes a primary key, a session id or a correlation id inside your systems. Generating one through an API means the operator of that API saw every id before you used it. This page draws bytes from crypto.getRandomValues, the same CSPRNG your browser uses for TLS session keys, and the Network panel in your developer tools stays empty while you generate.',
  },
  {
    q: 'What do the 4 and the 8–b in a UUID mean?',
    a: 'A version 4 UUID is 16 bytes, of which 122 bits are pure randomness. The remaining six bits are fixed: the third group always starts with 4, marking the version — "this UUID is random", as opposed to a time-based v1 or a name-based v5. The fourth group always starts with 8, 9, a or b, the two variant bits that say "this follows RFC 4122". Every UUID on this page carries both markers.',
  },
  {
    q: 'How likely is a collision?',
    a: 'Astronomically unlikely — and the honest number is more useful than the adjective. By the birthday bound, a collision needs roughly 2^61 UUIDs to become plausible: generate one billion UUIDs per second for a century and the odds of a single duplicate are still under one in a billion. The tool page shows the order of magnitude for whatever batch size you choose. The practical rule: collisions are not how v4 UUIDs fail; reusing the same id twice by copy-paste is.',
  },
  {
    q: 'Why offer braced and URN formats?',
    a: 'Because UUIDs travel through ecosystems with different wrappers. .NET and older Microsoft code often writes them in braces: {3b24…}. SAML, XMPP and other XML-era standards wrap them in a URN: urn:uuid:3b24…. Some databases and compact APIs strip the hyphens entirely. All four forms encode the same 128 bits — the format is a display choice, which is why this generator keeps the random bytes identical and only changes the wrapping.',
  },
  {
    q: 'Can I generate a thousand UUIDs at once?',
    a: 'Yes — set the count anywhere from 1 to 1,000 and the whole batch appears at once, one per line, ready to paste into a migration script or a fixtures file. Even at 1,000 per click, the chance of a duplicate inside one batch is about 1 in 10^16. If you ever do want deterministic ids derived from a name rather than randomness, that is UUID v5 territory — hash-based, and a different tool.',
  },
]

export function UuidGenerator() {
  useSeo({
    ...routeMeta('/tools/uuid-generator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit UUID Generator',
          'Generate RFC 4122 version 4 UUIDs with crypto.getRandomValues — one or a batch of 1,000, in standard, plain, braced or URN form. Runs entirely in your browser — nothing is uploaded.',
          '/tools/uuid-generator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [count, setCount] = useState(5)
  const [format, setFormat] = useState<UuidFormat>('hyphenated')
  const [uppercase, setUppercase] = useState(false)
  const [uuids, setUuids] = useState<string[]>(() =>
    generateUuids(5, { format: 'hyphenated', uppercase: false }),
  )
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedOne, setCopiedOne] = useState<string | null>(null)

  const output = useMemo(() => uuids.join('\n'), [uuids])
  const uniqueCount = useMemo(() => new Set(uuids).size, [uuids])

  const regenerate = (n: number, f: UuidFormat, up: boolean) => {
    setUuids(generateUuids(n, { format: f, uppercase: up }))
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(output)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  const copyOne = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid)
    setCopiedOne(uuid)
    setTimeout(() => setCopiedOne(null), 1500)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>UUIDs drawn from the same CSPRNG as your TLS keys</h1>
          <p>
            Version 4, 122 bits of randomness, up to 1,000 per click — standard, plain, braced or
            URN. Generated in this tab, so no server ever sees an id you are about to use.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="split" style={{ gap: 18 }}>
                <div className="field">
                  <span className="field-label">Format</span>
                  <div className="segmented">
                    {UUID_FORMATS.map((f) => (
                      <button
                        key={f.kind}
                        aria-pressed={format === f.kind}
                        onClick={() => {
                          setFormat(f.kind)
                          regenerate(count, f.kind, uppercase)
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">How many (1–1000)</span>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={count}
                    onChange={(e) => {
                      const n = Math.max(1, Math.min(1000, Number(e.target.value) || 1))
                      setCount(n)
                      regenerate(n, format, uppercase)
                    }}
                    style={{ width: 90 }}
                    aria-label="Number of UUIDs"
                  />
                </div>
              </div>

              <div className="row" style={{ gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                <label className="row" style={{ gap: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => {
                      setUppercase(e.target.checked)
                      regenerate(count, format, e.target.checked)
                    }}
                  />
                  UPPERCASE
                </label>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: 13.5 }}
                  onClick={() => regenerate(count, format, uppercase)}
                >
                  Regenerate
                </button>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => void copyAll()}
                >
                  <CopyIcon size={14} /> {copiedAll ? 'Copied' : 'Copy all'}
                </button>
              </div>

              <div
                className="mono"
                data-testid="uuid-output"
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  maxHeight: 340,
                  overflowY: 'auto',
                  fontSize: 13.5,
                  lineHeight: 1.9,
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                }}
              >
                {uuids.map((uuid) => (
                  <div
                    key={uuid}
                    className="row"
                    style={{ justifyContent: 'space-between', gap: 8 }}
                  >
                    <span>{uuid}</span>
                    <button
                      className="btn"
                      style={{ padding: '2px 8px', fontSize: 12 }}
                      onClick={() => void copyOne(uuid)}
                      aria-label={`Copy ${uuid}`}
                    >
                      {copiedOne === uuid ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>

              <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                {uuids.length.toLocaleString()} {uuids.length === 1 ? 'UUID' : 'UUIDs'} ·{' '}
                {uniqueCount.toLocaleString()} unique · collision odds in this batch:{' '}
                {collisionOdds(uuids.length)}
              </p>
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
                  'RFC 4122 v4: version nibble and variant bits set',
                  '122 bits from crypto.getRandomValues',
                  'Batches of up to 1,000, one per line',
                  'Standard, plain, braced or URN — same bits',
                  'Honest collision odds for the batch size',
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
                <LockIcon size={14} /> The UUID you are about to mint often becomes a database key,
                a session id or a trace id. An online generator sees every one before you use it.
                This one cannot — there is no request to watch.{' '}
                <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/uuid-generator-without-upload">
                    Guide: generate UUIDs without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/password-generator">Password generator</Link>
                </li>
                <li>
                  <Link to="/tools/hash-generator">Hash generator</Link>
                </li>
                <li>
                  <Link to="/tools/json-formatter">JSON formatter</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What a version 4 UUID actually is</h2>
          <p>
            Strip away the hyphens and a v4 UUID is 16 bytes. Six of those 128 bits are fixed
            markers — a 4 saying "I am random, not time-based", and a two-bit variant saying "I
            follow RFC 4122" — which leaves 122 bits of pure randomness. That is the whole
            specification. There is no coordination, no registry, no central allocator; the entire
            point of the design is that any machine anywhere can mint an id that no other machine
            will ever mint, without asking anyone.
          </p>

          <h2>The collision question, answered honestly</h2>
          <p>
            "Will two random UUIDs ever collide?" deserves a number, not an adjective. By the
            birthday bound, collisions become plausible around 2^61 UUIDs — about two billion
            billion. Put differently: mint one billion UUIDs per second for an entire century and
            the probability of even one duplicate stays under one in a billion. The way UUIDs
            actually fail in production is mundane — a copy-paste reuses the same id twice, or a
            retry writes the same row again. Randomness has never been the weak link.
          </p>

          <h2>Why the same bits wear four wrappers</h2>
          <p>
            The ecosystem wrapped UUIDs differently over the decades. .NET tooling and COM-era
            Microsoft code write them in braces. SAML and XMPP wrap them in a URN. Compact
            storage formats strip the hyphens. All four forms encode identical bits, so this
            generator treats format as what it is — a display choice — and keeps the random bytes
            untouched while switching the wrapping.
          </p>

          <h2>Why minting ids is a local job</h2>
          <p>
            A UUID generator that runs on a server hands the operator a list of ids you are about
            to rely on: future primary keys, session ids, correlation ids in your logs. The
            information leak is subtle but real, and it buys you nothing — randomness is not a
            service, it is a syscall. crypto.getRandomValues draws from the same entropy pool your
            browser uses for TLS session keys, and generating a thousand UUIDs costs less than
            rendering this paragraph.
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
