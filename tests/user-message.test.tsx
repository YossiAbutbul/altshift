import { expect, mock, test } from 'claude-code/testing'

const RLI = '\u2067'

for (const surface of ['terminal', 'desktop'] as const) {
  test(`RTL reaches the person's own messages on ${surface}`, async ($, on) => {
    mock.store(on)
    let seen = ''
    // Stands for the surface's own drawing of the row: records the text it is handed.
    on('ui.render', { component: 'UserMessage' }, ($, e) => {
      seen = e.props.text
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
    await band.press({ key: 'rtl' })
    await band.unmount()
    const row = await $.ui.mount({
      plugin: 'altshift',
      surface,
      component: 'UserMessage',
      props: { text: 'שלום when this() עובד', origin: { kind: 'composer' }, isExpanded: true } as never,
    })
    expect(seen.startsWith(RLI)).toBe(true)
    await row.unmount()
  })
}
