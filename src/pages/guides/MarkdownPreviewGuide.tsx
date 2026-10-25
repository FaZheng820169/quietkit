import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is my draft uploaded anywhere when I preview it?',
    a: 'No. The renderer is JavaScript running in this tab. Typing, previewing, copying and downloading all happen locally — you can confirm it in the Network panel of your browser developer tools, or by disconnecting from the internet after the page loads.',
  },
  {
    q: 'Which Markdown syntax is supported?',
    a: 'Headings, bold, italic, strikethrough, inline code and fenced code blocks, links, images, blockquotes, horizontal rules, ordered and unordered lists, and tables with alignment. That covers the CommonMark core plus the most-used GFM extras.',
  },
  {
    q: 'What happens to raw HTML inside my Markdown?',
    a: 'It is shown as text, never executed. The renderer escapes every HTML character before applying Markdown formatting, and link URLs are restricted to http, https and mailto schemes. This is the safe default for previewing untrusted or copied content.',
  },
  {
    q: 'Can I export the result as an HTML file?',
    a: 'Yes. “Download .html” produces a standalone document with embedded minimal styling that opens correctly in any browser. “Copy HTML” puts just the rendered body markup on your clipboard for pasting into a CMS, email template or static site.',
  },
  {
    q: 'Why use this instead of the preview built into my editor?',
    a: 'If your editor has one, use it. This tool is for the cases where it does not exist: editing a gist in a browser tab, reviewing a changelog pasted from an email, checking a table before committing, or working on a machine where you cannot install anything.',
  },
]

export function MarkdownPreviewGuide() {
  useSeo({
    ...routeMeta('/guides/markdown-preview-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Writer"
      title="Preview Markdown without pasting drafts into a server"
      lede="A Markdown draft is often unfinished thinking: meeting notes, an unannounced feature, a half-written post. Online previewers send every keystroke's worth of text to a server. Here is why that trade is rarely worth it, and what a local renderer does differently."
      updated="26 October 2026"
      toolTo="/tools/markdown-preview"
      toolLabel="Preview Markdown in your browser"
    >
      <h2>Drafts are the most sensitive text you write</h2>
      <p>
        Published text has already been seen by the world; a draft has not. Meeting notes name
        people and decisions. A changelog lists features competitors do not know about yet. A
        personal post contains the paragraph you might still delete. When you paste any of these
        into an online Markdown previewer, the server receives the text, renders it, and returns
        HTML. Even with a perfect privacy policy, the draft now exists in a log, a cache or a
        memory space you do not control — precisely because the whole point of the site is to
        process your input on its machine.
      </p>
      <p>
        A local renderer inverts this. The JavaScript engine already inside your browser parses
        the text and builds the HTML. No request leaves the tab. The draft exists in exactly one
        place: your device. When you close the tab, it is gone.
      </p>

      <h2>The hidden danger: raw HTML</h2>
      <p>
        Markdown allows embedded HTML by design, which means a careless renderer can execute it.
        Paste a snippet containing a script tag into a naive previewer and the script runs in your
        browser — a classic cross-site scripting hole, triggered by content you may have copied
        from an untrusted source. A safe local renderer takes the opposite approach: it escapes
        every HTML character first, so markup appears as visible text, then applies Markdown
        formatting on top. Links are restricted to web and email schemes, so a
        “javascript:” URL in copied content becomes inert.
      </p>
      <p>
        This costs you nothing in practice — most Markdown never needs raw HTML — and it makes the
        previewer safe for reviewing content you did not write.
      </p>

      <h2>What a good preview covers</h2>
      <p>
        The CommonMark core handles the everyday cases: headings, paragraphs, emphasis, strong
        text, links, images, lists, blockquotes, code spans and fenced code blocks. Two extras
        from GitHub Flavored Markdown are worth having because they appear constantly in real
        documents:
      </p>
      <ul>
        <li><strong>Tables</strong> — pipe-separated rows with a delimiter line, including colon markers for left, centre and right alignment.</li>
        <li><strong>Strikethrough</strong> — double tildes, the standard way to show a decision that was reversed.</li>
      </ul>
      <p>
        A preview that handles these two plus the CommonMark core will faithfully render the vast
        majority of READMEs, notes and posts.
      </p>

      <h2>From preview to published HTML</h2>
      <p>
        Rendering is only half the job; the other half is getting the HTML out. Two export shapes
        cover most needs. Copying the body markup gives you just the elements — headings, lists,
        tables — ready to paste into a CMS, an email template or a static site generator's
        content slot. Downloading a full document wraps the same markup in a complete page with
        embedded minimal styling, so the file opens correctly when double-clicked and looks tidy
        when sent to someone who does not use Markdown at all.
      </p>
      <p>
        Keeping the original .md file matters too. Markdown is the durable, diff-friendly source;
        HTML is a build artefact. Save both: the .md for your repository, the .html for whoever
        needs to read it.
      </p>

      <h2>A workflow that stays local</h2>
      <p>
        A sensible pattern for private drafts: write in the local previewer, check the rendered
        output, fix the table alignment, and only then commit the .md to a shared repository. The
        draft phase — with its half-formed sentences and names you might redact — never touched a
        server. The published phase starts when you decide, not when a preview site received your
        first paste.
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
