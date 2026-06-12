import type { SlidesPerView } from '../types'

// Sort key for a min-width breakpoint. px is normalized to rem (÷16) so mixed
// units still order correctly; other units (rem/em) compare by their number.
const breakpointWeight = (breakpoint: string): number => {
  const value = Number.parseFloat(breakpoint)
  return breakpoint.trim().endsWith('px') ? value / 16 : value
}

/** The slide count active below every breakpoint (`base`, or 1 if omitted). */
export const resolveBaseSlides = (slidesPerView: SlidesPerView): number =>
  typeof slidesPerView === 'number' ? slidesPerView : (slidesPerView.base ?? 1)

/**
 * CSS for a breakpoint map: a base rule plus one `min-width` media query per
 * breakpoint, sorted ascending so wider viewports win the cascade.
 */
export const buildSlidesCss = (
  selector: string,
  slidesPerView: Record<string, number>,
): string => {
  const { base, ...breakpoints } = slidesPerView
  const rules: string[] = []
  if (base !== undefined) {
    rules.push(`${selector}{--weburz-carousel-slides:${base}}`)
  }
  const sorted = Object.entries(breakpoints).sort(
    ([a], [b]) => breakpointWeight(a) - breakpointWeight(b),
  )
  for (const [breakpoint, slides] of sorted) {
    rules.push(
      `@media (min-width: ${breakpoint}){${selector}{--weburz-carousel-slides:${slides}}}`,
    )
  }
  return rules.join('\n')
}
