<template>
  <div
    ref="rootEl"
    class="weburz-tiktok-carousel"
  >
    <BaseCarousel
      :options="options"
      :plugins="plugins"
      :slides-per-view="slidesPerView"
      :show-arrows="showArrows"
      :show-dots="showDots"
      :arrow-position="arrowPosition"
      :layout="layout"
      :aside-position="asidePosition"
      :title="title"
      :description="description"
      :aria-label="ariaLabel"
      @select="onSelect"
    >
      <template
        v-if="$slots.heading || captions === 'active'"
        #heading="headingProps"
      >
        <slot
          name="heading"
          v-bind="headingProps"
        >
          <Transition
            name="weburz-fade"
            mode="out-in"
          >
            <div
              :key="activeIndex"
              class="weburz-active-caption"
            >
              <h3
                v-if="activeVideo && captionTitle(activeVideo)"
                class="weburz-caption__title"
              >
                <a
                  :href="activeVideo.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{ captionTitle(activeVideo) }}</a>
              </h3>
              <p
                v-if="activeVideo?.description"
                class="weburz-caption__description"
              >
                {{ activeVideo.description }}
              </p>
            </div>
          </Transition>
        </slot>
      </template>
      <template
        v-if="$slots.prevIcon"
        #prevIcon
      >
        <slot name="prevIcon" />
      </template>
      <template
        v-if="$slots.nextIcon"
        #nextIcon
      >
        <slot name="nextIcon" />
      </template>
      <BaseSlide
        v-for="(video, index) in videos"
        :key="video.url"
      >
        <button
          v-if="mode === 'facade' && !isActivated(index)"
          type="button"
          class="weburz-tiktok-embed weburz-tiktok-facade"
          :aria-label="`Play ${captionTitle(video) ?? `TikTok video ${index + 1}`}`"
          @click="activate(index)"
        >
          <img
            v-if="thumbUrl(video)"
            class="weburz-tiktok-facade__thumb"
            :src="thumbUrl(video)"
            :alt="captionTitle(video) ?? ''"
            loading="lazy"
          >
          <span
            class="weburz-tiktok-facade__play"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 48 48"
              width="48"
              height="48"
            >
              <circle
                class="weburz-tiktok-facade__play-bg"
                cx="24"
                cy="24"
                r="24"
              />
              <path
                d="M33 24 19.5 16.2v15.6"
                fill="#fff"
              />
            </svg>
          </span>
        </button>
        <iframe
          v-else
          :ref="(el: Element | null) => bindIframe(el, index)"
          class="weburz-tiktok-embed"
          :src="buildEmbedUrl(video.url)"
          :title="captionTitle(video) ?? `TikTok video ${index + 1}`"
          loading="lazy"
          frameborder="0"
          scrolling="no"
          allow="encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          allowfullscreen
        />
        <div
          v-if="captions === 'per-slide' && (captionTitle(video) || video.description)"
          class="weburz-caption"
        >
          <h3
            v-if="captionTitle(video)"
            class="weburz-caption__title"
          >
            <a
              :href="video.url"
              target="_blank"
              rel="noopener noreferrer"
            >{{ captionTitle(video) }}</a>
          </h3>
          <p
            v-if="video.description"
            class="weburz-caption__description"
          >
            {{ video.description }}
          </p>
        </div>
      </BaseSlide>
    </BaseCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import type { SlidesPerView, TikTokCarouselMode, TikTokVideo } from '../types'
import { useEmbedMetadata } from '../composables/useEmbedMetadata'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'

