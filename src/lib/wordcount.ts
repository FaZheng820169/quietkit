// Word, character, sentence and paragraph counting that runs entirely locally.
// Word and sentence splitting uses Intl.Segmenter so CJK text, contractions and
// emoji are counted the way a human reader would — no naive space-splitting.

export interface KeywordStat {
  word: string
  count: number
}

export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  avgWordsPerSentence: number
  readingTimeSec: number
  speakingTimeSec: number
  longestWord: string
  keywords: KeywordStat[]
}

// Conventional speeds: silent reading of English prose, and a steady
// presentation pace for speaking aloud.
export const READING_WPM = 200
export const SPEAKING_WPM = 130

// A small English stopword list — just enough to keep the keyword panel useful.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to', 'in',
  'on', 'for', 'with', 'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'it', 'its', 'this', 'that', 'these', 'those', 'not',
  'no', 'so', 'you', 'your', 'yours', 'we', 'our', 'ours', 'i', 'me', 'my',
  'they', 'them', 'their', 'theirs', 'he', 'him', 'his', 'she', 'her', 'hers',
  'us', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'can',
  'could', 'shall', 'should', 'may', 'might', 'must', 'than', 'too', 'very',
  'just', 'about', 'into', 'over', 'under', 'again', 'there', 'here', 'when',
  'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'because', 'until',
  'while', 'during', 'before', 'after', 'above', 'below', 'between', 'through',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'also', 'one', 'two', 'get', 'got',
])

const wordSegmenter = new Intl.Segmenter('en', { granularity: 'word' })
const sentenceSegmenter = new Intl.Segmenter('en', { granularity: 'sentence' })

const KEYWORD_MAX = 6
const KEYWORD_MIN_LEN = 3

export function analyzeText(text: string): TextStats {
  const characters = [...text].length
  const charactersNoSpaces = [...text.replace(/\s/g, '')].length

  if (text.trim() === '') {
    return {
      characters,
      charactersNoSpaces,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: text === '' ? 0 : text.split('\n').length,
      avgWordsPerSentence: 0,
      readingTimeSec: 0,
      speakingTimeSec: 0,
      longestWord: '',
      keywords: [],
    }
  }

  let words = 0
  let longestWord = ''
  const freq = new Map<string, number>()
  for (const seg of wordSegmenter.segment(text)) {
    if (!seg.isWordLike) continue
    words++
    const w = seg.segment
    if ([...w].length > [...longestWord].length) longestWord = w
    const key = w.toLowerCase()
    if (
      [...key].length >= KEYWORD_MIN_LEN &&
      /^[\p{L}]/u.test(key) &&
      !STOPWORDS.has(key)
    ) {
      freq.set(key, (freq.get(key) ?? 0) + 1)
    }
  }

  let sentences = 0
  for (const seg of sentenceSegmenter.segment(text)) {
    if (seg.segment.trim() !== '') sentences++
  }

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== '').length
  const lines = text.split('\n').length

  const keywords = [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, KEYWORD_MAX)

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    avgWordsPerSentence: sentences > 0 ? words / sentences : 0,
    readingTimeSec: Math.round((words / READING_WPM) * 60),
    speakingTimeSec: Math.round((words / SPEAKING_WPM) * 60),
    longestWord,
    keywords,
  }
}

// 45 -> "45 sec", 150 -> "2 min 30 sec", 600 -> "10 min"
export function formatDuration(totalSec: number): string {
  if (totalSec < 60) return `${totalSec} sec`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return sec === 0 ? `${min} min` : `${min} min ${sec} sec`
}
