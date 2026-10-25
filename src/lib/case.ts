// Text case conversion that runs entirely locally. Word splitting understands
// camelCase, PascalCase, snake_case, kebab-case, acronyms and digits, so mixed
// input like "HTTPS connection_status" converts cleanly to any target style.

export type CaseKind =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'

export interface CaseFormat {
  kind: CaseKind
  label: string
  example: string
  blurb: string
}

export const CASE_FORMATS: CaseFormat[] = [
  {
    kind: 'upper',
    label: 'UPPERCASE',
    example: 'HELLO WORLD',
    blurb: 'Headings, acronyms and shouty emphasis.',
  },
  {
    kind: 'lower',
    label: 'lowercase',
    example: 'hello world',
    blurb: 'Normalising input and quiet, even text.',
  },
  {
    kind: 'title',
    label: 'Title Case',
    example: 'The Quick Brown Fox',
    blurb: 'Headline style: major words up, small words down.',
  },
  {
    kind: 'sentence',
    label: 'Sentence case',
    example: 'The quick brown fox.',
    blurb: 'First letter of each sentence, and the pronoun I.',
  },
  {
    kind: 'camel',
    label: 'camelCase',
    example: 'theQuickBrownFox',
    blurb: 'JavaScript variables, JSON keys, Java fields.',
  },
  {
    kind: 'pascal',
    label: 'PascalCase',
    example: 'TheQuickBrownFox',
    blurb: 'Classes, React components, C# conventions.',
  },
  {
    kind: 'snake',
    label: 'snake_case',
    example: 'the_quick_brown_fox',
    blurb: 'Python and Ruby names, database columns.',
  },
  {
    kind: 'kebab',
    label: 'kebab-case',
    example: 'the-quick-brown-fox',
    blurb: 'URL slugs and CSS class names.',
  },
  {
    kind: 'constant',
    label: 'CONSTANT_CASE',
    example: 'THE_QUICK_BROWN_FOX',
    blurb: 'Environment variables and fixed constants.',
  },
]

// Identifier-style conversions are applied line by line, so a pasted list of
// names converts to a list of names instead of one giant identifier.
const LINE_BY_LINE: ReadonlySet<CaseKind> = new Set([
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
])

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Split any mix of naming styles into plain words.
// "HTTPS connection_status v2" -> ["HTTPS", "connection", "status", "v", "2"]
export function splitWords(text: string): string[] {
  const coarse = text.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (coarse === '') return []
  const words: string[] = []
  for (const token of coarse.split(' ')) {
    const marked = token
      // lower/digit -> upper boundary: fooBar -> foo Bar
      .replace(/([\p{Ll}\p{N}])([\p{Lu}])/gu, '$1 $2')
      // acronym -> word boundary: HTTPSConnection -> HTTPS Connection
      .replace(/([\p{Lu}])([\p{Lu}][\p{Ll}])/gu, '$1 $2')
      // letter <-> digit boundaries: version2Id -> version 2 Id
      .replace(/([\p{L}])([\p{N}])/gu, '$1 $2')
      .replace(/([\p{N}])([\p{L}])/gu, '$1 $2')
    for (const w of marked.split(' ')) {
      if (w !== '') words.push(w)
    }
  }
  return words
}

// Small words that stay lowercase in Title Case unless they are first or last.
const TITLE_MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'as', 'at', 'by', 'in', 'of', 'on', 'per', 'to', 'up', 'via',
])

const TITLE_WORD_RE = /[\p{L}\p{N}]+(?:[''’][\p{L}]+)*/gu

function titleCase(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const matches = line.match(TITLE_WORD_RE)
      if (matches === null) return line
      const last = matches.length - 1
      let idx = 0
      return line.replace(TITLE_WORD_RE, (word) => {
        const lower = word.toLowerCase()
        const i = idx
        idx++
        if (i !== 0 && i !== last && TITLE_MINOR_WORDS.has(lower)) return lower
        return capitalize(lower)
      })
    })
    .join('\n')
}

function sentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[.!?…]\s+|\n+)(\s*[\p{Ps}"'“‘«]*[\p{L}])/gu,
      (_m, boundary: string, lead: string) => boundary + lead.toUpperCase(),
    )
    .replace(/\bi\b/g, 'I')
}

function joinPerLine(text: string, join: (words: string[]) => string): string {
  return text
    .split('\n')
    .map((line) => {
      const words = splitWords(line)
      return words.length === 0 ? '' : join(words)
    })
    .join('\n')
}

export function convertCase(text: string, kind: CaseKind): string {
  switch (kind) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return titleCase(text)
    case 'sentence':
      return sentenceCase(text)
    case 'camel':
      return joinPerLine(text, (words) =>
        words
          .map((w, i) => {
            const lower = w.toLowerCase()
            return i === 0 ? lower : capitalize(lower)
          })
          .join(''),
      )
    case 'pascal':
      return joinPerLine(text, (words) =>
        words.map((w) => capitalize(w.toLowerCase())).join(''),
      )
    case 'snake':
      return joinPerLine(text, (words) =>
        words.map((w) => w.toLowerCase()).join('_'),
      )
    case 'kebab':
      return joinPerLine(text, (words) =>
        words.map((w) => w.toLowerCase()).join('-'),
      )
    case 'constant':
      return joinPerLine(text, (words) =>
        words.map((w) => w.toUpperCase()).join('_'),
      )
  }
}

export { LINE_BY_LINE }
