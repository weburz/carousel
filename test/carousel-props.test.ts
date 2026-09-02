import { describe, expect, it } from 'vitest'
import { carouselSharedDefaults, pickCarouselSharedProps } from '../src/runtime/utils/carouselProps'

describe('pickCarouselSharedProps', () => {
  it('returns only the shared keys, dropping platform-specific ones', () => {
    const picked = pickCarouselSharedProps({
      options: { loop: true },
      plugins: [],
      slidesPerView: 2,
      showArrows: false,
      showDots: false,
      arrowPosition: 'sides',
      layout: 'aside',
      asidePosition: 'right',
      title: 'Title',
      description: 'Description',
      ariaLabel: 'Aria label',
      // @ts-expect-error extra key not part of CarouselSharedProps
      videos: [{ id: 'abc' }],
    })

    expect(picked).not.toHaveProperty('videos')
    expect(picked).toEqual({
      options: { loop: true },
      plugins: [],
      slidesPerView: 2,
      showArrows: false,
      showDots: false,
      arrowPosition: 'sides',
      layout: 'aside',
      asidePosition: 'right',
      title: 'Title',
      description: 'Description',
      ariaLabel: 'Aria label',
    })
  })
})

describe('carouselSharedDefaults', () => {
  it('has the same keys as a picked CarouselSharedProps object', () => {
    const picked = pickCarouselSharedProps({
      options: {},
      plugins: [],
      slidesPerView: 1,
      showArrows: true,
      showDots: true,
      arrowPosition: 'below',
      layout: 'stacked',
      asidePosition: 'left',
      title: undefined,
      description: undefined,
      ariaLabel: undefined,
    })

    expect(Object.keys(carouselSharedDefaults).sort()).toEqual(
      Object.keys(picked).sort(),
    )
  })
})
