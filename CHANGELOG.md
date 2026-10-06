# Changelog

All notable changes to altshift. Versions follow [semantic versioning](https://semver.org): the version in `.claude-plugin/plugin.json` is the one installed. Each version is tagged in git (`v1.0.0` and so on), and pushing a tag publishes its [GitHub Release](https://github.com/YossiAbutbul/altshift/releases) with that version's section below as its notes.

## [1.0.0] - 2026-10-06

First release.

### Added

- **Fix:** converts only the words typed on the wrong layout (English ⇄ Hebrew), leaving real words, names and code alone. Mistyped words that happen to be real words (`to` for `אם`) follow their neighbours.
- **Swap:** converts the whole prompt to the other layout, no guessing.
- **RTL:** shows Hebrew lines in the chat right-to-left, for Claude's replies and your own messages. Inline code, code-like terms (`this()`, `file.ts`) and English sentences keep their left-to-right order. The choice is remembered across sessions.
- Desktop app: native buttons and an SVG swap icon. Terminal: text buttons.

[1.0.0]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.0.0
