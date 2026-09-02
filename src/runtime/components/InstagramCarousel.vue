<template>
  <div
    ref="rootEl"
    class="weburz-instagram-carousel"
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
        v-for="(post, index) in posts"
        :key="post.url"
      >
        <div class="weburz-instagram-media">
          <iframe
            :ref="(el: unknown) => bindIframe(el, index)"
            class="weburz-instagram-embed"
            :src="buildInstagramEmbedUrl(post.url)"
            :title="post.title ?? `Instagram post ${index + 1}`"
            loading="lazy"
            frameborder="0"
            scrolling="no"
            allowtransparency="true"
            allow="encrypted-media"
          />
          <button
            v-if="tapToInteract && unlockedIndex !== index"
            type="button"
            class="weburz-instagram-overlay"
            :aria-label="`Interact with ${post.title ?? `Instagram post ${index + 1}`}`"
            @click="unlock(index)"
          />
        </div>
        <CarouselCaption
          v-if="captions === 'per-slide' && (post.title || post.description)"
          v-bind="slideCaption(post)"
        />
      </BaseSlide>
    </EmbedCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { CaptionsMode, InstagramPost, SlideCaption } from '../types'
import { useFrameRegistry } from '../composables/useFrameRegistry'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'
import { buildInstagramEmbedUrl } from '../utils/embeds'
import { carouselSharedProps, pickCarouselSharedProps } from '../utils/carouselProps'
import CarouselCaption from './CarouselCaption.vue'
import EmbedCarousel from './EmbedCarousel.vue'

const props = defineProps({
  ...carouselSharedProps,
  posts: { type: Array as PropType<InstagramPost[]>, required: true },
  pauseOnLeave: { type: Boolean, default: true },
  // Instagram has no postMessage control API. The only way to halt a reel is
  // to unload the iframe (about:blank), which forces it to reload when the user
  // scrolls back into view. Default to "pause" because "audio keeps playing
  // while user scrolls elsewhere" is a worse UX than "video restarts on return".
  onScrollAway: { type: String as PropType<'pause' | 'none'>, default: 'pause' },
  /**
   * Cover each embed with a transparent layer so touch-drags reach the
   * carousel instead of dying inside Instagram's cross-origin iframe (touches
   * that start on an iframe never reach the page — without this, the carousel
   * cannot be hand-swiped on mobile). Tapping the layer unlocks the post for
   * interaction; it locks again when the active slide changes.
   */
  tapToInteract: { type: Boolean, default: true },
  /**
   * Per-item text display: under every slide ('per-slide'), one heading-area
   * block showing the active slide's title/description ('active'), or none.
   * Text comes from `posts[].title` / `posts[].description` only — Instagram
   * has no public metadata API to auto-fetch from.
   */
  captions: { type: String as PropType<CaptionsMode>, default: 'per-slide' },
})

const sharedProps = computed(() => pickCarouselSharedProps(props))

const slideCaption = (post: InstagramPost): SlideCaption => ({
  title: post.title,
  href: post.url,
  description: post.description,
})

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const activeCaption = computed(() => {
  const post = props.posts[activeIndex.value]
  return post ? slideCaption(post) : undefined
})

// IG has no postMessage control API, so pause = park the iframe (src → about:blank).
// On scroll-back / swipe-back the original src is restored, which causes a brief
// reload of the embed. Acceptable trade-off; opt out via prop if it bothers you.

const { bind: bindIframe, park, restore, parkAll, restoreAll } = useFrameRegistry<number>()

// Embla cancels the click that follows a drag, so dragging across the overlay
// never accidentally unlocks a post.
const unlockedIndex = ref<number | null>(null)
const unlock = (index: number) => {
  unlockedIndex.value = index
}

const onSelect = (index: number) => {
  const previousIndex = activeIndex.value
  activeIndex.value = index
  unlockedIndex.value = null
  if (!props.pauseOnLeave) return
  park(previousIndex)
  restore(index)
}

useScrollAwayHandler(
  rootEl,
  () => {
    if (props.onScrollAway !== 'pause') return
    parkAll()
  },
  () => {
    restoreAll()
  },
)
</script>

<style scoped>
.weburz-instagram-carousel {
  width: 100%;
}

/* The wrapper owns the box so the tap-to-interact overlay can cover the
   iframe exactly. */
.weburz-instagram-media {
  position: relative;
  margin: var(--weburz-carousel-media-margin, 0) auto;
  width: 100%;
  max-width: var(--weburz-instagram-max-width, 22rem);
  aspect-ratio: var(--weburz-instagram-aspect, 9 / 16);
}

.weburz-instagram-embed {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--weburz-instagram-bg, #fff);
  border: var(--weburz-instagram-border, var(--weburz-carousel-media-border, none));
  border-radius: var(--weburz-instagram-radius, var(--weburz-carousel-media-radius, 0.5rem));
  box-shadow: var(--weburz-instagram-shadow, var(--weburz-carousel-media-shadow, none));
}

/* Invisible by design: it exists to receive the touch so Embla can drag.
   A tap (no drag) hands the post over for real interaction. */
.weburz-instagram-overlay {
  position: absolute;
  inset: 0;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: var(--weburz-instagram-radius, var(--weburz-carousel-media-radius, 0.5rem));
  cursor: pointer;
}

.weburz-instagram-overlay:focus-visible {
  outline: 2px solid var(--weburz-carousel-accent, currentColor);
  outline-offset: 2px;
}
</style>
