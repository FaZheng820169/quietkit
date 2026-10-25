// URL slug generation that runs entirely locally. Accented Latin letters are
// folded to ASCII (é -> e, ü -> u), characters NFD cannot decompose are
// transliterated (ß -> ss, æ -> ae), apostrophes join contractions
// (don't -> dont), and everything else that is not a letter or a digit
// becomes one separator. Line by line, so a list of titles becomes a list
// of slugs.

export type SlugSeparator = '-' | '_'

export interface SlugOptions {
  separator: SlugSeparator
  lowercase: boolean
  /** Strip everything outside A–Z and 0–9. When false, letters of any script survive. */
  asciiOnly: boolean
  /** Maximum length in characters; 0 means no limit. Truncation prefers word boundaries. */
  maxLength: number
}

export const DEFAULT_SLUG_OPTIONS: SlugOptions = {
  separator: '-',
  lowercase: true,
  asciiOnly: true,
  maxLength: 0,
}

// Letters that NFD normalisation cannot decompose into an ASCII base letter.
const TRANSLITERATE: Record<string, string> = {
  ß: 'ss',
  ẞ: 'SS',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'TH',
  ł: 'l',
  Ł: 'L',
  ŋ: 'n',
  Ŋ: 'N',
  ħ: 'h',
  Ħ: 'H',
  ı: 'i',
  ſ: 's',
  ĸ: 'k',
  ŧ: 't',
  Ŧ: 'T',
}

// Straight and curly apostrophes join the word they sit inside: don't -> dont.
// Covers U+0027, U+2018, U+2019, U+0060 and U+00B4.
const APOSTROPHE_RE = /['’‘`´]/gu
const NON_ASCII_ALNUM_RE = /[^A-Za-z0-9]/g

function foldToAscii(text: string): string {
  return text
    .replace(/[^ -~]/g, (ch) => TRANSLITERATE[ch] ?? ch)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

// Word splitting for slugs: digits and acronyms split the way a reader
// expects (version2Id -> version, 2, Id; HTTPSConnection -> HTTPS,
// Connection), but a capital after a single lowercase letter does not split,
// so removing the apostrophe from d'Alene yields dalene, not d-alene.
function splitSlugWords(line: string): string[] {
  const coarse = line.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (coarse === '') return []
  const words: string[] = []
  for (const token of coarse.split(' ')) {
    const marked = token
      // letter <-> digit boundaries: version2 -> version 2
      .replace(/([\p{L}])([\p{N}])/gu, '$1 $2')
      .replace(/([\p{N}])([\p{L}])/gu, '$1 $2')
      // acronym -> word boundary: HTTPSConnection -> HTTPS Connection.
      // Requires 2+ capitals before the boundary, so OBrien stays whole.
      .replace(/(?<=[\p{Lu}]{2})([\p{Lu}][\p{Ll}])/gu, ' $1')
      // camel boundary with 2+ lowercase letters: userFirst -> user First
      .replace(/([\p{Ll}][\p{Ll}])([\p{Lu}])/gu, '$1 $2')
    for (const w of marked.split(' ')) {
      if (w !== '') words.push(w)
    }
  }
  return words
}

function truncate(slug: string, maxLength: number, separator: SlugSeparator): string {
  if (maxLength <= 0) return slug
  const chars = Array.from(slug)
  if (chars.length <= maxLength) return slug
  let cut = chars.slice(0, maxLength).join('')
  // The cut is already clean when the next character would have been the
  // separator; otherwise backtrack to the last separator inside the cut.
  if (chars[maxLength] !== separator) {
    const lastSep = cut.lastIndexOf(separator)
    if (lastSep > 0) cut = cut.slice(0, lastSep)
  }
  return cut
}

export function slugifyLine(text: string, options: SlugOptions): string {
  let line = text.replace(APOSTROPHE_RE, '')
  if (options.asciiOnly) line = foldToAscii(line)
  let words = splitSlugWords(line)
  if (options.asciiOnly) {
    words = words
      .map((w) => w.replace(NON_ASCII_ALNUM_RE, ''))
      .filter((w) => w !== '')
  }
  if (options.lowercase) words = words.map((w) => w.toLowerCase())
  return truncate(words.join(options.separator), options.maxLength, options.separator)
}

// Each input line becomes one slug on the corresponding output line, so a
// pasted list of post titles converts to a matching list of slugs.
export function slugify(text: string, options: SlugOptions): string {
  return text
    .split('\n')
    .map((line) => slugifyLine(line, options))
    .join('\n')
}
