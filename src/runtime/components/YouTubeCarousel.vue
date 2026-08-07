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
          <CarouselActiveCaption
            :active-key="activeIndex"
            :title="activeTitle"
            :href="activeHref"
            :description="activeDescription"
          />
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
          <button
            v-if="isThumbnail(video)"
            type="button"
            class="weburz-yt__facade"
            :aria-label="`Play ${captionTitle(video) ?? `YouTube ${video.kind ?? 'video'}`}`"
            @click="activateFacade(video)"
          >
            <img
              class="weburz-yt__thumb"
              :src="thumbnailUrl(video)"
              :alt="captionTitle(video) ?? ''"
              loading="lazy"
              @error="onThumbnailError(video)"
            >
            <span
              class="weburz-yt__play"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 68 48"
                width="68"
                height="48"
              >
                <path
                  class="weburz-yt__play-bg"
                  d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                />
                <path
                  d="M45 24 27 14v20"
                  fill="#fff"
                />
              </svg>
            </span>
          </button>
          <iframe
            v-else-if="mode !== 'player-api'"
            :ref="(el: unknown) => bindIframe(el, video)"
            :src="embedUrl(video)"
            :title="captionTitle(video) ?? `YouTube ${video.kind ?? 'video'} ${video.id}`"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
          <div
            v-else
            :ref="(el: unknown) => bindPlayer(el as HTMLElement | null, video)"
            class="weburz-yt__player"
          />
        </div>
        <CarouselCaption
          v-if="captions === 'per-slide' && (captionTitle(video) || video.description)"
          :title="captionTitle(video)"
          :href="captionHref(video)"
          :description="video.description"
        />
      </BaseSlide>
    </BaseCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type {
  CarouselSharedProps,
  YouTubeCarouselMode,
  YouTubeVideo,
} from '../types'
import { useEmbedMetadata } from '../composables/useEmbedMetadata'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'
import { useYouTubeMedia } from '../composables/useYouTubeMedia'
import { youtubeWatchUrl } from '../utils/embeds'
import CarouselActiveCaption from './CarouselActiveCaption.vue'
import CarouselCaption from './CarouselCaption.vue'

interface Props extends CarouselSharedProps {
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
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'facade',
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

const {
  embedUrl,
  thumbnailUrl,
  onThumbnailError,
  isThumbnail,
  activateFacade,
  bindIframe,
  bindPlayer,
  playVideo,
  pauseVideo,
  muteVideo,
  unmuteVideo,
  stopVideo,
} = useYouTubeMedia(() => props.mode, () => props.nocookie)

const { forYouTube } = useEmbedMetadata()
const fetchedTitles = ref<Record<string, string>>({})

const captionTitle = (video: YouTubeVideo) =>
  video.title ?? fetchedTitles.value[video.id]

const captionHref = (video: YouTubeVideo) =>
  youtubeWatchUrl(video.id, video.kind ?? 'video', video.url)

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
const activeTitle = computed(() =>
  activeVideo.value ? captionTitle(activeVideo.value) : undefined,
)
const activeHref = computed(() =>
  activeVideo.value ? captionHref(activeVideo.value) : undefined,
)
const activeDescription = computed(() => activeVideo.value?.description)

const onSelect = (index: number) => {
  const previousIndex = activeIndex.value
  activeIndex.value = index
  if (!props.pauseOnLeave) return
  const previousVideo = props.videos[previousIndex]
  if (!previousVideo) return
  // Facade slides revert to the "stopped" thumbnail state on leave; the other
  // modes pause. (Facade deactivation destroys the iframe — the only hard stop.)
  stopVideo(previousVideo)
}

let mutedByObserver = false

useScrollAwayHandler(
  rootEl,
  () => {
    if (props.onScrollAway === 'pause') {
      for (const video of props.videos) pauseVideo(video)
    }
    else if (props.onScrollAway === 'mute') {
      for (const video of props.videos) muteVideo(video)
      mutedByObserver = true
    }
  },
  () => {
    const activeVideo = props.videos[activeIndex.value]
    if (props.mode === 'player-api' && props.autoplayOnScroll && activeVideo) {
      playVideo(activeVideo)
    }
    if (mutedByObserver) {
      for (const video of props.videos) unmuteVideo(video)
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

/* Facade: a plain thumbnail button until tapped. Being a regular element (not
   a cross-origin iframe), it keeps touch events on the page — so Embla drags
   work — and defers the heavy YouTube player until the user asks for it. */
.weburz-yt__facade {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: #000;
  cursor: pointer;
}

.weburz-yt__thumb {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.weburz-yt__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  width: var(--weburz-yt-play-size, 4.25rem);
  height: auto;
  pointer-events: none;
}

.weburz-yt__play svg {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 1px 4px rgb(0 0 0 / 0.4));
}

.weburz-yt__play-bg {
  fill: var(--weburz-yt-play-bg, rgb(0 0 0 / 0.7));
  transition: fill 0.15s ease;
}

.weburz-yt__facade:hover .weburz-yt__play-bg,
.weburz-yt__facade:focus-visible .weburz-yt__play-bg {
  fill: var(--weburz-yt-play-bg-hover, #f03);
}
</style>
