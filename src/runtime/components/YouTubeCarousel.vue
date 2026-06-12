<template>
  <div
    ref="rootEl"
    class="weburz-youtube-carousel"
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
                  :href="watchUrl(activeVideo)"
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
        v-for="video in videos"
        :key="video.id"
      >
        <div :class="['weburz-yt', `weburz-yt--${video.kind ?? 'video'}`]">
          <iframe
            v-if="mode === 'iframe-embed'"
            :ref="(el: Element | null) => bindIframe(el, video)"
            :src="buildEmbedUrl(video)"
            :title="captionTitle(video) ?? `YouTube ${video.kind ?? 'video'} ${video.id}`"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
          <div
            v-else
            :ref="(el: Element | null) => bindPlayer(el as HTMLElement | null, video)"
            class="weburz-yt__player"
            :data-video-id="video.id"
          />
        </div>
        <div
          v-if="captions === 'per-slide' && (captionTitle(video) || video.description)"
          class="weburz-caption"
        >
          <h3
            v-if="captionTitle(video)"
            class="weburz-caption__title"
          >
            <a
              :href="watchUrl(video)"
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
import type { SlidesPerView, YouTubeCarouselMode, YouTubeVideo } from '../types'
import { useEmbedMetadata } from '../composables/useEmbedMetadata'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'
import { useYouTubePlayer } from '../composables/useYouTubePlayer'

