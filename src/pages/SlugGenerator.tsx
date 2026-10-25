import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdSlot } from '../components/AdSlot'
import { CheckIcon, CopyIcon, LockIcon, TrashIcon } from '../components/Icons'
import { DEFAULT_SLUG_OPTIONS, slugify, type SlugSeparator } from '../lib/slug'
import { faqJsonLd, routeMeta, toolJsonLd, useSeo } from '../lib/seo'

const faqs = [
  {
    q: 'Does my title get uploaded to be slugged?',
    a: 'No. Folding accents, joining contractions and swapping spaces for hyphens is a few lines of JavaScript, not a service — it all happens in this tab as you type. Verify it: open the Network panel in your browser developer tools and watch it stay empty, or load the page, disconnect from the internet and keep slugging.',
  },
  {
    q: 'What happens to accented characters like é, ü or ß?',
    a: 'Accented Latin letters fold to their ASCII base: café becomes cafe, über becomes uber, smörgåsbord becomes smorgasbord. Letters that cannot be decomposed get a standard transliteration — Straße becomes strasse, Łódź becomes lodz, cœur becomes coeur. The convention is the international one, so a German reader expecting "ue" from ü should know this tool produces "u", which is what most English-language sites use.',
  },
  {
    q: 'What about emoji, CJK and non-Latin scripts?',
    a: 'Emoji and symbols are stripped — they are decoration in a title, dead weight in a URL. Non-Latin scripts like Chinese, Japanese or Arabic are dropped in the default ASCII mode, leaving any Latin and digit words. Turn on Unicode slugs to keep them: modern browsers and servers handle percent-encoded UTF-8 slugs correctly, and many international sites prefer readable native-language URLs.',
  },
  {
    q: "Why does \"don't\" become dont and not don-t?",
    a: 'Because an apostrophe is not a word boundary — it is a letter that happens to be punctuation. "Don\'t" is one word, so its slug is dont, the same way WordPress has always done it. Hyphens appear only where real word boundaries are: spaces, punctuation between words, and camelCase or digit boundaries like userFirstName or version2Id. Irish names survive too: O’Brien becomes obrien, not o-brien.',
  },
  {
    q: 'Should I use hyphens or underscores, and how long should a slug be?',
    a: 'Hyphens. Google has said for years that it treats hyphens as word separators and underscores as word joiners, so user_first_name reads as one word to a search engine while user-first-name reads as three. Underscores remain useful for machine-facing identifiers, which is why the option exists. For length, shorter slugs get shared and typed more often — 60 characters is a sensible ceiling, and this tool truncates at word boundaries rather than mid-word.',
  },
]

const SAMPLE =
  '10 Tips for Better Sleep — Backed by Science!\nÜber Café: München’s Best Kept Secret\nO’Brien’s Guide to HTTPSConnection & version2Id'

