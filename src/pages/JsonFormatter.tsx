import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { downloadBlob } from '../lib/files'
import { countNodes, formatJson, maxDepth, minifyJson, parseJson, sortKeys } from '../lib/jsonTool'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Is it safe to paste API keys or user data into this formatter?',
    a: 'Yes, because the JSON never leaves your browser. The parser runs in JavaScript on this page, and there is no network request when you click format, minify or download. You can disconnect from the internet after loading the page and it still works.',
  },
  {
    q: 'What does “sort keys” do?',
    a: 'It rewrites the JSON with object keys in alphabetical order, recursively. Arrays keep their original order. This is useful for comparing two versions of a config file or API response — when keys are in the same order, a diff shows only real changes.',
  },
  {
    q: 'Why does my JSON fail to parse even though it looks correct?',
    a: 'The most common causes are trailing commas after the last item in an array or object, single quotes instead of double quotes around strings, unquoted keys, or comments (which are not valid JSON). The error message shows the line and column where the parser gave up.',
  },
  {
    q: 'Can I format a JSON file from my computer?',
    a: 'Yes. Click “Open file” and pick a .json or .txt file. The contents are read into the text area by your browser, processed locally, and can be downloaded again after formatting. Nothing is uploaded.',
  },
  {
    q: 'What is the difference between 2-space, 4-space and tab indentation?',
    a: 'Only convention. 2 spaces is the most common in web projects and npm configs. 4 spaces is common in Java and Python ecosystems. Tabs produce the smallest files and let each developer choose their preferred visual width. The JSON data itself is identical in all three.',
  },
]

const SAMPLE = '{\n  "name": "quietkit",\n  "private": true,\n  "tools": ["compress", "convert", "merge"],\n  "uploads": 0\n}'

