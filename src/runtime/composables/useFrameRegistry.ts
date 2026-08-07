interface FrameLike {
  src: string
  dataset: Record<string, string | undefined>
}

const BLANK_SRC = 'about:blank'

const isFrame = (el: unknown): el is HTMLIFrameElement =>
  el instanceof HTMLIFrameElement

/**
 * Parks an iframe at about:blank without losing its original src, so playback
 * halts but the embed can be restored without re-navigating from scratch.
 */
export const parkFrame = (frame: FrameLike) => {
  if (!frame.src || frame.src === BLANK_SRC) return
  frame.dataset.savedSrc = frame.src
  frame.src = BLANK_SRC
}

/** Restores an iframe parked by {@link parkFrame} to its saved src. */
export const restoreFrame = (frame: FrameLike) => {
  const savedSrc = frame.dataset.savedSrc
  if (!savedSrc) return
  frame.src = savedSrc
  delete frame.dataset.savedSrc
}

/**
 * Registry of iframe elements bound per key, with single-bind guarantees and
 * park/restore helpers. Shared by the TikTok and Instagram carousels, where
 * the embeds expose no postMessage control API — halting playback means
 * parking the iframe.
 *
 * The Map is plain (not reactive) — callers read live elements from template
 * refs or event handlers, never render from it.
 */
export const useFrameRegistry = <Key extends string | number>() => {
  const frames = new Map<Key, HTMLIFrameElement>()
  const bound = new Set<Key>()

  const bind = (
    el: unknown,
    key: Key,
    onFirstBind?: (el: HTMLIFrameElement) => void,
  ) => {
    if (!isFrame(el)) return
    frames.set(key, el)
    if (bound.has(key)) return
    bound.add(key)
    onFirstBind?.(el)
  }

  const get = (key: Key) => frames.get(key)

  const remove = (key: Key) => {
    frames.delete(key)
    bound.delete(key)
  }

  const park = (key: Key) => {
    const frame = frames.get(key)
    if (frame) parkFrame(frame)
  }

  const restore = (key: Key) => {
    const frame = frames.get(key)
    if (frame) restoreFrame(frame)
  }

  const parkAll = () => frames.forEach(parkFrame)
  const restoreAll = () => frames.forEach(restoreFrame)

  return { bind, get, remove, park, restore, parkAll, restoreAll }
}
