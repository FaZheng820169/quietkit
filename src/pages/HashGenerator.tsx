import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { Dropzone } from '../components/Dropzone'
import { CheckIcon, CopyIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { formatBytes } from '../lib/files'
import { HASH_ALGORITHMS, hashFileAll, hashTextAll, type HashAlgorithm } from '../lib/hash'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'What is a hash and why would I want one?',
    a: 'A hash is a fixed-length fingerprint of data. The same input always produces the same hash, but you cannot reverse a hash to recover the input. The main uses are verifying that a downloaded file was not corrupted or tampered with, and storing passwords (which this tool is not for — use a password manager instead).',
  },
  {
    q: 'Which algorithm should I use?',
    a: 'SHA-256 is the current standard and the right choice for almost everything. SHA-512 is stronger and sometimes faster on 64-bit systems. SHA-1 is broken for security purposes — do not use it for anything that matters — but it is still widely used for non-security checksums like git commit IDs.',
  },
  {
    q: 'Why is there no MD5?',
    a: 'MD5 is cryptographically broken — collisions can be generated in seconds on a laptop. Modern browsers no longer expose it in the Web Crypto API. If a website asks you to verify an MD5 hash, treat it as a hint, not a guarantee, and prefer a SHA-256 hash when one is available.',
  },
  {
    q: 'Is my file uploaded to compute the hash?',
    a: 'No. The file is read by the browser into memory, hashed with the Web Crypto API, and discarded. Nothing is transmitted. This matters for unreleased software, internal documents and any file you would not want on a third-party server.',
  },
  {
    q: 'How do I verify a download with a hash?',
    a: 'Find the hash published by the software vendor (usually on the download page or in a release note), download the file, then drop it here. Compare the SHA-256 hash shown on this page with the published one — they must match exactly, character for character. If they differ, the file is corrupted or has been modified.',
  },
]

export function HashGenerator() {
  useSeo({
    ...routeMeta('/tools/hash-generator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Hash Generator',
          'Compute SHA-256, SHA-512, SHA-384 and SHA-1 hashes of text or files entirely in your browser. Verify downloads and check integrity — nothing is uploaded.',
          '/tools/hash-generator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string> | null>(null)
  const [working, setWorking] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Text hashes are async (Web Crypto), so compute them in an effect.
  useEffect(() => {
    if (mode !== 'text' || text === '') {
      setHashes(null)
      setWorking(false)
      return
    }
    let cancelled = false
    setWorking(true)
    hashTextAll(text)
      .then((result) => {
        if (!cancelled) {
          setHashes(result)
          setWorking(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHashes(null)
          setWorking(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [mode, text])

  const pickFile = async (picked: File[]) => {
    const chosen = picked[0]
    if (!chosen) return
    setFile(chosen)
    setWorking(true)
    setHashes(null)
    try {
      const result = await hashFileAll(chosen)
      setHashes(result)
    } catch {
      setHashes(null)
    } finally {
      setWorking(false)
    }
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const reset = () => {
    setFile(null)
    setHashes(null)
    setText('')
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Security</span>
          <h1>Hash a file or string without uploading it</h1>
          <p>
            SHA-256, SHA-512, SHA-384 and SHA-1 fingerprints computed by the Web Crypto API inside
            this tab. Verify a download, check a config, or compare two files — without the file
            leaving your device.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="panel-title">Input</span>
              <div className="segmented">
                <button aria-pressed={mode === 'text'} onClick={() => setMode('text')}>
                  Text
                </button>
                <button aria-pressed={mode === 'file'} onClick={() => setMode('file')}>
                  File
                </button>
              </div>
            </div>

            {mode === 'text' ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 140,
                  marginTop: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 14,
                  lineHeight: 1.5,
                  padding: 12,
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: 'var(--paper-2)',
                  resize: 'vertical',
                }}
                placeholder="Type or paste text to hash…"
              />
            ) : (
              <div style={{ marginTop: 12 }}>
                {!file ? (
                  <Dropzone
                    accept="*/*"
                    multiple={false}
                    title="Drop a file here"
                    hint="Any type, any size — hashed locally"
                    icon={<FileIcon size={30} />}
                    onFiles={pickFile}
                  />
                ) : (
                  <div className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--paper-2)' }}>
                    <div className="row" style={{ gap: 10 }}>
                      <FileIcon size={18} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</div>
                        <div className="small muted">{formatBytes(file.size)}</div>
                      </div>
                    </div>
                    <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={reset}>
                      <TrashIcon size={14} /> Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {(hashes || working) && (
            <div className="panel" style={{ marginTop: 20 }}>
              <span className="panel-title">Hashes</span>
              <div className="stack-sm" style={{ marginTop: 12 }}>
                {working && !hashes ? (
                  <p className="small muted">Computing hashes…</p>
                ) : (
                  HASH_ALGORITHMS.map((algo) => {
                    const value = hashes?.[algo]
                    if (!value) return null
                    return (
                      <div
                        key={algo}
                        className="row"
                        style={{
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          border: '1px solid var(--line)',
                          borderRadius: 8,
                          background: 'var(--paper-2)',
                        }}
                      >
                        <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                          <span className="small muted" style={{ width: 64, flexShrink: 0 }}>{algo}</span>
                          <code style={{ fontSize: 13, wordBreak: 'break-all' }}>{value}</code>
                        </div>
                        <button
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: 13, flexShrink: 0 }}
                          onClick={() => copy(value, algo)}
                        >
                          <CopyIcon size={14} /> {copied === algo ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
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
                'SHA-256, SHA-512, SHA-384 and SHA-1',
                'Text input or file drop',
                'All four hashes computed at once',
                'One click to copy any hash',
                'Files hashed locally, never uploaded',
              ].map((item) => (
                <li key={item} className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/hash-generator-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: hash files without the upload
                </Link>
              </li>
              <li>
                <Link to="/tools/password-generator" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Generate a strong password
                </Link>
              </li>
              <li>
                <Link to="/tools/json-formatter" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Format the JSON you just hashed
                </Link>
              </li>
              <li>
                <Link to="/tools/metadata-cleaner" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Strip metadata before sharing a file
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Local by design</span>
            <p className="small muted">
              A file you want to verify is often a file you do not fully trust — or one you do not
              want to share. Hashing it locally means the content never leaves your device.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What a hash actually is</h2>
          <p>
            A cryptographic hash function takes any input — a sentence, a photo, a 4 GB installer —
            and produces a fixed-length string of characters. The same input always produces the
            same output, but the output tells you nothing about the input. Change one bit of the
            input and the hash changes completely. This makes hashes perfect for verifying that two
            copies of a file are identical without comparing every byte.
          </p>

          <h2>Which algorithm to choose</h2>
          <p>
            SHA-256 is the current standard and the right default for almost everything. It is fast,
            widely supported, and considered secure against all known attacks. SHA-512 produces a
            longer hash and is sometimes faster on 64-bit processors because it works with 64-bit
            words internally. SHA-1 is broken — collisions can be found by a well-funded attacker —
            but it is still everywhere in legacy systems like git, so you will encounter it.
          </p>

          <h2>Why MD5 is missing</h2>
          <p>
            MD5 was the standard hash for decades, but it is now cryptographically broken.
            Collisions — two different files with the same MD5 hash — can be generated in seconds on
            a laptop. Modern browsers removed MD5 from the Web Crypto API because it gives a false
            sense of security. If a website asks you to verify an MD5 hash, treat it as a hint, not
            a guarantee, and look for a SHA-256 hash instead.
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
