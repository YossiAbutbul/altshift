export type AltshiftRtl = boolean

declare module 'claude-code' {
  interface PluginState {
    'altshift': { isRtl: AltshiftRtl }
  }
}
