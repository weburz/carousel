# @weburz/carousel

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Drop-in carousels for Nuxt 4 that make YouTube, Instagram, and TikTok embeds
behave. Buttery [Embla](https://www.embla-carousel.com/)-powered sliding,
captions that fetch themselves, and videos that actually shut up when you
scroll away.

Every platform embed is hostile in its own special way: Instagram answers the
obvious embed URL with `X-Frame-Options: DENY`, YouTube ignores your commands
until you whisper the right postMessage handshake, and TikTok's `embed.js`
sleeps through SPA navigations. This module ships all the workarounds so you
don't have to earn them the hard way.

> **Status: experimental.** Pre-1.0 — the API may shift.

- 🎠 `<BaseCarousel>` / `<BaseSlide>` — Embla underneath: arrows, dots, multi-slide views, zero jank
- ▶️ `<YouTubeCarousel>` — videos & Shorts; autoplays when scrolled into view, mutes/pauses when scrolled away
- 📸 `<InstagramCarousel>` — direct iframes that content blockers can't kill, no `embed.js` required
- 🎵 `<TikTokCarousel>` — `/embed/v2/` cards whose playback halts the moment they're off-screen
- 🏷️ Captions that write themselves — linked titles + descriptions, auto-fetched from YouTube/TikTok oEmbed
- 🧱 Layouts with range — stacked or magazine-style aside (left *or* right), arrows wherever you want them
- 🎰 Slots for everything — custom headings, custom arrow icons, your markup wins
- 🎨 ~40 CSS variables to theme with, zero `!important` battles
- 📐 SSR-safe responsive slide counts — `:slides-per-view="{ base: 1, '48rem': 3 }"`, no hydration snap
- 🧩 Auto-imported composables: `useCarousel`, `useYouTubePlayer`, `useInstagramEmbed`, `useTikTokEmbed`, `useEmbedMetadata`
- 🟦 First-class TypeScript types

## Install

```bash
pnpm add @weburz/carousel
# or: npm install @weburz/carousel
# or: yarn add @weburz/carousel
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@weburz/carousel'],
})
```

That's the whole setup — every component and composable now auto-imports in
every Vue file.

## Usage

### BaseCarousel

```vue
<template>
  <BaseCarousel
    :options="{ loop: true, align: 'start' }"
    :slides-per-view="2"
    arrow-position="below"
    aria-label="Featured items"
  >
    <BaseSlide v-for="item in items" :key="item.id">
      <!-- your slide content -->
    </BaseSlide>
  </BaseCarousel>
</template>
```

### YouTubeCarousel

```vue
<template>
  <YouTubeCarousel
    :videos="[
      { id: 'dQw4w9WgXcQ', kind: 'video', title: 'Never Gonna Give You Up' },
      { id: '9bZkp7q19f0', kind: 'shorts', title: 'A short' },
    ]"
    aria-label="Featured videos"
  />
</template>
```

(Yes, that first id is exactly what you think it is. Copy-paste responsibly.)

The default `mode="facade"` renders each slide as the video's thumbnail with a
play button; the actual YouTube iframe (a ~1 MB player) is only created when
the user taps play, with `autoplay=1` so the tap counts as the play gesture.
Besides the obvious page-weight win, this is what keeps the carousel
**hand-swipeable on touch screens**: touches that start on a cross-origin
iframe are delivered to the embed's document and never reach the page, so a
carousel of always-on iframes can't be dragged at all. Swiping away from a
playing slide destroys the iframe back to its facade. Prefer everything loaded
upfront? `mode="iframe-embed"`. Need programmatic control
(`autoplay-on-scroll`)? `mode="player-api"`.

### InstagramCarousel / TikTokCarousel

```vue
<template>
  <InstagramCarousel
    :posts="[{ url: 'https://www.instagram.com/p/ABC123/' }]"
    aria-label="Instagram posts"
  />

  <TikTokCarousel
    :videos="[{ url: 'https://www.tiktok.com/@user/video/1234567890' }]"
    aria-label="TikTok videos"
  />
</template>
```

TikTok defaults to `mode="facade"` like YouTube: the thumbnail comes from
TikTok's keyless oEmbed endpoint, and the player iframe (which autoplays on
load) is only created when the user taps. Instagram has no keyless thumbnail
source, so it keeps its iframes but covers each with a **tap-to-interact
overlay** (`tapToInteract`, on by default): drags land on the page — so the
carousel stays hand-swipeable — and a tap unlocks the post for real
interaction until the slide changes.

