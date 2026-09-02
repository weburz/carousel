<template>
  <div
    ref="rootEl"
    class="weburz-tiktok-carousel"
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
        v-for="(video, index) in videos"
        :key="video.url"
      >
        <EmbedFacade
          v-if="mode === 'facade' && !isActivated(index)"
          class="weburz-tiktok-embed weburz-tiktok-facade"
          :label="`Play ${captionTitle(video) ?? `TikTok video ${index + 1}`}`"
          :thumbnail="thumbUrl(video)"
          :alt="captionTitle(video) ?? ''"
          @activate="activate(index)"
        >
          <template #icon>
            <svg
              viewBox="0 0 48 48"
              width="48"
              height="48"
            >
              <circle
                fill="currentColor"
                cx="24"
                cy="24"
                r="24"
              />
              <path
                d="M33 24 19.5 16.2v15.6"
                fill="#fff"
              />
            </svg>
          </template>
        </EmbedFacade>
        <iframe
          v-else
          :ref="(el: unknown) => bindIframe(el, index)"
          class="weburz-tiktok-embed"
          :src="buildTikTokEmbedUrl(video.url)"
          :title="captionTitle(video) ?? `TikTok video ${index + 1}`"
          loading="lazy"
          frameborder="0"
          scrolling="no"
          allow="encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          allowfullscreen
        />
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
import type {
  CarouselSharedProps,
  CaptionsMode,
  SlideCaption,
  TikTokCarouselMode,
  TikTokVideo,
} from '../types'
import { useEmbedMetadata } from '../composables/useEmbedMetadata'
import { useFacadeActivation } from '../composables/useFacadeActivation'
import { useFrameRegistry } from '../composables/useFrameRegistry'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'
import { buildTikTokEmbedUrl } from '../utils/embeds'
import { carouselSharedDefaults, pickCarouselSharedProps } from '../utils/carouselProps'
import CarouselCaption from './CarouselCaption.vue'
import EmbedCarousel from './EmbedCarousel.vue'
import EmbedFacade from './EmbedFacade.vue'

interface Props extends CarouselSharedProps {
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
  captions?: CaptionsMode
  fetchMetadata?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  ...carouselSharedDefaults,
  mode: 'facade',
  pauseOnLeave: true,
  // TikTok's /embed/v2/ iframe does not respond to any documented postMessage
  // protocol from outside the frame. The only way to halt playback is iframe.src
  // nuke, which causes a reload on scroll-back. Default to "pause" because
  // stopping playback is more important than avoiding the reload flicker.
  onScrollAway: 'pause',
  captions: 'none',
  fetchMetadata: true,
})

const sharedProps = computed(() => pickCarouselSharedProps(props))

const { forTikTok } = useEmbedMetadata()
const fetchedTitles = ref<Record<string, string>>({})
const fetchedThumbs = ref<Record<string, string>>({})

const captionTitle = (video: TikTokVideo) =>
  video.title ?? fetchedTitles.value[video.url]

const thumbUrl = (video: TikTokVideo) =>
  video.thumbnail ?? fetchedThumbs.value[video.url]

const slideCaption = (video: TikTokVideo): SlideCaption => ({
  title: captionTitle(video),
  href: video.url,
  description: video.description,
})

const fetchMissingMetadata = () => {
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
}

if (import.meta.client) watch(() => props.videos, fetchMissingMetadata, { immediate: true })

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const activeCaption = computed(() => {
  const video = props.videos[activeIndex.value]
  return video ? slideCaption(video) : undefined
})

const { activated, isActivated, activate, deactivate } = useFacadeActivation<number>()
const { bind: bindIframe, remove: removeIframe, park, restore, parkAll, restoreAll } = useFrameRegistry<number>()

// Facade activation: the thumbnail button swaps for the live iframe (which
// autoplays — TikTok's /embed/v2/ starts on load). Deactivating destroys the
// iframe, hard-stopping playback, and brings the thumbnail back.
const deactivateFacade = (index: number) => {
  if (!isActivated(index)) return
  deactivate(index)
  removeIframe(index)
}

const onSelect = (index: number) => {
  const previousIndex = activeIndex.value
  activeIndex.value = index
  if (!props.pauseOnLeave) return
  if (props.mode === 'facade') {
    deactivateFacade(previousIndex)
    return
  }
  park(previousIndex)
  restore(index)
}

useScrollAwayHandler(
  rootEl,
  () => {
    if (props.onScrollAway !== 'pause') return
    if (props.mode === 'facade') {
      // Destroy rather than about:blank-park: the facade is the natural
      // stopped state, and it stays swipeable when the user scrolls back.
      for (const index of [...activated.value]) deactivateFacade(index)
      return
    }
    parkAll()
  },
  () => {
    if (props.mode === 'facade') return
    restoreAll()
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
   TikTok's player until the user taps.
   Both classes together (rather than one) so this deterministically beats
   both .weburz-tiktok-embed and EmbedFacade's .weburz-facade — equal
   single-class specificity would be injection-order dependent. */
.weburz-tiktok-embed.weburz-tiktok-facade {
  /* The button's children are absolutely positioned, so unlike the iframe
     (intrinsic 300px) it has ZERO intrinsic width — in an auto-sized flex or
     grid track the whole carousel collapses to its nav row's width. Claim the
     embed card's width explicitly; max-width still lets narrow slides shrink
     it. */
  width: var(--weburz-tiktok-max-width, 20.3125rem);
  max-width: 100%;
  background: var(--weburz-tiktok-facade-bg, #000);
  --weburz-facade-play-size: var(--weburz-tiktok-play-size, 3.5rem);
  --weburz-facade-play-bg: var(--weburz-tiktok-play-bg, rgb(0 0 0 / 0.7));
  --weburz-facade-play-bg-hover: var(--weburz-tiktok-play-bg-hover, #fe2c55);
}
</style>
