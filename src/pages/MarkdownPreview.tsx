import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, DownloadIcon, FileIcon, LockIcon, TrashIcon } from '../components/Icons'
import { downloadBlob } from '../lib/files'
import { countWords, markdownToHtmlDocument, renderMarkdown } from '../lib/markdown'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Is my draft uploaded anywhere when I preview it?',
    a: 'No. The renderer is JavaScript running in this tab. Typing, previewing, copying and downloading all happen locally — you can confirm it in the Network panel of your browser developer tools, or by disconnecting from the internet after the page loads.',
  },
  {
    q: 'Which Markdown syntax is supported?',
    a: 'Headings, bold, italic, strikethrough, inline code and fenced code blocks, links, images, blockquotes, horizontal rules, ordered and unordered lists, and tables with alignment. That covers the CommonMark core plus the most-used GFM extras.',
  },
  {
    q: 'What happens to raw HTML inside my Markdown?',
    a: 'It is shown as text, never executed. The renderer escapes every HTML character before applying Markdown formatting, and link URLs are restricted to http, https and mailto schemes. This is the safe default for previewing untrusted or copied content.',
  },
  {
    q: 'Can I export the result as an HTML file?',
    a: 'Yes. “Download .html” produces a standalone document with embedded minimal styling that opens correctly in any browser. “Copy HTML” puts just the rendered body markup on your clipboard for pasting into a CMS, email template or static site.',
  },
  {
    q: 'Why use this instead of the preview built into my editor?',
    a: 'If your editor has one, use it. This tool is for the cases where it does not exist: editing a gist in a browser tab, reviewing a changelog pasted from an email, checking a table before committing, or working on a machine where you cannot install anything.',
  },
]

const SAMPLE = `# Meeting notes — draft

**Attendees:** you, your team, and nobody else.

## Decisions

1. Ship the *smallest* useful thing first.
2. Keep drafts **local** until they are ready.

## Open questions

- Does the API support ~~webhooks~~ callbacks?
- Who owns the \`deploy\` step?

| Task | Owner | Due |
|:-----|:-----:|----:|
| Write spec | Ana | Monday |
| Review spec | Ben | Tuesday |

> A draft you have not shared yet should stay exactly that — unshared.

Find the syntax reference at [CommonMark](https://commonmark.org).
`

export function MarkdownPreview() {
  useSeo({
    ...routeMeta('/tools/markdown-preview'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Markdown Preview',
          'Write Markdown and see it rendered live. Copy or download clean HTML, or keep the .md file. Rendering runs locally in your browser — drafts never leave your device.',
          '/tools/markdown-preview',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [input, setInput] = useState(SAMPLE)
  const [copied, setCopied] = useState<string | null>(null)

  const html = useMemo(() => renderMarkdown(input), [input])
  const words = useMemo(() => countWords(input), [input])

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const openFile = () => {
    const picker = document.createElement('input')
    picker.type = 'file'
    picker.accept = '.md,.markdown,.txt,text/markdown,text/plain'
    picker.onchange = async () => {
      const file = picker.files?.[0]
      if (file) setInput(await file.text())
    }
    picker.click()
  }

  const downloadHtml = () => {
    downloadBlob(
      new Blob([markdownToHtmlDocument(input, 'Document')], { type: 'text/html' }),
      'document.html',
    )
  }

  const downloadMd = () => {
    downloadBlob(new Blob([input], { type: 'text/markdown' }), 'document.md')
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Writer</span>
          <h1>Preview Markdown without pasting drafts into a server</h1>
          <p>
            Live rendering as you type, clean HTML export, and a renderer that treats raw HTML as
            text. Unfinished drafts stay on your device — where they belong.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="md-grid">
            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="panel-title">Markdown</span>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={openFile}>
                    <FileIcon size={14} /> Open .md
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
                  minHeight: 420,
                  marginTop: 12,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 14,
                  lineHeight: 1.6,
                  padding: 12,
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: 'var(--paper-2)',
                  resize: 'vertical',
                }}
                placeholder="# Start writing…"
              />
              <div className="row" style={{ marginTop: 10, gap: 16, fontSize: 13 }}>
                <span className="muted">{words} words</span>
                <span className="muted">{new Blob([input]).size} bytes</span>
              </div>
            </div>

            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="panel-title">Preview</span>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={() => copy(html, 'html')}
                    disabled={!html}
                  >
                    <CopyIcon size={14} /> {copied === 'html' ? 'Copied' : 'Copy HTML'}
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={downloadHtml}
                    disabled={!html}
                  >
                    <DownloadIcon size={14} /> .html
                  </button>
                  <button
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={downloadMd}
                    disabled={!input}
                  >
                    <DownloadIcon size={14} /> .md
                  </button>
                </div>
              </div>
              {html ? (
                <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <p className="muted" style={{ marginTop: 12 }}>
                  Nothing to preview yet — start typing on the left.
                </p>
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
                'Live preview as you type',
                'Tables, lists, quotes and code blocks',
                'Raw HTML shown as text, never executed',
                'Copy body HTML or download a styled file',
                'Zero uploads — drafts stay local',
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
              <LockIcon size={14} /> Rendering happens in this tab. No draft, keystroke or file name
              is sent anywhere. <Link to="/privacy">Read the privacy policy</Link>.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/markdown-preview-without-upload">
                  Guide: preview Markdown without a server
                </Link>
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
    </>
  )
}
