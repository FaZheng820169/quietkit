import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon, TrashIcon } from '../components/Icons'
import { CASE_FORMATS, convertCase, splitWords, type CaseKind } from '../lib/case'
import { analyzeText } from '../lib/wordcount'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Does my text get uploaded to be converted?',
    a: 'No. Changing the case of a string is a few lines of JavaScript, not a service — the conversion happens in this tab, the moment you type. Verify it: open the Network panel in your browser developer tools and watch it stay empty, or load the page, disconnect from the internet and keep converting.',
  },
  {
    q: 'What is the difference between camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE?',
    a: 'They are the five naming styles of source code. camelCase joins words with no separator and capitalises each word after the first — JavaScript variables and JSON keys. PascalCase capitalises every word — classes and React components. snake_case separates lowercased words with underscores — Python, Ruby and database columns. kebab-case uses hyphens — URL slugs and CSS classes. CONSTANT_CASE uppercases everything with underscores — environment variables. This converter produces all five from the same input.',
  },
  {
    q: 'How does it handle acronyms like "HTTPSConnection"?',
    a: 'By looking for the pattern a human reader sees: a run of capitals that ends where a normal word begins. "HTTPSConnection" splits into "HTTPS" and "Connection", so converting it to snake_case gives https_connection, not the h_t_t_p_s_connection a naive letter-by-letter converter produces. Mixed input like "HTTPS connection_status v2" splits cleanly into HTTPS, connection, status, v and 2 before any conversion happens.',
  },
  {
    q: 'Which words stay lowercase in Title Case?',
    a: 'Short connectors: a, an, the, and, but, or, nor, for, so, yet, and short prepositions like as, at, by, in, of, on, per, to, up and via — unless one of them is the first or last word, where every style guide capitalises it. Longer prepositions like "over" and "between" are capitalised, matching the AP convention. Hyphenated compounds follow the same rule part by part, so "well-known facts" becomes "Well-Known Facts".',
  },
  {
    q: 'What happens to numbers, punctuation and line breaks?',
    a: 'UPPERCASE, lowercase, Title Case and Sentence case preserve your text exactly as it is — same punctuation, same line breaks — only the letter case changes. The identifier styles (camel, pascal, snake, kebab, constant) treat punctuation as word separators, keep digits attached as their own word, and convert each line separately, so a pasted list of twenty names converts to a list of twenty names, not one giant identifier.',
  },
]

const SAMPLE =
  'The API response_format for HTTPSConnection was never documented\nuser first name\nlast login attempt'

