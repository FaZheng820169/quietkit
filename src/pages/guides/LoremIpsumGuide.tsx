import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What does lorem ipsum actually say?',
    a: 'Nothing coherent — that is the point. The passage is a scrambled excerpt from Cicero’s de Finibus Bonorum et Malorum (45 BC), a treatise on ethics. A 15th-century typesetter jumbled the word order to make filler text for a type specimen, and the scrambled version stuck. It looks like Latin, carries the rhythm of real prose, and means nothing, so nobody mistakes it for content.',
  },
  {
    q: 'Why not just paste real text as a placeholder?',
    a: 'Because real text distracts. Give a client a mockup filled with readable English and the review meeting becomes about the copy instead of the layout. Lorem ipsum has the word lengths and sentence cadence of real prose without the meaning, so the conversation stays on typography, spacing and hierarchy. It also never accidentally ships: nobody lets "Consectetur adipiscing elit" go live unnoticed.',
  },
  {
    q: 'When should I use words, sentences or paragraphs?',
    a: 'Match the unit to the slot you are filling. Words are for labels, button copy and headings — "generate 3 words" fills a nav item. Sentences are for subtitles, card descriptions and tooltips. Paragraphs are for article bodies, product descriptions and comment threads, where you need to judge line length, leading and how the page scrolls. The count limits differ on purpose: up to 5,000 words, 500 sentences or paragraphs per click.',
  },
  {
    q: 'Does the generator send my settings anywhere?',
    a: 'No. Generation is arithmetic on a fixed word pool — the 69 words of the classic passage — seeded locally and produced in this tab. There is no request to inspect in the Network panel because there is nothing to send. You can load the page, disconnect from the network, and generate a thousand paragraphs.',
  },
  {
    q: 'Can I get the output wrapped in HTML tags?',
    a: 'Yes — in paragraphs mode, tick the HTML option and each paragraph comes wrapped in its own <p> tags, ready to drop into a template. The plain-text output separates paragraphs with a blank line, which is what most design tools and CMS preview fields expect when you paste.',
  },
]

export function LoremIpsumGuide() {
  useSeo({
    ...routeMeta('/guides/lorem-ipsum-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Design"
      title="Generate lorem ipsum without a server watching"
      lede="The same 69 Latin words have filled mockups since the 1500s — and yet most generators still phone home to produce them. Here is where the passage comes from, how to choose between words, sentences and paragraphs, why filler text must stay meaningless, and how to generate any amount of it on your own machine."
      updated="26 October 2026"
      toolTo="/tools/lorem-ipsum"
      toolLabel="Generate lorem ipsum in your browser"
    >
      <h2>A typesetter's accident, five centuries old</h2>
      <p>
        Lorem ipsum is not a language and was never meant to be read. Its source is a real text —
        a passage from Cicero's <em>de Finibus Bonorum et Malorum</em>, a treatise on ethics
        written in 45 BC — but somewhere in the 1500s a typesetter assembling a specimen book
        chopped the sentence apart and shuffled the words. He wanted filler that showed off the
        typeface, not prose anyone would read. The scrambled version proved so useful that it
        outlived letterpress, phototypesetting and desktop publishing, and arrived intact in the
        age of the web.
      </p>
      <p>
        The accident turned out to be well engineered. The word pool preserves the statistical
        shape of Latin prose: short function words (<em>in, ut, sed, et</em>), long stems
        (<em>consectetur, exercitation, reprehenderit</em>), the occasional double letter. Line
        lengths, word spacing and hyphenation points in a mockup filled with lorem ipsum land
        almost exactly where they will when real English copy arrives — which is the entire job
        of placeholder text.
      </p>

      <h2>Why filler must stay meaningless</h2>
      <p>
        Every designer has watched the alternative fail. Paste a real article into the mockup and
        the review meeting drifts into copyediting; a stakeholder objects to a sentence in text
        that will never ship. Use "text goes here" fifty times and the opposite problem appears —
        every line is the same length, so the ragged right edge lies and the column looks
        narrower than it will in production. Meaningful text distracts; repeated text deceives.
      </p>
      <p>
        Lorem ipsum threads the needle because it is recognisably fake. It has the cadence of
        real prose, so typography decisions made against it survive contact with real content,
        and it is unmistakably placeholder, so no reviewer wastes attention on it and no build
        accidentally ships with it. "Nobody will notice" is precisely the property you are
        buying.
      </p>

      <h2>Choosing the unit: words, sentences, paragraphs</h2>
      <p>
        The unit you generate should match the slot you are filling. <strong>Words</strong> are
        for labels — nav items, buttons, headings — where the design needs an exact count and
        nothing more. "Three words" fills a menu entry; capitalise them and you have a headline
        of realistic width.
      </p>
      <p>
        <strong>Sentences</strong> are for the middle layer: subtitles, card descriptions,
        tooltips, pull quotes. Real sentences vary in length, and a generator that emits
        uniform twelve-word sentences produces a mockup that reads like a metronome. The
        generator on this site draws eight to seventeen words per sentence — the range ordinary
        prose actually occupies — capitalises the first letter and ends with a period, because
        that is what the copy will do.
      </p>
      <p>
        <strong>Paragraphs</strong> are for bodies: articles, product descriptions, comment
        threads. Here what you are judging is rhythm rather than content — how the column reads,
        where the fold lands, whether the line length tires the eye. Paragraphs of three to five
        sentences behave the way real articles behave, and the blank line between them is what
        design tools and CMS preview fields expect when you paste. If the destination is a
        template rather than a design canvas, the HTML option wraps each paragraph in its own
        {'<p>'} tags so the paste drops straight in.
      </p>

      <h2>The traditional opening</h2>
      <p>
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit" is the opening of the scrambled
        passage, and five centuries of habit made it the recognised face of placeholder text.
        Starting your output with it has one practical benefit: anyone glancing at the mockup
        identifies the filler instantly, with no chance of mistaking it for draft copy. Switch it
        off when you have seen enough of the phrase for one career — the rest of the pool works
        identically either way.
      </p>

      <h2>Why generation belongs on your machine</h2>
      <p>
        There is no server work in lorem ipsum. The whole operation is picking words from a
        fixed 69-word pool with a random source and joining them with spaces — arithmetic that
        costs less than rendering this sentence. A server-side generator adds a round trip, a
        log entry and an ad impression to a task your browser completes in microseconds.
      </p>
      <p>
        Placeholder text itself is not sensitive, but the pattern generalises: the habit of
        checking whether a tool needs a network at all is what keeps drafts, keys and documents
        off strangers' servers. This generator runs in the tab you are looking at. Load the
        page, cut the connection, and it will still produce five thousand words without noticing
        anything changed.
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
    </Article>
  )
}
