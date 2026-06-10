export interface EmbedMetadata {
  title?: string
  authorName?: string
  thumbnailUrl?: string
}

interface OEmbedResponse {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

// Module-level cache: every carousel instance shares one in-flight request per
// URL, and repeat mounts (SPA navigation) don't refetch.
const cache = new Map<string, Promise<EmbedMetadata | null>>()

const fetchOEmbed = (endpoint: string): Promise<EmbedMetadata | null> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }
  const cached = cache.get(endpoint)
  if (cached) {
    return cached
  }
  const request = fetch(endpoint)
    .then(res => (res.ok ? (res.json() as Promise<OEmbedResponse>) : null))
    .then(data =>
      data
        ? {
            title: data.title,
            authorName: data.author_name,
            thumbnailUrl: data.thumbnail_url,
          }
        : null,
    )
    .catch(() => null)
  cache.set(endpoint, request)
  return request
}

/**
 * Fetches title/author/thumbnail for a video from the platform's public
 * oEmbed endpoint (CORS-enabled, no auth). Supported: YouTube, TikTok.
 * Instagram's oEmbed requires a Facebook app token, so it is not offered here —
 * pass Instagram titles explicitly instead.
 */
export const useEmbedMetadata = () => {
  const forYouTube = (videoId: string): Promise<EmbedMetadata | null> => {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
    return fetchOEmbed(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    )
  }

  const forTikTok = (videoUrl: string): Promise<EmbedMetadata | null> =>
    fetchOEmbed(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`)

  return {
    forYouTube,
    forTikTok,
  }
}
