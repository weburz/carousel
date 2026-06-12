<template>
  <div
    ref="rootEl"
    class="weburz-instagram-carousel"
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
                v-if="activePost?.title"
                class="weburz-caption__title"
              >
                <a
                  :href="activePost.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{ activePost.title }}</a>
              </h3>
              <p
                v-if="activePost?.description"
                class="weburz-caption__description"
              >
                {{ activePost.description }}
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
        v-for="(post, index) in posts"
        :key="post.url"
      >
        <iframe
          :ref="(el: Element | null) => bindIframe(el, index)"
          class="weburz-instagram-embed"
          :src="buildEmbedUrl(post.url)"
          :title="post.title ?? `Instagram post ${index + 1}`"
          loading="lazy"
          frameborder="0"
          scrolling="no"
          allowtransparency="true"
          allow="encrypted-media"
        />
        <div
          v-if="captions === 'per-slide' && (post.title || post.description)"
          class="weburz-caption"
        >
          <h3
            v-if="post.title"
            class="weburz-caption__title"
          >
            <a
              :href="post.url"
              target="_blank"
              rel="noopener noreferrer"
            >{{ post.title }}</a>
          </h3>
          <p
            v-if="post.description"
            class="weburz-caption__description"
          >
            {{ post.description }}
          </p>
        </div>
      </BaseSlide>
    </BaseCarousel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import type { InstagramPost, SlidesPerView } from '../types'
import { useScrollAwayHandler } from '../composables/useScrollAwayHandler'

interface Props {
  posts: InstagramPost[]
  pauseOnLeave?: boolean
  onScrollAway?: 'pause' | 'none'
  /**
   * Per-item text display: under every slide ('per-slide'), one heading-area
   * block showing the active slide's title/description ('active'), or none.
   * Text comes from `posts[].title` / `posts[].description` only — Instagram
   * has no public metadata API to auto-fetch from.
   */
  captions?: 'none' | 'per-slide' | 'active'
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
  pauseOnLeave: true,
  // Instagram has no postMessage control API. The only way to halt a reel is
  // to unload the iframe (about:blank), which forces it to reload when the user
  // scrolls back into view. Default to "pause" because "audio keeps playing
  // while user scrolls elsewhere" is a worse UX than "video restarts on return".
  onScrollAway: 'pause',
  captions: 'per-slide',
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

const rootEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const activePost = computed(() => props.posts[activeIndex.value])
const iframeEls = new Map<number, HTMLIFrameElement>()
const boundIframes = new Set<number>()

// Instagram's direct embed URL bypasses embed.js entirely — works even when
// content blockers drop instagram.com/embed.js. We use /embed/captioned/ rather
// than /embed/ because the captionless variant responds with
// X-Frame-Options: DENY (refuses to render inside iframes), while the captioned
// variant has no such header. This is the same URL IG's own embed.js resolves to.
const buildEmbedUrl = (url: string): string => {
  // Share links carry query trackers (?igsh=…, ?utm_source=…) that would end up
  // mid-path if we appended to the raw string — rebuild from origin + pathname.
  try {
    const { origin, pathname } = new URL(url)
    const base = pathname.endsWith('/') ? pathname : `${pathname}/`
    return `${origin}${base}embed/captioned/`
  }
  catch {
    const trimmed = url.endsWith('/') ? url : `${url}/`
    return `${trimmed}embed/captioned/`
  }
}

const bindIframe = (el: Element | null, index: number) => {
  if (!el || !(el instanceof HTMLIFrameElement)) return
  iframeEls.set(index, el)
  if (boundIframes.has(index)) return
  boundIframes.add(index)
}

// IG has no postMessage control API, so pause = unload the iframe (src → about:blank).
// On scroll-back / swipe-back the original src is restored, which causes a brief
// reload of the embed. Acceptable trade-off; opt out via prop if it bothers you.
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
.weburz-instagram-carousel {
  width: 100%;
}

.weburz-instagram-embed {
  display: block;
  margin: var(--weburz-carousel-media-margin, 0) auto;
  width: 100%;
  max-width: var(--weburz-instagram-max-width, 22rem);
  aspect-ratio: var(--weburz-instagram-aspect, 9 / 16);
  background: var(--weburz-instagram-bg, #fff);
  border: var(--weburz-instagram-border, var(--weburz-carousel-media-border, none));
  border-radius: var(--weburz-instagram-radius, var(--weburz-carousel-media-radius, 0.5rem));
  box-shadow: var(--weburz-instagram-shadow, var(--weburz-carousel-media-shadow, none));
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
