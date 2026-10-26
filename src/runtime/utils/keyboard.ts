/** What a key press inside the carousel asks for, or null to let it through. */
export type CarouselKeyAction = 'prev' | 'next' | 'first' | 'last'

/**
 * Maps a `KeyboardEvent.key` to a carousel action. Arrow keys follow reading
 * direction, so they mirror under Embla's `direction: 'rtl'`.
 */
export const carouselKeyAction = (
  key: string,
  direction: 'ltr' | 'rtl' = 'ltr',
): CarouselKeyAction | null => {
  switch (key) {
    case 'ArrowLeft':
      return direction === 'rtl' ? 'next' : 'prev'
    case 'ArrowRight':
      return direction === 'rtl' ? 'prev' : 'next'
    case 'Home':
      return 'first'
    case 'End':
      return 'last'
    default:
      return null
  }
}
