import { onScopeDispose } from 'vue'

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  mute: () => void
  unMute: () => void
  destroy: () => void
  getPlayerState: () => number
}

interface YTPlayerConfig {
  videoId: string
  width?: string | number
  height?: string | number
  host?: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: { target: YTPlayer }) => void
    onStateChange?: (event: { target: YTPlayer, data: number }) => void
  }
}

interface YTNamespace {
  Player: new (
    elementOrId: HTMLElement | string,
    config: YTPlayerConfig,
  ) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let scriptPromise: Promise<void> | null = null

const loadYouTubeAPI = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires a browser environment'))
  }
  if (window.YT?.Player) {
    return Promise.resolve()
  }
  if (scriptPromise) {
    return scriptPromise
  }
  scriptPromise = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    // Without this the promise hangs forever when the script can't load
    // (offline, ad blocker) — reset the cache so a later call can retry.
    script.onerror = () => {
      scriptPromise = null
      script.remove()
      reject(new Error('Failed to load the YouTube iframe API script'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

interface RegisterOptions {
  nocookie?: boolean
  playerVars?: Record<string, string | number>
}

export const useYouTubePlayer = () => {
  const players = new Map<HTMLElement, YTPlayer>()

  const register = async (
    element: HTMLElement,
    videoId: string,
    options: RegisterOptions = {},
  ): Promise<YTPlayer> => {
    await loadYouTubeAPI()

    return new Promise<YTPlayer>((resolve) => {
      const player = new window.YT!.Player(element, {
        videoId,
        // Fill the wrapper — YT otherwise creates a fixed 640x360 iframe.
        width: '100%',
        height: '100%',
        host: options.nocookie
          ? 'https://www.youtube-nocookie.com'
          : 'https://www.youtube.com',
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          ...options.playerVars,
        },
        events: {
          onReady: ({ target }) => {
            players.set(element, target)
            resolve(target)
          },
        },
      })
      players.set(element, player)
    })
  }

  // Every control call goes through here: the player may not be ready yet
  // (still loading) or may already be torn down, and either throws.
  const invoke = (player: YTPlayer | undefined, method: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute' | 'destroy') => {
    try {
      player?.[method]()
    }
    catch {
      // player not ready yet, or already torn down
    }
  }

  const unregister = (element: HTMLElement) => {
    const player = players.get(element)
    if (!player) return
    invoke(player, 'destroy')
    players.delete(element)
  }

  const play = (element: HTMLElement) => invoke(players.get(element), 'playVideo')

  const pause = (element: HTMLElement) => invoke(players.get(element), 'pauseVideo')

  const pauseAll = () => {
    players.forEach(p => invoke(p, 'pauseVideo'))
  }

  const mute = (element: HTMLElement) => invoke(players.get(element), 'mute')

  const unmute = (element: HTMLElement) => invoke(players.get(element), 'unMute')

  onScopeDispose(() => {
    players.forEach(p => invoke(p, 'destroy'))
    players.clear()
  })

  return {
    register,
    unregister,
    play,
    pause,
    pauseAll,
    mute,
    unmute,
  }
}
