<template>
  <div :class="variant === 'active' ? 'weburz-active-caption' : 'weburz-caption'">
    <h3
      v-if="title"
      class="weburz-caption__title"
    >
      <a
        v-if="href"
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
      >{{ title }}</a>
      <template v-else>
        {{ title }}
      </template>
    </h3>
    <p
      v-if="description"
      class="weburz-caption__description"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  /** Optional link target for the title. Renders plain text when omitted. */
  href?: string
  description?: string
  /** 'below' sits under a slide; 'active' is the heading-area block. */
  variant?: 'below' | 'active'
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  href: undefined,
  description: undefined,
  variant: 'below',
})
</script>

<style scoped>
.weburz-caption {
  margin-top: var(--weburz-carousel-caption-gap, 0.75rem);
  text-align: var(--weburz-carousel-caption-align, center);
}

/* Active captions live in the carousel heading (aside layout), so they align
   to the reading start rather than the slide center. */
.weburz-active-caption {
  text-align: var(--weburz-carousel-active-caption-align, start);
}

.weburz-caption__title,
.weburz-active-caption__title {
  margin: 0;
  font-size: var(--weburz-carousel-caption-title-size, 1rem);
  font-weight: var(--weburz-carousel-caption-title-weight, 600);
}

.weburz-caption__title a,
.weburz-active-caption__title a {
  color: var(--weburz-carousel-caption-title-color, inherit);
  text-decoration: none;
}

.weburz-caption__title a:hover,
.weburz-active-caption__title a:hover {
  text-decoration: underline;
}

.weburz-caption__description,
.weburz-active-caption__description {
  margin: 0.25rem 0 0;
  font-size: var(--weburz-carousel-caption-description-size, 0.875rem);
  color: var(--weburz-carousel-caption-description-color, inherit);
  opacity: var(--weburz-carousel-caption-description-opacity, 0.7);
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
</style>
