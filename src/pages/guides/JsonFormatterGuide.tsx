import { Article } from '../../components/Article'
import { faqJsonLd, routeMeta, useSeo } from '../../lib/seo'

const faqs = [
  {
    q: 'Is it safe to paste API keys or user data into this formatter?',
    a: 'Yes, because the JSON never leaves your browser. The parser runs in JavaScript on this page, and there is no network request when you click format, minify or download. You can disconnect from the internet after loading the page and it still works.',
  },
  {
    q: 'What does “sort keys” do?',
    a: 'It rewrites the JSON with object keys in alphabetical order, recursively. Arrays keep their original order. This is useful for comparing two versions of a config file or API response — when keys are in the same order, a diff shows only real changes.',
  },
  {
    q: 'Why does my JSON fail to parse even though it looks correct?',
    a: 'The most common causes are trailing commas after the last item in an array or object, single quotes instead of double quotes around strings, unquoted keys, or comments (which are not valid JSON). The error message shows the line and column where the parser gave up.',
  },
  {
    q: 'Can I format a JSON file from my computer?',
    a: 'Yes. Click “Open file” and pick a .json or .txt file. The contents are read into the text area by your browser, processed locally, and can be downloaded again after formatting. Nothing is uploaded.',
  },
  {
    q: 'What is the difference between 2-space, 4-space and tab indentation?',
    a: 'Only convention. 2 spaces is the most common in web projects and npm configs. 4 spaces is common in Java and Python ecosystems. Tabs produce the smallest files and let each developer choose their preferred visual width. The JSON data itself is identical in all three.',
  },
]

export function JsonFormatterGuide() {
  useSeo({
    ...routeMeta('/guides/json-formatter-without-upload'),
    jsonLd: faqJsonLd(faqs),
  })

  return (
    <Article
      eyebrow="Guide · Developer"
      title="Format JSON without pasting it into a server"
      lede="JSON is where API keys, user records and internal configs live. Pasting it into an online formatter means the server sees every byte. Here is why that matters, how to read a parse error, and what a local formatter gives you instead."
      updated="26 October 2026"
      toolTo="/tools/json-formatter"
      toolLabel="Format JSON in your browser"
    >
      <h2>The paste is the problem</h2>
      <p>
        Every developer has done it: copy a blob of JSON from a log, paste it into the first
        formatter that appears in search results, and read the pretty-printed output. What is easy
        to forget is that the formatter runs on a server. The JSON — which often contains access
        tokens, customer email addresses, internal hostnames or database connection strings — is
        sent there, parsed, formatted and sent back. Even if the site does not log it, the data has
        crossed a network and sat in a process you do not control.
      </p>
      <p>
        A local formatter avoids the problem entirely. The JSON is parsed by the JavaScript engine
        already running in your browser tab. No request is made, so there is nothing to intercept,
        log or leak. You can verify this yourself: open the Network panel in developer tools, click
        format, and watch nothing happen.
      </p>

      <h2>Reading a parse error</h2>
      <p>
        When JSON is invalid, the browser throws a message like “Unexpected token {'}'} in JSON at
        position 142”. This is precise but not friendly. The formatter converts that character
        position into a line and column number, so you can jump straight to the problem instead of
        counting characters by hand.
      </p>
      <p>The usual causes, in order of frequency:</p>
      <ul>
        <li><strong>Trailing comma</strong> — a comma after the last item in an array or object is valid in JavaScript but not in JSON.</li>
        <li><strong>Single quotes</strong> — JSON requires double quotes around strings and keys.</li>
        <li><strong>Unquoted keys</strong> — JavaScript allows {`{name: "x"}`}, JSON requires {`{"name": "x"}`}.</li>
        <li><strong>Comments</strong> — JSON has no comment syntax; strip them before parsing.</li>
      </ul>

      <h2>Format, minify, sort</h2>
      <p>
        Formatting adds whitespace so a human can read the structure. Minifying removes every
        unnecessary byte so the file is as small as possible for transmission. The data is
        identical either way — only the presentation changes. A good workflow is to keep configs
        formatted in the repository and minify them at build time.
      </p>
      <p>
        Sorting keys is less common but invaluable when comparing two versions of the same data.
        When object keys are in alphabetical order, a diff shows only real changes — not the noise
        of keys that moved position because the serializer felt like it.
      </p>

      <h2>When to use which indentation</h2>
      <p>
        Two spaces is the dominant convention in web projects: package.json, tsconfig.json, most
        API responses. Four spaces is common in Java and Python ecosystems. Tabs produce the
        smallest files and let each developer choose their preferred visual width, but they can
        cause arguments in code review. The JSON data itself is identical in all three — the choice
        is purely about readability and team convention.
      </p>

      <h2>Working with files</h2>
      <p>
        The formatter accepts pasted text, but it can also open a .json or .txt file directly. The
        file is read into the text area by your browser, processed locally, and the result can be
        downloaded again. Nothing is uploaded at any point — the file picker is a browser feature,
        not a network request. For large files, the browser may take a second to parse and render
        the formatted output; that work happens on your machine, not on a server queue.
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
