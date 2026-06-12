import { describe, expect, it } from 'vitest'
import { buildSlidesCss, resolveBaseSlides } from '../src/runtime/utils/slides'

describe('resolveBaseSlides', () => {
  it('passes a plain number through', () => {
    expect(resolveBaseSlides(3)).toBe(3)
  })

  it('takes base from a breakpoint map', () => {
    expect(resolveBaseSlides({ 'base': 2, '48rem': 4 })).toBe(2)
  })

  it('defaults to 1 when the map has no base', () => {
    expect(resolveBaseSlides({ '48rem': 3 })).toBe(1)
  })
})

describe('buildSlidesCss', () => {
  it('renders a base rule plus one media query per breakpoint', () => {
    expect(buildSlidesCss('.c', { 'base': 1, '48rem': 3 })).toBe(
      '.c{--weburz-carousel-slides:1}\n'
      + '@media (min-width: 48rem){.c{--weburz-carousel-slides:3}}',
    )
  })

  it('omits the base rule when base is absent', () => {
    expect(buildSlidesCss('.c', { '48rem': 3 })).toBe(
      '@media (min-width: 48rem){.c{--weburz-carousel-slides:3}}',
    )
  })

  it('sorts breakpoints ascending so wider viewports win the cascade', () => {
    const css = buildSlidesCss('.c', {
      '80rem': 5,
      'base': 1,
      '48rem': 3,
    })
    const positions = ['base-rule', '48rem', '80rem'].map(marker =>
      marker === 'base-rule'
        ? css.indexOf('.c{--weburz-carousel-slides:1}')
        : css.indexOf(`min-width: ${marker}`),
    )
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(positions.every(p => p >= 0)).toBe(true)
  })

  it('orders mixed px and rem breakpoints by real width', () => {
    // 600px (37.5rem) must come before 48rem despite 600 > 48 numerically.
    const css = buildSlidesCss('.c', { '600px': 2, '48rem': 4 })
    expect(css.indexOf('600px')).toBeLessThan(css.indexOf('48rem'))
  })
})
