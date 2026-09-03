<template>
  <BaseSlide
    v-for="slide in slides"
    :key="slide.id"
  >
    <div
      :class="['slide-card', size && `slide-card--${size}`]"
      :style="{ background: slide.color }"
    >
      {{ slide.label }}{{ suffix }}
    </div>
  </BaseSlide>
</template>

<script setup lang="ts">
import type { DemoSlide } from '~/utils/demoSlides'

withDefaults(defineProps<{
  slides: DemoSlide[]
  size?: 'tall' | 'short'
  suffix?: string
}>(), {
  suffix: '',
})
</script>