export function JsonFormatter() {
  useSeo({
    ...routeMeta('/tools/json-formatter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit JSON Formatter',
          'Format, validate and minify JSON entirely in your browser. Error messages show line and column. Sort keys alphabetically, copy or download the result — nothing is uploaded.',
          '/tools/json-formatter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [input, setInput] = useState(SAMPLE)
  const [indent, setIndent] = useState<2 | 4 | '\t'>(2)
  const [copied, setCopied] = useState<string | null>(null)

  const parsed = useMemo(() => parseJson(input), [input])
  const formatted = useMemo(() => (parsed.ok ? formatJson(input, indent) : null), [input, indent, parsed.ok])
  const stats = useMemo(() => {
    if (!parsed.ok) return null
    return { nodes: countNodes(parsed.data), depth: maxDepth(parsed.data) }
  }, [parsed])

  const output = formatted?.ok ? formatted.output : ''
  const bytesIn = new Blob([input]).size
  const bytesOut = output ? new Blob([output]).size : 0

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const openFile = () => {
    const picker = document.createElement('input')
    picker.type = 'file'
    picker.accept = '.json,.txt,application/json,text/plain'
    picker.onchange = async () => {
      const file = picker.files?.[0]
      if (file) setInput(await file.text())
    }
    picker.click()
  }

  const doMinify = () => {
    const result = minifyJson(input)
    if (result.ok && result.output) setInput(result.output)
  }

  const doSort = () => {
    const result = sortKeys(input)
    if (result.ok && result.output) setInput(result.output)
  }

  const download = () => {
    if (!output) return
    downloadBlob(new Blob([output], { type: 'application/json' }), 'formatted.json')
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Developer</span>
          <h1>Format JSON without pasting it into a server</h1>
          <p>
            Validate, format, minify and sort JSON with precise error locations. The parser runs in
            this tab — API keys and user data stay on your device.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="panel-title">Input</span>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={openFile}>
                  <FileIcon size={14} /> Open file
                </button>
                <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setInput('')}>
                  <TrashIcon size={14} /> Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 260,
                marginTop: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 14,
                lineHeight: 1.5,
                padding: 12,
                border: `1px solid ${parsed.ok || input.trim() === '' ? 'var(--line)' : '#c0392b'}`,
                borderRadius: 8,
                background: 'var(--paper-2)',
                resize: 'vertical',
              }}
              placeholder='{"paste": "your JSON here"}'
            />
            {!parsed.ok && input.trim() !== '' && (
              <div className="notice notice-error" style={{ marginTop: 10 }}>
                {parsed.error}
                {parsed.errorLine !== undefined && (
                  <span style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
                    Line {parsed.errorLine}, column {parsed.errorColumn}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="row" style={{ marginTop: 16, gap: 10, flexWrap: 'wrap' }}>
            <div className="segmented">
              {([2, 4, '\t'] as const).map((n) => (
                <button key={String(n)} aria-pressed={indent === n} onClick={() => setIndent(n)}>
                  {n === '\t' ? 'Tab' : `${n} spaces`}
                </button>
              ))}
            </div>
            <button className="btn" onClick={doMinify} disabled={!parsed.ok}>
              Minify
            </button>
            <button className="btn" onClick={doSort} disabled={!parsed.ok}>
              Sort keys
            </button>
          </div>

          {parsed.ok && output && (
            <div className="panel" style={{ marginTop: 20 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="panel-title">Output</span>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={() => copy(output, 'json')}
                  >
                    <CopyIcon size={14} /> {copied === 'json' ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={download}
                  >
                    <DownloadIcon size={14} /> Download
                  </button>
                </div>
              </div>
              <pre
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  fontSize: 14,
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  maxHeight: 420,
                  overflowY: 'auto',
                }}
              >
                <code>{output}</code>
              </pre>
              <div className="row" style={{ marginTop: 10, gap: 16, fontSize: 13 }}>
                <span className="muted">{bytesIn} → {bytesOut} bytes</span>
                {stats && (
                  <span className="muted">
                    {stats.nodes} values · max depth {stats.depth}
                  </span>
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
                'Instant validation with line and column',
                'Format with 2 spaces, 4 spaces or tabs',
                'Minify to a single line',
                'Sort object keys alphabetically',
                'Copy or download the result',
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
                <Link to="/guides/json-formatter-without-upload" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Guide: format JSON without the upload
                </Link>
              </li>
              <li>
                <Link to="/tools/password-generator" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Generate an API key password
                </Link>
              </li>
              <li>
                <Link to="/tools/qr-code" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Share JSON as a QR code
                </Link>
              </li>
              <li>
                <Link to="/tools/pdf-text" className="row" style={{ gap: 8 }}>
                  <CheckIcon size={15} /> Extract text from a PDF spec
                </Link>
              </li>
            </ul>
          </div>

          <div className="panel">
            <span className="panel-title">Local by design</span>
            <p className="small muted">
              JSON often contains secrets: API keys, tokens, user records, internal config. Here the
              parser runs in JavaScript inside this tab and nothing is transmitted.
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <LockIcon size={16} /> <span className="small">0 bytes uploaded</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Why paste JSON into a local tool</h2>
          <p>
            JSON is the lingua franca of APIs, configs and logs — and it routinely contains things
            you do not want to share: access tokens, customer email addresses, internal hostnames,
            database connection strings. An online formatter that runs on a server sees every byte
            you paste. A local formatter parses the text with the same JavaScript engine the rest
            of your browser uses, so the data never leaves the tab.
          </p>

          <h2>Reading the error message</h2>
          <p>
            When JSON fails to parse, the browser throws a message like “Unexpected token {'}'} in JSON
            at position 142”. This tool converts that position into a line and column number so you
            can jump straight to the problem. The usual suspects are a trailing comma after the
            last array element, a missing comma between object properties, or single quotes where
            JSON requires double quotes.
          </p>

          <h2>Minify versus format</h2>
          <p>
            Formatting adds whitespace so a human can read the structure. Minifying removes every
            unnecessary byte so the file is as small as possible for transmission. The data is
            identical either way — only the presentation changes. A good workflow is to keep
            configs formatted in the repository and minify them at build time.
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
