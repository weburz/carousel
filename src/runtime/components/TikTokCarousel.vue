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
        <iframe
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
import type { TikTokVideo } from '../types'
import { useEmbedMetadata } from '../composables/useEmbedMetadata'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'

interface Props {
  videos: TikTokVideo[]
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
  slidesPerView?: number
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

const captionTitle = (video: TikTokVideo) =>
  video.title ?? fetchedTitles.value[video.url]

onMounted(() => {
  // Fetched titles only surface in captions, so skip the requests when hidden.
  if (!props.fetchMetadata || props.captions === 'none') return
  for (const video of props.videos) {
    if (video.title) continue
    forTikTok(video.url).then((meta) => {
      if (meta?.title) fetchedTitles.value[video.url] = meta.title
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
  const previous = iframeEls.get(previousIndex)
  if (previous) unloadIframe(previous)
  const current = iframeEls.get(index)
  if (current) restoreIframe(current)
}

useScrollAwayHandler(
  rootEl,
  () => {
    if (props.onScrollAway !== 'pause') return
    iframeEls.forEach(unloadIframe)
  },
  () => {
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
