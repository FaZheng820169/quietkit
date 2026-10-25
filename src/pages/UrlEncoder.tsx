import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon, TrashIcon } from '../components/Icons'
import { buildQuery, decodeUrl, encodeUrl, parseQuery, splitUrl } from '../lib/url'
import type { EncodeMode } from '../lib/url'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Is my data uploaded to be encoded or decoded?',
    a: 'No. Percent-encoding is a fixed character substitution defined in RFC 3986 — there is nothing a server can do that this page cannot. The conversion runs in JavaScript inside this tab. Verify it: open the Network panel in your browser developer tools and watch it stay empty while you type, or load the page, disconnect from the internet and keep converting.',
  },
  {
    q: 'What is the difference between "component" and "full URL" encoding?',
    a: 'Component mode (the browser\'s encodeURIComponent) escapes everything except letters, digits and - _ . ~ — use it for a single value going inside a query string or path segment, so characters like &, = and ? cannot break the URL\'s structure. Full-URL mode (encodeURI) keeps structural characters like : / ? & = # readable and only escapes characters that are never allowed in a URL, like spaces and non-ASCII text. Use component mode for values, full-URL mode for tidying a whole link.',
  },
  {
    q: 'Does + mean a space in a URL?',
    a: 'Only in a query string, and only by convention from HTML forms (application/x-www-form-urlencoded). Everywhere else in a URL, + is a literal plus sign. That is why this tool\'s decoder has a "+ as space" option: tick it when decoding form data or query strings, leave it off for everything else. When encoding, %20 is the safe, unambiguous way to write a space.',
  },
  {
    q: 'Why does my encoded string fail to decode?',
    a: 'The usual cause is a malformed percent-escape: a % that is not followed by two hexadecimal digits, often because a literal percent sign was never encoded. This tool points at the exact position of the bad escape. The second cause is truncated input — a multi-byte UTF-8 character like 你好 encodes to three escapes each (%E4%BD%A0), and losing even one makes the sequence invalid UTF-8, which the decoder reports honestly.',
  },
  {
    q: 'Why are some characters left unencoded?',
    a: 'RFC 3986 defines an "unreserved" set — A–Z, a–z, 0–9, and - _ . ~ — that never needs encoding, plus "reserved" characters like / ? & = that are only escaped in component mode, where they would otherwise be mistaken for URL structure. Seeing ? and & survive full-URL encoding is correct: escaping them would change what the URL means.',
  },
]

