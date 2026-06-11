import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('@weburz/carousel', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders BaseCarousel viewport with slides', async () => {
    const html = await $fetch('/')
    expect(html).toContain('weburz-carousel__viewport')
    expect(html).toContain('weburz-carousel__container')
    expect(html).toContain('Slide 1')
    expect(html).toContain('Slide 3')
  })

  it('renders arrow buttons by default', async () => {
    const html = await $fetch('/')
    expect(html).toContain('aria-label="Previous slide"')
    expect(html).toContain('aria-label="Next slide"')
  })

  it('places arrows beside the dots by default', async () => {
    const html = await $fetch('/')
    expect(html).toContain('weburz-carousel__stage--arrows-below')
  })

  it('renders title and description props', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Aside test title')
    expect(html).toContain('Aside test description')
  })

  it('falls back to the title for aria-label', async () => {
    const html = await $fetch('/')
    expect(html).toContain('aria-label="Aside test title"')
  })

  it('applies the aside layout class', async () => {
    const html = await $fetch('/')
    expect(html).toContain('weburz-carousel--aside')
  })

  it('ships slidesPerView to CSS as a raw number', async () => {
    const html = await $fetch('/')
    // The count reaches CSS via a v-bind variable so the slide width math
    // happens in calc(), where --weburz-carousel-slides (settable from
    // consumer media queries) can override it SSR-correctly.
    expect(html).toMatch(/--[\w-]+-slideCount:2/)
    // A precomputed width in the HTML would mean JS decided the slide size
    // again — the exact thing that caused the hydration width snap.
    expect(html).not.toMatch(/-flexBasis:/)
  })

  it('renders YouTubeCarousel iframes pointing at youtube-nocookie.com', async () => {
    const html = await $fetch('/')
    expect(html).toContain('youtube-nocookie.com/embed/abc12345678')
    expect(html).toContain('youtube-nocookie.com/embed/def98765432')
  })

  it('passes title attribute to YouTube iframes', async () => {
    const html = await $fetch('/')
    expect(html).toContain('title="Test video"')
    expect(html).toContain('title="Test shorts"')
  })

  it('applies video vs shorts aspect-ratio classes', async () => {
    const html = await $fetch('/')
    expect(html).toContain('weburz-yt--video')
    expect(html).toContain('weburz-yt--shorts')
  })

  it('renders the active slide caption in the heading area', async () => {
    const html = await $fetch('/')
    expect(html).toContain('weburz-active-caption')
  })

  it('renders linked caption titles and descriptions', async () => {
    const html = await $fetch('/')
    expect(html).toContain('weburz-caption__title')
    expect(html).toContain(
      'href="https://www.youtube.com/watch?v=abc12345678"',
    )
    expect(html).toContain(
      'href="https://www.youtube.com/shorts/def98765432"',
    )
    expect(html).toContain('Test video description')
  })

  it('renders Instagram iframe pointing at /embed/captioned/', async () => {
    const html = await $fetch('/')
    expect(html).toContain('class="weburz-instagram-embed"')
    expect(html).toContain(
      'https://www.instagram.com/p/TESTabc123/embed/captioned/',
    )
  })

  it('strips query trackers from Instagram embed URLs', async () => {
    const html = await $fetch('/')
    expect(html).toContain(
      'https://www.instagram.com/p/TESTdef456/embed/captioned/',
    )
    // The broken pattern the URL rebuild guards against: a tracker query
    // ending up mid-path. (The caption link may legitimately keep the query.)
    expect(html).not.toContain('igsh=tracker123/embed')
  })

  it('renders TikTok iframe pointing at /embed/v2/', async () => {
    const html = await $fetch('/')
    expect(html).toContain('class="weburz-tiktok-embed"')
    expect(html).toContain('https://www.tiktok.com/embed/v2/1234567890')
  })
})
