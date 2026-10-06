import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { smartFix, toEnglish, toHebrew } from './convert'
import { hasHebrew, toRtl } from './rtl'

const isRtl = atom({ plugin: 'altshift', key: 'isRtl' } as const, false)
const RTL_STORE_KEY = 'isRtl'

// Short notices clear quickly; a failure stays the default 4s.
const NOTICE_MS = 1500

// Icons: a rounded 1.75px stroke in the app's icon gray, 16px.
const ICON_SIZE = 16
const icon = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">` +
  `<g fill="none" stroke="#8e8d89" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">` +
  `${paths}</g></svg>`
// Two opposed arrows.
const VERSION = '1.1.3'
const REPO = 'https://github.com/YossiAbutbul/altshift'

const SWAP_ICON = icon('<path d="M2.5 5.5h10M10 3l2.5 2.5L10 8"/><path d="M13.5 10.5h-10M6 8l-2.5 2.5L6 13"/>')

const write = async ($: EngineInterface, convert: (text: string) => string) => {
  const { text } = await $.prompt.read()
  if (!text) {
    $.ui.toast('Prompt box is empty', { timeoutMs: NOTICE_MS })
    return
  }
  const converted = convert(text)
  if (converted === text) {
    $.ui.toast('Nothing looked like the wrong layout', { timeoutMs: NOTICE_MS })
    return
  }
  const filled = await $.prompt.fill({ text: converted, mode: 'replace' })
  if (!filled.isFilled) {
    $.ui.toast(`Could not write the prompt box${filled.refusal ? ` (${filled.refusal})` : ''}`)
  }
}

// The whole text to the other layout, no guessing: more Hebrew letters turn into
// English, otherwise into Hebrew. The fallback for when Fix guesses wrong.
const swapAll = (text: string) => {
  const hebrew = (text.match(/[א-ת]/g) ?? []).length
  const latin = (text.match(/[a-zA-Z]/g) ?? []).length
  return hebrew > latin ? toEnglish(text) : toHebrew(text)
}

const setRtl = async ($: EngineInterface, value: boolean) => {
  await update($, isRtl, () => value)
  await $.store.set(RTL_STORE_KEY, value)
}

export const register: Register = on => {
  // The RTL choice is kept across sessions.
  on('session.start', async ($, e, next) => {
    const saved = (await $.store.get(RTL_STORE_KEY)) === true
    await update($, isRtl, () => saved)
    const started = await next(e)
    // A new chat draws the area above the prompt before the plugin is up, and nothing redraws
    // it until the first reply: ask for the band now, and once more when the window has settled.
    $.ui.invalidate('ui.render')
    void $.clock.sleep(1000).then(() => $.ui.invalidate('ui.render'))

    return started
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const rtl = await read($, isRtl)
    if (e.surface !== 'terminal' && e.surface !== 'desktop') {
      return next(e)
    }
    const { Box, Button, Link, Text } = $.ui.resolve(e)
    const Svg = e.surface === 'desktop' ? $.ui.resolve(e).Svg : undefined

    // An icon control: the SVG sets its size and a blank Button (braille blanks keep their
    // width) lies over it in an absolute Box, so it takes the click and its hover highlight
    // frames the icon; an image on top would swallow the click. The terminal gets a glyph.
    const iconButton = (key: string, source: string, alt: string, glyph: string, onPress: () => void) =>
      Svg ? (
        <Box key={`${key}-area`} alignItems="center" justifyContent="center" paddingX={1}>
          <Svg source={source} alt={alt} width={ICON_SIZE} height={ICON_SIZE} />
          <Box position="absolute" top={0} bottom={0} left={0} right={0} alignItems="center" justifyContent="center">
            <Button key={key} label={'⠀⠀'} plain onPress={onPress} />
          </Box>
        </Box>
      ) : (
        <Button key={key} label={glyph} dimColor onPress={onPress} />
      )

    return (
      // Layout fixes on the left, the chat's RTL toggle on the right.
      <Box width="100%" justifyContent="space-between" alignItems="center">
        <Box gap={1} alignItems="center">
          {/* Hovering the keyboard opens a small card with a link to the plugin's repo and its
              version, lifted a row and shifted left of the glyph. */}
          <Box key="about-area" alignItems="center">
            <Text dimColor>⌨</Text>
            {Svg && (
              <Box position="absolute" top={-1} left={-4} width={17} paddingX={1} gap={1} alignItems="center" display="none" hover={{ display: 'flex' }}>
                <Link href={REPO}>altshift</Link>
                <Text dimColor>{`v${VERSION}`}</Text>
              </Box>
            )}
          </Box>
          <Button key="fix" variant="primary" label="Fix" onPress={() => write($, smartFix)} />
          {iconButton('swap', SWAP_ICON, 'Swap the whole text to the other layout', '⇄', () => write($, swapAll))}
        </Box>
        {/* Filled like Fix when on, dim when off. */}
        <Button
          key="rtl"
          label="RTL"
          variant={rtl ? 'primary' : 'secondary'}
          dimColor={!rtl}
          onPress={() => setRtl($, !rtl)}
        />
      </Box>
    )
  })

  // Only the drawn text changes; the surface draws the message as always.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (!(await read($, isRtl)) || !hasHebrew(e.props.text)) {
      return next(e)
    }

    return next({ ...e, props: { ...e.props, text: toRtl(e.props.text, 'isolate') } })
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (!(await read($, isRtl)) || !hasHebrew(e.props.text)) {
      return next(e)
    }

    return next({ ...e, props: { ...e.props, text: toRtl(e.props.text) } })
  })
}