Instagram (and TikTok in `iframe-embed` mode) expose no playback control API
from outside the iframe, so "pause" is implemented by unloading the iframe
(`src → about:blank`) and restoring it on return — the embed reloads, but
audio never keeps playing off-screen. Opt out with `:pause-on-leave="false"` /
`on-scroll-away="none"`.

### The hero treatment

```vue
<template>
  <TikTokCarousel
    :videos="videos"
    layout="aside"
    aside-position="right"
    title="Latest drops"
    description="Fresh out of the For You page."
  />
</template>
```

Heading and nav settle into a side column (pick your side), the media takes
the rest, and below 768px the whole thing stacks back politely. Pair with
`captions="active"` to cross-fade the current slide's title in that column as
you flick through.

## Props

Shared by all carousels:

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `options` | `EmblaOptionsType` | `{}` | Embla carousel options |
| `plugins` | `EmblaPluginType[]` | `[]` | Embla plugins (autoplay, etc.) |
| `slidesPerView` | `number \| Record<string, number>` | `1` | Slides visible at once — a number, or a breakpoint map (`{ base: 1, '48rem': 3 }`) rendered as SSR-correct media queries. See [Responsive slide counts](#responsive-slide-counts-ssr-safe) |
| `showArrows` | `boolean` | `true` | Render prev/next arrows — auto-hidden when there's only one scroll position |
| `showDots` | `boolean` | `true` | Render dot pagination — hidden when there's only one scroll position |
| `arrowPosition` | `'sides' \| 'below'` | `'below'` | Arrows flanking the dots (default) or beside the stage |
| `layout` | `'stacked' \| 'aside'` | `'stacked'` | `'aside'` puts title, description, and nav in a side column next to the carousel (≥768px; stacks below that) |
| `asidePosition` | `'left' \| 'right'` | `'left'` | Which side the aside column sits on (only applies with `layout="aside"`) |
| `title` | `string` | — | Heading rendered above the carousel (or in the aside column) |
| `description` | `string` | — | Supporting copy under the title |
| `ariaLabel` | `string` | — | Accessible label for the carousel region; falls back to `title` |

`YouTubeCarousel` additionally:

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `videos` | `YouTubeVideo[]` | — | `{ id, kind?: 'video' \| 'shorts', title?, description?, url?, thumbnail? }` |
| `mode` | `'facade' \| 'iframe-embed' \| 'player-api'` | `'facade'` | Thumbnail-until-tapped (light + touch-swipeable), all iframes upfront, or the YouTube IFrame Player API |
| `nocookie` | `boolean` | `true` | Use `youtube-nocookie.com` |
| `autoplayOnScroll` | `boolean` | `false` | Play active video when scrolled into view (`player-api` only) |
| `pauseOnLeave` | `boolean` | `true` | Pause the previous slide on swipe |
| `onScrollAway` | `'mute' \| 'pause' \| 'none'` | `'mute'` | What to do when the carousel leaves the viewport |
| `captions` | `'none' \| 'per-slide' \| 'active'` | `'per-slide'` | Per-item text: under each slide, one heading-area block following the active slide, or none |
| `fetchMetadata` | `boolean` | `true` | Auto-fetch missing titles from YouTube's oEmbed endpoint |

`InstagramCarousel` / `TikTokCarousel` additionally:

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `posts` / `videos` | `InstagramPost[]` / `TikTokVideo[]` | — | `{ url, title?, description? }` (TikTok also takes `thumbnail?`) |
| `mode` | `'facade' \| 'iframe-embed'` | `'facade'` | TikTok only: thumbnail-until-tapped vs all iframes upfront |
| `tapToInteract` | `boolean` | `true` | Instagram only: transparent layer over each embed so drags reach the carousel; tap to unlock the post |
| `pauseOnLeave` | `boolean` | `true` | Unload the previous slide's iframe on swipe |
| `onScrollAway` | `'pause' \| 'none'` | `'pause'` | Unload all iframes when the carousel leaves the viewport |
| `captions` | `'none' \| 'per-slide' \| 'active'` | IG `'per-slide'`, TikTok `'none'` | Per-item text mode. Off for TikTok by default — its embed already shows the caption inside the iframe |
| `fetchMetadata` | `boolean` | `true` | TikTok only: auto-fetch missing titles/thumbnails from TikTok's oEmbed (runs when captions or facades need it) |

All carousels emit `select` with the new active index.

## Slots

When props aren't enough, take the wheel. All carousels (base and platform)
accept:

| Slot | Props | Description |
| ---- | ----- | ----------- |
| `heading` | `activeIndex`, `slideCount` | Replaces the built-in title/description markup entirely — bring your own eyebrow, heading levels, counters, … On the platform carousels it also wins over `captions="active"` |
| `prevIcon` / `nextIcon` | — | Custom arrow content (icons, SVGs) instead of the default chevrons |

```vue
<YouTubeCarousel :videos="videos" layout="aside">
  <template #heading="{ activeIndex, slideCount }">
    <span class="eyebrow">Showcase</span>
    <h2>Featured videos</h2>
    <p>{{ activeIndex + 1 }} / {{ slideCount }}</p>
  </template>
  <template #prevIcon>&larr;</template>
  <template #nextIcon>&rarr;</template>
</YouTubeCarousel>
```

The default heading markup is styleable without the slot too — see the
`--weburz-carousel-title-*` / `--weburz-carousel-description-*` variables under
[Theming](#theming).

## Captions & metadata

Each item can carry its own `title` and `description`. The `captions` prop
picks how that text is displayed:

- **`'per-slide'`** — a caption under every slide: linked title (opens the
  video/post in a new tab) with the description below it.
- **`'active'`** — one text block in the heading position that always shows
  the *active* slide's title/description, cross-fading as you navigate. In
  `layout="aside"` it lives in the side column next to the media — a classic
  "content left, media right" hero pattern (flip it with
  `aside-position="right"`).
- **`'none'`** — no per-item text at all.

These compose with the carousel-level `title`/`description` props (the shared
heading): media-only carousel = `captions="none"` and no `title`; one heading
for the whole carousel = `captions="none"` plus `title`/`description`.
For full markup control, every carousel accepts a `#heading` slot (receives
`activeIndex` and `slideCount`) that overrides all of the above — see
[Slots](#slots).

For YouTube the caption link defaults to the watch/shorts URL derived from the
id (override with `url`).

When a title is omitted, it is fetched client-side from the platform's public
oEmbed endpoint (no auth, CORS-enabled, cached per URL across all carousels):

- **YouTube** ✅ and **TikTok** ✅ — titles arrive shortly after mount.
- **Instagram** ❌ — its oEmbed has required a Facebook app token since 2020,
  so Instagram captions only render from explicit `title` / `description`.

TikTok captions are `'none'` by default: the embed already renders the post
caption, author, and music inside the iframe, so an external caption
duplicates it. Opt in with `captions="per-slide"` or `captions="active"` if
you want a clickable title outside the frame.

Disable fetching with `:fetch-metadata="false"`, or hide captions entirely
with `captions="none"`. The same data is available standalone via the
`useEmbedMetadata()` composable (`forYouTube(id)` / `forTikTok(url)` →
`{ title, authorName, thumbnailUrl }`).

Embeds render their own poster/thumbnail imagery inside the iframe, served
fresh from the platform CDNs — the module never snapshots or caches media.

## Theming

Every visual decision is a CSS variable — set them on any ancestor and the
cascade does the rest. No deep selectors, no `:deep()`, no fighting scoped
styles:

```css
.my-page {
  --weburz-carousel-accent: #00dc82;
  --weburz-carousel-gap: 1rem;             /* stack gap: heading / stage / nav */
  --weburz-carousel-slide-gap: 1rem;       /* gap between slides */
  /* --weburz-carousel-slides: 3;             slides per view — wins over the slidesPerView
                                              prop; see Responsive slide counts below */
  /* Arrows are plain chevrons by default — add bg/border to get buttons back */
  --weburz-carousel-arrow-size: 2rem;
  --weburz-carousel-arrow-font-size: 1.5rem;
  --weburz-carousel-arrow-space: 3rem;     /* horizontal room reserved in 'sides' mode */
  --weburz-carousel-arrow-color: #fff;
  --weburz-carousel-arrow-bg: transparent;
  --weburz-carousel-arrow-border: none;
  --weburz-carousel-arrow-radius: 0.25rem;
  --weburz-carousel-dot-size: 0.625rem;
  --weburz-carousel-dot-gap: 0.5rem;
  --weburz-carousel-dot-radius: 50%;
  --weburz-carousel-dot-opacity: 0.3;          /* inactive dots */
  --weburz-carousel-dot-color: #fff;
  --weburz-carousel-dot-active-color: var(--weburz-carousel-accent);
  --weburz-carousel-dot-active-scale: 1;       /* e.g. 1.5 for a growing active dot */

  --weburz-carousel-title-size: 1.375rem;
  --weburz-carousel-title-weight: 600;
  --weburz-carousel-title-color: inherit;
  --weburz-carousel-description-size: 0.9375rem;
  --weburz-carousel-description-color: inherit;
  --weburz-carousel-description-opacity: 0.65;

  /* per-slide captions */
  --weburz-carousel-caption-gap: 0.75rem;
  --weburz-carousel-caption-align: center;
  --weburz-carousel-caption-title-size: 1rem;
  --weburz-carousel-caption-title-weight: 600;
  --weburz-carousel-caption-title-color: inherit;
  --weburz-carousel-caption-description-size: 0.875rem;
  --weburz-carousel-caption-description-color: inherit;
  --weburz-carousel-caption-description-opacity: 0.7;

  /* layout="aside" (breakpoint is fixed at 768px) */
  --weburz-carousel-aside-column: minmax(12rem, 1fr);  /* heading column sizing */
  --weburz-carousel-aside-stage: 2fr;                  /* carousel column sizing */
  --weburz-carousel-aside-gap: 2.5rem;

  /* media frame — applies to YouTube, Instagram and TikTok embeds alike;
     override per platform with --weburz-yt-border / --weburz-instagram-border / --weburz-tiktok-border
     (and the matching -radius / -shadow variants) */
  --weburz-carousel-media-border: none;        /* e.g. 0.25rem solid var(--brand-primary) */
  --weburz-carousel-media-radius: 0.5rem;
  --weburz-carousel-media-shadow: none;        /* e.g. 0 10px 40px rgb(0 0 0 / 0.3) */
  --weburz-carousel-media-margin: 0;           /* set ~the shadow's blur radius so the
                                           viewport's overflow:hidden can't clip it */

  --weburz-yt-radius: 0.5rem;
  --weburz-yt-video-aspect: 16 / 9;
  --weburz-yt-shorts-aspect: 9 / 16;
  --weburz-yt-shorts-max-width: 24rem;

  /* facade play button (facade mode) */
  --weburz-yt-play-size: 4.25rem;
  --weburz-yt-play-bg: rgb(0 0 0 / 0.7);
  --weburz-yt-play-bg-hover: #f03;

  --weburz-instagram-max-width: 22rem;
  --weburz-instagram-aspect: 9 / 16;

  /* TikTok's embed card is fixed ~323x757px — these defaults match it.
     Wider → white side gutters; shorter → the music line gets clipped. */
  --weburz-tiktok-max-width: 20.3125rem;
  --weburz-tiktok-min-height: 47.5rem;

  /* facade play button (facade mode) */
  --weburz-tiktok-facade-bg: #000;
  --weburz-tiktok-play-size: 3.5rem;
  --weburz-tiktok-play-bg: rgb(0 0 0 / 0.7);
  --weburz-tiktok-play-bg-hover: #fe2c55;
}
```

These are ordinary CSS custom properties, so they inherit through the cascade.
To integrate with a design system, map them once inside your theme classes —

```css
html.dark {
  --weburz-carousel-dot-color: var(--text-primary);
  --weburz-carousel-dot-active-color: var(--brand-primary);
  --weburz-carousel-arrow-color: var(--text-primary);
}
```

— and every carousel follows theme switches automatically, with no JS theme
watcher. Arrows and dots default to `currentColor`, so even with zero mapping
they already match the surrounding text color.

## Responsive slide counts (SSR-safe)

Driving `slidesPerView` from JavaScript viewport detection (`useMediaQuery`
and friends) has an SSR problem: media queries can't run on the server, so
the server guesses one count, the browser hydrates to another, and the first
slide visibly snaps to its real width. (In dev mode the carousel detects this
pattern and warns about it.)

Pass a breakpoint map instead — keys are `base` plus any `min-width` length,
and the carousel renders them as real CSS media queries, server-side:

```vue
<BaseCarousel :slides-per-view="{ 'base': 1, '48rem': 3 }">
  <BaseSlide v-for="card in cards" :key="card.id">…</BaseSlide>
</BaseCarousel>
```

The server output is correct for every viewport with zero JavaScript
involved, so there is nothing to snap on hydration.

Prefer styling-level control? The same mechanism is exposed as the
`--weburz-carousel-slides` CSS variable, which always wins over the prop:

```css
.cards {
  --weburz-carousel-slides: 1;
}

@media (min-width: 48rem) {
  .cards {
    --weburz-carousel-slides: 3;
  }
}
```

Both work on the platform carousels too — their slides live in the same
cascade, so a map on `<TikTokCarousel>` behaves identically.

Keep the plain number for counts that are genuinely static
(`:slides-per-view="2"`).

## Module options

| Option   | Type     | Default | Description                                                      |
| -------- | -------- | ------- | ---------------------------------------------------------------- |
| `prefix` | `string` | `""`    | Component name prefix, e.g. `"Weburz"` → `<WeburzBaseCarousel>` |

Configure via the `carousel` key in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@weburz/carousel'],

  carousel: {
    prefix: 'Weburz',
  },
})
```

## Composables

- `useCarousel(options?, plugins?)` — Embla wrapper returning `carouselRef`, `emblaApi`, `activeIndex`, `slideCount`, `canScrollPrev`, `canScrollNext`, `next`, `prev`, `scrollTo`. Used internally by `<BaseCarousel>`; reach for it to build a fully custom carousel.
- `useYouTubePlayer()` — loads the YouTube IFrame Player API once and manages player instances: `register`, `unregister`, `play`, `pause`, `pauseAll`, `mute`, `unmute`.
- `useInstagramEmbed()` — `load` / `process` for Instagram's `embed.js` (only needed for blockquote-style embeds; `<InstagramCarousel>` uses direct iframes instead).
- `useTikTokEmbed()` — `load` / `reload` for TikTok's `embed.js` with the cache-bust trick needed after SPA navigation.
- `useEmbedMetadata()` — `forYouTube(videoId)` / `forTikTok(url)` fetch `{ title, authorName, thumbnailUrl }` from the platforms' public oEmbed endpoints, cached per URL.

## Contributing

Contributions are welcome — bug reports, fixes, new platform quirk
workarounds, docs. Day-to-day commands are wrapped in a
[Taskfile](https://taskfile.dev), so you don't have to memorize the pnpm
script names.

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) 11 (`corepack enable` or `npm i -g pnpm`)
- [Task](https://taskfile.dev/installation/) (`brew install go-task` /
  `scoop install task` / see the install docs)
- [pre-commit](https://pre-commit.com/) — optional but recommended
  (`brew install pre-commit` or `pipx install pre-commit`)

### Getting started

```bash
git clone https://github.com/Weburz/carousel.git
cd carousel
task setup        # pnpm install + generate Nuxt type stubs
task setup:hooks  # activate the pre-commit hooks (optional)
task dev          # run the playground at http://localhost:3000
```

The playground (`playground/`) is a real Nuxt app with the module stubbed in —
edit anything under `src/` and it hot-reloads.

### Everyday tasks

Run `task` (no arguments) to see the full list. The ones you'll use most:

| Command | What it does |
| ------- | ------------ |
| `task setup` | Install dependencies and generate Nuxt type stubs (run once per clone) |
| `task dev` | Run the playground with hot reload |
| `task test` | Run the test suite once (`task test:watch` for watch mode) |
| `task test:types` | Type-check the module and the playground |
| `task lint` | Lint everything (`task lint:fix` to auto-fix) |
| `task check` | Everything CI runs: lint, type-check, tests, build |
| `task build` | Build the distributable module into `dist/` |
| `task clean` | Remove build artifacts (`task clean:all` also nukes `node_modules`) |

Before opening a PR, run `task check` — it mirrors the `Code QA Checks`
GitHub workflow, so if it passes locally, CI should too.

### Project layout

```
src/module.ts               # Nuxt module entry — registers components & composables
src/runtime/components/     # BaseCarousel, YouTubeCarousel, InstagramCarousel, TikTokCarousel, …
src/runtime/composables/    # useCarousel, useYouTubePlayer, useEmbedMetadata, …
src/runtime/types.ts        # public TypeScript types
playground/                 # demo Nuxt app for local dev (deployed to GitHub Pages)
test/                       # Vitest + @nuxt/test-utils suite
```

### Commit messages & hooks

Commits must follow
[Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`,
`fix: …`, `chore: …`) — the CHANGELOG is auto-generated from them by
`changelogen`. The pre-commit hooks (installed via `task setup:hooks`) lint
staged files and validate the commit message for you. Skip them for a single
commit with `git commit --no-verify` (use sparingly).

### Releases (maintainers)

```bash
task release
```

Lints, tests, builds the module, bumps the version + CHANGELOG via
`changelogen`, publishes to npm, and pushes the tag. The `Deploy Playground`
workflow publishes `playground/` to GitHub Pages on every push to `main`.

## License

MIT &copy; [Weburz](https://github.com/Weburz)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@weburz/carousel/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@weburz/carousel

[npm-downloads-src]: https://img.shields.io/npm/dm/@weburz/carousel.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@weburz/carousel

[license-src]: https://img.shields.io/npm/l/@weburz/carousel.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@weburz/carousel

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
