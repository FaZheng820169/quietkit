import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { decodeToBytes, encodeBytes, encodeText } from '../lib/base64'
import { downloadBlob, formatBytes } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Is my data uploaded to be encoded or decoded?',
    a: 'No. Base64 encoding is arithmetic — there is nothing a server can do that this page cannot. The conversion runs in JavaScript inside this tab. You can verify it: open the Network panel in your browser developer tools and watch it stay empty while you type, or load the page, disconnect from the internet and keep converting.',
  },
  {
    q: 'Why do some Base64 tools break on non-English text?',
    a: 'The browser\'s built-in btoa() function works on bytes, not characters, and throws an "InvalidCharacterError" on anything outside Latin-1 — accented letters, CJK text, emoji. This tool converts text to UTF-8 bytes first, so any character in any language encodes and decodes correctly.',
  },
  {
    q: 'What is the URL-safe variant of Base64?',
    a: 'Standard Base64 uses + and /, which have special meanings in URLs, and ends with = padding. The URL-safe variant (RFC 4648 §5) swaps + for - and / for _, and usually drops the padding. It is what JSON Web Tokens (JWTs) and many URL parameters use. Tick "URL-safe" when your output is going into a link or a token.',
  },
  {
    q: 'Why does my Base64 string fail to decode?',
    a: 'The usual causes: the string uses the URL-safe alphabet while standard mode is selected (or the reverse), characters outside the Base64 alphabet slipped in when copying, or the data is not Base64 at all. Missing padding is tolerated. If decoding succeeds but the result is not valid UTF-8 text, the original data was binary — an image, an archive — and this tool offers it as a file download instead of garbled text.',
  },
  {
    q: 'How much bigger is Base64 than the original data?',
    a: 'About 33% — every 3 bytes become 4 characters, plus padding. That is why email attachments and embedded images grow when they are Base64-encoded. Base64 is a transport format for moving binary data through text-only channels, not a compression or encryption method.',
  },
]

