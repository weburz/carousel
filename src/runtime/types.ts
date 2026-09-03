/** The shared subset of a wrapper's props — types AND defaults live in `carouselSharedProps`. */
export type { CarouselSharedProps } from './utils/carouselProps'

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
