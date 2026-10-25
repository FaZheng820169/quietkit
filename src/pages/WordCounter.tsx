import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon, TrashIcon } from '../components/Icons'
import { analyzeText, formatDuration } from '../lib/wordcount'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Is my text uploaded to be counted?',
    a: 'No. Counting words is arithmetic, not a service: the page splits your text with the same ICU word-segmentation rules your operating system uses, and it happens in JavaScript inside this tab. Verify it — open the Network panel in your browser developer tools and watch it stay empty while you type, or load the page, disconnect from the internet and keep counting.',
  },
  {
    q: 'How does it count words in Chinese, Japanese or Thai?',
    a: 'Those languages do not separate words with spaces, so a naive counter that splits on spaces reports one giant "word" — or zero. This tool uses Intl.Segmenter, the browser\'s built-in implementation of the Unicode word-segmentation standard, which knows that 你好世界 is two words and that ですます endings attach to the verb. The count is the same one your phone\'s keyboard uses.',
  },
  {
    q: 'How are emoji and contractions counted?',
    a: 'Characters are counted as Unicode code points, so an emoji is one character even when it is made of several bytes. Contractions follow the Unicode word rules: "don\'t" is one word, and so is "it\'s". A hyphenated compound like "well-known" also counts as one word, matching how most publishers count.',
  },
  {
    q: 'How is reading time estimated?',
    a: 'Reading time divides the word count by 200 words per minute, the conventional average for an adult reading English prose silently; speaking time uses 130 words per minute, a steady presentation pace. Both are rounded to the nearest second. Dense technical text reads slower, dialogue reads faster — treat the number as a planning estimate, not a measurement.',
  },
  {
    q: 'What does the keyword density panel show?',
    a: 'The six most frequent words of three or more letters, after removing a small list of English stopwords like "the" and "and". The percentage is that word\'s share of the total word count. It is a quick way to notice you have written "just" fourteen times — not an SEO score. Text that repeats a keyword above a few percent reads as stuffed to a human, whatever a search engine thinks.',
  },
]

const SAMPLE =
  'The quick brown fox jumps over the lazy dog. It does so with remarkable enthusiasm, considering the early hour.\n\nMeanwhile, the dog pretends to sleep. This is a well-known arrangement, and neither party questions it.'