export function UrlEncoder() {
  useSeo({
    ...routeMeta('/tools/url-encoder'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit URL Encoder & Decoder',
          'Percent-encode a value for a URL or decode it back, with component and full-URL modes, plus a query-string parser. Runs locally in your browser — nothing is uploaded.',
          '/tools/url-encoder',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeMode, setEncodeMode] = useState<EncodeMode>('component')
  const [plusAsSpace, setPlusAsSpace] = useState(true)
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (input === '') return null
    if (mode === 'encode') return { ok: true, output: encodeUrl(input, encodeMode) }
    return decodeUrl(input, plusAsSpace)
  }, [input, mode, encodeMode, plusAsSpace])

  const output = result?.ok ? result.output : ''
  const error = result && !result.ok ? (result.error ?? 'Decode failed.') : null

  // Breakdown: parse the query out of whichever side currently holds a URL-ish
  // string — the raw input when decoding, the output when encoding a full URL.
  const breakdownSource = mode === 'decode' ? input : output
  const parts = useMemo(() => splitUrl(breakdownSource.trim()), [breakdownSource])
  const queryParams = useMemo(() => {
    const source = parts ? parts.query : breakdownSource
    return parseQuery(source)
  }, [parts, breakdownSource])
  const showBreakdown = parts !== null || queryParams.length > 0

  const swap = () => {
    if (!output) return
    setInput(output)
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  const clear = () => setInput('')

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>Percent-encode and decode URLs without a server</h1>
          <p>
            Escape a value so it survives inside a link, decode a mangled URL back to readable
            text, and see exactly what a query string carries. The rules come from RFC 3986 — and
            they run in this tab.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span className="panel-title">{mode === 'encode' ? 'Text to encode' : 'Encoded URL or value'}</span>
              <div className="segmented">
                <button aria-pressed={mode === 'encode'} onClick={() => setMode('encode')}>
                  Encode
                </button>
                <button aria-pressed={mode === 'decode'} onClick={() => setMode('decode')}>
                  Decode
                </button>
              </div>
            </div>

            <textarea
              aria-label={mode === 'encode' ? 'Text to encode' : 'Encoded URL or value'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 140,
                marginTop: 12,
                fontFamily: 'var(--mono)',
                fontSize: 13.5,
                lineHeight: 1.6,
                padding: 12,
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--paper-2)',
                resize: 'vertical',
              }}
              placeholder={
                mode === 'encode'
                  ? 'Paste a value like "café & tea" or a whole URL…'
                  : 'Paste an encoded URL or value, e.g. q%3Dhello%20world…'
              }
            />

            <div className="row" style={{ marginTop: 12, gap: 14, flexWrap: 'wrap' }}>
              {mode === 'encode' ? (
                <div className="segmented">
                  <button
                    aria-pressed={encodeMode === 'component'}
                    onClick={() => setEncodeMode('component')}
                  >
                    Component
                  </button>
                  <button
                    aria-pressed={encodeMode === 'full'}
                    onClick={() => setEncodeMode('full')}
                  >
                    Full URL
                  </button>
                </div>
              ) : (
                <label className="row" style={{ gap: 6, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={plusAsSpace}
                    onChange={(e) => setPlusAsSpace(e.target.checked)}
                  />
                  Treat + as space (form data)
                </label>
              )}
              <span style={{ flex: 1 }} />
              <button
                className="btn"
                style={{ padding: '6px 12px', fontSize: 13 }}
                onClick={swap}
                disabled={!output}
              >
                Use output as input
              </button>
              <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={clear}>
                <TrashIcon size={14} /> Clear
              </button>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div className="row" style={{ gap: 14, fontSize: 14 }}>
                <span className="panel-title">Output</span>
                {output && (
                  <span className="muted" style={{ fontSize: 13 }}>
                    {input.length.toLocaleString()} → {output.length.toLocaleString()} characters
                  </span>
                )}
              </div>
              <button
                className="btn"
                style={{ padding: '6px 12px', fontSize: 13 }}
                onClick={() => void copy(output)}
                disabled={!output}
              >
                <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {error ? (
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--red, #b3402a)' }}>{error}</p>
            ) : output ? (
              <textarea
                readOnly
                aria-label="Output"
                value={output}
                style={{
                  width: '100%',
                  minHeight: 140,
                  marginTop: 12,
                  fontFamily: 'var(--mono)',
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  padding: 12,
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: 'var(--paper-2)',
                  resize: 'vertical',
                }}
              />
            ) : (
              <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                {mode === 'encode'
                  ? 'The encoded string appears here as you type.'
                  : 'Paste an encoded string above — the decoded text appears here.'}
              </p>
            )}
          </div>

          {showBreakdown && (
            <div className="panel" style={{ marginTop: 16 }}>
              <span className="panel-title">Breakdown</span>
              {parts && (
                <dl
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '6px 14px',
                    margin: '12px 0 0',
                    fontSize: 14,
                  }}
                >
                  {(['protocol', 'host', 'path', 'query', 'fragment'] as const).map((k) =>
                    parts[k] ? (
                      <div key={k} style={{ display: 'contents' }}>
                        <dt className="muted">{k}</dt>
                        <dd style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: 13, wordBreak: 'break-all' }}>
                          {parts[k]}
                        </dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              )}
              {queryParams.length > 0 && (
                <>
                  <table style={{ width: '100%', marginTop: 14, borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ textAlign: 'left' }}>
                        <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>Key</th>
                        <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryParams.map((p, i) => (
                        <tr key={`${p.key}-${i}`}>
                          <td
                            style={{
                              padding: '6px 10px',
                              borderBottom: '1px solid var(--line)',
                              fontFamily: 'var(--mono)',
                              fontSize: 13,
                              wordBreak: 'break-all',
                            }}
                          >
                            {p.key}
                          </td>
                          <td
                            style={{
                              padding: '6px 10px',
                              borderBottom: '1px solid var(--line)',
                              fontFamily: 'var(--mono)',
                              fontSize: 13,
                              wordBreak: 'break-all',
                            }}
                          >
                            {p.value === '' ? <span className="muted">(empty)</span> : p.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="row" style={{ marginTop: 10, gap: 8 }}>
                    <button
                      className="btn"
                      style={{ padding: '6px 12px', fontSize: 13 }}
                      onClick={() => void copy(buildQuery(queryParams))}
                    >
                      <CopyIcon size={14} /> Copy rebuilt query
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <AdSlot />
          </div>
        </div>

        <aside className="stack-md">
          <div className="panel">
            <span className="panel-title">What you get</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              {[
                'Component and full-URL encode modes',
                'Decode with honest, positioned errors',
                'Query string parsed into a decoded table',
                'Whole URLs split into their parts',
                'Live conversion as you type',
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
              <LockIcon size={14} /> The URLs people decode are tracking links, password-reset
              tokens and signed redirect URLs — exactly what should not pass through a server.
              Conversion runs in this tab. <Link to="/privacy">Read the privacy policy</Link>.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/url-encoding-without-upload">Guide: URL encoding without a server</Link>
              </li>
              <li>
                <Link to="/tools/base64">Base64 encoder</Link>
              </li>
              <li>
                <Link to="/tools/json-formatter">JSON formatter</Link>
              </li>
              <li>
                <Link to="/tools/hash-generator">Hash generator</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Component mode vs full-URL mode</h2>
          <p>
            The single most common URL-encoding bug is using the wrong mode. Component mode escapes
            everything that could be mistaken for URL structure — &amp;, =, ?, /, # — so a value
            like "salt &amp; pepper" can sit safely inside ?q=salt%20%26%20pepper without eating the
            rest of the query string. Full-URL mode does the opposite: it trusts the structure and
            only escapes characters a URL can never contain, like spaces and non-ASCII text. Encode
            a whole link in component mode and every : and / gets mangled; encode a query value in
            full-URL mode and an &amp; inside it silently starts a new parameter. The modes are not
            interchangeable, and this tool keeps them clearly separate.
          </p>

          <h2>What + really means</h2>
          <p>
            Nowhere in RFC 3986 does + mean space. That convention comes from HTML forms: when a
            browser submits a form as application/x-www-form-urlencoded, spaces become + signs, and
            servers decoding the body turn them back. Query strings inherited the habit. Outside a
            query — in a path, a fragment, a filename — + is a literal plus sign, and decoding it as
            a space corrupts the data: think of a file literally named "c++notes.txt". The safe rule
            is to encode spaces as %20 and only treat + as a space when you know the string came
            from form data — which is why the option exists here rather than being always on.
          </p>

          <h2>Why decoding fails — and where</h2>
          <p>
            A percent sign promises two hexadecimal digits. When that promise breaks — %zz, %2, a
            stray % at the end — the string is malformed and no decoder can guess the intent, so
            this tool reports the exact position of the bad escape instead of failing silently. The
            subtler failure is truncation: a non-ASCII character becomes two to four escapes in
            UTF-8, and cutting the string mid-character leaves bytes that are not valid text. Both
            failures usually trace back to the same root cause — a URL that was decoded twice, or a
            value that was never encoded at all and just happened to contain a %.
          </p>

          <h2>Reading a query string</h2>
          <p>
            The breakdown panel pulls a URL apart into protocol, host, path, query and fragment,
            then decodes the query into its key-value pairs — including duplicates, which are legal
            and meaningful (filters, multi-selects, UTM tags). It is the fastest way to see what a
            tracking link actually carries before you click it, or to verify that a redirect URL you
            built contains the parameters you think it does. The rebuilt query button re-encodes the
            pairs canonically, which is a quick check for values that were double-encoded upstream.
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
