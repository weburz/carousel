export interface YouTubeVideo {
  id: string
  kind?: 'video' | 'shorts'
  /** Caption title. Omit to auto-fetch it from YouTube (when `fetchMetadata` is on). */
  title?: string
  /** Caption text shown under the title. */
  description?: string
  /** Caption link target. Defaults to the watch/shorts URL derived from `id`. */
  url?: string
}

export type YouTubeCarouselMode = 'iframe-embed' | 'player-api'

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
