import { shallowRef } from 'vue'

/**
 * Tracks which facade slides have been swapped for a live iframe. Keyed by a
 * primitive (`string` for YouTube video ids, `number` for TikTok slide
 * indexes) so every embed type shares one activation model.
 *
 * The Set is replaced on every change rather than mutated, so Vue tracks the
 * update and re-renders the facade↔iframe swap. A shallow ref fits: the value
 * is never mutated in place.
 */
export const useFacadeActivation = <Key extends string | number>() => {
  const activated = shallowRef(new Set<Key>())

  const isActivated = (key: Key) => activated.value.has(key)

  const activate = (key: Key) => {
    const next = new Set<Key>(activated.value)
    next.add(key)
    activated.value = next
  }

  const deactivate = (key: Key) => {
    if (!activated.value.has(key)) return
    const next = new Set<Key>(activated.value)
    next.delete(key)
    activated.value = next
  }

  const deactivateAll = () => {
    activated.value = new Set<Key>()
  }

  return {
    activated,
    isActivated,
    activate,
    deactivate,
    deactivateAll,
  }
}
