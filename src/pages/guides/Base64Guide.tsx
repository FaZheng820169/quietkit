import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is my data uploaded to be encoded or decoded?',
    a: 'No. Base64 encoding is arithmetic — there is nothing a server can do that this page cannot. The conversion runs in JavaScript inside this tab. You can verify it: open the Network panel in your browser developer tools and watch it stay empty while you type, or load the page, disconnect from the internet and keep converting.',
  },
  {
    q: 'Why do some Base64 tools break on non-English text?',
    a: 'The browser\'s built-in btoa() function works on bytes, not characters, and throws an "InvalidCharacterError" on anything outside Latin-1 — accented letters, CJK text, emoji. This tool converts text to UTF-8 bytes first, so any character in any language encodes and decodes correctly.',
  },
  {
    q: 'What is the URL-safe variant of Base64?',
    a: 'Standard Base64 uses + and /, which have special meanings in URLs, and ends with = padding. The URL-safe variant (RFC 4648 §5) swaps + for - and / for _, and usually drops the padding. It is what JSON Web Tokens (JWTs) and many URL parameters use. Tick "URL-safe" when your output is going into a link or a token.',
  },
  {
    q: 'Why does my Base64 string fail to decode?',
    a: 'The usual causes: the string uses the URL-safe alphabet while standard mode is selected (or the reverse), characters outside the Base64 alphabet slipped in when copying, or the data is not Base64 at all. Missing padding is tolerated. If decoding succeeds but the result is not valid UTF-8 text, the original data was binary — an image, an archive — and this tool offers it as a file download instead of garbled text.',
  },
  {
    q: 'How much bigger is Base64 than the original data?',
    a: 'About 33% — every 3 bytes become 4 characters, plus padding. That is why email attachments and embedded images grow when they are Base64-encoded. Base64 is a transport format for moving binary data through text-only channels, not a compression or encryption method.',
  },
]

export function Base64Guide() {
  useSeo({
    ...routeMeta('/guides/base64-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Base64 encode and decode without pasting data into a server"
      lede="The strings people paste into Base64 tools are rarely harmless: API keys, Basic-auth credentials, JWT payloads, config snippets. An online encoder sees every one of them. The conversion itself is pure arithmetic that any browser can do — here is how it works, where the traps are, and how to keep it local."
      updated="26 October 2026"
      toolTo="/tools/base64"
      toolLabel="Encode and decode Base64 in your browser"
    >
      <h2>The data people Base64 is exactly the data they should not share</h2>
      <p>
        Nobody reaches for a Base64 encoder to convert a grocery list. The realistic inputs are a
        client ID and secret for a Basic-auth header, the middle segment of a JWT someone asked
        you to inspect, an API token from an environment file, a SAML response during a login
        outage. Every one of those is a credential or a session in disguise. Paste them into a
        server-side encoder and they sit in that server's access log, long after you closed the
        tab — decodable by anyone who reads it, because Base64 is not encryption and never was.
      </p>
      <p>
        The uncomfortable part is that the server adds nothing. Base64 is a fixed mechanical
        mapping: three bytes in, four characters out, according to a table published in 1992. A
        browser tab computes it exactly as well as a data centre does. The only thing the
        round-trip buys you is latency and a copy of your data on somebody else's disk.
      </p>

      <h2>What Base64 actually is</h2>
      <p>
        Sixty-four printable ASCII characters — A–Z, a–z, 0–9, + and / — each standing for six
        bits. Bytes are consumed three at a time (24 bits) and emitted as four characters; leftover
        bytes are padded with = signs. That is the entire algorithm. It exists because much of the
        internet's plumbing was designed for text only: email attachments, JSON fields, URL query
        strings, HTTP headers, XML attributes. Base64 is how binary data crosses those text-only
        bridges without a single byte being mangled by a system that thinks 0x0A is a newline.
      </p>
      <p>
        Two consequences follow. First, size: four characters for every three bytes means the
        encoded form is about 33% larger, which is why a 10 MB photo attached to an email travels
        as roughly 13.3 MB. Second, secrecy — or rather the lack of it: anyone who sees the string
        can reverse it in a second. Base64 hides data from machines that mangle binary, not from
        people who can read.
      </p>

      <h2>Why btoa breaks on Unicode</h2>
      <p>
        The browser's built-in btoa() function is a fossil from the Latin-1 era. It treats a
        JavaScript string as a sequence of single-byte characters, and the moment it meets an
        accented é, a Chinese character or an emoji, it throws an InvalidCharacterError. Countless
        online tools wrap btoa() directly and inherit the bug, which is why "base64 encode ü" turns
        up so many confused results.
      </p>
      <p>
        The fix is one extra step: convert the text to UTF-8 bytes first, then encode the bytes.
        UTF-8 represents every character in every writing system as one to four bytes, so once the
        text is bytes, the standard algorithm handles it without knowing or caring what language it
        was. Decoding reverses the process and checks that the bytes are valid UTF-8 — if they are
        not, the original was binary data, and the honest answer is a file download, not a screen
        of replacement characters.
      </p>

      <h2>The URL-safe variant, and when you need it</h2>
      <p>
        Two characters in the standard alphabet cause trouble in transit: + means a space in URL
        query strings, and / separates path segments. The = padding has its own escaping issues in
        some systems. RFC 4648 defines a URL-and-filename-safe variant that swaps + for - and /
        for _ and usually drops the padding entirely. The most famous user of this alphabet is the
        JSON Web Token: a JWT is three URL-safe Base64 segments joined by dots, which is why
        decoding the middle one in standard mode sometimes throws an error on a perfectly valid
        token. If your input came from a URL or your output is going into one, use the URL-safe
        option; if a standard-mode decode fails on what looks like valid input, an alphabet
        mismatch is the first thing to check.
      </p>

      <h2>Reading a decode failure honestly</h2>
      <p>
        A good decoder fails loudly and specifically. Characters outside the alphabet — a stray
        quote or comma copied along with the string — are reported rather than silently skipped,
        because silently skipping them produces a wrong answer that looks right. A length that is
        impossible for Base64 (one more than a multiple of four) is rejected outright. Missing
        padding, on the other hand, is a common and harmless truncation, so it is tolerated. And
        when the decoded bytes are not valid UTF-8, the correct response is to say "this is binary"
        and offer the bytes as a file — the Base64 of a PNG decodes cleanly, just not into
        readable text.
      </p>

      <h2>How to verify a tool is local</h2>
      <p>
        The check takes ten seconds and works on any converter: open your browser's developer
        tools, switch to the Network panel, and type into the input box. If requests appear with
        your text in the payload, the conversion is happening on a server. If the panel stays
        empty, the work is local. The stronger version: load the page, pull the network cable or
        switch on airplane mode, and keep working — a genuinely local tool does not notice. Given
        that the realistic inputs are credentials, it is a habit worth having.
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
