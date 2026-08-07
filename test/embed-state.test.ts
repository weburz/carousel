// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { useFacadeActivation } from '../src/runtime/composables/useFacadeActivation'
import { parkFrame, restoreFrame, useFrameRegistry } from '../src/runtime/composables/useFrameRegistry'

describe('useFacadeActivation', () => {
  it('starts empty', () => {
    const { activated } = useFacadeActivation<string>()
    expect(activated.value.size).toBe(0)
  })

  it('activates a key', () => {
    const { isActivated, activate } = useFacadeActivation<string>()
    expect(isActivated('a')).toBe(false)
    activate('a')
    expect(isActivated('a')).toBe(true)
  })

  it('deactivates a key', () => {
    const { isActivated, activate, deactivate } = useFacadeActivation<string>()
    activate('a')
    deactivate('a')
    expect(isActivated('a')).toBe(false)
  })

  it('deactivate of an inactive key is a no-op', () => {
    const { deactivate, activated } = useFacadeActivation<string>()
    deactivate('missing')
    expect(activated.value.size).toBe(0)
  })

  it('keeps other keys active when one is deactivated', () => {
    const { isActivated, activate, deactivate } = useFacadeActivation<string>()
    activate('a')
    activate('b')
    deactivate('a')
    expect(isActivated('b')).toBe(true)
  })

  it('replaces the Set so Vue sees the change', () => {
    const { activate, activated } = useFacadeActivation<string>()
    activate('a')
    const first = activated.value
    activate('b')
    expect(activated.value).not.toBe(first)
    expect(activated.value.size).toBe(2)
  })
})

describe('parkFrame / restoreFrame', () => {
  const makeFrame = () => ({
    src: 'https://example.com/embed',
    dataset: {} as Record<string, string>,
  })

  it('parks a frame to about:blank and saves its src', () => {
    const frame = makeFrame()
    parkFrame(frame)
    expect(frame.src).toBe('about:blank')
    expect(frame.dataset.savedSrc).toBe('https://example.com/embed')
  })

  it('does not park an already-blank frame', () => {
    const frame = { src: 'about:blank', dataset: {} as Record<string, string> }
    parkFrame(frame)
    expect(frame.dataset.savedSrc).toBeUndefined()
  })

  it('restores the saved src and clears the marker', () => {
    const frame = makeFrame()
    parkFrame(frame)
    restoreFrame(frame)
    expect(frame.src).toBe('https://example.com/embed')
    expect(frame.dataset.savedSrc).toBeUndefined()
  })
})

describe('useFrameRegistry bind', () => {
  const makeFrame = () => document.createElement('iframe')

  it('stores the frame on first bind', () => {
    const { bind, get } = useFrameRegistry<number>()
    const frame = makeFrame()
    bind(frame, 1)
    expect(get(1)).toBe(frame)
  })

  it('runs onFirstBind only once', () => {
    const { bind } = useFrameRegistry<number>()
    const frame = makeFrame()
    let calls = 0
    const onFirstBind = () => {
      calls += 1
    }
    bind(frame, 1, onFirstBind)
    bind(frame, 1, onFirstBind)
    expect(calls).toBe(1)
  })

  it('ignores null elements', () => {
    const { bind, get } = useFrameRegistry<number>()
    bind(null, 1)
    expect(get(1)).toBeUndefined()
  })
})
