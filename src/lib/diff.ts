// Line-based text diff built on the Myers O(ND) algorithm. Everything runs in
// memory — the two texts never leave the tab.

export interface DiffOp {
  type: 'keep' | 'ins' | 'del'
  line: string
  aIndex?: number // 0-based line index in the original text (keep/del)
  bIndex?: number // 0-based line index in the revised text (keep/ins)
}

export interface DiffOptions {
  ignoreWhitespace?: boolean
  ignoreCase?: boolean
}

// Myers needs O(D * (N + M)) memory for the backtrack trace. Beyond this size
// the trimmed middle is emitted as a plain remove/add block instead.
const MAX_MIDDLE = 6000

function myers(ka: string[], kb: string[]): DiffOp[] {
  const n = ka.length
  const m = kb.length
  const max = n + m
  if (max === 0) return []
  const offset = max
  const v = new Int32Array(2 * max + 1)
  const trace: Int32Array[] = []

  let done = false
  for (let d = 0; d <= max && !done; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      let x: number
      if (k === -d || (k !== d && v[k - 1 + offset] < v[k + 1 + offset])) {
        x = v[k + 1 + offset] // down: insertion
      } else {
        x = v[k - 1 + offset] + 1 // right: deletion
      }
      let y = x - k
      while (x < n && y < m && ka[x] === kb[y]) {
        x++
        y++
      }
      v[k + offset] = x
      if (x >= n && y >= m) {
        done = true
        break
      }
    }
  }

  // Backtrack through the trace to emit the edit script.
  const ops: DiffOp[] = []
  let x = n
  let y = m
  for (let d = trace.length - 1; d >= 0; d--) {
    const vv = trace[d]
    const k = x - y
    let prevK: number
    if (k === -d || (k !== d && vv[k - 1 + offset] < vv[k + 1 + offset])) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }
    const prevX = vv[prevK + offset]
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      ops.push({ type: 'keep', line: ka[x - 1], aIndex: x - 1, bIndex: y - 1 })
      x--
      y--
    }
    if (d > 0) {
      if (x === prevX) {
        ops.push({ type: 'ins', line: kb[y - 1], bIndex: y - 1 })
        y--
      } else {
        ops.push({ type: 'del', line: ka[x - 1], aIndex: x - 1 })
        x--
      }
    }
  }
  return ops.reverse()
}

export function splitLines(text: string): string[] {
  const norm = text.replace(/\r\n?/g, '\n')
  if (norm === '') return []
  const lines = norm.split('\n')
  if (lines[lines.length - 1] === '') lines.pop() // trailing newline is not a line
  return lines
}

export function diffLines(a: string[], b: string[], opts: DiffOptions = {}): DiffOp[] {
  const key = (s: string): string => {
    let k = s
    if (opts.ignoreWhitespace) k = k.replace(/\s+/g, ' ').trim()
    if (opts.ignoreCase) k = k.toLowerCase()
    return k
  }
  const ka = a.map(key)
  const kb = b.map(key)

  // Trim common prefix and suffix — the common case is a small edit in a large text.
  let start = 0
  while (start < ka.length && start < kb.length && ka[start] === kb[start]) start++
  let endA = ka.length
  let endB = kb.length
  while (endA > start && endB > start && ka[endA - 1] === kb[endB - 1]) {
    endA--
    endB--
  }

  const ops: DiffOp[] = []
  for (let i = 0; i < start; i++) ops.push({ type: 'keep', line: a[i], aIndex: i, bIndex: i })

  const midA = ka.slice(start, endA)
  const midB = kb.slice(start, endB)
  if (midA.length + midB.length > MAX_MIDDLE) {
    for (let i = start; i < endA; i++) ops.push({ type: 'del', line: a[i], aIndex: i })
    for (let j = start; j < endB; j++) ops.push({ type: 'ins', line: b[j], bIndex: j })
  } else {
    for (const op of myers(midA, midB)) {
      if (op.type === 'keep') {
        const ai = start + (op.aIndex ?? 0)
        const bi = start + (op.bIndex ?? 0)
        ops.push({ type: 'keep', line: a[ai], aIndex: ai, bIndex: bi })
      } else if (op.type === 'del') {
        const ai = start + (op.aIndex ?? 0)
        ops.push({ type: 'del', line: a[ai], aIndex: ai })
      } else {
        const bi = start + (op.bIndex ?? 0)
        ops.push({ type: 'ins', line: b[bi], bIndex: bi })
      }
    }
  }

  for (let i = 0; i < ka.length - endA; i++) {
    ops.push({ type: 'keep', line: a[endA + i], aIndex: endA + i, bIndex: endB + i })
  }
  return ops
}

export function diffStats(ops: DiffOp[]): { added: number; removed: number; unchanged: number } {
  let added = 0
  let removed = 0
  let unchanged = 0
  for (const op of ops) {
    if (op.type === 'ins') added++
    else if (op.type === 'del') removed++
    else unchanged++
  }
  return { added, removed, unchanged }
}

