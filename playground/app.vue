<template>
  <div class="stage">
    <h1>@weburz/carousel playground</h1>

    <section class="demo">
      <h2>Responsive slide count — the --weburz-carousel-slides CSS var (SSR-safe)</h2>
      <p class="demo-note">
        The slide count lives in CSS media queries (1 below 48rem, 3 above),
        so the server-rendered HTML is already viewport-correct — no hydration
        width snap, unlike a slidesPerView prop driven by JS viewport
        detection. The var wins over the prop, which stays as the static
        fallback.
      </p>
      <BaseCarousel
        class="responsive-slides"
        :options="{ align: 'start' }"
        aria-label="CSS-var responsive carousel"
      >
        <BaseSlide
          v-for="slide in slides"
          :key="slide.id"
        >
          <div
            class="slide-card slide-card--tall"
            :style="{ background: slide.color }"
          >
            {{ slide.label }}
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>YouTubeCarousel — facade mode (default): thumbnail until tapped</h2>
      <p class="demo-note">
        No YouTube player loads until you tap play — slides are plain
        thumbnails, so the page stays light and the carousel can be hand-swiped
        on touch screens (touches on a cross-origin iframe never reach the
        page). Swiping away destroys the player back to its thumbnail.
        Captions: explicit on slide 1, auto-fetched on 2 &amp; 3.
      </p>
      <YouTubeCarousel
        :videos="ytVideos"
        title="Featured videos"
        description="Linked slide titles — omitted ones are fetched from YouTube oEmbed."
      />
    </section>

    <section class="demo">
      <h2>captions="none" — media only, no text anywhere</h2>
      <YouTubeCarousel
        :videos="ytVideos"
        captions="none"
        aria-label="Media-only carousel"
      />
    </section>

    <section class="demo">
      <h2>captions="active" — one text block that follows the active slide</h2>
      <p class="demo-note">
        Each video carries its own title and description; the arrows swap both
        the media and the text. Pairs well with layout="aside".
      </p>
      <YouTubeCarousel
        :videos="ytActiveDemo"
        captions="active"
        layout="aside"
        aria-label="Active captions carousel"
      />
    </section>

    <section class="demo">
      <h2>YouTubeCarousel — shorts in the aside layout</h2>
      <YouTubeCarousel
        :videos="ytShorts"
        layout="aside"
        title="Shorts"
        description="9:16 facades (portrait thumbnails) with the nav cluster on the left."
      />
    </section>

    <section class="demo">
      <h2>Custom #heading + arrow icon slots — bring your own markup</h2>
      <p class="demo-note">
        The heading slot replaces the built-in title/description (and wins over
        captions="active"); prevIcon/nextIcon swap the default chevrons. Works
        on the platform carousels too, not just BaseCarousel.
      </p>
      <YouTubeCarousel
        :videos="ytActiveDemo"
        layout="aside"
        aria-label="Custom heading carousel"
      >
        <template #heading="{ activeIndex, slideCount }">
          <p class="custom-heading__eyebrow">
            Showcase
          </p>
          <h2 class="custom-heading__title">
            Your markup, your design
          </h2>
          <p class="custom-heading__meta">
            {{ activeIndex + 1 }} / {{ slideCount }}
          </p>
        </template>
        <template #prevIcon>
          &larr;
        </template>
        <template #nextIcon>
          &rarr;
        </template>
      </YouTubeCarousel>
    </section>

    <section class="demo">
      <h2>YouTubeCarousel — player-api mode (autoplay on scroll, pause on leave)</h2>
      <p class="demo-note">
        Scroll this section into view to trigger autoplay. Swipe to a different
        slide to pause the previous video.
      </p>
      <YouTubeCarousel
        :videos="ytVideos"
        mode="player-api"
        :autoplay-on-scroll="true"
        :pause-on-leave="true"
        aria-label="Player API demo"
      />
    </section>

    <section class="demo">
      <h2>Framed media + mode="iframe-embed" — all iframes load upfront</h2>
      <div class="framed">
        <YouTubeCarousel
          :videos="ytVideos"
          mode="iframe-embed"
          :show-dots="false"
          aria-label="Framed videos"
        />
      </div>
    </section>

    <section class="demo">
      <h2>InstagramCarousel — tap-to-interact overlay</h2>
      <p class="demo-note">
        Each embed sits under a transparent layer so drags reach the carousel
        (Instagram has no keyless thumbnail, so no facade). Tap once to unlock
        the post for interaction; it locks again when the slide changes.
      </p>
      <InstagramCarousel
        :posts="igPosts"
        title="From Instagram"
        description="Direct captioned embeds — no embed.js needed."
      />
    </section>

    <section class="demo">
      <h2>TikTokCarousel — facade mode (default), aside layout</h2>
      <TikTokCarousel
        :videos="ttVideos"
        layout="aside"
        title="From TikTok"
        description="Thumbnails come from TikTok's keyless oEmbed; tap to load the player, swipe away to destroy it."
      />
    </section>

    <section class="demo">
      <h2>Theme inheritance — design-system tokens</h2>
      <p class="demo-note">
        The theme class on the wrapper defines the tokens; the carousel inherits
        them at render time. No JS theme watcher needed — click to cycle.
      </p>
      <div :class="['themed', `themed--${demoTheme}`]">
        <button
          type="button"
          class="theme-toggle"
          @click="cycleTheme"
        >
          theme: {{ demoTheme }}
        </button>
        <BaseCarousel
          title="Themed carousel"
          description="Dots and arrows restyle themselves from the active theme's tokens."
        >
          <BaseSlide
            v-for="slide in slides"
            :key="slide.id"
          >
            <div
              class="slide-card"
              :style="{ background: slide.color }"
            >
              {{ slide.label }}
            </div>
          </BaseSlide>
        </BaseCarousel>
      </div>
    </section>

    <section class="demo">
      <h2>BaseCarousel — arrows flanking the dots, title + description props</h2>
      <BaseCarousel
        :options="{ loop: false, align: 'start' }"
        title="Featured slides"
        description="The out-of-the-box look: plain chevrons either side of the dots."
      >
        <BaseSlide
          v-for="slide in slides"
          :key="slide.id"
        >
          <div
            class="slide-card"
            :style="{ background: slide.color }"
          >
            {{ slide.label }}
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>arrow-position="sides" — arrows beside the stage</h2>
      <BaseCarousel
        :options="{ loop: false, align: 'start' }"
        arrow-position="sides"
        aria-label="Side-arrows carousel"
      >
        <BaseSlide
          v-for="slide in slides"
          :key="slide.id"
        >
          <div
            class="slide-card"
            :style="{ background: slide.color }"
          >
            {{ slide.label }}
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>layout="aside" — heading + nav on the left, carousel on the right</h2>
      <p class="demo-note">
        Resize below 768px wide and it collapses back to the stacked layout.
      </p>
      <BaseCarousel
        :options="{ loop: true, align: 'start' }"
        layout="aside"
        title="Aside layout"
        description="Title, description, arrows and dots live in the left column on larger frames."
      >
        <BaseSlide
          v-for="slide in slides"
          :key="slide.id"
        >
          <div
            class="slide-card"
            :style="{ background: slide.color }"
          >
            {{ slide.label }}
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>layout="aside" + aside-position="right" — carousel left, heading right</h2>
      <BaseCarousel
        :options="{ loop: true, align: 'start' }"
        layout="aside"
        aside-position="right"
        title="Aside on the right"
        description="Same aside layout, mirrored: the carousel leads and the text column follows."
      >
        <BaseSlide
          v-for="slide in slides"
          :key="slide.id"
        >
          <div
            class="slide-card"
            :style="{ background: slide.color }"
          >
            {{ slide.label }}
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>Two slides per view, looped</h2>
      <BaseCarousel
        :options="{ loop: true, align: 'start' }"
        :slides-per-view="2"
        aria-label="Two-up looped carousel"
      >
        <BaseSlide
          v-for="slide in slides"
          :key="slide.id"
        >
          <div
            class="slide-card"
            :style="{ background: slide.color }"
          >
            {{ slide.label }}
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>Single slide — arrows and dots auto-hide</h2>
      <p class="demo-note">
        One slide means one scroll position: dots never render, and the arrows
        are dropped once Embla confirms the count. (SSR keeps arrows while the
        count is unknown so multi-slide carousels don't get a nav pop-in.)
      </p>
      <BaseCarousel aria-label="Single slide carousel">
        <BaseSlide>
          <div
            class="slide-card slide-card--short"
            style="background: #555"
          >
            The only slide — no chrome below
          </div>
        </BaseSlide>
      </BaseCarousel>
    </section>

    <section class="demo">
      <h2>Dots only / arrows only</h2>
      <div class="demo-grid">
        <BaseCarousel
          :show-arrows="false"
          aria-label="Dots-only carousel"
        >
          <BaseSlide
            v-for="slide in slides"
            :key="slide.id"
          >
            <div
              class="slide-card slide-card--short"
              :style="{ background: slide.color }"
            >
              {{ slide.label }} (dots only)
            </div>
          </BaseSlide>
        </BaseCarousel>
        <BaseCarousel
          :show-dots="false"
          aria-label="Arrows-only carousel"
        >
          <BaseSlide
            v-for="slide in slides"
            :key="slide.id"
          >
            <div
              class="slide-card slide-card--short"
              :style="{ background: slide.color }"
            >
              {{ slide.label }} (arrows only)
            </div>
          </BaseSlide>
        </BaseCarousel>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  InstagramPost,
  TikTokVideo,
  YouTubeVideo,
} from '../src/runtime/types'

