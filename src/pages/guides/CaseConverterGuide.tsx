import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function CaseConverterGuide() {
  useSeo({
    ...routeMeta('/guides/case-conversion-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Writing"
      title="Convert text case without pasting it into a server"
      lede="Changing the case of a string is one of the cheapest operations a computer performs — and yet most online converters run it on a server, which means your draft headline, your unreleased code names and your half-renamed API all pass through someone else's machine. Here is how case conversion actually works, where naive converters go wrong, and how to keep all of it local."
      updated="26 October 2026"
      toolTo="/tools/case-converter"
      toolLabel="Convert case in your browser"
    >
      <h2>The text people re-case is rarely public text</h2>
      <p>
        Think about what actually gets pasted into a case converter. A draft headline being tuned
        before publication. A column of database field names being normalised during a migration.
        An API surface being renamed before anyone outside the team has seen it. A product name
        being tried in CONSTANT_CASE for an environment file that also contains the words "staging"
        and "internal". Almost none of it is text the world has already read.
      </p>
      <p>
        A server-side converter receives a full copy of that text before it returns the answer.
        Some log inputs, some do not, and from the outside you cannot tell which is which. The
        uncomfortable part is that there is no reason to accept the trade: changing letter case is
        not model inference, not a database lookup, not anything that benefits from a data centre.
        It is a few lines of code that every browser already runs. The converter on this site does
        exactly that, locally, and the Network panel in your developer tools stays empty while it
        works.
      </p>

      <h2>Four naming styles walk into a codebase</h2>
      <p>
        Every programming community picked a different answer to the same question: how do you
        write a multi-word name when spaces are forbidden? JavaScript chose camelCase — join the
        words, capitalise each one after the first, and you get userFirstName. Python and Ruby
        chose snake_case, keeping everything low and separating with underscores: user_first_name.
        CSS and URLs chose kebab-case, which reads closest to plain language: user-first-name.
        Classes and components almost everywhere chose PascalCase, and constants shout in
        CONSTANT_CASE.
      </p>
      <p>
        None of these is better in the abstract. All of them are load-bearing conventions: a
        Python codebase full of camelCase reads as wrong to its maintainers as a JavaScript
        codebase full of snake_case, and most teams enforce their choice with a linter. The
        practical consequence is that renaming things — moving data from a Python backend to a
        JavaScript frontend, turning class names into CSS — is a constant background task of
        software work, and it is pure mechanics. Mechanical work is what tools are for.
      </p>

      <h2>Why acronyms break naive converters</h2>
      <p>
        Ask a simple script to turn HTTPSConnection into snake_case and it will cheerfully return
        h_t_t_p_s_connection — it inserts a separator at every capital letter, because "capital
        letter" is the only rule it knows. A human reader sees two words, not nine. The correct
        split follows the reader's eye: a run of capitals belongs together until the last capital
        before a lowercase letter, which starts the next word. HTTPSConnection is therefore HTTPS
        plus Connection, and the snake_case output is the https_connection you actually wanted.
      </p>
      <p>
        The same care applies to digits, which most converters either glue to the nearest word or
        mangle entirely. A name like version2Id splits into version, 2 and Id, so the identifier
        styles produce version_2_id — the digit survives as its own word, in the position a human
        put it. Mixed input works too: "HTTPS connection_status v2" splits cleanly into HTTPS,
        connection, status, v and 2, and converts to any target style without ceremony.
      </p>

      <h2>Title Case is not "capitalise every word"</h2>
      <p>
        Real headline style has a subtlety the name hides: some words stay lowercase. The style
        guides disagree on the margins but agree on the core — articles (a, an, the), short
        conjunctions (and, but, or, nor, for, so, yet) and short prepositions (as, at, by, in, of,
        on, to, and their two-letter cousins) are set in lowercase when they appear in the middle
        of a title. They also agree on the two exceptions that matter most: the first and last
        words of a title are always capitalised, whatever they are. That is why "A Tale of Two
        Cities" keeps its small words small but still starts with a capital A.
      </p>
      <p>
        Where guides diverge is the long prepositions. AP style capitalises prepositions of four
        or more letters — "over", "between", "through" — while some older rules lowercase anything
        that is a preposition at all. This converter follows the AP convention, which is the one
        most online headlines actually use. Hyphenated compounds follow the same rule part by
        part, so "well-known facts" becomes "Well-Known Facts", and "mother-in-law" keeps its
        small middle word small.
      </p>

      <h2>Sentence case and the letter I</h2>
      <p>
        Sentence case sounds trivial — lowercase everything, capitalise the first letter of each
        sentence — until you meet the details. The start of a sentence is not always a letter:
        sentences open with quotation marks and parentheses, and the capital belongs on the first
        letter inside them, so a lowercased '"quoted sentence here."' comes back as '"Quoted
        sentence here."' with the quote untouched. And English has one word that is always
        capitalised wherever it stands: the pronoun I. A sentence-case converter that lowercases
        "i know" and stops there has produced text that is technically sentence case and visibly
        wrong. This one fixes the pronoun too.
      </p>

      <h2>Line by line, because identifiers travel in lists</h2>
      <p>
        One more detail separates a useful identifier converter from a frustrating one. When you
        paste twenty column names into a converter to get twenty JavaScript keys, you want twenty
        results — not one giant camelCase string with all twenty names fused together. So the
        identifier styles on this site convert line by line: each line of the input becomes one
        converted name on the corresponding line of the output. The prose styles — UPPERCASE,
        lowercase, Title Case and Sentence case — do the opposite, preserving your punctuation and
        line breaks exactly and changing only the letters. Each style behaves the way its actual
        use case needs.
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
