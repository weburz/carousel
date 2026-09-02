import type { CarouselSharedProps } from '../types'

/** Defaults for CarouselSharedProps, spread into every component's withDefaults. */
export const carouselSharedDefaults = {
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
} as const

/** The shared subset of a wrapper's props, for `v-bind` onto the inner carousel. */
export const pickCarouselSharedProps = (props: CarouselSharedProps): CarouselSharedProps => ({
  options: props.options,
  plugins: props.plugins,
  slidesPerView: props.slidesPerView,
  showArrows: props.showArrows,
  showDots: props.showDots,
  arrowPosition: props.arrowPosition,
  layout: props.layout,
  asidePosition: props.asidePosition,
  title: props.title,
  description: props.description,
  ariaLabel: props.ariaLabel,
})
