import { describe, expect, it } from 'vitest'
import {
  buildInstagramEmbedUrl,
  buildTikTokEmbedUrl,
  buildYouTubeEmbedUrl,
  defaultYouTubeThumbnailUrl,
  youtubeWatchUrl,
} from '../src/runtime/utils/embeds'

describe('buildYouTubeEmbedUrl', () => {
  it('uses the nocookie host by default and the plain host otherwise', () => {
    expect(buildYouTubeEmbedUrl('abc123', { nocookie: true }))
      .toContain('https://www.youtube-nocookie.com/embed/abc123')
    expect(buildYouTubeEmbedUrl('abc123', { nocookie: false }))
      .toContain('https://www.youtube.com/embed/abc123')
  })

  it('never adds autoplay unless asked', () => {
    expect(buildYouTubeEmbedUrl('abc123', { nocookie: true }))
      .not.toContain('autoplay')
  })

  it('adds autoplay only for facade-mode embeds (the tap is the gesture)', () => {
    expect(buildYouTubeEmbedUrl('abc123', { nocookie: true, autoplay: true }))
      .toContain('autoplay=1')
  })

  it('keeps the enablejsapi flag for the listening handshake', () => {
    expect(buildYouTubeEmbedUrl('abc123', { nocookie: true }))
      .toContain('enablejsapi=1')
  })
})

describe('youtubeWatchUrl', () => {
  it('defaults to the watch page for plain videos', () => {
    expect(youtubeWatchUrl('abc123')).toBe('https://www.youtube.com/watch?v=abc123')
  })

  it('uses the portrait short URL for shorts', () => {
    expect(youtubeWatchUrl('abc123', 'shorts'))
      .toBe('https://www.youtube.com/shorts/abc123')
  })

  it('honors an explicit url override', () => {
    expect(youtubeWatchUrl('abc123', 'video', 'https://example.com/custom'))
      .toBe('https://example.com/custom')
  })
})

describe('defaultYouTubeThumbnailUrl', () => {
  it('hqdefault for videos', () => {
    expect(defaultYouTubeThumbnailUrl('abc123'))
      .toBe('https://i.ytimg.com/vi/abc123/hqdefault.jpg')
  })

  it('portrait oar2 for shorts', () => {
    expect(defaultYouTubeThumbnailUrl('abc123', 'shorts'))
      .toBe('https://i.ytimg.com/vi/abc123/oar2.jpg')
  })
})

describe('buildTikTokEmbedUrl', () => {
  it('resolves the downstream /embed/v2/ endpoint from a share link', () => {
    expect(buildTikTokEmbedUrl('https://www.tiktok.com/@test/video/1234567890'))
      .toBe('https://www.tiktok.com/embed/v2/1234567890')
  })

  it('returns an empty embeds path when the id is missing', () => {
    expect(buildTikTokEmbedUrl('https://www.tiktok.com/@test'))
      .toBe('https://www.tiktok.com/embed/v2/')
  })
})

describe('buildInstagramEmbedUrl', () => {
  it('rebuilds the captioned embed endpoint from origin + pathname', () => {
    expect(buildInstagramEmbedUrl('https://www.instagram.com/p/TESTabc123/'))
      .toBe('https://www.instagram.com/p/TESTabc123/embed/captioned/')
  })

  it('strips query trackers so they never land mid-path', () => {
    expect(
      buildInstagramEmbedUrl('https://www.instagram.com/p/TESTdef456/?igsh=tracker123'),
    ).toBe('https://www.instagram.com/p/TESTdef456/embed/captioned/')
  })

  it('normalizes a missing trailing slash', () => {
    expect(buildInstagramEmbedUrl('https://www.instagram.com/p/TESTabc123'))
      .toBe('https://www.instagram.com/p/TESTabc123/embed/captioned/')
  })

  it('falls back to string surgery for malformed urls', () => {
    expect(buildInstagramEmbedUrl('not-a-url'))
      .toBe('not-a-url/embed/captioned/')
  })
})
