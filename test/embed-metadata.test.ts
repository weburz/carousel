// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useEmbedMetadata } from '../src/runtime/composables/useEmbedMetadata'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useEmbedMetadata', () => {
  it('retries after a failed lookup', async () => {
    const fetch = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ title: 'T' }) })
    vi.stubGlobal('fetch', fetch)

    const { forYouTube } = useEmbedMetadata()
    expect(await forYouTube('retry1')).toBeNull()
    expect(await forYouTube('retry1')).toEqual({ title: 'T', authorName: undefined, thumbnailUrl: undefined })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('treats non-OK responses as failures and retries them', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ title: 'T' }) })
    vi.stubGlobal('fetch', fetch)

    const { forYouTube } = useEmbedMetadata()
    expect(await forYouTube('retry2')).toBeNull()
    expect(await forYouTube('retry2')).toEqual({ title: 'T', authorName: undefined, thumbnailUrl: undefined })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('caches successful lookups', async () => {
    const fetch = vi.fn()
      .mockResolvedValue({ ok: true, json: async () => ({ title: 'T' }) })
    vi.stubGlobal('fetch', fetch)

    const { forYouTube } = useEmbedMetadata()
    await forYouTube('cached1')
    await forYouTube('cached1')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('shares one in-flight request per URL', async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const fetch = vi.fn(() => new Promise((resolve) => {
      resolveFetch = resolve
    }))
    vi.stubGlobal('fetch', fetch)

    const { forYouTube } = useEmbedMetadata()
    const first = forYouTube('inflight1')
    const second = forYouTube('inflight1')
    resolveFetch({ ok: true, json: async () => ({ title: 'T' }) })

    expect(await first).toEqual({ title: 'T', authorName: undefined, thumbnailUrl: undefined })
    expect(await second).toEqual({ title: 'T', authorName: undefined, thumbnailUrl: undefined })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
