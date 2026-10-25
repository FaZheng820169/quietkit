import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does a server see the UUIDs I generate?',
    a: 'No — and that is the entire point. A UUID usually becomes a primary key, a session id or a correlation id inside your systems. Generating one through an API means the operator of that API saw every id before you used it. This page draws bytes from crypto.getRandomValues, the same CSPRNG your browser uses for TLS session keys, and the Network panel in your developer tools stays empty while you generate.',
  },
  {
    q: 'What do the 4 and the 8–b in a UUID mean?',
    a: 'A version 4 UUID is 16 bytes, of which 122 bits are pure randomness. The remaining six bits are fixed: the third group always starts with 4, marking the version — "this UUID is random", as opposed to a time-based v1 or a name-based v5. The fourth group always starts with 8, 9, a or b, the two variant bits that say "this follows RFC 4122". Every UUID on this page carries both markers.',
  },
  {
    q: 'How likely is a collision?',
    a: 'Astronomically unlikely — and the honest number is more useful than the adjective. By the birthday bound, a collision needs roughly 2^61 UUIDs to become plausible: generate one billion UUIDs per second for a century and the odds of a single duplicate are still under one in a billion. The practical rule: collisions are not how v4 UUIDs fail; reusing the same id twice by copy-paste is.',
  },
  {
    q: 'Why offer braced and URN formats?',
    a: 'Because UUIDs travel through ecosystems with different wrappers. .NET and older Microsoft code often writes them in braces: {3b24…}. SAML, XMPP and other XML-era standards wrap them in a URN: urn:uuid:3b24…. Some databases and compact APIs strip the hyphens entirely. All four forms encode the same 128 bits — the format is a display choice, which is why the generator keeps the random bytes identical and only changes the wrapping.',
  },
  {
    q: 'Can I generate a thousand UUIDs at once?',
    a: 'Yes — set the count anywhere from 1 to 1,000 and the whole batch appears at once, one per line, ready to paste into a migration script or a fixtures file. Even at 1,000 per click, the chance of a duplicate inside one batch is about 1 in 10^16. If you ever do want deterministic ids derived from a name rather than randomness, that is UUID v5 territory — hash-based, and a different tool.',
  },
]

export function UuidGeneratorGuide() {
  useSeo({
    ...routeMeta('/guides/uuid-generator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Generate UUIDs without a server knowing them"
      lede="A UUID is usually about to become a primary key, a session id or a correlation id — an identifier your systems will rely on. Generating it through an online API means the operator saw every id before you used it. That trade buys nothing, because randomness is a syscall, not a service. Here is what a version 4 UUID actually contains, how likely collisions really are, and how to mint a thousand of them locally."
      updated="26 October 2026"
      toolTo="/tools/uuid-generator"
      toolLabel="Generate UUIDs in your browser"
    >
      <h2>Six fixed bits, 122 random ones</h2>
      <p>
        A version 4 UUID looks ceremonial — five groups of hex, hyphens in familiar places — but
        strip the formatting away and it is 16 bytes. Of the 128 bits, exactly six are not
        random. The third group always begins with 4, the version marker that says "this id is
        random" rather than time-based (v1) or name-derived (v5). The fourth group always begins
        with 8, 9, a or b: two variant bits announcing "this follows RFC 4122". Everything else —
        122 bits — is drawn from randomness.
      </p>
      <p>
        That design is the entire point. A UUID needs no coordination: no registry, no range
        allocation, no asking a central authority for a block of ids. Any machine anywhere can
        mint one and be certain, for all practical purposes, that no other machine will ever mint
        the same one. Which raises the question every developer asks eventually.
      </p>

      <h2>How likely is a collision, really?</h2>
      <p>
        The honest answer is a number, not an adjective. Random ids follow the birthday bound:
        with n possible values, collisions become plausible after roughly the square root of n
        draws. For 122 random bits that is about 2^61 UUIDs — two billion billion. Concretely:
        generate one billion UUIDs every second for a full century, and the probability of a
        single duplicate is still under one in a billion.
      </p>
      <p>
        In production, UUIDs fail for boring reasons instead. A retry writes the same row twice
        because the id was generated once and reused. A copy-paste moves an id from staging into
        production. An ORM silently keeps an old value. Randomness has never been the weak link —
        the weak link is always reuse, and no generator, local or remote, can protect you from
        that. What a generator can protect you from is being watched.
      </p>

      <h2>What an online UUID API actually sees</h2>
      <p>
        UUID generation APIs exist, and they get used — by developers seeding test data, writing
        migration scripts, spinning up session ids. Every request hands the operator a list of
        identifiers the caller is about to depend on. The leak is subtle: an id is not a
        password, and knowing it grants no access by itself. But it is information about your
        system you did not need to disclose, disclosed for a computation your own machine performs
        in microseconds.
      </p>
      <p>
        crypto.getRandomValues draws from the same operating-system entropy pool that seeds your
        browser's TLS session keys — the strongest randomness available to any software on the
        machine. A server cannot offer better randomness; it can only offer the same randomness,
        with a network log attached. The generator on this site runs entirely in the tab, and the
        Network panel stays empty while you mint a batch of a thousand.
      </p>

      <h2>Why one id wears four wrappers</h2>
      <p>
        Decades of ecosystem history left UUIDs with four common spellings. The hyphenated form
        is the RFC standard and what most databases print. .NET tooling and COM-era Microsoft
        code traditionally write UUIDs in braces: {'{'}3b24…{'}'}. SAML, XMPP and other XML-era
        standards wrap them as a URN: urn:uuid:3b24…. Compact storage formats — and some
        databases' binary columns — strip the hyphens entirely.
      </p>
      <p>
        All four encode the same 128 bits; the wrapper is a display convention, nothing more.
        That is why the generator switches format without touching the underlying randomness —
        the id stays the id, only its clothing changes. Pick the spelling your target system
        expects, and paste.
      </p>

      <h2>Mint the batch, not the id</h2>
      <p>
        UUIDs are rarely needed one at a time. A fixtures file wants fifty, a migration script
        wants five hundred, a load test wants a thousand. The tool generates up to a thousand per
        click, one per line, ready to paste into whatever script consumes them. Even at a
        thousand per batch, the chance of a duplicate inside the batch is about 1 in 10^16 — and
        the tool reports the order of magnitude for whatever size you choose, because an honest
        number beats a confident adjective.
      </p>
      <p>
        And if you ever need ids that are deterministic — the same name always producing the same
        UUID — that is version 5 territory: name-based, hash-derived, and deliberately not
        random. It answers a different question, and it is a different tool.
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
