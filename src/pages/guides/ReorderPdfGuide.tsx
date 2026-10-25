import { Link } from 'react-router-dom'
import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Does reordering PDF pages reduce quality?',
    a: 'No. Pages are copied into the new document as they are — text stays real text, images keep their original encoding, nothing is re-rendered. The output file is usually within a few percent of the original size.',
  },
  {
    q: 'How do I move one page to the front or the end?',
    a: 'Write the new order with ranges as shorthand. For a 10-page file, “7, 1-6, 8-10” moves page 7 to the front; “1-6, 8-10, 7” sends it to the end. Most single-page moves take two or three numbers, not a full list.',
  },
  {
    q: 'What happens to bookmarks when I reorder?',
    a: 'They are dropped. The navigation outline lives outside the pages, so a rebuilt document has no “Chapter 3 → page 41” sidebar. The visible content is untouched. For long reports, reorder first and add bookmarks afterwards.',
  },
  {
    q: 'Will links and form fields still work?',
    a: 'Internal links keep pointing at their original page numbers, which may no longer be where that content sits — check them if you moved the target pages. Fillable form fields can stop being editable after a rebuild, because they are defined at document level. If a form must stay fillable, reorder the source document instead.',
  },
  {
    q: 'Is my PDF uploaded while reordering?',
    a: 'No. The file is read into this browser tab, the pages are copied in the new order in memory, and the result downloads straight back. Nothing is transmitted — you can watch the Network panel, or switch the network off after the page loads.',
  },
]

export function ReorderPdfGuide() {
  useSeo({
    ...routeMeta('/guides/reorder-pdf-pages-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Reorder PDF pages without uploading the file"
      lede="The duplex scanner returned the back sides in reverse, the signed page got merged at the end, the appendix landed in the middle. Page order goes wrong in predictable ways — and the fix is one line of numbers, typed locally."
      updated="26 October 2026"
      toolTo="/tools/pdf-reorder"
      toolLabel="Reorder PDF pages in your browser"
    >
      <h2>Three ways page order goes wrong</h2>
      <p>
        The classic is the duplex scanner that flips on the wrong edge: it returns all the front
        sides, then all the back sides in reverse, so a 20-page contract comes back as 1, 3, 5… 20,
        18, 16… The second is the signature page that arrives as its own file and gets merged where
        it lands — usually the end, never where it belongs. The third is the appendix written last
        but meant to sit in the middle, which no scanner can know.
      </p>
      <p>
        All three are the same operation: take the pages you have and write down the order you want.
      </p>

      <h2>Why typing beats dragging</h2>
      <p>
        Most PDF viewers reorder by dragging thumbnails. It works for swapping two neighbouring
        pages and falls apart everywhere else: dragging page 47 up to page 3 means scrolling with a
        held mouse button and hoping the drop lands between the right two thumbnails. There is no
        way to review the change before committing, and no way to repeat it on a second copy of the
        file.
      </p>
      <p>
        A written order is precise, reviewable and repeatable. <code>47, 1-46</code> says exactly
        what happens, can be checked before anything is built, and works identically on every copy
        of the document. A good tool goes further and enforces the one rule that matters: every
        page must appear exactly once. A missing or duplicated page stops the build with a named
        error, because silently dropping page 12 would produce a document nobody asked for.
      </p>

      <h2>The order string, by example</h2>
      <p>For a 6-page file:</p>
      <ul>
        <li>
          <code>2, 1, 3-6</code> — swap the first two pages.
        </li>
        <li>
          <code>6, 1-5</code> — last page to the front.
        </li>
        <li>
          <code>1, 3, 2, 4-6</code> — swap two pages in the middle.
        </li>
        <li>
          <code>6, 5, 4, 3, 2, 1</code> — reverse the whole file, which is also what the reverse
          button writes for you.
        </li>
      </ul>
      <p>
        Commas separate positions; a dash makes a range, expanded in the order you wrote it. Leaving
        the box empty keeps the original order — useful for checking the page count before you
        commit to anything.
      </p>

      <h2>What survives a reorder, and what does not</h2>
      <p>
        Page content survives intact: fonts, images, vector art, annotations drawn on the page and
        each page’s rotation. Three things live outside the page objects and do not survive a
        rebuild: the bookmark outline, document-level form fields, and the original metadata block
        (author, title, producer). For a scan or a contract none of those exist or matter; for a
        long report with a navigation sidebar, reorder before adding bookmarks rather than after.
      </p>

      <h2>Why this should happen on your machine</h2>
      <p>
        The documents that need reordering are assembled from scans — contracts, medical records,
        visa applications, court bundles. Upload-based reorder tools send the whole file through
        someone else’s infrastructure to do what is fundamentally a local shuffle. The privacy
        trade makes no sense: the operation is copying pages in memory, work any laptop does in
        milliseconds.
      </p>
      <p>
        A local reorder reads the file into the browser tab and never transmits it. You can verify
        rather than trust: open the Network panel before dropping the file and watch — no request
        carries the document. The page also works offline once loaded, the strongest proof a web
        tool can give.
      </p>

      <h2>Reordering a PDF locally, in four steps</h2>
      <ol>
        <li>
          Open the <Link to="/tools/pdf-reorder">page reorder tool</Link> and drop the file in.
        </li>
        <li>
          Type the new order — <code>4, 1-3, 5</code> — and read the live check underneath the box:
          it confirms every page is listed exactly once, or names the problem.
        </li>
        <li>
          Reorder, then download. The original file is untouched.
        </li>
        <li>
          Open the result and page through the joins — the pages before and after each move — to
          confirm the flow reads right.
        </li>
      </ol>

      <h2>What reordering cannot do</h2>
      <ul>
        <li>
          <strong>Split a page in two.</strong> A page is the smallest unit; to separate what is on
          one page, extract the text or render it to an image instead.
        </li>
        <li>
          <strong>Fix orientation.</strong> A sideways page moved to the right position is still
          sideways — <Link to="/tools/pdf-rotate">rotate it</Link> first or after.
        </li>
        <li>
          <strong>Remove pages.</strong> Every page must appear exactly once, so anything unwanted
          has to go through the <Link to="/tools/pdf-remove-pages">remove-pages tool</Link> — often
          the step right before reordering.
        </li>
        <li>
          <strong>Preserve the outline.</strong> Bookmarks are rebuilt from scratch, so add them
          after reordering, not before.
        </li>
      </ul>
      <p>
        Once the order is right, the finishing touches are local too:{' '}
        <Link to="/tools/pdf-page-numbers">stamp page numbers</Link> that match the new sequence, or{' '}
        <Link to="/tools/pdf-compress">shrink the file</Link> for email.
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