export function WordCounter() {
  useSeo({
    ...routeMeta('/tools/word-counter'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Word Counter',
          'Count words, characters, sentences and paragraphs with live reading and speaking time estimates and keyword density. Counts CJK text and emoji correctly. Runs locally in your browser — nothing is uploaded.',
          '/tools/word-counter',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => analyzeText(input), [input])
  const hasText = input.trim() !== ''

  const clear = () => setInput('')

  const copyReport = async () => {
    const report = [
      `Words: ${stats.words}`,
      `Characters: ${stats.characters}`,
      `Characters (no spaces): ${stats.charactersNoSpaces}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Reading time: ${formatDuration(stats.readingTimeSec)}`,
      `Speaking time: ${formatDuration(stats.speakingTimeSec)}`,
    ].join('\n')
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Writing</span>
          <h1>Count words and reading time without uploading a word of it</h1>
          <p>
            Live word, character, sentence and paragraph counts, reading and speaking time, and
            keyword density — with correct counts for Chinese, Japanese and emoji. The counting
            happens in this tab.
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
                  onClick={clear}
                  disabled={input === ''}
                >
                  <TrashIcon size={14} /> Clear
                </button>
              </div>
            </div>

            <textarea
              aria-label="Text to count"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 180,
                marginTop: 12,
                fontSize: 14.5,
                lineHeight: 1.7,
                padding: 12,
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--paper-2)',
                resize: 'vertical',
              }}
              placeholder="Paste or type your draft — an essay, an article, a chapter, an email…"
            />
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span className="panel-title">Counts</span>
              <button
                className="btn"
                style={{ padding: '6px 12px', fontSize: 13 }}
                onClick={() => void copyReport()}
                disabled={!hasText}
              >
                <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy report'}
              </button>
            </div>

            <dl className="stat-grid">
              <div className="stat">
                <dt>Words</dt>
                <dd>{stats.words.toLocaleString()}</dd>
              </div>
              <div className="stat">
                <dt>Characters</dt>
                <dd>{stats.characters.toLocaleString()}</dd>
              </div>
              <div className="stat">
                <dt>No spaces</dt>
                <dd>{stats.charactersNoSpaces.toLocaleString()}</dd>
              </div>
              <div className="stat">
                <dt>Sentences</dt>
                <dd>{stats.sentences.toLocaleString()}</dd>
              </div>
              <div className="stat">
                <dt>Paragraphs</dt>
                <dd>{stats.paragraphs.toLocaleString()}</dd>
              </div>
              <div className="stat">
                <dt>Lines</dt>
                <dd>{stats.lines.toLocaleString()}</dd>
              </div>
            </dl>

            <dl className="stat-grid">
              <div className="stat">
                <dt>Reading time</dt>
                <dd>{formatDuration(stats.readingTimeSec)}</dd>
              </div>
              <div className="stat">
                <dt>Speaking time</dt>
                <dd>{formatDuration(stats.speakingTimeSec)}</dd>
              </div>
              <div className="stat">
                <dt>Avg words / sentence</dt>
                <dd>{stats.avgWordsPerSentence > 0 ? stats.avgWordsPerSentence.toFixed(1) : '0'}</dd>
              </div>
            </dl>

            {stats.longestWord !== '' && (
              <p className="muted" style={{ marginTop: 14, fontSize: 13.5 }}>
                Longest word: <span style={{ fontFamily: 'var(--mono)' }}>{stats.longestWord}</span>
              </p>
            )}
          </div>

          {stats.keywords.length > 0 && (
            <div className="panel" style={{ marginTop: 16 }}>
              <span className="panel-title">Keyword density</span>
              <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>Word</th>
                    <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>Count</th>
                    <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', width: '45%' }}>
                      Share of words
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.keywords.map((k) => {
                    const pct = (k.count / stats.words) * 100
                    return (
                      <tr key={k.word}>
                        <td
                          style={{
                            padding: '6px 10px',
                            borderBottom: '1px solid var(--line)',
                            fontFamily: 'var(--mono)',
                            fontSize: 13,
                          }}
                        >
                          {k.word}
                        </td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>
                          {k.count}
                        </td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>
                          <div className="row" style={{ gap: 8 }}>
                            <div
                              style={{
                                height: 6,
                                flex: 1,
                                background: 'var(--paper-2)',
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, (pct / (stats.keywords[0]?.count ? (stats.keywords[0].count / stats.words) * 100 : pct)) * 100)}%`,
                                  background: 'var(--forest)',
                                }}
                              />
                            </div>
                            <span className="muted" style={{ fontSize: 13, minWidth: 44, textAlign: 'right' }}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
                'Live counts as you type',
                'Words, characters, sentences, paragraphs',
                'Reading and speaking time estimates',
                'Keyword density, stopwords removed',
                'Correct counts for CJK text and emoji',
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
              <LockIcon size={14} /> The text people count is usually unpublished — a draft, a
              manuscript, a legal letter. It should not pass through a server to be measured.{' '}
              <Link to="/privacy">Read the privacy policy</Link>.
            </p>
          </div>

          <div className="panel">
            <span className="panel-title">Related</span>
            <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
              <li>
                <Link to="/guides/word-count-without-upload">Guide: count words without a server</Link>
              </li>
              <li>
                <Link to="/tools/markdown-preview">Markdown preview</Link>
              </li>
              <li>
                <Link to="/tools/text-diff">Text diff</Link>
              </li>
              <li>
                <Link to="/tools/url-encoder">URL encoder</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What counts as a word</h2>
          <p>
            The obvious algorithm — split on spaces and count the pieces — works for English prose
            and fails almost everywhere else. Chinese and Japanese do not use spaces between words,
            so a whole paragraph becomes one giant "word". Vietnamese mixes spaced and unspaced
            compounds. Even English has edge cases: is "don't" one word, is "well-known" one or
            two, is "3.14" a word at all. This tool does not guess. It uses Intl.Segmenter, the
            browser's implementation of the Unicode word-segmentation standard — the same rules
            that decide where a double-click selects a word on your phone. The count you get is a
            standard's answer, not a regex's.
          </p>

          <h2>Reading time is an estimate, not a promise</h2>
          <p>
            The 200-words-per-minute figure behind the reading-time estimate is a convention, not a
            measurement of you. It comes from studies of adults reading uncomplicated English prose
            silently. Dense legal text reads at half that speed; a dialogue-heavy novel reads
            faster. Speaking time uses 130 words per minute, the pace of a presenter who wants to
            be understood rather than an auctioneer. Both numbers are best used comparatively: if
            the tool says ten minutes and your last article said five, this one is twice as long —
            whatever the absolute figure turns out to be for your readers.
          </p>

          <h2>Keyword density without the superstition</h2>
          <p>
            The keyword panel answers one honest question: which words did I actually lean on. It
            counts words of three or more letters, sets aside a small list of English stopwords,
            and shows the six most frequent survivors with their share of the whole. That is useful
            for catching a tic — the "just" that appears in every paragraph, the "important" that
            stopped meaning anything by the third use. It is not an SEO score, and no serious
            search engine has ranked pages by raw keyword density in twenty years. If a word's
            share climbs past a few percent, the problem is not the algorithm's ranking of your
            page; it is that a human reader will notice the repetition too.
          </p>

          <h2>Why count locally</h2>
          <p>
            Word counters see text at its most sensitive: the unpublished article, the manuscript
            an agent has not read yet, the legal letter, the medical statement, the resignation
            email drafted at midnight. A server-side counter receives a copy of all of it before
            you have decided the text is finished, let alone public. Counting words is arithmetic
            that any browser tab can do — there is no model to run, no dictionary to download, no
            advantage a data centre adds. The counting here happens in this tab, and the Network
            panel in your developer tools will show nothing leaving the machine while you type.
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