const themes = ['light', 'dark', 'neutral'] as const
const demoTheme = ref<(typeof themes)[number]>('light')
const cycleTheme = () => {
  const next = (themes.indexOf(demoTheme.value) + 1) % themes.length
  demoTheme.value = themes[next]!
}

const slides = [
  { id: 1, label: 'Slide 1', color: '#0a7' },
  { id: 2, label: 'Slide 2', color: '#07a' },
  { id: 3, label: 'Slide 3', color: '#a07' },
  { id: 4, label: 'Slide 4', color: '#a70' },
  { id: 5, label: 'Slide 5', color: '#70a' },
]

const ytVideos: YouTubeVideo[] = [
  {
    id: 'UhRXn2NRiWI',
    kind: 'video',
    title: 'JUST DO IT!!! ft. Shia LaBeouf — Songify This',
    description: 'Explicit title + description passed as props.',
  },
  // No titles — fetched from YouTube oEmbed on the client.
  { id: 'UbQgXeY_zi4', kind: 'video' },
  { id: '9QS0q3mGPGg', kind: 'video' },
]

const ytActiveDemo: YouTubeVideo[] = [
  {
    id: 'UhRXn2NRiWI',
    title: 'JUST DO IT!!!',
    description: 'Shia LaBeouf delivers the most motivational speech of all time.',
  },
  {
    id: 'UbQgXeY_zi4',
    title: 'Lone Digger',
    description: 'Caravan Palace’s electro-swing classic.',
  },
  {
    id: '9QS0q3mGPGg',
    title: 'Winning',
    description: 'Charlie Sheen, songified.',
  },
]

