<template>
  <div
    class="weburz-carousel__slide"
    :style="{ '--weburz-carousel-slide-count': slidesPerView }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'

const slidesPerView = inject<Ref<number>>(
  'weburz-carousel-slides-per-view',
  ref(1),
)
</script>

<style scoped>
.weburz-carousel__slide {
  flex-grow: 0;
  flex-shrink: 0;
  /* The count is written above as an inline custom property (not v-bind() in
     scoped CSS) so the width math happens here in calc() — that's what lets
     the public `--weburz-carousel-slides` (settable from consumer CSS, media
     queries included) win over the prop. The server output already carries
     the right value, so there's no hydration width snap. */
  flex-basis: calc(100% / var(--weburz-carousel-slides, var(--weburz-carousel-slide-count, 1)));
  box-sizing: border-box;
  padding-inline-start: var(--weburz-carousel-slide-gap, 1rem);
  min-width: 0;
}
</style>