interface Props {
  videos: TikTokVideo[]
  mode?: TikTokCarouselMode
  pauseOnLeave?: boolean
  onScrollAway?: 'pause' | 'none'
  /**
   * Per-item text display: 'none' by default since TikTok's embed already
   * shows the post caption, author, and music inside the iframe. 'active'
   * shows the active video's title in the heading area instead; 'per-slide'
   * puts it under each slide.
   */
  captions?: 'none' | 'per-slide' | 'active'
  fetchMetadata?: boolean
  options?: EmblaOptionsType
  plugins?: EmblaPluginType[]
  slidesPerView?: SlidesPerView
  showArrows?: boolean
  showDots?: boolean
  arrowPosition?: 'sides' | 'below'
  layout?: 'stacked' | 'aside'
  asidePosition?: 'left' | 'right'
  title?: string
  description?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'facade',
  pauseOnLeave: true,
  // TikTok's /embed/v2/ iframe does not respond to any documented postMessage
  // protocol from outside the frame. The only way to halt playback is iframe.src
  // nuke, which causes a reload on scroll-back. Default to "pause" because
  // stopping playback is more important than avoiding the reload flicker.
  onScrollAway: 'pause',
  captions: 'none',
  fetchMetadata: true,
  options: () => ({}),
  plugins: () => [],
  slidesPerView: 1,
  showArrows: true,
  showDots: true,
  arrowPosition: 'below',
  layout: 'stacked',
  asidePosition: 'left',
  title: undefined,
  description: undefined,
  ariaLabel: undefined,
})

const { forTikTok } = useEmbedMetadata()
const fetchedTitles = ref<Record<string, string>>({})
const fetchedThumbs = ref<Record<string, string>>({})

const captionTitle = (video: TikTokVideo) =>
  video.title ?? fetchedTitles.value[video.url]

const thumbUrl = (video: TikTokVideo) =>
  video.thumbnail ?? fetchedThumbs.value[video.url]

onMounted(() => {
  // `fetchMetadata` governs optional caption titles only. Facade thumbnails
  // are NOT optional metadata — without one the facade is a blank box — so
  // they're fetched whenever facade mode needs them, regardless of the flag.
  // (Pass `thumbnail` per video to skip the oEmbed request entirely.)
  // One oEmbed request (shared via the module-level cache) serves both.
  const needsTitles = props.fetchMetadata && props.captions !== 'none'
  for (const video of props.videos) {
    const wantsThumb = props.mode === 'facade' && !video.thumbnail
    const wantsTitle = needsTitles && !video.title
    if (!wantsThumb && !wantsTitle) continue
    forTikTok(video.url).then((meta) => {
      if (meta?.title) fetchedTitles.value[video.url] = meta.title
      if (meta?.thumbnailUrl) fetchedThumbs.value[video.url] = meta.thumbnailUrl
    })
  }
})

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const activeVideo = computed(() => props.videos[activeIndex.value])
const iframeEls = new Map<number, HTMLIFrameElement>()
const boundIframes = new Set<number>()

const extractTikTokId = (url: string): string => {
  const match = url.match(/\/video\/(\d+)/)
  return match?.[1] ?? ''
}

const buildEmbedUrl = (url: string): string => {
  const id = extractTikTokId(url)
  return `https://www.tiktok.com/embed/v2/${id}`
}

const bindIframe = (el: Element | null, index: number) => {
  if (!el || !(el instanceof HTMLIFrameElement)) return
  iframeEls.set(index, el)
  if (boundIframes.has(index)) return
  boundIframes.add(index)
}

// Facade activation: the thumbnail button swaps for the live iframe (which
// autoplays — TikTok's /embed/v2/ starts on load). Deactivating destroys the
// iframe, hard-stopping playback, and brings the thumbnail back.
const activatedIndexes = ref(new Set<number>())
const isActivated = (index: number) => activatedIndexes.value.has(index)

const activate = (index: number) => {
  const next = new Set(activatedIndexes.value)
  next.add(index)
  activatedIndexes.value = next
}

const deactivate = (index: number) => {
  if (!activatedIndexes.value.has(index)) return
  const next = new Set(activatedIndexes.value)
  next.delete(index)
  activatedIndexes.value = next
  iframeEls.delete(index)
  boundIframes.delete(index)
}

const unloadIframe = (iframe: HTMLIFrameElement) => {
  if (iframe.src && iframe.src !== 'about:blank') {
    iframe.dataset.savedSrc = iframe.src
    iframe.src = 'about:blank'
  }
}

const restoreIframe = (iframe: HTMLIFrameElement) => {
  const saved = iframe.dataset.savedSrc
  if (saved && iframe.src === 'about:blank') {
    iframe.src = saved
    delete iframe.dataset.savedSrc
  }
}

