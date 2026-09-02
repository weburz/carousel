<template>
  <BaseCarousel
    v-bind="sharedProps"
    @select="emit('select', $event)"
  >
    <template
      v-if="$slots.heading || captions === 'active'"
      #heading="headingProps"
    >
      <slot
        name="heading"
        v-bind="headingProps"
      >
        <!-- Keying the caption inside the Transition swaps it with a fade
             (mode="out-in") whenever the active slide changes. -->
        <Transition
          name="weburz-fade"
          mode="out-in"
        >
          <CarouselCaption
            :key="activeIndex"
            variant="active"
            v-bind="activeCaption"
          />
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
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </BaseCarousel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CarouselSharedProps, CaptionsMode, SlideCaption } from '../types'
import { carouselSharedDefaults, pickCarouselSharedProps } from '../utils/carouselProps'
import BaseCarousel from './BaseCarousel.vue'
import CarouselCaption from './CarouselCaption.vue'

interface Props extends CarouselSharedProps {
  captions: CaptionsMode
  activeIndex: number
  activeCaption?: SlideCaption
}

const props = withDefaults(defineProps<Props>(), {
  ...carouselSharedDefaults,
  activeCaption: undefined,
})

const emit = defineEmits<{
  select: [index: number]
}>()

const sharedProps = computed(() => pickCarouselSharedProps(props))
</script>

<style scoped>
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
</style>
