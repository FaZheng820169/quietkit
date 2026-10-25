import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'

export function About() {
  useSeo({
    title: 'About QuietKit — why these tools exist',
    description:
      'QuietKit is a small set of file tools built on one rule: your files should not have to leave your device to be useful.',
    path: '/about',
  })

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <span className="eyebrow">About</span>
          <h1>A small tool site rebuilt on one rule</h1>
          <p>
            “Free online converter” usually means: upload your private file to someone’s server,
            wait, download it back, and hope the copy is deleted. QuietKit removes the middle
            step.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow prose">
          <h2>The rule</h2>
          <p>
            Every tool on this site must work with the network switched off. That constraint is
            the whole design. It rules out upload pipelines, queues and cloud processing — and it
            means a photo of your passport, a scanned contract or a medical letter never has to
            sit on a disk that is not yours.
          </p>

          <h2>Why so few tools</h2>
          <p>
            Most file tasks are easy to fake and hard to do well. Compressing an image, stripping
            metadata and merging PDFs are all genuinely solvable in a browser today, with no
            compromise on quality. Those shipped. Splitting PDFs, HEIC conversion and video
            compression are on the workbench until they meet the same bar.
          </p>

          <h2>How it is funded</h2>
          <p>
            The site is static files on a CDN, which costs very little to run. A small number of
            clearly marked ad slots and the planned one-time pro tier cover that cost. No tool
            requires an account, and no file is ever monetised.
          </p>

          <h2>Built in public</h2>
          <p>
            QuietKit is built by one developer, in the open. The tools are plain web technology:
            Canvas for images, a hand-written JPEG/PNG segment parser for metadata, and pdf-lib for
            document copying. Nothing here needs a framework or a fleet of servers to stay online.
          </p>

          <h2>Say hello</h2>
          <p>
            Feature requests decide the roadmap. If a tool would save you time, describe the file
            you have and what you need to end up with — that is the most useful bug report there
            is. Reach out through the repository linked in the footer, or use the contact address
            published there.
          </p>

          <p>
            Start with the <Link to="/tools/image-compressor">image compressor</Link>, or read the{' '}
            <Link to="/privacy">privacy policy</Link> first.
          </p>
        </div>
      </section>
    </>
  )
}
