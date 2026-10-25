import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Are my texts uploaded anywhere to be compared?',
    a: 'No. The diff algorithm is JavaScript running in this tab. Paste, compare, copy and download all happen locally — you can watch the Network panel in your browser developer tools, or load the page and then disconnect from the internet. Nothing changes.',
  },
  {
    q: 'What exactly is being compared?',
    a: 'Lines. The tool splits both texts into lines, finds the smallest set of line insertions and deletions that turns the original into the revision (the Myers algorithm, the same family git uses), then highlights the changed words inside each modified line. Whitespace-only or case-only differences can be ignored with the checkboxes.',
  },
  {
    q: 'What is a unified diff and what can I do with it?',
    a: 'A unified diff is the standard plain-text format for describing changes: --- and +++ headers, @@ hunks with line numbers, and lines prefixed by a space, minus or plus. It is what git diff produces. You can save it as a .diff or .patch file, attach it to a review, or apply it with tools like git apply or patch.',
  },
  {
    q: 'Is there a size limit?',
    a: 'There is no upload limit because there is no upload. Very large pastes — tens of thousands of changed lines in the edited region — fall back to a plain remove-and-add block instead of a line-by-line alignment, so the page stays responsive. Texts of normal contract, config or article size diff instantly.',
  },
  {
    q: 'When should I tick “Ignore whitespace”?',
    a: 'When a document has been through an editor that re-wraps or re-indents: a config file reformatted by a tool, a contract pasted from a PDF, or code with tabs converted to spaces. The option compares lines with runs of whitespace collapsed and edges trimmed, so only real wording changes surface.',
  },
]

export function TextDiffGuide() {
  useSeo({
    ...routeMeta('/guides/text-diff-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Documents"
      title="Compare two texts without uploading either one"
      lede="The texts you most need to diff are the ones you least want to share: a contract the other side just amended, a config that holds credentials, a draft nobody has seen. Online diff tools ask you to paste both into a server. Here is how the comparison works, and how to keep it on your own machine."
      updated="26 October 2026"
      toolTo="/tools/text-diff"
      toolLabel="Compare two texts in your browser"
    >
      <h2>The texts worth diffing are the private ones</h2>
      <p>
        Think about when you actually reach for a diff. A contract comes back from the other
        party's lawyer and you need to know exactly which clauses moved. A configuration file
        changed and the service stopped working. A colleague "only fixed a typo" in the document
        you are about to sign. In every case the text is confidential — that is precisely why the
        comparison matters. An unnoticed change to a payment term or a liability cap is worth far
        more than the convenience of a web tool.
      </p>
      <p>
        Yet the most popular diff tools work by sending both versions to a server, which compares
        them and returns the result. The two texts — the original you hold and the revision you
        were sent — now sit in someone else's logs. A local diff tool does the same computation
        with the JavaScript engine already in your browser. No request carries your text anywhere,
        and closing the tab removes every trace of it.
      </p>

      <h2>How a line diff actually works</h2>
      <p>
        A diff is not a guess about what "probably" changed; it is a proof. The classic approach,
        published by Eugene Myers in 1986 and still at the heart of git, treats the problem as a
        shortest-path search: what is the smallest number of line insertions and deletions that
        turns version A into version B? Lines that survive untouched are the context; the rest is
        the edit. Because the algorithm minimises the edit script, you see the fewest possible
        changes — not a noisy list of every line that differs in some way.
      </p>
      <p>
        Two practical refinements matter. First, common prefixes and suffixes are trimmed before
        the search, so a small edit in a long document is instant. Second, once a changed line is
        found, the words inside it can be compared too: the old and new line share a common start
        and end, and only the differing middle is highlighted. That is how you spot that "30
        days" became "14 days" without re-reading the whole clause.
      </p>

      <h2>Reading the result</h2>
      <p>
        A good diff view shows three kinds of rows. Unchanged lines carry both line numbers and a
        neutral background. Removed lines are numbered on the left and shaded red; added lines are
        numbered on the right and shaded green. When a line was modified rather than added or
        removed outright, the changed words inside it are marked more strongly, so your eye goes
        straight to the edit. The summary — how many lines were added, removed and kept — tells
        you at a glance whether you are looking at a typo fix or a rewrite.
      </p>

      <h2>The unified diff: a portable record of change</h2>
      <p>
        Sometimes the comparison is not the end of the job — you need to send the change itself
        to someone. The unified diff format, decades old and understood by every developer tool,
        encodes it as plain text: a header naming the two files, then "hunks" marked with line
        ranges, each line prefixed by a space (kept), a minus (removed) or a plus (added). Saved
        as a .diff or .patch file, it can be attached to a code review, archived with the contract
        it describes, or applied mechanically with git apply or the patch command. It is the
        difference between telling someone "section two changed" and handing them the exact
        change, verifiable character by character.
      </p>

      <h2>Whitespace, case and other false alarms</h2>
      <p>
        Not every difference is a change. A contract pasted out of a PDF arrives re-wrapped; a
        config file passed through a formatter comes back re-indented; a heading changes capitalisation
        when a style guide is updated. These produce pages of phantom diffs that hide the one edit
        that matters. Ignore-whitespace collapses runs of spaces and tabs and trims line edges
        before comparing, so only wording changes surface. Ignore-case does the same for
        capitalisation. Use them when you suspect the document has been through a machine, then
        switch them off to check the formatting itself.
      </p>

      <h2>A local comparison workflow</h2>
      <p>
        The habit worth building: when an amended document arrives, open the local diff tool,
        paste the version you sent into the left pane and the version that came back into the
        right. Read every highlighted change — there are usually fewer than you fear. If the
        other side claims nothing changed, the identical-texts message settles it in a second.
        Save the unified diff alongside the document when the amendments need a record. The two
        texts never left your machine, which, for a contract under negotiation, is exactly where
        they belong.
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
