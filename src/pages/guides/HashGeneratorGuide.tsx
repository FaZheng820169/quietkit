import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'What is a hash and why would I want one?',
    a: 'A hash is a fixed-length fingerprint of data. The same input always produces the same hash, but you cannot reverse a hash to recover the input. The main uses are verifying that a downloaded file was not corrupted or tampered with, and storing passwords (which this tool is not for — use a password manager instead).',
  },
  {
    q: 'Which algorithm should I use?',
    a: 'SHA-256 is the current standard and the right choice for almost everything. SHA-512 is stronger and sometimes faster on 64-bit systems. SHA-1 is broken for security purposes — do not use it for anything that matters — but it is still widely used for non-security checksums like git commit IDs.',
  },
  {
    q: 'Why is there no MD5?',
    a: 'MD5 is cryptographically broken — collisions can be generated in seconds on a laptop. Modern browsers no longer expose it in the Web Crypto API. If a website asks you to verify an MD5 hash, treat it as a hint, not a guarantee, and prefer a SHA-256 hash when one is available.',
  },
  {
    q: 'Is my file uploaded to compute the hash?',
    a: 'No. The file is read by the browser into memory, hashed with the Web Crypto API, and discarded. Nothing is transmitted. This matters for unreleased software, internal documents and any file you would not want on a third-party server.',
  },
  {
    q: 'How do I verify a download with a hash?',
    a: 'Find the hash published by the software vendor (usually on the download page or in a release note), download the file, then drop it here. Compare the SHA-256 hash shown on this page with the published one — they must match exactly, character for character. If they differ, the file is corrupted or has been modified.',
  },
]

export function HashGeneratorGuide() {
  useSeo({
    ...routeMeta('/guides/hash-generator-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Security"
      title="Hash files without uploading them"
      lede="A hash is a fingerprint for data. You use it to verify that a download is intact, that two files are identical, or that a config has not changed. Here is why the fingerprinting should happen locally, and which algorithm to trust."
      updated="26 October 2026"
      toolTo="/tools/hash-generator"
      toolLabel="Hash a file in your browser"
    >
      <h2>What a hash actually is</h2>
      <p>
        A cryptographic hash function takes any input — a sentence, a photo, a 4 GB installer — and
        produces a fixed-length string of characters. The same input always produces the same
        output, but the output tells you nothing about the input. Change one bit of the input and
        the hash changes completely. This makes hashes perfect for verifying that two copies of a
        file are identical without comparing every byte.
      </p>

      <h2>Why hash locally</h2>
      <p>
        A file you want to hash is often a file you do not fully trust, or one you do not want to
        share. It might be an installer you downloaded from a mirror, a config file before you
        commit it, or a document you are about to send. Sending it to an online hash service means
        the service sees the file — and a corrupted or malicious file is exactly the kind of file
        you do not want on someone else's server.
      </p>
      <p>
        A local hash tool reads the file into the browser's memory, computes the digest with the Web
        Crypto API, and discards the file. No network request is made, so the content stays on your
        device. You can verify this by watching the Network panel while you drop a file — nothing
        is sent.
      </p>

      <h2>Which algorithm to trust</h2>
      <ul>
        <li><strong>SHA-256</strong> — the current standard. Fast, secure, and what most vendors publish. Use this unless you have a reason not to.</li>
        <li><strong>SHA-512</strong> — longer output, sometimes faster on 64-bit systems because it works with 64-bit words. A good choice for new systems.</li>
        <li><strong>SHA-384</strong> — a truncated SHA-512. Rarely needed; use SHA-256 or SHA-512 instead.</li>
        <li><strong>SHA-1</strong> — broken for security purposes. Do not use it for anything that matters. It survives only because legacy systems like git still use it for commit IDs.</li>
      </ul>

      <h2>Why MD5 is missing</h2>
      <p>
        MD5 was the standard hash for decades, but it is now cryptographically broken. Collisions —
        two different files with the same MD5 hash — can be generated in seconds on a laptop.
        Modern browsers removed MD5 from the Web Crypto API because it gives a false sense of
        security. If a website asks you to verify an MD5 hash, treat it as a hint, not a guarantee,
        and look for a SHA-256 hash instead.
      </p>

      <h2>How to verify a download</h2>
      <p>
        Find the hash published by the software vendor — usually on the download page, in a release
        note, or in a separate .sha256 file. Download the file, then drop it here. Compare the
        SHA-256 hash shown on this page with the published one. They must match exactly, character
        for character, including case. If they differ, the file is corrupted or has been modified.
        Do not run it. If the vendor does not publish a hash at all, treat the download with extra
        suspicion — there is no way to know whether the file you received is the file they made.
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
