import emblaCarouselVue from 'embla-carousel-vue'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import { ref, watch, type MaybeRef } from 'vue'

export const useCarousel = (
  // Refs pass straight through to embla-carousel-vue, which watches them and
  // re-initializes on change — so option/plugin props stay live, not
  // captured once at setup.
  options?: MaybeRef<EmblaOptionsType>,
  plugins?: MaybeRef<EmblaPluginType[]>,
) => {
  const [carouselRef, emblaApi] = emblaCarouselVue(options, plugins)

  const activeIndex = ref(0)
  const slideCount = ref(0)
  const canScrollPrev = ref(false)
  const canScrollNext = ref(false)

  watch(
    emblaApi,
    (api) => {
      if (!api) return
      const sync = () => {
        activeIndex.value = api.selectedScrollSnap()
        slideCount.value = api.scrollSnapList().length
        canScrollPrev.value = api.canScrollPrev()
        canScrollNext.value = api.canScrollNext()
      }
      sync()
      api.on('select', sync)
      api.on('reInit', sync)
    },
    { immediate: true },
  )

  const next = () => emblaApi.value?.scrollNext()
  const prev = () => emblaApi.value?.scrollPrev()
  const scrollTo = (index: number) => emblaApi.value?.scrollTo(index)

  return {
    carouselRef,
    emblaApi,
    activeIndex,
    slideCount,
    canScrollPrev,
    canScrollNext,
    next,
    prev,
    scrollTo,
  }
}