// --- Render model with intra-line highlighting ---

export interface DiffSegment {
  text: string
  changed: boolean
}

export interface DiffRow {
  type: 'keep' | 'ins' | 'del'
  aNo?: number // 1-based line number in the original
  bNo?: number // 1-based line number in the revision
  segments: DiffSegment[]
}

function inlineSegments(a: string, b: string): [DiffSegment[], DiffSegment[]] {
  const minLen = Math.min(a.length, b.length)
  let pre = 0
  while (pre < minLen && a[pre] === b[pre]) pre++
  let suf = 0
  while (suf < minLen - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++
  const prefix = a.slice(0, pre)
  const suffix = a.slice(a.length - suf)
  const aMid = a.slice(pre, a.length - suf)
  const bMid = b.slice(pre, b.length - suf)
  const aSegs: DiffSegment[] = []
  const bSegs: DiffSegment[] = []
  if (prefix) {
    aSegs.push({ text: prefix, changed: false })
    bSegs.push({ text: prefix, changed: false })
  }
  if (aMid) aSegs.push({ text: aMid, changed: true })
  if (bMid) bSegs.push({ text: bMid, changed: true })
  if (suffix) {
    aSegs.push({ text: suffix, changed: false })
    bSegs.push({ text: suffix, changed: false })
  }
  if (aSegs.length === 0) aSegs.push({ text: a, changed: a.length > 0 })
  if (bSegs.length === 0) bSegs.push({ text: b, changed: b.length > 0 })
  return [aSegs, bSegs]
}

export function diffRows(ops: DiffOp[]): DiffRow[] {
  const rows: DiffRow[] = []
  let i = 0
  while (i < ops.length) {
    const op = ops[i]
    if (op.type === 'keep') {
      rows.push({
        type: 'keep',
        aNo: (op.aIndex ?? 0) + 1,
        bNo: (op.bIndex ?? 0) + 1,
        segments: [{ text: op.line, changed: false }],
      })
      i++
      continue
    }
    const dels: DiffOp[] = []
    while (i < ops.length && ops[i].type === 'del') {
      dels.push(ops[i])
      i++
    }
    const inss: DiffOp[] = []
    while (i < ops.length && ops[i].type === 'ins') {
      inss.push(ops[i])
      i++
    }
    // Pair removed/added lines for intra-line highlight.
    const delSegs: DiffSegment[][] = dels.map((d) => [{ text: d.line, changed: true }])
    const insSegs: DiffSegment[][] = inss.map((d) => [{ text: d.line, changed: true }])
    const pairs = Math.min(dels.length, inss.length)
    for (let p = 0; p < pairs; p++) {
      const [dSeg, iSeg] = inlineSegments(dels[p].line, inss[p].line)
      delSegs[p] = dSeg
      insSegs[p] = iSeg
    }
    dels.forEach((d, idx) =>
      rows.push({ type: 'del', aNo: (d.aIndex ?? 0) + 1, segments: delSegs[idx] }),
    )
    inss.forEach((d, idx) =>
      rows.push({ type: 'ins', bNo: (d.bIndex ?? 0) + 1, segments: insSegs[idx] }),
    )
  }
  return rows
}

// --- Unified diff export ---

export function toUnifiedDiff(ops: DiffOp[], aName = 'original.txt', bName = 'revised.txt', context = 3): string {
  const changeIdx: number[] = []
  ops.forEach((o, i) => {
    if (o.type !== 'keep') changeIdx.push(i)
  })
  if (changeIdx.length === 0) return ''

  const ranges: Array<[number, number]> = []
  let s = Math.max(0, changeIdx[0] - context)
  let e = Math.min(ops.length, changeIdx[0] + context + 1)
  for (let c = 1; c < changeIdx.length; c++) {
    const ns = Math.max(0, changeIdx[c] - context)
    const ne = Math.min(ops.length, changeIdx[c] + context + 1)
    if (ns <= e) {
      e = ne
    } else {
      ranges.push([s, e])
      s = ns
      e = ne
    }
  }
  ranges.push([s, e])

  const out: string[] = [`--- ${aName}`, `+++ ${bName}`]
  for (const [hs, he] of ranges) {
    let aStart = 0
    let bStart = 0
    for (let i = 0; i < hs; i++) {
      const o = ops[i]
      if (o.type !== 'ins') aStart++
      if (o.type !== 'del') bStart++
    }
    let aCount = 0
    let bCount = 0
    for (let i = hs; i < he; i++) {
      const o = ops[i]
      if (o.type !== 'ins') aCount++
      if (o.type !== 'del') bCount++
    }
    out.push(`@@ -${aStart + 1},${aCount} +${bStart + 1},${bCount} @@`)
    for (let i = hs; i < he; i++) {
      const o = ops[i]
      const prefix = o.type === 'keep' ? ' ' : o.type === 'del' ? '-' : '+'
      out.push(prefix + o.line)
    }
  }
  return out.join('\n') + '\n'
}
