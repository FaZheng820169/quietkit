import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, DownloadIcon, LockIcon, TrashIcon } from '../components/Icons'
import { diffLines, diffRows, diffStats, splitLines, toUnifiedDiff } from '../lib/diff'
import { downloadBlob } from '../lib/files'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Are my texts uploaded anywhere to be compared?',
    a: 'No. The diff algorithm is JavaScript running in this tab. Paste, compare, copy and download all happen locally — you can watch the Network panel in your browser developer tools, or load the page and then disconnect from the internet. Nothing changes.',
  },
  {
    q: 'What exactly is being compared?',
    a: 'Lines. The tool splits both texts into lines, finds the smallest set of line insertions and deletions that turns the original into the revision (the Myers algorithm, the same family git uses), then highlights the changed words inside each modified line. Whitespace-only or case-only differences can be ignored with the checkboxes.',
  },
  {
    q: 'What is a unified diff and what can I do with it?',
    a: 'A unified diff is the standard plain-text format for describing changes: --- and +++ headers, @@ hunks with line numbers, and lines prefixed by a space, minus or plus. It is what git diff produces. You can save it as a .diff or .patch file, attach it to a review, or apply it with tools like git apply or patch.',
  },
  {
    q: 'Is there a size limit?',
    a: 'There is no upload limit because there is no upload. Very large pastes — tens of thousands of changed lines in the edited region — fall back to a plain remove-and-add block instead of a line-by-line alignment, so the page stays responsive. Texts of normal contract, config or article size diff instantly.',
  },
  {
    q: 'When should I tick “Ignore whitespace”?',
    a: 'When a document has been through an editor that re-wraps or re-indents: a config file reformatted by a tool, a contract pasted from a PDF, or code with tabs converted to spaces. The option compares lines with runs of whitespace collapsed and edges trimmed, so only real wording changes surface.',
  },
]

const SAMPLE_A = `Services Agreement — draft v1

1. Scope. The Contractor will deliver the work described in Exhibit A.
2. Payment. Invoices are due within 30 days of receipt.
3. Term. This agreement runs from 1 March 2026 to 31 August 2026.
4. Confidentiality. Both parties will keep shared information confidential.
5. Termination. Either party may end this agreement with 14 days' notice.`

const SAMPLE_B = `Services Agreement — draft v2

1. Scope. The Contractor will deliver the work described in Exhibit A.
2. Payment. Invoices are due within 14 days of receipt.
3. Term. This agreement runs from 1 March 2026 to 31 December 2026.
4. Confidentiality. Both parties will keep shared information confidential for 3 years.
5. Termination. Either party may end this agreement with 30 days' notice.
6. Governing law. This agreement is governed by the laws of England and Wales.`

export function TextDiff() {
  useSeo({
    ...routeMeta('/tools/text-diff'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Text Diff',
          'Compare two versions of a text and see exactly what changed, line by line and word by word. Export a unified diff. Runs locally in your browser — nothing is uploaded.',
          '/tools/text-diff',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [a, setA] = useState(SAMPLE_A)
  const [b, setB] = useState(SAMPLE_B)
  const [ignoreWs, setIgnoreWs] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [copied, setCopied] = useState(false)

  const ops = useMemo(
    () => diffLines(splitLines(a), splitLines(b), { ignoreWhitespace: ignoreWs, ignoreCase }),
    [a, b, ignoreWs, ignoreCase],
  )
  const rows = useMemo(() => diffRows(ops), [ops])
  const stats = useMemo(() => diffStats(ops), [ops])
  const unified = useMemo(() => toUnifiedDiff(ops), [ops])

  const empty = a === '' && b === ''
  const identical = !empty && stats.added === 0 && stats.removed === 0

  const swap = () => {
    const oldA = a
    setA(b)
    setB(oldA)
  }

  const clear = () => {
    setA('')
    setB('')
  }

  const copyDiff = async () => {
    await navigator.clipboard.writeText(unified)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadDiff = () => {
    downloadBlob(new Blob([unified], { type: 'text/plain' }), 'changes.diff')
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Documents</span>
          <h1>Compare two texts without uploading either one</h1>
          <p>
            Paste the original and the revision — a contract, a config, a draft — and see exactly
            what changed, line by line and word by word. The comparison runs in this tab.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="md-grid">
            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="panel-title">Original</span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {splitLines(a).length} lines
                </span>
              </div>
              <textarea
                aria-label="Original text"
                value={a}
                onChange={(e) => setA(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 220,
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
                placeholder="Paste the original version…"
              />
            </div>

            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="panel-title">Revised</span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {splitLines(b).length} lines
                </span>
              </div>
              <textarea
                aria-label="Revised text"
                value={b}
                onChange={(e) => setB(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 220,
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
                placeholder="Paste the revised version…"
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: 12, gap: 16, flexWrap: 'wrap' }}>
            <label className="row" style={{ gap: 6, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={ignoreWs}
                onChange={(e) => setIgnoreWs(e.target.checked)}
              />
              Ignore whitespace
            </label>
            <label className="row" style={{ gap: 6, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
              />
              Ignore case
            </label>
            <span style={{ flex: 1 }} />
            <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={swap}>
              Swap sides
            </button>
            <button className="btn" style={{ padding: '6px 12px', fontSize: 13 }} onClick={clear}>
              <TrashIcon size={14} /> Clear
            </button>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div className="row" style={{ gap: 14, fontSize: 14 }}>
                <span className="panel-title">Changes</span>
                {!empty && (
                  <>
                    <span className="diff-stat-added">+{stats.added} added</span>
                    <span className="diff-stat-removed">−{stats.removed} removed</span>
                    <span className="muted">{stats.unchanged} unchanged</span>
                  </>
                )}
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={copyDiff}
                  disabled={!unified}
                >
                  <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy unified diff'}
                </button>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={downloadDiff}
                  disabled={!unified}
                >
                  <DownloadIcon size={14} /> .diff
                </button>
              </div>
            </div>

            {empty ? (
              <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                Paste both versions above — the comparison appears here as you type.
              </p>
            ) : identical ? (
              <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                No changes — the two texts are identical
                {ignoreWs || ignoreCase ? ' under the current ignore options' : ''}.
              </p>
            ) : (
              <div className="diff-wrap">
                <table className="diff-table">
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.type === 'ins' ? 'diff-ins' : row.type === 'del' ? 'diff-del' : undefined
                        }
                      >
                        <td className="diff-no">{row.aNo ?? ''}</td>
                        <td className="diff-no">{row.bNo ?? ''}</td>
                        <td className="diff-line">
                          <span className="diff-sign">
                            {row.type === 'ins' ? '+' : row.type === 'del' ? '-' : ' '}
                          </span>
                          {row.segments.every((s) => s.text === '')
                            ? ' '
                            : row.segments.map((seg, j) =>
                                seg.changed ? (
                                  <mark key={j} className="diff-changed">
                                    {seg.text}
                                  </mark>
                                ) : (
                                  <span key={j}>{seg.text}</span>
                                ),
                              )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                'Line-by-line comparison as you type',
                'Changed words highlighted inside each line',
                'Ignore whitespace or case options',
                'Copy or download a standard unified diff',
                'Zero uploads — both texts stay local',
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
              <LockIcon size={14} /> Comparing happens in this tab. Contracts, configs and drafts
              are never sent anywhere. <Link to="/privacy">Read the privacy policy</Link>.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/text-diff-without-upload">Guide: compare texts without a server</Link>
              </li>
              <li>
                <Link to="/tools/json-formatter">JSON formatter</Link>
              </li>
              <li>
                <Link to="/tools/markdown-preview">Markdown preview</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
