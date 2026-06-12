<template>
  <div class="weburz-carousel__slide">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'

const slidesPerView = inject<Ref<number>>(
  'weburz-carousel-slides-per-view',
  ref(1),
)

// Exposed to CSS as a plain number so all sizing math happens in calc() —
// that lets `--weburz-carousel-slides` (settable from consumer CSS, media
// queries included) take precedence over the prop. Sizing decided in CSS is
// SSR-correct: a JS-driven slidesPerView (e.g. from useMediaQuery) can't be
// known on the server and causes a visible width snap on hydration.
const slideCount = computed(() => String(slidesPerView.value))
</script>

<style scoped>
.weburz-carousel__slide {
  flex-grow: 0;
  flex-shrink: 0;
  /* Slides EXACTLY fill the viewport with the configured gap between them.
     For N slides per view with gap G:
       N * basis + (N - 1) * G = 100%
       basis = (100% - (N - 1) * G) / N
     For N = 1 the formula reduces to 100%. */
  flex-basis: calc(
    (
        100% - (var(--weburz-carousel-slides, v-bind(slideCount)) - 1) *
          var(--weburz-carousel-slide-gap, 1rem)
      ) /
      var(--weburz-carousel-slides, v-bind(slideCount))
  );
  min-width: 0;
}
</style>