export function Base64() {
  useSeo({
    ...routeMeta('/tools/base64'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Base64 Encoder & Decoder',
          'Encode text or files to Base64 and decode them back, with a URL-safe variant. Unicode-safe, runs locally in your browser — nothing is uploaded.',
          '/tools/base64',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileB64, setFileB64] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  // Encode side: live text conversion, or the picked file's bytes.
  const encoded = useMemo(() => {
    if (mode !== 'encode') return ''
    if (file) return fileB64
    return encodeText(input, urlSafe)
  }, [mode, input, urlSafe, file, fileB64])

  const encodeInputBytes = useMemo(() => {
    if (file) return file.size
    return new TextEncoder().encode(input).length
  }, [file, input])

  // Decode side: bytes first, then an honest attempt at UTF-8 text.
  type Decoded =
    | { kind: 'error'; error: string }
    | { kind: 'text'; text: string; bytes: Uint8Array }
    | { kind: 'binary'; bytes: Uint8Array }

  const decoded = useMemo<Decoded | null>(() => {
    if (mode !== 'decode' || input.trim() === '') return null
    const r = decodeToBytes(input, urlSafe)
    if (!r.ok || !r.bytes) return { kind: 'error', error: r.error ?? 'Decode failed.' }
    const bytes = r.bytes
    try {
      return { kind: 'text', text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), bytes }
    } catch {
      return { kind: 'binary', bytes }
    }
  }, [mode, input, urlSafe])

  const output = mode === 'encode' ? encoded : decoded?.kind === 'text' ? decoded.text : ''
  const outputBytes =
    mode === 'encode' ? encoded.length : decoded && decoded.kind !== 'error' ? decoded.bytes.length : 0
  const hasOutput = output !== '' || decoded?.kind === 'binary'
  const decodeError = decoded?.kind === 'error' ? decoded.error : null
  const decodeBinary = decoded?.kind === 'binary'

  const pickFile = async (picked: FileList | null) => {
    const chosen = picked?.[0]
    if (!chosen) return
    const bytes = new Uint8Array(await chosen.arrayBuffer())
    setFile(chosen)
    setFileB64(encodeBytes(bytes, urlSafe))
  }

  const clear = () => {
    setInput('')
    setFile(null)
    setFileB64('')
    if (fileInput.current) fileInput.current.value = ''
  }

  const swap = () => {
    if (!output) return
    setInput(output)
    setFile(null)
    setFileB64('')
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    if (mode === 'encode') {
      downloadBlob(new Blob([encoded], { type: 'text/plain' }), 'encoded-base64.txt')
    } else if (decoded && decoded.kind !== 'error') {
      downloadBlob(new Blob([decoded.bytes.slice().buffer as ArrayBuffer]), 'decoded.bin')
    }
  }

  // Re-encode the picked file when the alphabet changes.
  const toggleUrlSafe = async (checked: boolean) => {
    setUrlSafe(checked)
    if (file) {
      const bytes = new Uint8Array(await file.arrayBuffer())
      setFileB64(encodeBytes(bytes, checked))
    }
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>Encode and decode Base64 without a server</h1>
          <p>
            Turn text or files into Base64 and back again — Unicode-safe, with a URL-safe variant
            for tokens and links. The conversion is arithmetic, and it happens in this tab.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="panel-title">{mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}</span>
              <div className="segmented">
                <button aria-pressed={mode === 'encode'} onClick={() => setMode('encode')}>
                  Encode
                </button>
                <button aria-pressed={mode === 'decode'} onClick={() => setMode('decode')}>
                  Decode
                </button>
              </div>
            </div>

            {file ? (
              <div
                className="row"
                style={{
                  justifyContent: 'space-between',
                  marginTop: 12,
                  padding: '10px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: 'var(--paper-2)',
                }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <FileIcon size={18} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</div>
                    <div className="small muted">{formatBytes(file.size)}</div>
                  </div>
                </div>
                <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={clear}>
                  <TrashIcon size={14} /> Remove
                </button>
              </div>
            ) : (
              <textarea
                aria-label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 160,
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
                    ? 'Type or paste text — any language, emoji included…'
                    : 'Paste a Base64 string…'
                }
              />
            )}

            <div className="row" style={{ marginTop: 12, gap: 14, flexWrap: 'wrap' }}>
              <label className="row" style={{ gap: 6, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => void toggleUrlSafe(e.target.checked)}
                />
                URL-safe alphabet
              </label>
              <span style={{ flex: 1 }} />
              {mode === 'encode' && !file && (
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => fileInput.current?.click()}
                >
                  <FileIcon size={14} /> Encode a file
                </button>
              )}
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
            <input
              ref={fileInput}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => void pickFile(e.target.files)}
            />
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div className="row" style={{ gap: 14, fontSize: 14 }}>
                <span className="panel-title">Output</span>
                {hasOutput && !decodeError && (
                  <span className="muted" style={{ fontSize: 13 }}>
                    {mode === 'encode'
                      ? `${formatBytes(encodeInputBytes)} → ${outputBytes.toLocaleString()} Base64 characters`
                      : `${outputBytes.toLocaleString()} bytes decoded`}
                  </span>
                )}
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={copy}
                  disabled={!output}
                >
                  <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={download}
                  disabled={!hasOutput || !!decodeError}
                >
                  <DownloadIcon size={14} /> {mode === 'encode' ? '.txt' : 'file'}
                </button>
              </div>
            </div>

            {decodeError ? (
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--red, #b3402a)' }}>{decodeError}</p>
            ) : decodeBinary ? (
              <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                Decoded data is not valid UTF-8 text — it is binary (an image, an archive, a
                compiled file). Use the download button to save it as a file.
              </p>
            ) : output ? (
              <textarea
                readOnly
                aria-label="Output"
                value={output}
                style={{
                  width: '100%',
                  minHeight: 160,
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
                  ? 'The Base64 appears here as you type.'
                  : 'Paste Base64 above — the decoded text appears here.'}
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
                'Unicode-safe encode and decode — emoji and CJK work',
                'URL-safe alphabet for tokens and links',
                'Encode whole files, not just text',
                'Live conversion as you type',
                'Honest errors for invalid or binary data',
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
              <LockIcon size={14} /> API keys, credentials and snippets are exactly what Base64
              gets used for — and exactly what should not pass through a server. Conversion runs in
              this tab. <Link to="/privacy">Read the privacy policy</Link>.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/base64-without-upload">Guide: Base64 without a server</Link>
              </li>
              <li>
                <Link to="/tools/hash-generator">Hash generator</Link>
              </li>
              <li>
                <Link to="/tools/json-formatter">JSON formatter</Link>
              </li>
              <li>
                <Link to="/tools/text-diff">Text diff</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What Base64 is actually for</h2>
          <p>
            Base64 turns any bytes — text, an image, a compiled binary — into a string of 64 safe
            ASCII characters. It exists because many systems were built to carry text only: email
            attachments, JSON fields, URL parameters, XML documents, Basic-auth headers. Encoding
            costs about 33% in size; in exchange the data survives any text-only channel
            untouched. It is a transport format, not encryption — anyone can decode it, so never
            treat a Base64 string as a secret.
          </p>

          <h2>Why btoa breaks on Unicode — and this tool doesn't</h2>
          <p>
            The browser's built-in btoa() predates the Unicode web: it encodes a string as if every
            character were a single byte, and throws an InvalidCharacterError on accented letters,
            Chinese or Japanese text, and emoji. The correct approach is to convert the text to
            UTF-8 bytes first, then encode those bytes. That is what this tool does, so "café —
            你好 👋" round-trips perfectly where naive tools fail.
          </p>

          <h2>The URL-safe variant</h2>
          <p>
            Standard Base64 uses + and /, both of which mean something else inside a URL, and pads
            the end with =. The URL-safe alphabet defined in RFC 4648 swaps + for - and / for _
            and typically omits padding. JSON Web Tokens are the best-known example: a JWT is three
            URL-safe Base64 segments joined by dots. If your output is headed for a link, a token
            or a filename, tick the URL-safe option.
          </p>

          <h2>When decoding fails</h2>
          <p>
            Decoding is stricter than encoding because real-world input is messy. This tool
            tolerates whitespace and missing padding, reports characters outside the alphabet
            instead of silently skipping them, and warns when the decoded bytes are binary rather
            than text — offering a file download instead of a screen of mojibake. The most common
            failure is an alphabet mismatch: a URL-safe string pasted into standard mode. Tick the
            URL-safe box and try again.
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
