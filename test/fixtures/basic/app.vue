<template>
  <div>
    <BaseCarousel aria-label="Test carousel">
      <BaseSlide
        v-for="i in 3"
        :key="i"
      >
        <p>Slide {{ i }}</p>
      </BaseSlide>
    </BaseCarousel>

    <BaseCarousel
      layout="aside"
      title="Aside test title"
      description="Aside test description"
    >
      <BaseSlide
        v-for="i in 2"
        :key="i"
      >
        <p>Aside slide {{ i }}</p>
      </BaseSlide>
    </BaseCarousel>

    <BaseCarousel
      :slides-per-view="2"
      aria-label="Two-up test carousel"
    >
      <BaseSlide
        v-for="i in 4"
        :key="i"
      >
        <p>Two-up slide {{ i }}</p>
      </BaseSlide>
    </BaseCarousel>

    <BaseCarousel
      :slides-per-view="{ 'base': 2, '48rem': 4 }"
      aria-label="Responsive test carousel"
    >
      <BaseSlide
        v-for="i in 4"
        :key="i"
      >
        <p>Responsive slide {{ i }}</p>
      </BaseSlide>
    </BaseCarousel>

    <YouTubeCarousel
      :videos="ytVideos"
      mode="iframe-embed"
      aria-label="Test YouTube carousel"
    />

    <YouTubeCarousel
      :videos="ytVideos"
      captions="active"
      :fetch-metadata="false"
      aria-label="Active captions test"
    />

    <InstagramCarousel
      :posts="igPosts"
      aria-label="Test Instagram carousel"
    />

    <TikTokCarousel
      :videos="ttVideos"
      aria-label="Test TikTok carousel"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  InstagramPost,
  TikTokVideo,
  YouTubeVideo,
} from '../../../src/runtime/types'

const ytVideos: YouTubeVideo[] = [
  {
    id: 'abc12345678',
    kind: 'video',
    title: 'Test video',
    description: 'Test video description',
  },
  { id: 'def98765432', kind: 'shorts', title: 'Test shorts' },
]

const igPosts: InstagramPost[] = [
  { url: 'https://www.instagram.com/p/TESTabc123/', title: 'Test IG post' },
  { url: 'https://www.instagram.com/p/TESTdef456/?igsh=tracker123', title: 'Test IG share link' },
]

const ttVideos: TikTokVideo[] = [
  { url: 'https://www.tiktok.com/@test/video/1234567890', title: 'Test TikTok' },
]
</script>
