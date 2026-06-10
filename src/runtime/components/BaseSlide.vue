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

// Compute basis so the slides EXACTLY fill the viewport with the configured gap
// between them. For N slides per view with gap G:
//   N * basis + (N - 1) * G = 100%
//   basis = (100% - (N - 1) * G) / N
// For N = 1 the formula reduces to 100% (no gaps in view), so short-circuit it.
const flexBasis = computed(() => {
  const n = slidesPerView.value
  if (n <= 1) return '100%'
  return `calc((100% - ${n - 1} * var(--weburz-carousel-slide-gap, 1rem)) / ${n})`
})
</script>

<style scoped>
.weburz-carousel__slide {
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: v-bind(flexBasis);
  min-width: 0;
}
</style>
