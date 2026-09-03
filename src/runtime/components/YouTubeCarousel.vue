<template>
  <div
    ref="rootEl"
    class="weburz-youtube-carousel"
  >
    <EmbedCarousel
      v-bind="sharedProps"
      :captions="captions"
      :active-index="activeIndex"
      :active-caption="activeCaption"
      @select="onSelect"
    >
      <!-- Forward every named slot (heading, prevIcon, nextIcon) untouched;
           the default slot is the slides below. -->
      <template
        v-for="name in Object.keys($slots).filter(slot => slot !== 'default')"
        #[name]="slotProps"
      >
        <slot
          :name="name"
          v-bind="slotProps"
        />
      </template>
      <BaseSlide
        v-for="video in videos"
        :key="video.id"
      >
        <div :class="['weburz-yt', `weburz-yt--${video.kind ?? 'video'}`]">
          <EmbedFacade
            v-if="isThumbnail(video)"
            class="weburz-yt__facade"
            :label="`Play ${captionTitle(video) ?? `YouTube ${video.kind ?? 'video'}`}`"
            :thumbnail="thumbnailUrl(video)"
            :alt="captionTitle(video) ?? ''"
            @activate="activateFacade(video)"
            @thumbnail-error="onThumbnailError(video)"
          >
            <template #icon>
              <svg
                viewBox="0 0 68 48"
                width="68"
                height="48"
              >
                <path
                  fill="currentColor"
                  d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                />
                <path
                  d="M45 24 27 14v20"
                  fill="#fff"
                />
              </svg>
            </template>
          </EmbedFacade>
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
          v-bind="slideCaption(video)"
        />
      </BaseSlide>
    </EmbedCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type {
  CaptionsMode,
  SlideCaption,
  YouTubeCarouselMode,
  YouTubeVideo,
} from '../types'
import { useEmbedMetadata } from '../composables/useEmbedMetadata'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'
import { useYouTubeMedia } from '../composables/useYouTubeMedia'
import { youtubeWatchUrl } from '../utils/embeds'
import { carouselSharedProps, pickCarouselSharedProps } from '../utils/carouselProps'
import CarouselCaption from './CarouselCaption.vue'
import EmbedCarousel from './EmbedCarousel.vue'
import EmbedFacade from './EmbedFacade.vue'

const props = defineProps({
  ...carouselSharedProps,
  videos: { type: Array as PropType<YouTubeVideo[]>, required: true },
  mode: { type: String as PropType<YouTubeCarouselMode>, default: 'facade' },
  nocookie: { type: Boolean, default: true },
  autoplayOnScroll: { type: Boolean, default: false },
  pauseOnLeave: { type: Boolean, default: true },
  onScrollAway: { type: String as PropType<'mute' | 'pause' | 'none'>, default: 'mute' },
  /**
   * Per-item text display: under every slide ('per-slide'), one heading-area
   * block showing the active slide's title/description ('active'), or none.
   * Carousel-level `title`/`description` props are independent of this.
   */
  captions: { type: String as PropType<CaptionsMode>, default: 'per-slide' },
  fetchMetadata: { type: Boolean, default: true },
})

const sharedProps = computed(() => pickCarouselSharedProps(props))

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

const slideCaption = (video: YouTubeVideo): SlideCaption => ({
  title: captionTitle(video),
  href: captionHref(video),
  description: video.description,
})

const fetchMissingMetadata = () => {
  if (!props.fetchMetadata || props.captions === 'none') return
  for (const video of props.videos) {
    if (video.title) continue
    forYouTube(video.id).then((meta) => {
      if (meta?.title) fetchedTitles.value[video.id] = meta.title
    })
  }
}

if (import.meta.client) watch(() => props.videos, fetchMissingMetadata, { immediate: true })

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const activeCaption = computed(() => {
  const video = props.videos[activeIndex.value]
  return video ? slideCaption(video) : undefined
})

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

/* Facade: maps the public --weburz-yt-* tokens onto EmbedFacade's generic
   --weburz-facade-* vars. */
.weburz-yt__facade {
  --weburz-facade-play-size: var(--weburz-yt-play-size, 4.25rem);
  --weburz-facade-play-bg: var(--weburz-yt-play-bg, rgb(0 0 0 / 0.7));
  --weburz-facade-play-bg-hover: var(--weburz-yt-play-bg-hover, #f03);
}
</style>
