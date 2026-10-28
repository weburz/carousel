/**
 * Pure embed-URL builders, one per platform. Kept free of DOM/props so the
 * query-stripping (Instagram) and keyless-thumbnail (YouTube) behavior is
 * unit-testable without a browser.
 */

/**
 * YouTube iframe embed URL. `autoplay` is only set by facade mode, where the
 * iframe exists because the user tapped play — the tap counts as the gesture.
 */
export const buildYouTubeEmbedUrl = (
  id: string,
  options: {
    nocookie: boolean
    autoplay?: boolean
  },
): string => {
  const host = options.nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com'
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
  })
  if (options.autoplay) {
    params.set('autoplay', '1')
  }
  return `https://${host}/embed/${id}?${params}`
}

/** Watch-page URL for caption links: shorts get the portrait short. */
export const youtubeWatchUrl = (
  id: string,
  kind: 'video' | 'shorts' = 'video',
  url?: string,
): string =>
  url
  ?? (kind === 'shorts'
    ? `https://www.youtube.com/shorts/${id}`
    : `https://www.youtube.com/watch?v=${id}`)

/** Keyless thumbnail default: i.ytimg.com serves every video. */
export const defaultYouTubeThumbnailUrl = (
  id: string,
  kind: 'video' | 'shorts' = 'video',
): string =>
  kind === 'shorts'
    ? `https://i.ytimg.com/vi/${id}/oar2.jpg`
    : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/**
 * TikTok /embed/v2/ iframe URL for a share link. The embed endpoint keys on
 * the numeric video id, which the share link carries in its path.
 */
export const buildTikTokEmbedUrl = (postUrl: string): string => {
  const id = postUrl.match(/\/video\/(\d+)/)?.[1] ?? ''
  return `https://www.tiktok.com/embed/v2/${id}`
}

/**
 * TikTok player/v1 URL that renders the video's cover frame without playing
 * it — the facade's preview when no thumbnail image is available (TikTok's
 * oEmbed stopped returning `thumbnail_url`). All player chrome is off: the
 * facade draws its own play button on top. Undefined when the share link
 * carries no video id, so callers render nothing rather than a broken frame.
 */
export const buildTikTokPreviewUrl = (postUrl: string): string | undefined => {
  const id = postUrl.match(/\/video\/(\d+)/)?.[1]
  if (!id) return undefined
  const params = new URLSearchParams({
    autoplay: '0',
    controls: '0',
    progress_bar: '0',
    play_button: '0',
    volume_control: '0',
    fullscreen_button: '0',
    timestamp: '0',
    music_info: '0',
    description: '0',
    rel: '0',
    native_context_menu: '0',
    closed_caption: '0',
  })
  return `https://www.tiktok.com/player/v1/${id}?${params}`
}

/**
 * Instagram direct-embed URL (bypasses embed.js entirely). /embed/captioned/
 * rather than /embed/: the captionless variant responds with
 * X-Frame-Options: DENY and refuses to render inside iframes.
 *
 * Share links carry query trackers (?igsh=…, ?utm_source=…) that would end up
 * mid-path if appended to the raw string — rebuild from origin + pathname so
 * no tracking params leak into the embed URL.
 */
export const buildInstagramEmbedUrl = (shareUrl: string): string => {
  try {
    const { origin, pathname } = new URL(shareUrl)
    const base = pathname.endsWith('/') ? pathname : `${pathname}/`
    return `${origin}${base}embed/captioned/`
  }
  catch {
    const trimmed = shareUrl.endsWith('/') ? shareUrl : `${shareUrl}/`
    return `${trimmed}embed/captioned/`
  }
}
