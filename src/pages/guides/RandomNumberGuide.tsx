import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Are these numbers really random?',
    a: 'As random as your browser can make them. By default the generator pulls bytes from crypto.getRandomValues — the same cryptographically secure pseudo-random number generator (CSPRNG) your browser uses for TLS session keys and WebAuthn. It is seeded from the operating system entropy pool, not from the clock, so it is not predictable the way Math.random is. The only exception is when you enter a seed: then the sequence is deterministic by design, so you can reproduce it.',
  },
  {
    q: "What's wrong with Math.random?",
    a: 'Math.random is fast but not cryptographically secure. Its output is predictable given enough previous values, which makes it fine for animations and games but wrong for passwords, security tokens, shuffle-a-deck-for-money, or any draw where someone could gain from guessing the next number. crypto.getRandomValues is unpredictable by design. This tool uses crypto by default and Math.random only as a fallback on environments that lack it.',
  },
  {
    q: 'What does the "no repeats" option do?',
    a: 'It draws without replacement, like pulling tickets from a hat. Each number in the range can appear at most once. If you ask for more unique numbers than the range contains, the tool refuses rather than repeat — ten unique numbers from 1 to 5 is impossible, and it tells you so. Internally it shuffles the whole range (Fisher-Yates) and takes the first few, which is the honest way to guarantee a uniform draw without bias.',
  },
  {
    q: 'Why would I want a seed?',
    a: 'A seed makes the sequence reproducible. That is useful for tests, for game replays, for shuffling a playlist the same way twice, or for any fixture that needs to look random but stay stable across runs. A seeded draw is not secure — anyone who knows the seed can reproduce the whole sequence — so do not use it for passwords or security. For those, leave the seed blank and get true CSPRNG output.',
  },
  {
    q: 'Can I generate decimals?',
    a: 'Yes. Switch to decimals and choose how many decimal places — 0 to 10. The result is uniformly distributed across the range and rounded to the precision you asked for. Decimals cannot be drawn "without repeats" in any meaningful way (the space is effectively continuous), so the unique option applies only to integers.',
  },
]

export function RandomNumberGuide() {
  useSeo({
    ...routeMeta('/guides/random-number-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Generate random numbers without a server"
      lede="Randomness looks simple — pick a number between one and a hundred — but the source matters more than the range. Here is where browser randomness comes from, why crypto.random beats Math.random, how to draw without repeats, and why a reproducible seed is sometimes exactly what you want."
      updated="26 October 2026"
      toolTo="/tools/random-number"
      toolLabel="Generate random numbers in your browser"
    >
      <h2>The two randomnesses inside your browser</h2>
      <p>
        Every browser ships two ways to make a random number, and they are not interchangeable.
        <code>Math.random()</code> is fast and convenient, but it is a non-cryptographic
        pseudo-random generator: given enough of its output, an attacker can reconstruct its
        internal state and predict every future value. It is perfect for animating a loading
        spinner or shuffling a list of cat photos. It is wrong for a password, a two-factor
        backup code, or a dice roll where real money is at stake.
      </p>
      <p>
        <code>crypto.getRandomValues()</code> is the other one. It is a cryptographically secure
        generator seeded from the operating system's entropy pool — the same pool that feeds TLS
        session keys and SSH key generation. Its output is unpredictable by design. This generator
        uses crypto by default and falls back to Math.random only on environments that lack it,
        which on the modern web means essentially never.
      </p>

      <h2>Uniformity and the modulo bias problem</h2>
      <p>
        The obvious way to make a random integer in a range is
        <code> Math.floor(Math.random() * range) </code>. It looks right and it is almost right,
        but it introduces modulo bias. The random source has a fixed number of possible values,
        and that number rarely divides evenly by the range. The remainder maps more heavily onto
        the lower values, so some outcomes are slightly more likely than others. For a 1-to-100
        draw the bias is tiny; for a raffle of a few thousand tickets, it is the difference
        between fair and not.
      </p>
      <p>
        The fix is rejection sampling: generate a raw value, and if it lands in the partial range
        at the top that does not divide evenly, throw it away and try again. Every kept value then
        maps to a range outcome with exactly equal probability. This generator does that for every
        integer draw, so the distribution is uniform, not approximately uniform.
      </p>

      <h2>Drawing without repeats, the honest way</h2>
      <p>
        "No repeats" means sampling without replacement — pulling tickets from a hat rather than
        rolling a die. The naive approach (generate, check if seen, retry if duplicate) works for
        small samples but grinds to a halt as the sample size approaches the range size, because
        most of the generated numbers are duplicates that get thrown away.
      </p>
      <p>
        The correct approach is the Fisher-Yates shuffle: write down every number in the range,
        step through swapping each element with a random later one, and take the first however
        many you asked for. The result is a perfectly uniform sample with no retries and no bias.
        If you ask for more unique numbers than the range can hold — ten unique numbers from 1 to
        5 — the generator refuses rather than looping forever or silently repeating.
      </p>

      <h2>When to reach for a seed</h2>
      <p>
        A seed trades randomness for reproducibility: the same seed always produces the same
        sequence. That is the right trade-off for a unit test that needs a random-looking fixture
        you can assert against, for a game replay that has to show the same events in the same
        order, or for shuffling a playlist identically on two devices. It is the wrong trade-off
        for anything security-sensitive, because a seeded sequence is reproducible by anyone who
        knows the seed. Leave the seed blank for true CSPRNG output; fill it in only when
        reproducibility is the point.
      </p>

      <h2>Why this never needs a server</h2>
      <p>
        Randomness is not a service. The entropy comes from your own machine — mouse movements,
        keyboard timing, disk interrupts, the operating system's internal noise. A server-side
        generator would add latency and a log of every draw to a process that is already complete
        before the page finishes loading. The generator on this site does the whole job in the
        tab: load it, pull the network cable, and it still produces unpredictable numbers without
        noticing anything changed.
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