export function SlugGenerator() {
  useSeo({
    ...routeMeta('/tools/slug-generator'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        toolJsonLd(
          'QuietKit Slug Generator',
          'Turn titles into clean URL slugs: accents folded, emoji stripped, contractions joined, custom separator and max length. Converts a whole list line by line. Runs locally in your browser — nothing is uploaded.',
          '/tools/slug-generator',
        ),
        faqJsonLd(faqs),
      ],
    },
  })

  const [input, setInput] = useState('')
  const [separator, setSeparator] = useState<SlugSeparator>(DEFAULT_SLUG_OPTIONS.separator)
  const [lowercase, setLowercase] = useState(DEFAULT_SLUG_OPTIONS.lowercase)
  const [asciiOnly, setAsciiOnly] = useState(DEFAULT_SLUG_OPTIONS.asciiOnly)
  const [maxLength, setMaxLength] = useState(0)
  const [copied, setCopied] = useState(false)

  const options = useMemo(
    () => ({ separator, lowercase, asciiOnly, maxLength }),
    [separator, lowercase, asciiOnly, maxLength],
  )
  const output = useMemo(() => (input === '' ? '' : slugify(input, options)), [input, options])
  const firstSlug = useMemo(
    () => output.split('\n').find((line) => line !== '') ?? '',
    [output],
  )
  const slugCount = useMemo(
    () => output.split('\n').filter((line) => line !== '').length,
    [output],
  )

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">Tool · Writing</span>
          <h1>Turn titles into URL slugs without sending them anywhere</h1>
          <p>
            Accents folded, emoji stripped, contractions joined, camelCase split — one title or a
            whole list, line by line. The slugging happens in this tab.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container workspace">
          <div>
            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <span className="panel-title">Titles, one per line</span>
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
                aria-label="Titles to slug"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 120,
                  marginTop: 12,
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  padding: 12,
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  background: 'var(--paper-2)',
                  resize: 'vertical',
                }}
                placeholder="Paste a post title — or twenty, one per line…"
              />

              <div className="split" style={{ gap: 18, marginTop: 16 }}>
                <div className="field">
                  <span className="field-label">Separator</span>
                  <div className="segmented">
                    <button aria-pressed={separator === '-'} onClick={() => setSeparator('-')}>
                      hyphen-case
                    </button>
                    <button aria-pressed={separator === '_'} onClick={() => setSeparator('_')}>
                      snake_case
                    </button>
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">Max length (0 = no limit)</span>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={maxLength}
                    onChange={(e) =>
                      setMaxLength(Math.max(0, Math.min(200, Number(e.target.value) || 0)))
                    }
                    style={{ width: 90 }}
                    aria-label="Maximum slug length"
                  />
                </div>
              </div>

              <div className="row" style={{ gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                <label className="row" style={{ gap: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={lowercase}
                    onChange={(e) => setLowercase(e.target.checked)}
                  />
                  Lowercase
                </label>
                <label className="row" style={{ gap: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={asciiOnly}
                    onChange={(e) => setAsciiOnly(e.target.checked)}
                  />
                  ASCII only (fold accents, drop non-Latin scripts)
                </label>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 16 }}>
              <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <span className="panel-title">Slugs</span>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => void copyOutput()}
                  disabled={output === ''}
                >
                  <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy all'}
                </button>
              </div>
              <div
                className="mono"
                data-testid="slug-output"
                style={{
                  marginTop: 12,
                  padding: '12px 14px',
                  minHeight: 76,
                  fontSize: 14,
                  lineHeight: 1.8,
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {output === '' ? 'your-slugs-appear-here' : output}
              </div>
              {input !== '' && (
                <p className="muted" style={{ margin: '10px 2px 0', fontSize: 13 }}>
                  {slugCount.toLocaleString()} {slugCount === 1 ? 'slug' : 'slugs'}
                  {firstSlug !== '' && (
                    <>
                      {' '}
                      · preview:{' '}
                      <span className="mono" style={{ fontSize: 12.5 }}>
                        https://your-site.com/blog/{firstSlug}
                      </span>
                    </>
                  )}
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
                  'Accents folded: café → cafe, Straße → strasse',
                  "Contractions joined: don't → dont, O’Brien → obrien",
                  'camelCase and digits split: version2Id → version-2-id',
                  'Emoji and symbols stripped automatically',
                  'A whole list of titles, slugged line by line',
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
                <LockIcon size={14} /> Headlines get slugged before they get published — sometimes
                before anyone outside the team has read them. An unreleased title should not pass
                through a server to get its hyphens. <Link to="/privacy">Read the privacy policy</Link>.
              </p>
            </div>

            <div className="panel">
              <span className="panel-title">Related</span>
              <ul className="stack-sm" style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 14 }}>
                <li>
                  <Link to="/guides/slug-generator-without-upload">
                    Guide: generate slugs without a server
                  </Link>
                </li>
                <li>
                  <Link to="/tools/case-converter">Case converter</Link>
                </li>
                <li>
                  <Link to="/tools/word-counter">Word counter</Link>
                </li>
                <li>
                  <Link to="/tools/url-encoder">URL encoder</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>What a slug owes to a title</h2>
          <p>
            A slug is the part of the URL that outlives the headline. Designs get refreshed, titles
            get tweaked, but the slug stays — it is what search engines index, what other sites
            link to and what people paste into messages. So a good slug is short, lowercase,
            hyphen-separated and free of anything that does not survive a copy-paste: no spaces,
            no emoji, no punctuation runs. This generator takes a title and gives back exactly
            that, folding accents (café → cafe), transliterating the letters accents cannot cover
            (Straße → strasse) and joining contractions the way WordPress always has
            (don’t → dont).
          </p>

          <h2>Hyphens separate words; underscores join them</h2>
          <p>
            Google has been consistent for years: a hyphen in a URL is a word separator, an
            underscore is a word joiner. user-first-name reads to a search engine as three words;
            user_first_name reads as one long one. For anything a human or a search engine should
            read — blog posts, product pages, docs — hyphens are the right choice. Underscores
            still earn their place in machine-facing identifiers, which is why both options sit
            side by side here.
          </p>

          <h2>Slug a whole list at once</h2>
          <p>
            Titles rarely arrive one at a time. A content migration, a new docs section, a quarter
            of planned posts — they arrive as lists. Paste twenty titles and you get twenty slugs
            back, line by line, in the same order, ready to paste into a CMS column or a redirect
            table. Set a maximum length and the truncation happens at word boundaries, so
            a-very-long-title never becomes a-very-long-tit.
          </p>

          <h2>Why slugging is a local job</h2>
          <p>
            The titles people slug are, by definition, not published yet — the slug comes first.
            An online slug generator therefore sees unreleased headlines, draft product names and
            occasionally the title of an announcement that is still embargoed. There is no
            justification for that trip: slugging is string mechanics, one of the cheapest things
            a computer does. Everything on this page runs in JavaScript inside this tab, and the
            Network panel in your developer tools will show nothing leaving the machine while you
            type.
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
