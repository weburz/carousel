interface InstagramNamespace {
  Embeds?: {
    process: () => void
  }
}

declare global {
  interface Window {
    instgrm?: InstagramNamespace
  }
}

let scriptPromise: Promise<void> | null = null

const loadInstagramScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Instagram embed requires a browser environment'))
  }
  if (window.instgrm?.Embeds) {
    return Promise.resolve()
  }
  if (scriptPromise) {
    return scriptPromise
  }
  scriptPromise = new Promise<void>((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
  return scriptPromise
}

export const useInstagramEmbed = () => {
  const process = async () => {
    await loadInstagramScript()
    window.instgrm?.Embeds?.process()
  }

  return {
    load: loadInstagramScript,
    process,
  }
}
