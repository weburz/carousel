# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## v0.4.1

[compare changes](https://github.com/Weburz/carousel/compare/v0.4.0...v0.4.1)

### 🩹 Fixes

- **types:** Emit component declarations again ([#40](https://github.com/Weburz/carousel/pull/40))

### ❤️ Contributors

- Sagar Kapoor ([@sagar-kap](https://github.com/sagar-kap))

## v0.4.0

[compare changes](https://github.com/Weburz/carousel/compare/v0.3.4...v0.4.0)

### 🚀 Enhancements

- **a11y:** Keyboard navigation and WAI-ARIA slide roles ([#38](https://github.com/Weburz/carousel/pull/38))

### 🩹 Fixes

- **types:** Export public types from the package entry ([#34](https://github.com/Weburz/carousel/pull/34))
- **embeds:** Restore only sweep-parked frames on scroll-back ([#35](https://github.com/Weburz/carousel/pull/35))

### 💅 Refactors

- Extract EmbedCarousel shell and EmbedFacade from the platform wrappers ([#27](https://github.com/Weburz/carousel/pull/27))
- Key embed state by URL, retry failed oEmbed lookups, dedupe playground ([#29](https://github.com/Weburz/carousel/pull/29))

### 🏡 Chore

- Run every gate in the release script and fix the ESLint pre-commit hook ([#36](https://github.com/Weburz/carousel/pull/36))

### ❤️ Contributors

- Sagar Kapoor ([@sagar-kap](https://github.com/sagar-kap))

## v0.3.4

[compare changes](https://github.com/Weburz/carousel/compare/v0.3.3...v0.3.4)

### 💅 Refactors

- Dedupe embed core across the three carousel wrappers ([#22](https://github.com/Weburz/carousel/pull/22))

### ❤️ Contributors

- Sagar Kapoor ([@sagar-kap](https://github.com/sagar-kap))

## v0.3.3

[compare changes](https://github.com/Weburz/carousel/compare/v0.3.2...v0.3.3)

### 🩹 Fixes

- **deps:** Pin overrides to aged releases that pass the 24h supply-chain policy ([99cd9be](https://github.com/Weburz/carousel/commit/99cd9be))

### 💅 Refactors

- Extract facade activation and iframe registry composables ([8f04710](https://github.com/Weburz/carousel/commit/8f04710))

### 📖 Documentation

- Add repository instructions (AGENTS.md) ([36b3b59](https://github.com/Weburz/carousel/commit/36b3b59))

### 🏡 Chore

- Re-add vue devDependency resolution to lockfile after rebase ([ddfbbe2](https://github.com/Weburz/carousel/commit/ddfbbe2))

### ❤️ Contributors

- Sagar-Kap ([@sagar-kap](https://github.com/sagar-kap))

## v0.3.2

[compare changes](https://github.com/Weburz/carousel/compare/v0.3.1...v0.3.2)

### 🏡 Chore

- Give the TikTok facade a intrinsic width ([661b318](https://github.com/Weburz/carousel/commit/661b318))

### ❤️ Contributors

- Sagar-Kap ([@sagar-kap](https://github.com/sagar-kap))

## v0.3.1

[compare changes](https://github.com/Weburz/carousel/compare/v0.3.0...v0.3.1)

## v0.3.0

[compare changes](https://github.com/Weburz/carousel/compare/v0.2.0...v0.3.0)

### 🚀 Enhancements

- Facade mode for YouTube and TikTok, tap-to-interact overlay for Instagram ([eeabf03](https://github.com/Weburz/carousel/commit/eeabf03))

### ❤️ Contributors

- Sagar-Kap ([@sagar-kap](https://github.com/sagar-kap))

## v0.2.0

[compare changes](https://github.com/Weburz/carousel/compare/v0.1.1...v0.2.0)

### 🚀 Enhancements

- Support breakpoint maps for slidesPerView with SSR-correct media queries ([8a8a416](https://github.com/Weburz/carousel/commit/8a8a416))

### ❤️ Contributors

- Sagar-Kap ([@sagar-kap](https://github.com/sagar-kap))

## v0.1.1

[compare changes](https://github.com/Weburz/carousel/compare/v0.1.0...v0.1.1)

### 🏡 Chore

- Auto hide arrows with single carousel item ([1a34e41](https://github.com/Weburz/carousel/commit/1a34e41))

### ❤️ Contributors

- Sagar-Kap ([@sagar-kap](https://github.com/sagar-kap))

## v0.1.0


### 🏡 Chore

- Scaffold the carousels ([22fd3b9](https://github.com/Weburz/carousel/commit/22fd3b9))
- Namespace CSS variables under --weburz- prefix ([3114039](https://github.com/Weburz/carousel/commit/3114039))
- Add umami analytics to the playground ([b98b50d](https://github.com/Weburz/carousel/commit/b98b50d))

### ❤️ Contributors

- Sagar-Kap ([@sagar-kap](https://github.com/sagar-kap))
