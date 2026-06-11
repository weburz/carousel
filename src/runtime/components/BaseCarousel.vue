<template>
  <section
    :class="[
      'weburz-carousel',
      `weburz-carousel--${layout}`,
      layout === 'aside' && `weburz-carousel--aside-${asidePosition}`,
    ]"
    aria-roledescription="carousel"
    :aria-label="ariaLabel ?? title"
  >
    <header
      v-if="$slots.heading || title || description"
      class="weburz-carousel__heading"
    >
      <slot
        name="heading"
        :active-index="activeIndex"
        :slide-count="slideCount"
      >
        <h2
          v-if="title"
          class="weburz-carousel__title"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="weburz-carousel__description"
        >
          {{ description }}
        </p>
      </slot>
    </header>

    <div :class="['weburz-carousel__stage', `weburz-carousel__stage--arrows-${arrowPosition}`]">
      <div
        ref="carouselRef"
        class="weburz-carousel__viewport"
      >
        <div class="weburz-carousel__container">
          <slot
            :active-index="activeIndex"
            :slide-count="slideCount"
          />
        </div>
      </div>

      <div
        v-if="showArrowControls && arrowPosition === 'sides'"
        class="weburz-carousel__arrows"
      >
        <button
          type="button"
          class="weburz-carousel__arrow weburz-carousel__arrow--prev"
          :disabled="!canScrollPrev"
          aria-label="Previous slide"
          @click="prev"
        >
          <slot name="prevIcon">
            &lsaquo;
          </slot>
        </button>
        <button
          type="button"
          class="weburz-carousel__arrow weburz-carousel__arrow--next"
          :disabled="!canScrollNext"
          aria-label="Next slide"
          @click="next"
        >
          <slot name="nextIcon">
            &rsaquo;
          </slot>
        </button>
      </div>
    </div>

    <div
      v-if="(showArrowControls && arrowPosition === 'below') || (showDots && slideCount > 1)"
      class="weburz-carousel__nav"
    >
      <button
        v-if="showArrowControls && arrowPosition === 'below'"
        type="button"
        class="weburz-carousel__arrow weburz-carousel__arrow--prev"
        :disabled="!canScrollPrev"
        aria-label="Previous slide"
        @click="prev"
      >
        <slot name="prevIcon">
          &lsaquo;
        </slot>
      </button>

      <div
        v-if="showDots && slideCount > 1"
        class="weburz-carousel__dots"
        role="tablist"
      >
        <button
          v-for="i in slideCount"
          :key="i - 1"
          type="button"
          class="weburz-carousel__dot"
          role="tab"
          :class="{ 'is-active': activeIndex === i - 1 }"
          :aria-selected="activeIndex === i - 1"
          :aria-label="`Go to slide ${i}`"
          @click="scrollTo(i - 1)"
        />
      </div>

      <button
        v-if="showArrowControls && arrowPosition === 'below'"
        type="button"
        class="weburz-carousel__arrow weburz-carousel__arrow--next"
        :disabled="!canScrollNext"
        aria-label="Next slide"
        @click="next"
      >
        <slot name="nextIcon">
          &rsaquo;
        </slot>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, provide, toRef, watch } from 'vue'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import { useCarousel } from '../composables/useCarousel'

