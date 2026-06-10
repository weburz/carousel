import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export const useScrollAwayHandler = (
  rootRef: Ref<HTMLElement | null>,
  onAway: () => void,
  onBack: () => void,
) => {
  onMounted(() => {
    if (typeof window === 'undefined' || !rootRef.value) return

    let wasVisible: boolean | null = null
    let rafId = 0

    const isInViewport = () => {
      if (!rootRef.value) return false
      const rect = rootRef.value.getBoundingClientRect()
      return rect.bottom > 0 && rect.top < window.innerHeight
    }

    const evaluate = () => {
      rafId = 0
      const visible = isInViewport()
      if (visible === wasVisible) return
      wasVisible = visible
      if (visible) onBack()
      else onAway()
    }

    const onScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(evaluate)
    }

    evaluate()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    })
  })
}
