import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { AdSlot } from '../../components/AdSlot'
import { faqJsonLd, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Do online PDF mergers keep my file?',
    a: 'Many state they delete it after an hour, which still means the document existed on someone else’s disk and was readable by their software. If the PDF is a contract, a payslip or an ID scan, “deleted after an hour” is not the same as “never uploaded”.',
  },
  {
    q: 'Does merging change the file size much?',
    a: 'It should barely change at all: pages are copied, not re-rendered. Expect the output to be close to the sum of the inputs. If a tool produces a much larger or much smaller file, it has probably rasterised your pages.',
  },
  {
    q: 'Will bookmarks and links survive?',
    a: 'Page content, text and embedded links survive because each page object is copied intact. Document-level bookmarks are a separate structure and may not transfer; that is a limitation of the underlying library, not of your files.',
  },
  {
    q: 'Can I merge password-protected PDFs?',
    a: 'Only if they open without a password. A file that prompts for a password cannot be read by the browser at all; unlock it in your PDF reader first.',
  },
]

export function MergePdfGuide() {
  useSeo({
    title: 'Merge PDF files without uploading them — why it matters and how to do it',
    description:
      'Combining contracts, scans and invoices usually means uploading them to a stranger’s server. Here is how to merge PDFs entirely inside your browser instead.',
    path: '/guides/merge-pdf-without-upload',
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Merge PDFs without uploading them"
      lede="Combining a contract, an ID scan and a signed page normally means handing all three to a website you have never heard of. It does not have to."
      updated="25 October 2026"
      toolTo="/tools/pdf-merge"
      toolLabel="Merge PDFs locally"
    >
      <h2>Why PDF merging ended up in the cloud</h2>
      <p>
        Ten years ago, merging PDFs in a browser was impractical: the file format is complex and
        JavaScript could not handle it reliably. So the obvious solution was a server that does the
        work for you. The model stuck, even though browsers caught up. Today a page can parse and
        rewrite PDFs directly, which removes the only real reason to upload.
      </p>

      <h2>What “local” actually means</h2>
      <p>
        A PDF is a container of objects — pages, fonts, images, and the instructions that place
        them. Merging is a copy operation: open each document, take its page objects, add them to a
        new container, write it out. No server is involved in that sequence, and no image is
        re-compressed.
      </p>
      <p>
        When you use the <Link to="/tools/pdf-merge">local merger</Link>, the bytes are read from
        your disk into the tab’s memory, rearranged, and written back to your downloads folder. You
        can watch the Network panel while it runs: nothing carrying your document leaves the
        machine.
      </p>

      <h2>Step by step</h2>
      <ol>
        <li>Open the merger and drop two or more PDFs.</li>
        <li>Reorder them with the arrow buttons — the list order is the output order.</li>
        <li>Check the page count shown next to each file, so you know what you are combining.</li>
        <li>Merge, then download the single file.</li>
        <li>Close the tab. Nothing is retained.</li>
      </ol>

      <h2>Which documents should never be uploaded</h2>
      <ul>
        <li><strong>Signed contracts</strong> — they contain names, addresses and signatures.</li>
        <li><strong>ID and passport scans</strong> — the highest-value target in any data breach.</li>
        <li><strong>Payslips and bank statements</strong> — routinely required for visa and loan applications.</li>
        <li><strong>Medical records</strong> — sensitive by law in most jurisdictions.</li>
        <li><strong>Anything under an NDA</strong> — uploading it to a free site may itself be a breach.</li>
      </ul>
      <p>
        The pattern is consistent: the documents people most often need to combine are exactly the
        ones that should not be sent to an anonymous service.
      </p>

      <h2>Checking that a tool is genuinely local</h2>
      <ul>
        <li>Open the browser’s developer tools, go to the Network tab, then perform the merge.</li>
        <li>If a request carries the file, it is being uploaded — regardless of what the page claims.</li>
        <li>Turn off your Wi-Fi after the page has loaded. A truly local tool keeps working.</li>
        <li>Look for a stated file-size limit. Local tools have none beyond your memory; upload sites often cap free files at 5–10 MB.</li>
      </ul>

      <h2>When the merge fails</h2>
      <p>
        Almost every failure is one of three things: the PDF is encrypted, the download is
        truncated, or the files are large enough to exhaust the tab’s memory. Open each file once
        in a reader to confirm it renders, then retry with fewer documents at a time.
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

      <div style={{ marginTop: 28 }}>
        <AdSlot />
      </div>
    </Article>
  )
}
