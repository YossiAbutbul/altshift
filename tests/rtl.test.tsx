import { describe, expect, mock, test } from 'claude-code/testing'

import { toRtl } from '../hooks/rtl'

const RLM = '\u200F'
const LRI = '\u2066'
const PDI = '\u2069'

describe('toRtl', () => {
  test('marks Hebrew lines right-to-left, markdown markers first', async () => {
    expect(toRtl('שלום עולם')).toBe(`${RLM}שלום עולם`)
    expect(toRtl('- פריט ראשון')).toBe(`- ${RLM}פריט ראשון`)
    expect(toRtl('## כותרת')).toBe(`## ${RLM}כותרת`)
    expect(toRtl('Claude Code הוא כלי מצוין')).toBe(`${RLM}Claude Code הוא כלי מצוין`)
  })

  test('leaves English, mostly English lines, code and tables alone', async () => {
    expect(toRtl('hello world')).toBe('hello world')
    expect(toRtl('run the tests in תיקייה please')).toBe('run the tests in תיקייה please')
    expect(toRtl('```\nשלום\n```')).toBe('```\nשלום\n```')
    expect(toRtl('| א | ב |')).toBe('| א | ב |')
  })

  test('inline code reads left to right', async () => {
    expect(toRtl('הפונקציה `smartFix()` מתקנת')).toBe(`${RLM}הפונקציה ${LRI}\`smartFix()\`${PDI} מתקנת`)
  })

  test('an English sentence keeps its own punctuation, a short term does not', async () => {
    expect(toRtl('שורה באנגלית בלבד: This line is English.')).toBe(
      `${RLM}שורה באנגלית בלבד: ${LRI}This line is English.${PDI}`,
    )
    expect(toRtl('רץ בתוך Claude Code.')).toBe(`${RLM}רץ בתוך Claude Code.`)
    expect(toRtl('הכפתור (RTL) נמצא כאן.')).toBe(`${RLM}הכפתור (RTL) נמצא כאן.`)
  })

  test('code spans of several backticks stay whole', async () => {
    const line = 'מוסיפה ```` ``` ```` בהתחלה'
    expect(toRtl(line)).toBe(`${RLM}מוסיפה ${LRI}\`\`\`\` \`\`\` \`\`\`\`${PDI} בהתחלה`)
  })

  test('the own lines of the person are wrapped whole', async () => {
    expect(toRtl('שלום עולם', 'isolate')).toBe(`⁧שלום עולם${PDI}`)
  })

  test('code-like English keeps its order even when short', async () => {
    expect(toRtl('לשלוח הודעה when this() לא נכון')).toBe(`${RLM}לשלוח הודעה ${LRI}when this()${PDI} לא נכון`)
    expect(toRtl('תפתח את file.ts.')).toBe(`${RLM}תפתח את ${LRI}file.ts${PDI}.`)
    expect(toRtl('קורא ל-get_user')).toBe(`${RLM}קורא ל-${LRI}get_user${PDI}`)
  })
})

describe('chat drawing', () => {
  for (const surface of ['terminal', 'desktop'] as const) {
    test(`RTL toggles Hebrew replies on ${surface}`, async ($, on) => {
      mock.store(on)
      // Stands for the surface's own drawing of a reply: its text as given.
      on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
        const { Text } = $.ui.resolve(e)
        return <Text>{e.props.text}</Text>
      })
      const band = await $.ui.mount({
        plugin: 'altshift',
        surface,
        component: 'AbovePrompt',
        props: {
          hasSurvey: false,
          isWorking: false,
          maxRows: 10,
          bodyColumns: 80,
          scroll: { offset: 0, bodyRows: 10 },
          view: {},
        },
      })
      expect(await band.find({ key: 'rtl' })).toMatchObject({ props: { variant: 'secondary' } })
      await band.press({ key: 'rtl' })
      expect(await band.find({ key: 'rtl' })).toMatchObject({ props: { variant: 'primary' } })

      const reply = await $.ui.mount({
        plugin: 'altshift',
        surface,
        component: 'AssistantMessage',
        props: { text: 'זה עובד, תודה!', isFirstOfReply: true },
      })
      expect((await reply.find({ type: 'Text' }))?.text).toBe(`${RLM}זה עובד, תודה!`)
      await band.unmount()
      await reply.unmount()
    })
  }
})

describe('swap icon', () => {
  test('the desktop draws the swap control as an SVG icon', async ($, on) => {
    mock.store(on)
    const band = await $.ui.mount({
      plugin: 'altshift',
      surface: 'desktop',
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 10,
        bodyColumns: 80,
        scroll: { offset: 0, bodyRows: 10 },
        view: {},
      },
    })
    expect(await band.find({ type: 'Svg' })).toBeDefined()
    await band.unmount()
  })
})

describe('about card', () => {
  test('hovering the keyboard reveals the icon and version, desktop only', async ($, on) => {
    mock.store(on)
    const props = {
      hasSurvey: false,
      isWorking: false,
      maxRows: 10,
      bodyColumns: 80,
      scroll: { offset: 0, bodyRows: 10 },
      view: {},
    }
    const desktop = await $.ui.mount({ plugin: 'altshift', surface: 'desktop', component: 'AbovePrompt', props })
    const drawn = JSON.stringify(await desktop.drawn())
    expect(drawn).toContain('"display":"none"},"hover":{"display":"flex"}')
    expect(drawn).toContain('v1.1.1')
    expect(await desktop.find({ type: 'Link' })).toMatchObject({ props: { href: 'https://github.com/YossiAbutbul/altshift' } })
    expect(await desktop.find({ type: 'Svg' })).toBeDefined()
    await desktop.unmount()

    const terminal = await $.ui.mount({ plugin: 'altshift', surface: 'terminal', component: 'AbovePrompt', props })
    expect(JSON.stringify(await terminal.drawn())).not.toContain('v1.1.1')
    await terminal.unmount()
  })
})