export function CaseConverter() {
  useSeo({
    ...routeMeta('/tools/case-converter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Case Converter',
          'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case or CONSTANT_CASE. Handles acronyms and digits correctly. Runs locally in your browser — nothing is uploaded.',
          '/tools/case-converter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [input, setInput] = useState('')
  const [copiedKind, setCopiedKind] = useState<CaseKind | null>(null)

  const outputs = useMemo(
    () =>
      CASE_FORMATS.map((f) => ({
        ...f,
        output: input === '' ? '' : convertCase(input, f.kind),
      })),
    [input],
  )
  const stats = useMemo(() => analyzeText(input), [input])
  const wordCount = useMemo(() => splitWords(input).length, [input])

  const copyOutput = async (kind: CaseKind, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKind(kind)
    setTimeout(() => setCopiedKind(null), 1500)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Writing</span>
          <h1>Convert text case without sending a character anywhere</h1>
          <p>
            UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case,
            kebab-case and CONSTANT_CASE — all nine at once, with acronyms and digits handled
            properly. The conversion happens in this tab.
          </p>
        </div>
      </section>

      <div className="container workspace">
        <div>
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span className="panel-title">Your text</span>
              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => setInput(SAMPLE)}
                >
                  Try a sample
                </button>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => setInput('')}
                  disabled={input === ''}
                >
                  <TrashIcon size={14} /> Clear
                </button>
              </div>
            </div>

            <textarea
              aria-label="Text to convert"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 140,
                marginTop: 12,
                fontSize: 14.5,
                lineHeight: 1.7,
                padding: 12,
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--paper-2)',
                resize: 'vertical',
              }}
              placeholder="Type or paste text — a heading, a variable name, a list of identifiers…"
            />

            {input !== '' && (
              <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                {stats.characters.toLocaleString()} characters · {stats.words.toLocaleString()}{' '}
                words · {wordCount.toLocaleString()} identifier words · {stats.lines.toLocaleString()}{' '}
                lines. Identifier styles convert line by line.
              </p>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 16,
              marginTop: 16,
            }}
          >
            {outputs.map((f) => (
              <div className="panel" key={f.kind} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <span className="panel-title" style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                    {f.label}
                  </span>
                  <button
                    className="btn"
                    style={{ padding: '4px 10px', fontSize: 12.5 }}
                    onClick={() => void copyOutput(f.kind, f.output)}
                    disabled={f.output === ''}
                    aria-label={`Copy ${f.label}`}
                  >
                    <CopyIcon size={13} /> {copiedKind === f.kind ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="muted" style={{ fontSize: 12.5, margin: '6px 0 0' }}>
                  {f.blurb}
                </p>
                <div
                  className="mono"
                  style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    minHeight: 44,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    background: 'var(--paper-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    flexGrow: 1,
                    color: f.output === '' ? 'var(--ink-3, #999)' : undefined,
                  }}
                >
                  {f.output === '' ? f.example : f.output}
                </div>
              </div>
            ))}
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
                'All nine styles from one input, live',
                'Acronyms kept whole: HTTPSConnection → https_connection',
                'Title Case with real small-word rules',
                'Sentence case that fixes the pronoun I',
                'Identifier styles convert line by line',
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
              <LockIcon size={14} /> Draft headings, unreleased code names, half-renamed APIs — the
              text people re-case is often text they have not published. It should not pass through
              a server to be re-lettered. <Link to="/privacy">Read the privacy policy</Link>.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/case-conversion-without-upload">
                  Guide: convert case without a server
                </Link>
              </li>
              <li>
                <Link to="/tools/word-counter">Word counter</Link>
              </li>
              <li>
                <Link to="/tools/text-diff">Text diff</Link>
              </li>
              <li>
                <Link to="/tools/markdown-preview">Markdown preview</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>Four naming styles walk into a codebase</h2>
          <p>
            Every programming community picked a different answer to the same question — how to
            write a multi-word name when spaces are forbidden. JavaScript chose camelCase, joining
            words and capitalising each one after the first. Python and Ruby chose snake_case,
            keeping everything low and separating with underscores. CSS and URLs chose kebab-case,
            which reads closest to plain language. Classes and components almost everywhere chose
            PascalCase, and constants shout in CONSTANT_CASE. None of them is better; all of them
            are load-bearing conventions that linters enforce and colleagues notice. Converting
            between them is mechanical work — exactly the kind a browser tab should do for you.
          </p>

          <h2>Why acronyms break naive converters</h2>
          <p>
            Ask a simple script to turn "HTTPSConnection" into snake_case and it will happily
            return h_t_t_p_s_connection, inserting a separator at every capital letter. A human
            reader sees two words, not nine. This converter splits on the pattern a reader uses: a
            run of capitals belongs together until the last capital before a lowercase letter,
            which starts the next word. So HTTPSConnection becomes HTTPS + Connection, and the
            snake_case output is the https_connection you actually wanted. Digits get the same
            respect: version2Id splits into version, 2 and Id, so the identifier styles produce
            version_2_id rather than pretending the digit never existed.
          </p>

          <h2>Title Case and its small words</h2>
          <p>
            Real headline style is not "capitalise every word" — that is just capitalising. The
            style guides agree that short connectors stay lowercase: articles like a, an and the,
            short conjunctions like and, but and or, and short prepositions like of, in, on and
            to. They also agree that the first and last words are always capitalised, whatever
            they are, so "A Tale of Two Cities" keeps its small words small but still starts with
            a capital A. This converter follows the AP convention: prepositions of four or more
            letters, like "over" and "between", are capitalised; hyphenated compounds follow the
            same rule part by part.
          </p>

          <h2>Why re-casing is a local job</h2>
          <p>
            The text people feed to case converters is rarely public text. It is a draft headline
            being tuned, a column of database names being normalised, an API being renamed before
            anyone outside the team has seen it. A server-side converter receives a copy of all of
            it. There is no justification for that: changing the case of a string is one of the
            cheapest operations a computer performs. Everything on this page happens in JavaScript
            inside this tab, and the Network panel in your developer tools will show nothing
            leaving the machine while you type.
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
