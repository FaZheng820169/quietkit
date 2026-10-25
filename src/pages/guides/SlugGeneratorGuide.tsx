import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

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

export function SlugGeneratorGuide() {
  useSeo({
    ...routeMeta('/guides/slug-generator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Writing"
      title="Generate URL slugs without pasting titles into a server"
      lede="The slug is the part of a URL that outlives the headline — it is what search engines index, what other sites link to, and what survives every redesign. Turning a title into one is pure string mechanics, which makes the standard practice of pasting unpublished titles into online generators hard to defend. Here is how slugs actually work, where naive ones go wrong, and how to do the whole job locally."
      updated="26 October 2026"
      toolTo="/tools/slug-generator"
      toolLabel="Generate slugs in your browser"
    >
      <h2>The slug comes before the story</h2>
      <p>
        Slugs are made from titles that are not public yet. The writer finishes a draft, the
        editor approves it, and then — before anyone presses publish — someone turns the headline
        into the last segment of a URL. The title of an embargoed announcement, a product name
        still being argued over, a headline for next quarter's campaign: all of it flows through
        whatever tool happens to be open. When that tool is an online generator, every one of
        those titles becomes a request somebody else's server receives.
      </p>
      <p>
        The odd part is that nothing about the job needs a server. A slug is a string
        transformation: lowercase the letters, fold the accents, drop the decoration, join the
        words with hyphens. Every browser runs that in microseconds. The generator on this site
        does it locally, and the Network panel in your developer tools stays empty while it works
        — the strongest privacy guarantee available is the one you can watch.
      </p>

      <h2>What a slug owes to its title</h2>
      <p>
        A good slug is a faithful compression of the title, not a copy of it. It keeps the words
        that carry meaning and sheds everything that does not survive a copy-paste: spaces,
        emoji, currency symbols, runs of punctuation. "10 Tips for Better Sleep — Backed by
        Science!" becomes 10-tips-for-better-sleep-backed-by-science. The em dash, the
        exclamation mark and the word "tips" capitalisation were all decoration; the words are
        the payload.
      </p>
      <p>
        Numbers matter in slugs in a way they do not in prose, because they are searchable and
        stable: a reader remembers "top 10" better than "top ten", and a year like 2026 anchors
        the URL in time. This generator keeps digits as their own words — version2Id becomes
        version-2-id, not version2-id — so the digit survives where a human put it, readable by
        both people and search engines.
      </p>

      <h2>Accents fold, but they fold honestly</h2>
      <p>
        Most of the world's writing is not ASCII, and titles prove it daily: café, über,
        smörgåsbord, déjà vu. The standard convention for URLs is to fold accented Latin letters
        to their base — café to cafe — which is what Unicode normalisation gives you for free.
        The letters it cannot decompose need a transliteration table instead: Straße becomes
        strasse, Łódź becomes lodz, œ becomes oe, ø becomes o.
      </p>
      <p>
        Conventions disagree at the edges. German orthography traditionally expands ü to ue, and
        German-language sites often prefer ueber over uber; the international convention this
        tool follows produces uber, which is what most English-language sites and all the major
        CMS defaults use. Neither is wrong — but a slug generator should tell you which one it
        picked, and the FAQ above says exactly that.
      </p>

      <h2>Apostrophes join, hyphens separate</h2>
      <p>
        The single most common slugging mistake is the apostrophe. A naive generator treats every
        non-letter as a separator, so "don't" becomes don-t — two words that do not exist, with a
        hyphen where no word boundary is. The convention WordPress settled on twenty years ago is
        the right one: an apostrophe is a letter-shaped punctuation mark, not a boundary, so
        "don't" slugs to dont. The same courtesy extends to Irish names — O’Brien becomes obrien,
        not o-brien — because the apostrophe sits inside the word it belongs to.
      </p>
      <p>
        Hyphens are reserved for real boundaries: spaces, punctuation between words, and the
        seams of pasted identifiers. userFirstName becomes user-first-name, HTTPSConnection
        becomes https-connection, and each split follows the pattern a human reader uses rather
        than a letter-by-letter rule.
      </p>

      <h2>Hyphens beat underscores, and short beats long</h2>
      <p>
        Google has been consistent for years: it treats the hyphen as a word separator and the
        underscore as a word joiner. user-first-name indexes as three words; user_first_name
        indexes as one unfamiliar long word. For anything a human or a search engine should read
        — posts, product pages, documentation — hyphens are the correct separator. Underscores
        still belong in machine-facing identifiers and file names, which is why the tool offers
        both rather than prescribing one.
      </p>
      <p>
        Length is the quieter decision. Shorter slugs get typed, shared and remembered more
        often, and they survive being pasted into chat windows without wrapping. A ceiling around
        60 characters is a sensible default, and truncation should happen at word boundaries:
        a-very-long-title is a slug, a-very-long-tit is a typo. Set the limit on the tool page
        and the cut always lands between words.
      </p>

      <h2>Slug the list, not the line</h2>
      <p>
        Real slugging work arrives in bulk: a content migration with four hundred posts, a new
        documentation section with thirty pages, a quarter of planned titles in a spreadsheet
        column. Slugging them one at a time is how typos and inconsistencies creep in — one title
        truncated, the next one not. The generator converts line by line: paste twenty titles,
        get twenty slugs back in the same order, ready to paste straight into the CMS column or
        redirect table they came from.
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
