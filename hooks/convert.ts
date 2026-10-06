import { ENGLISH, HEBREW, HEBREW_LETTER, isValidHebrew, PREFIXES, TABLE } from './layouts'

const TO_ENGLISH = Object.fromEntries(Object.entries(TABLE).map(([en, he]) => [he, en]))

// Uppercase Latin stays: Shift on the Hebrew layout types the Latin capital itself.
const mapText = (text: string, table: Record<string, string>) =>
  Array.from(text, ch => table[ch] ?? ch).join('')

export const toHebrew = (text: string) => mapText(text, TABLE)
export const toEnglish = (text: string) => mapText(text, TO_ENGLISH)

const isHebrewWord = (word: string) => {
  const bare = word.replace(/[^א-ת]/g, '')
  if (HEBREW.has(bare)) return true
  for (let cut = 1; cut <= 2 && cut < bare.length; cut++) {
    if (![...bare.slice(0, cut)].every(ch => PREFIXES.includes(ch))) break
    if (HEBREW.has(bare.slice(cut))) return true
  }
  return false
}

const isEnglishWord = (word: string) => ENGLISH.has(word.replace(/[^a-zA-Z']/g, '').toLowerCase())

// Could pass for English: has a vowel and no layout punctuation between letters.
const looksEnglish = (word: string) => /[aeiouy]/i.test(word) && !/[a-z][;',./][a-z]/i.test(word)

// Code, paths, numbers, camelCase: never touched.
const isCodeLike = (word: string) => /[0-9@\\_=<>{}$#*|~:]|[a-z][A-Z]|\w\/\w/.test(word)

type Verdict = 'wrong' | 'real' | 'unsure'
type Side = 'latin' | 'hebrew'
type Token = { index: number; side: Side; verdict: Verdict }

const judgeLatin = (word: string): Verdict | undefined => {
  // A capital is typed the same on both layouts: a name or an acronym.
  if (/[A-Z]/.test(word)) return undefined
  const hebrew = toHebrew(word)
  if (!isValidHebrew(hebrew)) return isEnglishWord(word) ? 'real' : undefined
  const isEnglish = isEnglishWord(word)
  const isHebrew = isHebrewWord(hebrew)
  // "to" is English and also אם typed on the wrong layout: its neighbours decide.
  if (isEnglish && isHebrew) return 'unsure'
  if (isEnglish) return 'real'
  if (isHebrew) return 'wrong'
  const letters = word.replace(/[^a-z]/g, '')
  if (letters.length >= 2 && !/[aeiouy]/.test(letters)) return 'wrong'
  if (/[a-z][;',.]+[a-z]/.test(word)) return 'wrong'
  return 'unsure'
}

const judgeHebrew = (word: string): Verdict | undefined => {
  const english = toEnglish(word)
  const isHebrew = isHebrewWord(word)
  const isEnglish = isEnglishWord(english)
  if (isHebrew && isEnglish) return 'unsure'
  if (isHebrew) return 'real'
  if (!isValidHebrew(word) || isEnglish) return 'wrong'
  return looksEnglish(english) ? 'unsure' : undefined
}

// An unsure word takes the verdict of its nearest sure neighbour on the same side;
// when the two nearest disagree at the same distance, it stays.
const resolve = (tokens: Token[], at: number): boolean => {
  const self = tokens[at]!
  const find = (step: number) => {
    for (let i = at + step, distance = 1; i >= 0 && i < tokens.length; i += step, distance++) {
      const other = tokens[i]!
      if (other.side === self.side && other.verdict !== 'unsure') return { verdict: other.verdict, distance }
    }
    return undefined
  }
  const left = find(-1)
  const right = find(1)
  if (!left && !right) return false
  if (!left || !right) return (left ?? right)!.verdict === 'wrong'
  if (left.verdict === right.verdict) return left.verdict === 'wrong'
  if (left.distance === right.distance) return false
  return (left.distance < right.distance ? left : right).verdict === 'wrong'
}

// Converts only the words that look typed on the wrong layout, leaving real words alone.
export const smartFix = (text: string) => {
  const parts = text.split(/(\s+)/)
  const tokens: Token[] = []

  parts.forEach((word, index) => {
    if (!word.trim() || isCodeLike(word)) return
    const hasLatin = /[a-zA-Z]/.test(word)
    const hasHebrew = HEBREW_LETTER.test(word)
    if (hasLatin === hasHebrew) return
    const side: Side = hasLatin ? 'latin' : 'hebrew'
    const verdict = hasLatin ? judgeLatin(word) : judgeHebrew(word)
    if (verdict) tokens.push({ index, side, verdict })
  })

  const out = [...parts]
  tokens.forEach((token, at) => {
    const isWrong = token.verdict === 'wrong' || (token.verdict === 'unsure' && resolve(tokens, at))
    if (!isWrong) return
    const word = parts[token.index] ?? ''
    out[token.index] = token.side === 'latin' ? toHebrew(word) : toEnglish(word)
  })

  return out.join('')
}
