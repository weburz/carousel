import type { ExtractPublicPropTypes, PropType } from 'vue'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import type { AsidePosition, SlidesPerView } from '../types'

/**
 * Presentation surface shared by BaseCarousel and every platform wrapper —
 * types AND defaults in one runtime object that each component spreads into
 * `defineProps(...)`. A runtime object (rather than `withDefaults` on a type)
 * because the module builder cannot emit non-literal `withDefaults` defaults:
 * it drops the `mergeDefaults` import and the published component crashes.
 */
export const carouselSharedProps = {
  /** Embla options passed through live (the prop is watched, not captured). */
  options: { type: Object as PropType<EmblaOptionsType>, default: () => ({}) },
  /** Embla plugins, passed through live the same way. */
  plugins: { type: Array as PropType<EmblaPluginType[]>, default: () => [] },
  /** Slides visible at once — a plain number or an SSR-safe breakpoint map. */
  slidesPerView: { type: [Number, Object] as PropType<SlidesPerView>, default: 1 },
  /** Render prev/next arrows. Hidden automatically for a single-snap carousel. */
  showArrows: { type: Boolean, default: true },
  /** Render dot navigation. */
  showDots: { type: Boolean, default: true },
  /** Where the arrows sit: flanking the dots ('below') or beside the stage ('sides'). */
  arrowPosition: { type: String as PropType<'sides' | 'below'>, default: 'below' },
  /** 'stacked' (column) or 'aside' (heading+nav in a side column on wide frames). */
  layout: { type: String as PropType<'stacked' | 'aside'>, default: 'stacked' },
  /** Which side the aside column sits on. Only meaningful with `layout: 'aside'`. */
  asidePosition: { type: String as PropType<AsidePosition>, default: 'left' },
  /** Heading title. Also the accessible name when `ariaLabel` is omitted. */
  title: { type: String, default: undefined },
  /** Heading description rendered under the title. */
  description: { type: String, default: undefined },
  /** Accessible name for the carousel region, overriding the title fallback. */
  ariaLabel: { type: String, default: undefined },
}

/** External (consumer-facing) shape of the shared props: every key optional. */
export type CarouselSharedProps = ExtractPublicPropTypes<typeof carouselSharedProps>

const sharedKeys = Object.keys(carouselSharedProps) as (keyof CarouselSharedProps)[]

/** The shared subset of a wrapper's props, for `v-bind` onto the inner carousel. */
export const pickCarouselSharedProps = (props: CarouselSharedProps): CarouselSharedProps =>
  Object.fromEntries(sharedKeys.map(key => [key, props[key]])) as CarouselSharedProps
