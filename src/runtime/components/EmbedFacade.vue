<template>
  <button
    type="button"
    class="weburz-facade"
    :aria-label="label"
    @click="emit('activate')"
  >
    <img
      v-if="thumbnail"
      class="weburz-facade__thumb"
      :src="thumbnail"
      :alt="alt"
      loading="lazy"
      @error="emit('thumbnailError')"
    >
    <span
      class="weburz-facade__play"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  /** Accessible name for the button. */
  label: string
  thumbnail?: string
  alt?: string
}

withDefaults(defineProps<Props>(), {
  thumbnail: undefined,
  alt: '',
})

const emit = defineEmits<{
  activate: []
  thumbnailError: []
}>()
</script>

<style scoped>
/* A plain element instead of a cross-origin iframe: touches stay on the page
   so Embla drags work, and the heavy player is deferred until tapped. */
.weburz-facade {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  overflow: hidden;
  background: var(--weburz-facade-bg, #000);
  cursor: pointer;
}

.weburz-facade__thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.weburz-facade__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  width: var(--weburz-facade-play-size, 4rem);
  color: var(--weburz-facade-play-bg, rgb(0 0 0 / 0.7));
  filter: drop-shadow(0 1px 4px rgb(0 0 0 / 0.4));
  transition: color 0.15s ease;
  pointer-events: none;
}

/* :deep() — the icon comes through a slot, so it carries the parent's scope id. */
.weburz-facade__play :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.weburz-facade:hover .weburz-facade__play,
.weburz-facade:focus-visible .weburz-facade__play {
  color: var(--weburz-facade-play-bg-hover, var(--weburz-carousel-accent, currentColor));
}
</style>
