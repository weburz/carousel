let scriptPromise: Promise<void> | null = null

const TIKTOK_SCRIPT_SRC = 'https://www.tiktok.com/embed.js'

const loadTikTokScript = (cacheBust = false): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('TikTok embed requires a browser environment'))
  }
  if (!cacheBust && scriptPromise) {
    return scriptPromise
  }
  scriptPromise = new Promise<void>((resolve) => {
    const script = document.createElement('script')
    // Cache-bust forces TikTok's embed.js to rescan blockquotes, required after
    // SPA route changes or dynamic blockquote inserts. Without ?t= TikTok ignores
    // any blockquotes added after the first load.
    script.src = cacheBust ? `${TIKTOK_SCRIPT_SRC}?t=${Date.now()}` : TIKTOK_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
  return scriptPromise
}

const reloadTikTokScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('TikTok embed requires a browser environment'))
  }
  document
    .querySelectorAll(`script[src*="tiktok.com/embed"]`)
    .forEach(node => node.remove())
  scriptPromise = null
  return loadTikTokScript(true)
}

export const useTikTokEmbed = () => {
  return {
    load: loadTikTokScript,
    reload: reloadTikTokScript,
  }
}
