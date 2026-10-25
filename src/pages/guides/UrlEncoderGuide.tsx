import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is my data uploaded to be encoded or decoded?',
    a: 'No. Percent-encoding is a fixed character substitution defined in RFC 3986 — there is nothing a server can do that this page cannot. The conversion runs in JavaScript inside this tab. Verify it: open the Network panel in your browser developer tools and watch it stay empty while you type, or load the page, disconnect from the internet and keep converting.',
  },
  {
    q: 'What is the difference between "component" and "full URL" encoding?',
    a: 'Component mode (the browser\'s encodeURIComponent) escapes everything except letters, digits and - _ . ~ — use it for a single value going inside a query string or path segment, so characters like &, = and ? cannot break the URL\'s structure. Full-URL mode (encodeURI) keeps structural characters like : / ? & = # readable and only escapes characters that are never allowed in a URL, like spaces and non-ASCII text. Use component mode for values, full-URL mode for tidying a whole link.',
  },
  {
    q: 'Does + mean a space in a URL?',
    a: 'Only in a query string, and only by convention from HTML forms (application/x-www-form-urlencoded). Everywhere else in a URL, + is a literal plus sign. That is why this tool\'s decoder has a "+ as space" option: tick it when decoding form data or query strings, leave it off for everything else. When encoding, %20 is the safe, unambiguous way to write a space.',
  },
  {
    q: 'Why does my encoded string fail to decode?',
    a: 'The usual cause is a malformed percent-escape: a % that is not followed by two hexadecimal digits, often because a literal percent sign was never encoded. This tool points at the exact position of the bad escape. The second cause is truncated input — a multi-byte UTF-8 character like 你好 encodes to three escapes each (%E4%BD%A0), and losing even one makes the sequence invalid UTF-8, which the decoder reports honestly.',
  },
  {
    q: 'Why are some characters left unencoded?',
    a: 'RFC 3986 defines an "unreserved" set — A–Z, a–z, 0–9, and - _ . ~ — that never needs encoding, plus "reserved" characters like / ? & = that are only escaped in component mode, where they would otherwise be mistaken for URL structure. Seeing ? and & survive full-URL encoding is correct: escaping them would change what the URL means.',
  },
]

export function UrlEncoderGuide() {
  useSeo({
    ...routeMeta('/guides/url-encoding-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="URL-encode and decode without pasting links into a server"
      lede="The URLs people decode are tracking links, password-reset tokens, signed redirect URLs and API query parameters — exactly the strings they should not paste into a server. Percent-encoding is a fixed substitution table from RFC 3986; a browser tab can do it as well as a data centre. Here is what the two modes mean, where decoding breaks, and how to keep it local."
      updated="26 October 2026"
      toolTo="/tools/url-encoder"
      toolLabel="Encode and decode URLs in your browser"
    >
      <h2>The data people URL-encode is exactly the data they should not share</h2>
      <p>
        Nobody reaches for a URL decoder to fix a link to a news article. The realistic inputs are
        tracking URLs from an email campaign — each carrying a UTM source, a hashed email address,
        a campaign identifier — a password-reset link that encodes a token valid for an hour, a
        SAML or OAuth redirect URL containing a one-time authorisation code, a link a colleague
        pasted from a Japanese auction site where half the characters are percent-escaped.
      </p>
      <p>
        Paste any of those into a server-side decoder and the server now owns a copy of your
        password-reset token, your campaign ID, your personally identifying tracking parameters.
        Unlike a data-centre visitor, a browser tab does not log anything, and the rules of
        percent-encoding are arithmetic, not judgement. There is no training data, no machine
        learning, no benefit a server can add.
      </p>

      <h2>Component mode vs full-URL mode</h2>
      <p>
        JavaScript exposes two different functions for a reason. encodeURIComponent treats every
        character outside the unreserved set — A–Z, a–z, 0–9, -, _, ., ~ — as something to escape.
        That includes the structural characters of a URL: : / ? & = #. The result is a single value
        that is safe to put anywhere inside a URL because nothing in it can be mistaken for
        structure. Encode a whole link in component mode and "https://" becomes "https%3A%2F%2F" —
        every slash eaten, every colon trapped.
      </p>
      <p>
        encodeURI does the opposite. It respects the URL's structure and only escapes characters
        that are never legal anywhere in a URL: spaces, non-ASCII text, control characters. That
        is the right mode when you are tidying a whole link that got mangled by a system that
        inserted spaces or raw UTF-8 characters where it should not have. The rule is simple:
        encode values with component mode, encode whole URLs with full-URL mode. Swapping them
        silently changes what the URL means, and the breakage usually only appears later, in
        production, when a parameter vanishes because an unescaped &amp; split the query in the
        wrong place.
      </p>

      <h2>What + really means in a query string</h2>
      <p>
        The browser standard for HTML forms says: when data travels as
        application/x-www-form-urlencoded, spaces become + signs. That is not part of the URL
        standard — it is a convention from form submission that leaked into query strings because
        servers use the same decoder for both. The consequence is a minefield. A query value that
        contains an actual plus sign — a filename like "notes + slides.pdf" — is ambiguous: is the
        + a space, or a literal plus?
      </p>
      <p>
        The safe encoding practice is %20 for every space, and only decode + as a space when you
        know the string was produced by a form or a server-side URL builder. Many tools decode +
        unconditionally, which silently corrupts any value that contains a real plus. This decoder
        keeps the option visible and off by default, so the choice is explicit rather than hidden.
      </p>

      <h2>When decoding fails — and why the error matters</h2>
      <p>
        The most common decoding failure is a bare % that was never encoded in the first place.
        A string like "50% off" contains two illegal characters: the space, and a % followed by
        " o", which is not two hex digits. Any honest decoder must stop and report that, because
        guessing would mean silently changing the meaning of the data. This tool reports the exact
        byte position of the bad escape.
      </p>
      <p>
        The second failure is truncated multi-byte characters. A Chinese character like 好 is three
        bytes in UTF-8, so three percent-escapes: %E5%A5%BD. If the string is cut after the first
        two — %E5%A5 — the decoder has a valid-looking % followed by hex digits, but the resulting
        bytes do not form a valid character, so the decoder must reject them rather than emit
        mojibake or a replacement diamond. Both failures usually trace back to double-decoding or
        to a value that was never encoded and was just copy-pasted into a URL field that assumes
        everything already is.
      </p>

      <h2>Reading a query string</h2>
      <p>
        The breakdown panel parses the query into its decoded key-value pairs, preserving order and
        duplicates, because both are meaningful in the real world: arrays often repeat the same key
        with different values, and some APIs rely on the order in which parameters appear. Seeing
        the decoded table is the fastest way to inspect what a tracking link actually carries
        before you click it, or to verify that the redirect URL you are building contains the right
        campaign code, language tag and session parameter. The rebuilt query button re-encodes the
        pairs canonically, which is useful for spotting values that were double-encoded upstream:
        a value that decodes to "hello%20world" was already encoded once and then encoded again.
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
