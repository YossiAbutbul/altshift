# Changelog

All notable changes to altshift. Versions follow [semantic versioning](https://semver.org): the version in `.claude-plugin/plugin.json` is the one installed. Each version is tagged in git (`v1.0.0` and so on), and pushing a tag publishes its [GitHub Release](https://github.com/YossiAbutbul/altshift/releases) with that version's section below as its notes.

## [1.1.4] - 2026-10-07

### Fixed

- The band no longer replaces what else is drawn above the prompt (the desktop app's own bar, other plugins' bands): it draws on top of it, as a well-behaved neighbour.

## [1.1.3] - 2026-10-06

### Changed

- The about card sits further to the left.

## [1.1.2] - 2026-10-06

### Changed

- The about card shows just the linked name and the version, without the icon.

## [1.1.1] - 2026-10-06

### Changed

- The about card's name links to this repo, and the card sits a row higher and a little to the left.

### Fixed

- The band shows in a new chat right away, instead of only after the first message.

## [1.1.0] - 2026-10-06

### Added

- Desktop app: hovering the keyboard icon at the start of the band shows a small card with the plugin's icon and version.

## [1.0.0] - 2026-10-06

First release.

### Added

- **Fix:** converts only the words typed on the wrong layout (English ⇄ Hebrew), leaving real words, names and code alone. Mistyped words that happen to be real words (`to` for `אם`) follow their neighbours.
- **Swap:** converts the whole prompt to the other layout, no guessing.
- **RTL:** shows Hebrew lines in the chat right-to-left, for Claude's replies and your own messages. Inline code, code-like terms (`this()`, `file.ts`) and English sentences keep their left-to-right order. The choice is remembered across sessions.
- Desktop app: native buttons and an SVG swap icon. Terminal: text buttons.

[1.1.4]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.1.4
[1.1.3]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.1.3
[1.1.2]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.1.2
[1.1.1]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.1.1
[1.1.0]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.1.0
[1.0.0]: https://github.com/YossiAbutbul/altshift/releases/tag/v1.0.0