const ytShorts: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    kind: 'shorts',
    title: 'Shorts demo 1',
    description: 'Captions work on shorts too — title links to the short.',
  },
  { id: '9bZkp7q19f0', kind: 'shorts' },
]

const igPosts: InstagramPost[] = [
  {
    url: 'https://www.instagram.com/p/DOYkIb9DSRG/',
    title: 'Instagram post 1',
    description: 'Instagram captions are always explicit props — no public metadata API.',
  },
  { url: 'https://www.instagram.com/p/DZVWGy-x-4I/', title: 'Instagram post 2' },
  { url: 'https://www.instagram.com/p/DXzCpnODU39/', title: 'Instagram post 3' },
  { url: 'https://www.instagram.com/p/DWrdfDWEXV2/', title: 'Instagram post 4' },
  { url: 'https://www.instagram.com/p/DV9HNHvkUOq/', title: 'Instagram post 5' },
]

const ttVideos: TikTokVideo[] = [
  { url: 'https://www.tiktok.com/@wwf/video/7613708934842436885' },
  { url: 'https://www.tiktok.com/@wwf/video/7602582444251811092' },
  { url: 'https://www.tiktok.com/@wwf/video/7633389608918650133' },
]
</script>

<style>
html,
body,
#__nuxt {
  margin: 0;
  min-height: 100%;
  background: #0a0a0a;
  color: #fff;
  font-family: system-ui, sans-serif;
}