interface Props {
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

const emit = defineEmits<{
  select: [index: number]
}>()

provide('weburz-carousel-slides-per-view', toRef(props, 'slidesPerView'))

const {
  carouselRef,
  activeIndex,
  slideCount,
  canScrollPrev,
  canScrollNext,
  next,
  prev,
  scrollTo,
} = useCarousel(props.options, props.plugins)

watch(activeIndex, i => emit('select', i))

// Arrows are pointless with a single scroll position, so hide them once Embla
// reports one. slideCount is 0 until Embla initializes (and during SSR) —
// keep arrows in that state so multi-slide carousels don't get a nav pop-in
// after hydration; only a confirmed single-snap carousel drops them.
const showArrowControls = computed(
  () => props.showArrows && slideCount.value !== 1,
)
</script>

<style scoped>
.weburz-carousel {
  display: flex;
  flex-direction: column;
  gap: var(--weburz-carousel-gap, 1rem);
}

/* Aside layout: heading + nav cluster beside the carousel (left by default,
   right via asidePosition). Only kicks in on wider frames; below the
   breakpoint it stays stacked.
   (CSS vars can't drive media queries, so the breakpoint is fixed.) */
@media (min-width: 768px) {
  .weburz-carousel--aside {
    display: grid;
    grid-template-columns: var(--weburz-carousel-aside-column, minmax(12rem, 1fr)) minmax(0, var(--weburz-carousel-aside-stage, 2fr));
    /* 1fr filler rows above and below keep the heading + nav cluster
       vertically centered against the stage. */
    grid-template-rows: 1fr auto auto 1fr;
    grid-template-areas:
      ".       stage"
      "heading stage"
      "nav     stage"
      ".       stage";
    column-gap: var(--weburz-carousel-aside-gap, 2.5rem);
    row-gap: 0;
  }

  .weburz-carousel--aside-right {
    grid-template-columns: minmax(0, var(--weburz-carousel-aside-stage, 2fr)) var(--weburz-carousel-aside-column, minmax(12rem, 1fr));
    grid-template-areas:
      "stage ."
      "stage heading"
      "stage nav"
      "stage .";
  }

  .weburz-carousel--aside .weburz-carousel__heading {
    grid-area: heading;
  }

  .weburz-carousel--aside .weburz-carousel__nav {
    grid-area: nav;
    margin-top: var(--weburz-carousel-gap, 1rem);
    justify-content: flex-start;
  }

  .weburz-carousel--aside .weburz-carousel__stage {
    grid-area: stage;
    align-self: center;
  }
}

.weburz-carousel__title {
  margin: 0;
  font-size: var(--weburz-carousel-title-size, 1.375rem);
  font-weight: var(--weburz-carousel-title-weight, 600);
  color: var(--weburz-carousel-title-color, inherit);
}

.weburz-carousel__description {
  margin: 0.375rem 0 0;
  font-size: var(--weburz-carousel-description-size, 0.9375rem);
  color: var(--weburz-carousel-description-color, inherit);
  opacity: var(--weburz-carousel-description-opacity, 0.65);
}

.weburz-carousel__stage {
  position: relative;
}

.weburz-carousel__viewport {
  overflow: hidden;
}

.weburz-carousel__container {
  display: flex;
  gap: var(--weburz-carousel-slide-gap, 1rem);
}

.weburz-carousel__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--weburz-carousel-nav-gap, 1rem);
}

/* Sides mode: reserve horizontal space outside the viewport so the arrows live
   beside the slide content, not on top of it. */
.weburz-carousel__stage--arrows-sides {
  padding-inline: var(--weburz-carousel-arrow-space, 3rem);
}

.weburz-carousel__stage--arrows-sides .weburz-carousel__arrows {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.weburz-carousel__stage--arrows-sides .weburz-carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
}

.weburz-carousel__stage--arrows-sides .weburz-carousel__arrow--prev {
  left: calc((var(--weburz-carousel-arrow-space, 3rem) - var(--weburz-carousel-arrow-size, 2.5rem)) / 2);
}

.weburz-carousel__stage--arrows-sides .weburz-carousel__arrow--next {
  right: calc((var(--weburz-carousel-arrow-space, 3rem) - var(--weburz-carousel-arrow-size, 2.5rem)) / 2);
}

.weburz-carousel__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--weburz-carousel-arrow-size, 2rem);
  height: var(--weburz-carousel-arrow-size, 2rem);
  border: var(--weburz-carousel-arrow-border, none);
  background: var(--weburz-carousel-arrow-bg, transparent);
  color: var(--weburz-carousel-arrow-color, currentColor);
  border-radius: var(--weburz-carousel-arrow-radius, 0.25rem);
  cursor: pointer;
  font-size: var(--weburz-carousel-arrow-font-size, 1.5rem);
  line-height: 1;
  padding: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.weburz-carousel__arrow:hover:not(:disabled) {
  opacity: 0.85;
}

.weburz-carousel__arrow:active:not(:disabled) {
  opacity: 0.55;
}

.weburz-carousel__arrow:focus-visible {
  outline: 2px solid var(--weburz-carousel-accent, currentColor);
  outline-offset: 2px;
}

.weburz-carousel__arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.weburz-carousel__dots {
  display: flex;
  gap: var(--weburz-carousel-dot-gap, 0.5rem);
  justify-content: center;
}

.weburz-carousel__dot {
  width: var(--weburz-carousel-dot-size, 0.625rem);
  height: var(--weburz-carousel-dot-size, 0.625rem);
  border-radius: var(--weburz-carousel-dot-radius, 50%);
  border: none;
  background: var(--weburz-carousel-dot-color, currentColor);
  opacity: var(--weburz-carousel-dot-opacity, 0.3);
  padding: 0;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.3s ease, background 0.3s ease;
}

.weburz-carousel__dot.is-active {
  opacity: 1;
  background: var(--weburz-carousel-dot-active-color, var(--weburz-carousel-accent, currentColor));
  transform: scale(var(--weburz-carousel-dot-active-scale, 1));
}
</style>