const onSelect = (index: number) => {
  const previousIndex = activeIndex.value
  activeIndex.value = index
  if (!props.pauseOnLeave) return
  if (props.mode === 'facade') {
    deactivate(previousIndex)
    return
  }
  const previous = iframeEls.get(previousIndex)
  if (previous) unloadIframe(previous)
  const current = iframeEls.get(index)
  if (current) restoreIframe(current)
}

useScrollAwayHandler(
  rootEl,
  () => {
    if (props.onScrollAway !== 'pause') return
    if (props.mode === 'facade') {
      // Destroy rather than about:blank-park: the facade is the natural
      // stopped state, and it stays swipeable when the user scrolls back.
      for (const index of [...activatedIndexes.value]) deactivate(index)
      return
    }
    iframeEls.forEach(unloadIframe)
  },
  () => {
    if (props.mode === 'facade') return
    iframeEls.forEach(restoreIframe)
  },
)
</script>

<style scoped>
.weburz-tiktok-carousel {
  width: 100%;
}

/* TikTok's /embed/v2/ card is a fixed ~323px wide and ~757px tall (caption is
   truncated to two lines, so the height is stable). Match those dimensions —
   wider iframes get white side gutters, shorter ones clip the music line. */
.weburz-tiktok-embed {
  display: block;
  margin: var(--weburz-carousel-media-margin, 0) auto;
  width: 100%;
  max-width: var(--weburz-tiktok-max-width, 20.3125rem);
  min-height: var(--weburz-tiktok-min-height, 47.5rem);
  background: var(--weburz-tiktok-bg, transparent);
  border: var(--weburz-tiktok-border, var(--weburz-carousel-media-border, none));
  border-radius: var(--weburz-tiktok-radius, var(--weburz-carousel-media-radius, 0.5rem));
  box-shadow: var(--weburz-tiktok-shadow, var(--weburz-carousel-media-shadow, none));
}

/* Facade: shares the embed's box (same class) so swapping in the iframe
   causes no layout shift. Being a regular element instead of a cross-origin
   iframe, it keeps touches on the page — Embla drags work — and defers
   TikTok's player until the user taps. */
.weburz-tiktok-facade {
  position: relative;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  background: var(--weburz-tiktok-facade-bg, #000);
}

.weburz-tiktok-facade__thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.weburz-tiktok-facade__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  width: var(--weburz-tiktok-play-size, 3.5rem);
  pointer-events: none;
}

.weburz-tiktok-facade__play svg {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 1px 4px rgb(0 0 0 / 0.4));
}

.weburz-tiktok-facade__play-bg {
  fill: var(--weburz-tiktok-play-bg, rgb(0 0 0 / 0.7));
  transition: fill 0.15s ease;
}

.weburz-tiktok-facade:hover .weburz-tiktok-facade__play-bg,
.weburz-tiktok-facade:focus-visible .weburz-tiktok-facade__play-bg {
  fill: var(--weburz-tiktok-play-bg-hover, #fe2c55);
}

.weburz-caption {
  margin-top: var(--weburz-carousel-caption-gap, 0.75rem);
  text-align: var(--weburz-carousel-caption-align, center);
}

.weburz-active-caption {
  text-align: var(--weburz-carousel-active-caption-align, start);
}

.weburz-fade-enter-active,
.weburz-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.weburz-fade-enter-from {
  opacity: 0;
  transform: translateY(0.25rem);
}

.weburz-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

.weburz-caption__title {
  margin: 0;
  font-size: var(--weburz-carousel-caption-title-size, 1rem);
  font-weight: var(--weburz-carousel-caption-title-weight, 600);
}

.weburz-caption__title a {
  color: var(--weburz-carousel-caption-title-color, inherit);
  text-decoration: none;
}

.weburz-caption__title a:hover {
  text-decoration: underline;
}

.weburz-caption__description {
  margin: 0.25rem 0 0;
  font-size: var(--weburz-carousel-caption-description-size, 0.875rem);
  color: var(--weburz-carousel-caption-description-color, inherit);
  opacity: var(--weburz-carousel-caption-description-opacity, 0.7);
}
</style>