.stage {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;

  /* Theme the carousel via CSS variables */
  --weburz-carousel-accent: #00dc82;
  --weburz-carousel-dot-color: #fff;
  --weburz-carousel-dot-active-color: #00dc82;
}

.demo {
  margin-block: 3rem;
}

.demo h2 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  opacity: 0.7;
  font-weight: 500;
}

.demo-note {
  font-size: 0.875rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

.slide-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-radius: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.slide-card--tall {
  height: 320px;
}

/* SSR-correct responsive slide count: plain CSS, so the server output already
   matches the viewport — no hydration snap. */
.responsive-slides {
  --weburz-carousel-slides: 1;
}

@media (min-width: 48rem) {
  .responsive-slides {
    --weburz-carousel-slides: 3;
  }
}

.slide-card--short {
  height: 120px;
  font-size: 1rem;
}

/* Design-system theme blocks: each theme class maps its tokens onto the
   carousel's CSS variables. Dots here are full-opacity circles where the
   active one scales up and takes the accent color. */
.themed {
  padding: 1.5rem;
  border-radius: 1rem;
  transition: background 0.3s ease, color 0.3s ease;

  --weburz-carousel-dot-size: 0.7rem;
  --weburz-carousel-dot-opacity: 1;
  --weburz-carousel-dot-active-scale: 1.5;
  --weburz-carousel-dot-gap: 1rem;
}

.themed--light {
  --primary: rgba(218, 50, 181, 1);
  --accent: rgba(108, 30, 214, 1);
  background: linear-gradient(90deg, #ffbff1 0%, #fff4fd 65%);
  color: #1e1b2e;

  --weburz-carousel-dot-color: var(--primary);
  --weburz-carousel-dot-active-color: var(--accent);
  --weburz-carousel-arrow-color: var(--primary);
}

.themed--dark {
  --primary: rgba(218, 50, 181, 1);
  background: #1e1b2e;
  color: #f1f1f1;

  --weburz-carousel-dot-color: #f1f1f1;
  --weburz-carousel-dot-active-color: var(--primary);
  --weburz-carousel-arrow-color: #f1f1f1;
}

.themed--neutral {
  --accent: rgba(108, 30, 214, 1);
  background: #f1f1f1;
  color: #1e1b2e;

  --weburz-carousel-dot-color: #1e1b2e;
  --weburz-carousel-dot-active-color: var(--accent);
  --weburz-carousel-arrow-color: rgba(85, 50, 133, 1);
}

/* Framed media: one set of vars covers YouTube, Instagram and TikTok embeds.
   Use --weburz-yt-border / --weburz-instagram-border / --weburz-tiktok-border for per-platform
   overrides. The media margin gives the shadow room inside the slide so the
   carousel viewport's overflow:hidden doesn't clip it. */
.framed {
  --weburz-carousel-media-border: 0.25rem solid #00dc82;
  --weburz-carousel-media-radius: 1.25rem;
  --weburz-carousel-media-shadow: 0 0 30px rgba(0, 220, 130, 0.35);
  --weburz-carousel-media-margin: 2.5rem;
}

.custom-heading__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #00dc82;
}

.custom-heading__title {
  margin: 0.375rem 0 0;
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(90deg, #00dc82, #36e4da);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.custom-heading__meta {
  margin: 0.5rem 0 0;
  font-variant-numeric: tabular-nums;
  opacity: 0.5;
}

.theme-toggle {
  margin-bottom: 1rem;
  padding: 0.375rem 0.875rem;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
