import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'

/**
 * Presentation surface shared by BaseCarousel and every platform wrapper.
 * Compound on purpose — wrappers extend this instead of redeclaring the
 * ten forwarding props in each of the four components.
 *
 * `options`/`plugins` pass through to Embla; `slidesPerView`/`layout` and
 * friends only shape the chrome around the viewport.
 */
export interface CarouselSharedProps {
  /** Embla options passed through live (the prop is watched, not captured). */
  options?: EmblaOptionsType
  /** Embla plugins, passed through live the same way. */
  plugins?: EmblaPluginType[]
  /** Slides visible at once — a plain number or an SSR-safe breakpoint map. */
  slidesPerView?: SlidesPerView
  /** Render prev/next arrows. Hidden automatically for a single-snap carousel. */
  showArrows?: boolean
  /** Render dot navigation. */
  showDots?: boolean
  /** Where the arrows sit: flanking the dots ('below') or beside the stage ('sides'). */
  arrowPosition?: 'sides' | 'below'
  /** 'stacked' (column) or 'aside' (heading+nav in a side column on wide frames). */
  layout?: 'stacked' | 'aside'
  /** Which side the aside column sits on. */
  asidePosition?: AsidePosition
  /** Heading title. Also the accessible name when `ariaLabel` is omitted. */
  title?: string
  /** Heading description rendered under the title. */
  description?: string
  /** Accessible name for the carousel region, overriding the title fallback. */
  ariaLabel?: string
}

// `asidePosition` is only valid when `layout: 'aside'`.
export type AsidePosition = 'left' | 'right'

/**
 * Per-item text display: under every slide ('per-slide'), one heading-area
 * block showing the active slide's caption ('active'), or none.
 */
export type CaptionsMode = 'none' | 'per-slide' | 'active'

/** Text block for one slide: rendered under it ('per-slide') or in the heading area ('active'). */
export interface SlideCaption {
  title?: string
  href?: string
  description?: string
}

export interface YouTubeVideo {
  id: string
  kind?: 'video' | 'shorts'
  /** Caption title. Omit to auto-fetch it from YouTube (when `fetchMetadata` is on). */
  title?: string
  /** Caption text shown under the title. */
  description?: string
  /** Caption link target. Defaults to the watch/shorts URL derived from `id`. */
  url?: string
  /**
   * Facade thumbnail override. Defaults to the keyless i.ytimg.com thumbnail
   * (`hqdefault.jpg`, or the portrait `oar2.jpg` for shorts).
   */
  thumbnail?: string
}

/**
 * 'facade' (default) renders the video thumbnail with a play button and only
 * creates the YouTube iframe when tapped — pages load light, and slides stay
 * hand-swipeable on touch devices (touches that start on a cross-origin
 * iframe never reach the page, so an always-on iframe kills Embla dragging).
 * 'iframe-embed' renders all iframes upfront; 'player-api' uses the IFrame
 * Player API for programmatic control (autoplay-on-scroll).
 */
export type YouTubeCarouselMode = 'facade' | 'iframe-embed' | 'player-api'

/** TikTok: 'facade' (default) mirrors the YouTube facade behavior. */
export type TikTokCarouselMode = 'facade' | 'iframe-embed'

export interface InstagramPost {
  url: string
  /**
   * Caption title. Instagram exposes no public metadata API (its oEmbed needs
   * a Facebook app token), so titles are never auto-fetched — set them here.
   */
  title?: string
  /** Caption text shown under the title. */
  description?: string
}

export interface TikTokVideo {
  url: string
  /** Caption title. Omit to auto-fetch it from TikTok (when `fetchMetadata` is on). */
  title?: string
  /** Caption text shown under the title. */
  description?: string
  /**
   * Facade thumbnail override. Omit to auto-fetch it from TikTok's keyless
   * oEmbed endpoint.
   */
  thumbnail?: string
}

/**
 * Slides visible at once. A plain number for static counts; a breakpoint map
 * for viewport-dependent counts. Map keys are `base` (below every breakpoint)
 * plus any CSS `min-width` length (`'48rem'`, `'768px'`), each mapping to the
 * slide count from that width up.
 *
 * The map is rendered as CSS media queries, so the server output is correct
 * for every viewport — unlike JS viewport detection (`useMediaQuery` and
 * friends), which can't run during SSR and snaps the slide width after
 * hydration.
 */
export type SlidesPerView = number | Record<string, number>
