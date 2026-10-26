import { describe, expect, it } from 'vitest'
import { carouselKeyAction } from '../src/runtime/utils/keyboard'

describe('carouselKeyAction', () => {
  it('maps arrow keys to prev/next in LTR', () => {
    expect(carouselKeyAction('ArrowLeft')).toBe('prev')
    expect(carouselKeyAction('ArrowRight')).toBe('next')
  })

  it('mirrors arrow keys in RTL', () => {
    expect(carouselKeyAction('ArrowLeft', 'rtl')).toBe('next')
    expect(carouselKeyAction('ArrowRight', 'rtl')).toBe('prev')
  })

  it('maps Home/End to the first and last slide', () => {
    expect(carouselKeyAction('Home')).toBe('first')
    expect(carouselKeyAction('End')).toBe('last')
  })

  it('ignores every other key', () => {
    expect(carouselKeyAction('ArrowUp')).toBeNull()
    expect(carouselKeyAction('Enter')).toBeNull()
    expect(carouselKeyAction(' ')).toBeNull()
  })
})