interface Props {
  videos: YouTubeVideo[]
  mode?: YouTubeCarouselMode
  nocookie?: boolean
  autoplayOnScroll?: boolean
  pauseOnLeave?: boolean
  onScrollAway?: 'mute' | 'pause' | 'none'
  /**
   * Per-item text display: under every slide ('per-slide'), one heading-area
   * block showing the active slide's title/description ('active'), or none.
   * Carousel-level `title`/`description` props are independent of this.
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
  mode: 'iframe-embed',
  nocookie: true,
  autoplayOnScroll: false,
  pauseOnLeave: true,
  onScrollAway: 'mute',
  captions: 'per-slide',
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

const buildEmbedUrl = (video: YouTubeVideo) => {
  const host = props.nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com'
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
  })
  return `https://${host}/embed/${video.id}?${params}`
}

const { forYouTube } = useEmbedMetadata()
const fetchedTitles = ref<Record<string, string>>({})

const captionTitle = (video: YouTubeVideo) =>
  video.title ?? fetchedTitles.value[video.id]

const watchUrl = (video: YouTubeVideo) =>
  video.url
  ?? (video.kind === 'shorts'
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`)

onMounted(() => {
  if (!props.fetchMetadata || props.captions === 'none') return
  for (const video of props.videos) {
    if (video.title) continue
    forYouTube(video.id).then((meta) => {
      if (meta?.title) fetchedTitles.value[video.id] = meta.title
    })
  }
})

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const activeVideo = computed(() => props.videos[activeIndex.value])
const playerEls = new Map<string, HTMLElement>()
const iframeEls = new Map<string, HTMLIFrameElement>()
const registeredPlayers = new Set<string>()
const registeredIframes = new Set<string>()

const { register, pause, play, mute, unmute } = useYouTubePlayer()

const bindPlayer = (el: HTMLElement | null, video: YouTubeVideo) => {
  // Vue's inline function refs fire null callbacks on every re-render even when
  // the element hasn't really gone away. Ignoring null avoids losing the entry.
  if (!el) return
  playerEls.set(video.id, el)
  if (registeredPlayers.has(video.id)) return
  if (props.mode === 'player-api' && import.meta.client) {
    registeredPlayers.add(video.id)
    register(el, video.id, { nocookie: props.nocookie }).catch(() => {
      registeredPlayers.delete(video.id)
    })
  }
}

const bindIframe = (el: Element | null, video: YouTubeVideo) => {
  if (!el || !(el instanceof HTMLIFrameElement)) return
  iframeEls.set(video.id, el)
  if (registeredIframes.has(video.id)) return
  registeredIframes.add(video.id)
  // YouTube only reliably accepts postMessage commands once the parent has
  // sent a "listening" handshake. Without this, mute/pause work intermittently.
  const sendListening = () => {
    el.contentWindow?.postMessage(
      JSON.stringify({
        event: 'listening',
        id: `weburz-${video.id}`,
        channel: 'widget',
      }),
      '*',
    )
  }
  el.addEventListener('load', sendListening, { once: true })
  sendListening()
}

const postIframeCommand = (iframe: HTMLIFrameElement, func: string) => {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args: [] }),
    '*',
  )
}

const pauseIframe = (iframe: HTMLIFrameElement) => postIframeCommand(iframe, 'pauseVideo')
const playIframe = (iframe: HTMLIFrameElement) => postIframeCommand(iframe, 'playVideo')
const muteIframe = (iframe: HTMLIFrameElement) => postIframeCommand(iframe, 'mute')
const unmuteIframe = (iframe: HTMLIFrameElement) => postIframeCommand(iframe, 'unMute')

const playByVideo = (video: YouTubeVideo) => {
  if (props.mode === 'iframe-embed') {
    const iframe = iframeEls.get(video.id)
    if (iframe) playIframe(iframe)
    return
  }
  const el = playerEls.get(video.id)
  if (el) play(el)
}

const pauseByVideo = (video: YouTubeVideo) => {
  if (props.mode === 'iframe-embed') {
    const iframe = iframeEls.get(video.id)
    if (iframe) pauseIframe(iframe)
    return
  }
  const el = playerEls.get(video.id)
  if (el) pause(el)
}

const muteByVideo = (video: YouTubeVideo) => {
  if (props.mode === 'iframe-embed') {
    const iframe = iframeEls.get(video.id)
    if (iframe) muteIframe(iframe)
    return
  }
  const el = playerEls.get(video.id)
  if (el) mute(el)
}

const unmuteByVideo = (video: YouTubeVideo) => {
  if (props.mode === 'iframe-embed') {
    const iframe = iframeEls.get(video.id)
    if (iframe) unmuteIframe(iframe)
    return
  }
  const el = playerEls.get(video.id)
  if (el) unmute(el)
}

const onSelect = (index: number) => {
  const previousIndex = activeIndex.value
  activeIndex.value = index
  if (!props.pauseOnLeave) return
  const previousVideo = props.videos[previousIndex]
  if (previousVideo) pauseByVideo(previousVideo)
}

let mutedByObserver = false

useScrollAwayHandler(
  rootEl,
  () => {
    if (props.onScrollAway === 'pause') {
      for (const video of props.videos) pauseByVideo(video)
    }
    else if (props.onScrollAway === 'mute') {
      for (const video of props.videos) muteByVideo(video)
      mutedByObserver = true
    }
  },
  () => {
    const activeVideo = props.videos[activeIndex.value]
    if (props.mode === 'player-api' && props.autoplayOnScroll && activeVideo) {
      playByVideo(activeVideo)
    }
    if (mutedByObserver) {
      for (const video of props.videos) unmuteByVideo(video)
      mutedByObserver = false
    }
  },
)
</script>

<style scoped>
.weburz-youtube-carousel {
  width: 100%;
}

.weburz-yt {
  position: relative;
  overflow: hidden;
  /* Breathing room inside the slide so borders/shadows aren't clipped by the
     carousel viewport's overflow:hidden. */
  margin: var(--weburz-carousel-media-margin, 0);
  border: var(--weburz-yt-border, var(--weburz-carousel-media-border, none));
  border-radius: var(--weburz-yt-radius, var(--weburz-carousel-media-radius, 0.5rem));
  box-shadow: var(--weburz-yt-shadow, var(--weburz-carousel-media-shadow, none));
  background: #000;
}

.weburz-yt--video {
  aspect-ratio: var(--weburz-yt-video-aspect, 16 / 9);
}

.weburz-yt--shorts {
  aspect-ratio: var(--weburz-yt-shorts-aspect, 9 / 16);
  max-width: var(--weburz-yt-shorts-max-width, 24rem);
  margin-inline: auto;
}

/* :deep() because in player-api mode the iframe is created by YouTube's API
   (it replaces our placeholder div), so it never gets Vue's scope attribute. */
.weburz-yt :deep(iframe),
.weburz-yt__player {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
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
