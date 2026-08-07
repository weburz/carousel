import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { YouTubeCarouselMode, YouTubeVideo } from '../types'
import { buildYouTubeEmbedUrl, defaultYouTubeThumbnailUrl } from '../utils/embeds'
import { useFacadeActivation } from './useFacadeActivation'
import { useFrameRegistry } from './useFrameRegistry'
import { useYouTubePlayer } from './useYouTubePlayer'

/**
 * YouTube embeds are the only platform with a working control channel, and it
 * splits across two transports: the IFrame Player API ('player-api' mode) and
 * the postMessage widget protocol ('facade' / 'iframe-embed' modes). This
 * composable owns that whole lifecycle — facade activation, thumbnail
 * fallbacks, iframe binding + listening handshake, player registration, and
 * play/pause/mute/unmute dispatch — so the component stays declarative.
 */

const sendListening = (frame: HTMLIFrameElement, id: string) => {
  // YouTube only reliably accepts postMessage commands once the parent has
  // sent a "listening" handshake. Without this, mute/pause work intermittently.
  const handshake = () => {
    frame.contentWindow?.postMessage(
      JSON.stringify({
        event: 'listening',
        id: `weburz-${id}`,
        channel: 'widget',
      }),
      '*',
    )
  }
  frame.addEventListener('load', handshake, { once: true })
  handshake()
}

const sendIframeCommand = (frame: HTMLIFrameElement, func: string) => {
  frame.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args: [] }),
    '*',
  )
}

type ControlAction = 'play' | 'pause' | 'mute' | 'unmute'

const IFRAME_COMMANDS: Record<ControlAction, string> = {
  play: 'playVideo',
  pause: 'pauseVideo',
  mute: 'mute',
  unmute: 'unMute',
}

export const useYouTubeMedia = (
  mode: MaybeRefOrGetter<YouTubeCarouselMode>,
  nocookie: MaybeRefOrGetter<boolean>,
) => {
  const { isActivated, activate, deactivate } = useFacadeActivation<string>()
  const { bind: bindFrame, get: getFrame, remove: removeFrame } = useFrameRegistry<string>()
  const { register, play, pause, mute, unmute } = useYouTubePlayer()

  const playerElements = new Map<string, HTMLElement>()
  const registeredPlayers = new Set<string>()
  const thumbnailFallbacks = ref<Record<string, string>>({})

  const embedUrl = (video: YouTubeVideo) =>
    buildYouTubeEmbedUrl(video.id, {
      nocookie: toValue(nocookie),
      // A facade iframe only exists because the user tapped play — start
      // immediately so the facade tap counts as the play gesture.
      autoplay: toValue(mode) === 'facade',
    })

  // Keyless thumbnails: i.ytimg.com serves them for every video. Shorts get
  // the portrait variant (oar2) with a fallback to hqdefault, since oar2
  // isn't generated for older uploads.
  const thumbnailUrl = (video: YouTubeVideo) =>
    thumbnailFallbacks.value[video.id]
    ?? video.thumbnail
    ?? defaultYouTubeThumbnailUrl(video.id, video.kind ?? 'video')

  const onThumbnailError = (video: YouTubeVideo) => {
    const fallback = defaultYouTubeThumbnailUrl(video.id)
    if (thumbnailUrl(video) !== fallback) {
      thumbnailFallbacks.value[video.id] = fallback
    }
  }

  // Facade slides render as a thumbnail button until the user taps play.
  const isThumbnail = (video: YouTubeVideo) =>
    toValue(mode) === 'facade' && !isActivated(video.id)

  const activateFacade = (video: YouTubeVideo) => activate(video.id)

  // Activated facade slides have swapped their thumbnail for a live iframe.
  // Deactivating destroys the iframe (hard-stops playback) and brings the
  // facade back.
  const deactivateFacade = (video: YouTubeVideo) => {
    if (!isActivated(video.id)) return
    deactivate(video.id)
    removeFrame(video.id)
  }

  const bindIframe = (el: unknown, video: YouTubeVideo) => {
    bindFrame(el, video.id, frame => sendListening(frame, video.id))
  }

  const bindPlayer = (el: HTMLElement | null, video: YouTubeVideo) => {
    // Vue's inline function refs fire null callbacks on every re-render even
    // when the element hasn't really gone away. Ignoring null avoids losing
    // the entry.
    if (!el) return
    playerElements.set(video.id, el)
    if (registeredPlayers.has(video.id)) return
    if (toValue(mode) !== 'player-api' || !import.meta.client) return
    registeredPlayers.add(video.id)
    register(el, video.id, { nocookie: toValue(nocookie) }).catch(() => {
      registeredPlayers.delete(video.id)
    })
  }

  // Dispatch play/pause/mute/unmute over whichever transport the mode uses.
  const playerControls = { play, pause, mute, unmute }

  const control = (video: YouTubeVideo, action: ControlAction) => {
    if (toValue(mode) === 'player-api') {
      const element = playerElements.get(video.id)
      if (element) playerControls[action](element)
      return
    }
    const frame = getFrame(video.id)
    if (frame) sendIframeCommand(frame, IFRAME_COMMANDS[action])
  }

  const playVideo = (video: YouTubeVideo) => control(video, 'play')
  const pauseVideo = (video: YouTubeVideo) => control(video, 'pause')
  const muteVideo = (video: YouTubeVideo) => control(video, 'mute')
  const unmuteVideo = (video: YouTubeVideo) => control(video, 'unmute')

  /** The slide's natural "stopped" state: facade → thumbnail, otherwise pause. */
  const stopVideo = (video: YouTubeVideo) => {
    if (toValue(mode) === 'facade') deactivateFacade(video)
    else pauseVideo(video)
  }

  return {
    embedUrl,
    thumbnailUrl,
    onThumbnailError,
    isThumbnail,
    activateFacade,
    deactivateFacade,
    bindIframe,
    bindPlayer,
    playVideo,
    pauseVideo,
    muteVideo,
    unmuteVideo,
    stopVideo,
  }
}
