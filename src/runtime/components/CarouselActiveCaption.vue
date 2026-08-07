<template>
  <!-- Keying CarouselCaption inside the Transition swaps the block with a
       fade-out/fade-in (mode="out-in") whenever the active slide changes. -->
  <Transition
    name="weburz-fade"
    mode="out-in"
  >
    <CarouselCaption
      :key="activeKey"
      variant="active"
      :title="title"
      :href="href"
      :description="description"
    />
  </Transition>
</template>

<script setup lang="ts">
import CarouselCaption from './CarouselCaption.vue'

interface Props {
  /** Changes with the active slide so the fade animation re-triggers. */
  activeKey: string | number
  title?: string
  href?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  href: undefined,
  description: undefined,
})
</script>
