import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is it safe to generate a password on a website?',
    a: 'Only if the generator runs entirely in your browser. This page uses crypto.getRandomValues — the same source of randomness your operating system uses — and never sends the password anywhere. You can switch off Wi-Fi after loading the page and it still works.',
  },
  {
    q: 'How long should my password be?',
    a: 'For an important account, 16 characters with all character sets enabled is the practical minimum. For a password manager master password, use 20 or more. Length matters more than complexity: a 20-character lowercase password is stronger than a 10-character one with symbols.',
  },
  {
    q: 'What does “exclude ambiguous characters” do?',
    a: 'It removes characters that look alike in many fonts: 0 and O, 1 and l and I, and the pipe |. Use this when you will read the password aloud, type it from a printed sheet, or dictate it over the phone. It slightly reduces entropy, so add a couple of extra characters if you use it.',
  },
  {
    q: 'Why not just use a password manager?',
    a: 'You should — for most accounts. But you still need one strong master password you can remember, and you occasionally need a password for a device or service that cannot use autofill. This generator is for those cases. The passwords it makes are random, not memorable, so store them somewhere safe.',
  },
  {
    q: 'Can I generate several passwords at once?',
    a: 'Yes. Choose “5” or “10” and the page generates a fresh batch. Each one is independently random — picking from a batch does not weaken any of them.',
  },
]

export function PasswordGeneratorGuide() {
  useSeo({
    ...routeMeta('/guides/password-generator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Security"
      title="Generate passwords without uploading them"
      lede="A password generator that runs on a server has to send you the password — which means the server saw it first. Here is why that matters, what actually makes a password strong, and how to generate one that never leaves your browser."
      updated="26 October 2026"
      toolTo="/tools/password-generator"
      toolLabel="Generate a password in your browser"
    >
      <h2>The server-side generator paradox</h2>
      <p>
        Most online password generators work like this: you click a button, the server runs some
        code, and the server sends back a password. By definition, the server knew the password
        before you did. It may log it, store it, or sell it — you have no way to know. Even if the
        site promises not to keep logs, the password traveled over the network and sat in a
        database row, if only for a millisecond.
      </p>
      <p>
        A local generator avoids the problem entirely. The password is created by JavaScript
        running inside your browser tab, using the same random number generator that your operating
        system uses for cryptographic keys. Nothing is transmitted, so there is nothing to log,
        intercept or leak.
      </p>

      <h2>Length beats complexity</h2>
      <p>
        Password strength is measured in bits of entropy — how many guesses an attacker needs, on
        average, to find yours. Each additional character multiplies the search space by the size
        of the character set. That means length is the dominant factor: a 20-character password
        using only lowercase letters has about 94 bits of entropy, while an 8-character password
        with every symbol on the keyboard has about 52 bits. The short complex one is weaker.
      </p>
      <p>
        For most accounts, 16 characters with lowercase, uppercase, digits and symbols is the
        practical sweet spot — around 105 bits, which puts brute-force cracking beyond any
        realistic budget. For a password manager master password or full-disk encryption, go to
        24 or 32 characters.
      </p>

      <h2>What “exclude ambiguous” is for</h2>
      <p>
        Some characters are hard to tell apart in common fonts: the digit 0 and the letter O, the
        digit 1 and lowercase l and uppercase I, and the pipe symbol |. If you will ever read the
        password aloud, type it from a printed sheet, or enter it on a device with a small screen,
        excluding these characters prevents transcription errors. The cost is a small loss of
        entropy — about 2 bits at 16 characters — so add an extra character or two to compensate.
      </p>

      <h2>Why humans cannot improvise randomness</h2>
      <p>
        Asked to invent a random password, people produce keyboard walks (qwerty, 1qaz2wsx),
        meaningful words with number substitutions (p@ssw0rd), names and dates. All of these appear
        in cracking dictionaries within the first few million guesses. A true random generator
        produces strings with no pattern, no meaning and no personal connection — which is exactly
        why they are hard to remember, and why they belong in a password manager.
      </p>

      <h2>How to verify a generator is local</h2>
      <ul>
        <li>Open the browser's developer tools and switch to the Network tab.</li>
        <li>Click generate. If a request fires — any request — the password left your device.</li>
        <li>Reload the page, then disable Wi-Fi. A local generator keeps working.</li>
        <li>Check the source. A local generator will call crypto.getRandomValues, not fetch.</li>
      </ul>

      <h2>When you still need a password manager</h2>
      <p>
        This tool generates one password at a time, but you should not reuse passwords across
        accounts. A password manager stores a unique random password for every site, protected by
        one strong master password that you generate here and memorise. The manager handles the
        remembering; this tool handles the creating.
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
