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
