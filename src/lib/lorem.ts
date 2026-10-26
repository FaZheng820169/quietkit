// Lorem ipsum placeholder text from the standard word pool — the words of
// the scrambled Cicero passage designers have used since the 1500s. Word,
// sentence and paragraph generation are seeded per call so two panels never
// produce identical output, and generation is local and instant.

const WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )

// A small, fast PRNG (mulberry32) so generated text varies per click without
// touching Math.random in a way tests cannot reproduce.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rand: () => number): string {
  return WORDS[Math.floor(rand() * WORDS.length)]
}

export function generateWords(count: number, seed: number): string {
  const rand = mulberry32(seed)
  const words: string[] = []
  for (let i = 0; i < count; i++) words.push(pick(rand))
  return words.join(' ')
}

export function generateSentence(seed: number): string {
  const rand = mulberry32(seed)
  const len = 8 + Math.floor(rand() * 10) // 8–17 words, like real prose
  const words: string[] = []
  for (let i = 0; i < len; i++) words.push(pick(rand))
  const s = words.join(' ')
  return s.charAt(0).toUpperCase() + s.slice(1) + '.'
}

export function generateSentences(count: number, seed: number): string {
  const out: string[] = []
  for (let i = 0; i < count; i++) out.push(generateSentence(seed + i * 7919))
  return out.join(' ')
}

export function generateParagraph(seed: number): string {
  const rand = mulberry32(seed)
  const sentences = 3 + Math.floor(rand() * 3) // 3–5 sentences
  const out: string[] = []
  for (let i = 0; i < sentences; i++) {
    out.push(generateSentence(seed + i * 104729))
  }
  return out.join(' ')
}

export function generateParagraphs(count: number, seed: number): string {
  const out: string[] = []
  for (let i = 0; i < count; i++) out.push(generateParagraph(seed + i * 13007))
  return out.join('\n\n')
}

export type LoremMode = 'words' | 'sentences' | 'paragraphs'

export function generate(mode: LoremMode, count: number, seed: number): string {
  const n = Math.max(1, Math.min(mode === 'words' ? 5000 : 500, Math.floor(count)))
  switch (mode) {
    case 'words':
      return generateWords(n, seed)
    case 'sentences':
      return generateSentences(n, seed)
    case 'paragraphs':
      return generateParagraphs(n, seed)
  }
}

// The traditional opening, used when "start with lorem ipsum" is on.
export const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
