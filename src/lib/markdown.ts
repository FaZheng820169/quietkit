// Minimal, safe Markdown renderer. Raw HTML in the source is escaped before any
// transformation, so rendered output can never inject markup or scripts.

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(https?:|mailto:|#|\/)/i.test(trimmed)) return trimmed
  return '#'
}

// Inline rendering: code spans are extracted into placeholders first so their
// contents are never styled as bold/italic/links.
function renderInline(text: string): string {
  const codes: string[] = []
  let out = text.replace(/`([^`]+)`/g, (_m, code: string) => {
    codes.push(code)
    return `\u0000${codes.length - 1}\u0000`
  })
  out = out
    .replace(
      /!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_m, alt: string, url: string) => `<img alt="${alt}" src="${sanitizeUrl(url)}" loading="lazy">`,
    )
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_m, label: string, url: string) =>
        `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`,
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(?<![\w*])\*([^*\n]+)\*(?![\w*])/g, '<em>$1</em>')
    .replace(/(?<![\w_])_([^_\n]+)_(?![\w_])/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
  // oxlint-disable-next-line no-control-regex -- NUL is our internal code-span placeholder, never present in input
  out = out.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => `<code>${codes[Number(i)]}</code>`)
  return out
}

function splitTableRow(line: string): string[] {
  let row = line.trim()
  if (row.startsWith('|')) row = row.slice(1)
  if (row.endsWith('|')) row = row.slice(0, -1)
  return row.split('|').map((cell) => cell.trim())
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell))
}

function isBlockStart(lines: string[], i: number): boolean {
  const line = lines[i]
  if (/^```/.test(line)) return true
  if (/^#{1,6}\s+/.test(line)) return true
  if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return true
  if (/^&gt;\s?/.test(line)) return true
  if (/^\s*[-*+]\s+/.test(line)) return true
  if (/^\s*\d+[.)]\s+/.test(line)) return true
  if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) return true
  return false
}

export function renderMarkdown(source: string): string {
  const escaped = escapeHtml(source.replace(/\r\n?/g, '\n'))
  const lines = escaped.split('\n')
  const html: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    // Fenced code block.
    if (/^```/.test(line)) {
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++ // skip closing fence (or run off the end)
      html.push(`<pre><code>${buf.join('\n')}</code></pre>`)
      continue
    }

    // Heading.
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      html.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`)
      i++
      continue
    }

    // Horizontal rule.
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      html.push('<hr>')
      i++
      continue
    }

    // Blockquote (the source is escaped, so ">" arrives as "&gt;").
    if (/^&gt;\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^&gt;\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^&gt;\s?/, ''))
        i++
      }
      html.push(`<blockquote><p>${renderInline(buf.join('\n')).replace(/\n/g, '<br>')}</p></blockquote>`)
      continue
    }

    // Table: header row followed by a separator row.
    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line)
      const aligns = splitTableRow(lines[i + 1]).map((cell) =>
        cell.startsWith(':') && cell.endsWith(':')
          ? 'center'
          : cell.endsWith(':')
            ? 'right'
            : cell.startsWith(':')
              ? 'left'
              : '',
      )
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitTableRow(lines[i]))
        i++
      }
      const alignAttr = (n: number) => (aligns[n] ? ` style="text-align:${aligns[n]}"` : '')
      const thead = `<thead><tr>${headers.map((h, n) => `<th${alignAttr(n)}>${renderInline(h)}</th>`).join('')}</tr></thead>`
      const tbody = `<tbody>${rows
        .map(
          (row) =>
            `<tr>${headers.map((_, n) => `<td${alignAttr(n)}>${renderInline(row[n] ?? '')}</td>`).join('')}</tr>`,
        )
        .join('')}</tbody>`
      html.push(`<table>${thead}${tbody}</table>`)
      continue
    }

    // Unordered list.
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`)
      continue
    }

    // Ordered list.
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''))
        i++
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ol>`)
      continue
    }

    // Paragraph: consume until a blank line or another block start.
    const buf: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines, i)) {
      buf.push(lines[i])
      i++
    }
    html.push(`<p>${renderInline(buf.join('\n')).replace(/\n/g, '<br>')}</p>`)
  }

  return html.join('\n')
}

// Wrap rendered Markdown in a standalone HTML document for download.
export function markdownToHtmlDocument(source: string, title: string): string {
  const body = renderMarkdown(source)
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1a1a1a; }
pre { background: #f4f4f4; padding: 14px; border-radius: 8px; overflow-x: auto; }
code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.92em; }
p code, li code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
blockquote { border-left: 3px solid #ddd; margin-left: 0; padding-left: 16px; color: #555; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
img { max-width: 100%; }
</style>
</head>
<body>
${body}
</body>
</html>
`
}

export function countWords(source: string): number {
  const words = source.trim().match(/\S+/g)
  return words ? words.length : 0
}
