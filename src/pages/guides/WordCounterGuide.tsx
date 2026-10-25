import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function WordCounterGuide() {
  useSeo({
    ...routeMeta('/guides/word-count-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Writing"
      title="Count words without pasting your draft into a server"
      lede="The text people paste into word counters is text they have not published yet — drafts, manuscripts, legal letters, resignation emails. Counting words is arithmetic a browser tab can do; there is nothing a server adds except a copy of your draft. Here is how counting actually works, where naive counters go wrong, and how to keep it local."
      updated="26 October 2026"
      toolTo="/tools/word-counter"
      toolLabel="Count words in your browser"
    >
      <h2>The text people count is the text they should not share</h2>
      <p>
        Nobody counts the words of a published article — the publisher already did. The realistic
        inputs to an online word counter are an essay due at midnight, a chapter of an unfinished
        novel, a cover letter, a legal statement, a medical complaint, a resignation email. In
        every case the text is pre-publication, and in many of them it is sensitive in the
        ordinary, human sense: it names employers, diagnoses, opponents, grievances.
      </p>
      <p>
        A server-side counter receives the whole text before it returns a number. Some services
        log inputs for "product improvement"; some honestly do not. The trouble is that you cannot
        tell which from the outside, and you do not have to — word counting is not a model
        inference or a database lookup. It is segmentation and arithmetic, and your browser
        already ships with everything needed to do it. The local counter on this site runs the
        same Unicode rules your phone's keyboard uses, and the Network panel stays empty while it
        works.
      </p>

      <h2>What a "word" is to a computer</h2>
      <p>
        The naive approach to counting words is splitting on whitespace. For a plain English
        paragraph that more or less works. For almost everything else it fails in instructive
        ways. Chinese and Japanese do not put spaces between words at all, so the splitter sees
        one token for an entire paragraph and reports a word count of one. A counter that writers
        of half the world's languages cannot use is not a counter; it is an English splitter.
      </p>
      <p>
        The correct approach is the Unicode word-segmentation standard, implemented in browsers
        as Intl.Segmenter. It knows that 你好世界 is two words, that Thai dictionary-based breaks
        are required, that "don't" is one word, that "well-known" is one word, that "3.14" is a
        number-like token and not a word at all. These are the same rules that decide what gets
        selected when you double-click a word, so the count matches what a human means by "word"
        far better than any hand-rolled regular expression.
      </p>

      <h2>Characters, bytes and emoji</h2>
      <p>
        Character counting has its own quiet trap. JavaScript's native string length counts
        UTF-16 code units, not characters, so an emoji like 🦊 — which is one character to any
        human — reports a length of two. Astral-plane characters in general, from historical
        Chinese ideographs to mathematical symbols, are inflated the same way. This counter
        iterates by code point, so one visible character is one count, the way a writer thinks
        about it.
      </p>
      <p>
        The "no spaces" figure exists for the forms and platforms that count that way — some
        translation agencies bill by it, some academic submission systems enforce it. It removes
        all whitespace, including line breaks, and counts what remains.
      </p>

      <h2>Sentences, paragraphs and the shape of a text</h2>
      <p>
        Sentence splitting uses the same ICU machinery: it understands that "Mr. Smith arrived at
        3 p.m." is one sentence, not three, because the rules know about abbreviations and
        decimal points. The average-words-per-sentence figure that comes out of it is the single
        most useful style metric on the page. When it climbs past twenty-five, prose starts to
        feel like wading; most readable general writing sits between twelve and twenty. That is
        not a law — it is the observed shape of text people finish reading.
      </p>
      <p>
        Paragraphs are counted the way writers mean them: blocks of text separated by a blank
        line. Lines are counted literally, for the poets and the people filling in a form with a
        line limit.
      </p>

      <h2>Reading time: honest about being an estimate</h2>
      <p>
        The reading-time figure divides the word count by 200 words per minute — the conventional
        average for an adult reading ordinary English prose silently. Speaking time uses 130, a
        presenter's pace. Both conventions are approximations: dense legal or technical text
        halves the real speed, and light fiction can double it. Treat the numbers comparatively.
        If this draft says twelve minutes and your last one said six, it is twice as long, and
        that relative fact is what planning actually needs.
      </p>

      <h2>Keyword density without the superstition</h2>
      <p>
        The keyword panel lists the six most frequent words of three or more letters after
        removing a small stopword list — the, and, of, and their friends. Its honest use is
        stylistic self-defence: noticing that "just" appears in every paragraph, or that
        "important" stopped meaning anything four occurrences ago. What it is not is an SEO
        instrument. Search engines have not ranked by raw keyword density for twenty years, and
        text written to satisfy a density target reads exactly like what it is. If one word's
        share of the whole climbs past a few percent, a human reader will feel the repetition
        long before any algorithm comments on it.
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
