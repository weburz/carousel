import {
  addComponent,
  addImports,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Component name prefix. Set to "" to disable the prefix.
   * @default ""
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@weburz/carousel',
    configKey: 'carousel',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },

  defaults: {
    prefix: '',
  },

  setup(options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    const prefix = options.prefix ?? ''

    addComponent({
      name: `${prefix}BaseCarousel`,
      filePath: resolver.resolve('./runtime/components/BaseCarousel.vue'),
    })

    addComponent({
      name: `${prefix}BaseSlide`,
      filePath: resolver.resolve('./runtime/components/BaseSlide.vue'),
    })

    addComponent({
      name: `${prefix}YouTubeCarousel`,
      filePath: resolver.resolve('./runtime/components/YouTubeCarousel.vue'),
    })

    addComponent({
      name: `${prefix}InstagramCarousel`,
      filePath: resolver.resolve('./runtime/components/InstagramCarousel.vue'),
    })

    addComponent({
      name: `${prefix}TikTokCarousel`,
      filePath: resolver.resolve('./runtime/components/TikTokCarousel.vue'),
    })

    addImports([
      {
        name: 'useCarousel',
        from: resolver.resolve('./runtime/composables/useCarousel'),
      },
      {
        name: 'useYouTubePlayer',
        from: resolver.resolve('./runtime/composables/useYouTubePlayer'),
      },
      {
        name: 'useInstagramEmbed',
        from: resolver.resolve('./runtime/composables/useInstagramEmbed'),
      },
      {
        name: 'useTikTokEmbed',
        from: resolver.resolve('./runtime/composables/useTikTokEmbed'),
      },
      {
        name: 'useEmbedMetadata',
        from: resolver.resolve('./runtime/composables/useEmbedMetadata'),
      },
    ])
  },
})
