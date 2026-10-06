import { describe, expect, test } from 'claude-code/testing'

import { smartFix, toEnglish, toHebrew } from '../hooks/convert'

describe('forced conversion', () => {
  test('both ways', async () => {
    expect(toHebrew('akuo')).toBe('שלום')
    expect(toEnglish('יקךךם')).toBe('hello')
  })
})

describe('smart fix', () => {
  test('a whole sentence typed on the wrong layout', async () => {
    expect(smartFix('ןד איקרק םאיקר פךשבקד ן בשמ פוא איןד?')).toBe('is there other places i can put this?')
    expect(smartFix('akuo nv nmc')).toBe('שלום מה מצב')
  })

  test('gibberish that is also a real word follows its neighbours', async () => {
    // "to" is אם, "do" is גם
    expect(smartFix('nv to tbh')).toBe('מה אם אני')
    expect(smartFix('tbh do rtv')).toBe('אני גם ראה')
  })

  test('real words stay, only the wrong ones flip', async () => {
    expect(smartFix('תקן את יקךךם')).toBe('תקן את hello')
    expect(smartFix('fix the bug nv nmc')).toBe('fix the bug מה מצב')
    expect(smartFix('i want to go')).toBe('i want to go')
  })

  test('code is left alone', async () => {
    expect(smartFix('run npm test in src/app.ts')).toBe('run npm test in src/app.ts')
    // The README's preview example.
    expect(smartFix('fix the bug in src/app.ts nv nmc')).toBe('fix the bug in src/app.ts מה מצב')
  })

  test('correct text is unchanged', async () => {
    expect(smartFix('שלום, מה שלומך?')).toBe('שלום, מה שלומך?')
    expect(smartFix('please fix the build')).toBe('please fix the build')
  })
})
