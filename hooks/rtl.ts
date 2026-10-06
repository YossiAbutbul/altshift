// Right-to-left display for Hebrew chat messages. The surface already picks each
// line's direction from its first strong letter; a right-to-left mark at the start
// of a mostly Hebrew line makes that pick right-to-left even when the line opens
// with an English word, and inline code and English sentences keep their own order.

const RLM = '‏'
const RLI = '⁧'
const LRI = '⁦'
const PDI = '⁩'

const HEBREW = /[א-ת]/g
const LATIN = /[a-zA-Z]/g

// Markdown that opens a line (heading, quote, list item) stays before the mark.
const LEAD = /^(\s*(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)*)(.*)$/

// A code span as markdown reads one: a run of backticks, then the text up to a run of
// exactly as many, neither run touching another backtick.
const INLINE_CODE = /(?<!`)(`+)(?!`)(.+?)(?<!`)\1(?!`)/g

// An English run inside a Hebrew line: words (a call's parentheses included) apart by
// spaces or commas, then any closing punctuation. It reads left to right when it is
// a sentence (three words or more, its punctuation its own) or looks like code
// (`this()`, `file.ts`, `a_b`), whose closing punctuation stays the Hebrew line's.
// A short plain term ("Claude Code") stays part of the Hebrew sentence.
const WORD = String.raw`[A-Za-z_$](?:[A-Za-z0-9_$'’\-/]|\.(?=[A-Za-z0-9]))*(?:\([^()\u05D0-\u05EA]*\)|\[[^\]\u05D0-\u05EA]*\])?`
const ENGLISH_RUN = new RegExp(`(${WORD}(?:[ ,]+${WORD})*)([.!?:;]*)`, 'g')

const isCodeLike = (run: string) => /[()[\]_$/]|[A-Za-z0-9]\.[A-Za-z]/.test(run)

const isolateRun = (_: string, run: string, closing: string) => {
  const words = run.split(/[ ,]+/).length
  if (words >= 3) return ltr(run + closing)
  if (isCodeLike(run)) return ltr(run) + closing
  return run + closing
}

export const hasHebrew = (text: string) => /[א-ת]/.test(text)

// A Hebrew line: it opens with a Hebrew letter, or most of its letters are Hebrew.
const isHebrewLine = (text: string) =>
  /^[^a-zA-Zא-ת]*[א-ת]/.test(text) ||
  (text.match(HEBREW) ?? []).length >= (text.match(LATIN) ?? []).length

const ltr = (part: string) => `${LRI}${part}${PDI}`

// Inline code and English sentences read left to right inside the Hebrew line.
const isolateLtr = (body: string) => {
  let out = ''
  let last = 0
  for (const match of body.matchAll(INLINE_CODE)) {
    out += body.slice(last, match.index).replace(ENGLISH_RUN, isolateRun) + ltr(match[0])
    last = match.index + match[0].length
  }
  return out + body.slice(last).replace(ENGLISH_RUN, isolateRun)
}

// How a Hebrew line is made right-to-left. `mark`: a right-to-left mark first, for a
// surface that picks each line's direction from its first strong letter (the replies'
// markdown). `isolate`: the line wrapped whole, for one drawn left to right whatever
// it holds (the person's own message), so at least its order reads right.
export type RtlMode = 'mark' | 'isolate'

export const toRtl = (text: string, mode: RtlMode = 'mark') => {
  let isCode = false

  return text
    .split('\n')
    .map(line => {
      if (/^\s*(```|~~~)/.test(line)) {
        isCode = !isCode
        return line
      }
      if (isCode || /^\s*\|/.test(line) || !hasHebrew(line) || !isHebrewLine(line) || line.includes(RLM) || line.includes(RLI)) {
        return line
      }
      const [, lead = '', body = ''] = LEAD.exec(line) ?? []
      const ordered = isolateLtr(body)
      return mode === 'mark' ? `${lead}${RLM}${ordered}` : `${lead}${RLI}${ordered}${PDI}`
    })
    .join('\n')
}
