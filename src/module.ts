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

  setup(options) {
    const resolver = createResolver(import.meta.url)
    const prefix = options.prefix ?? ''

    const components = [
      'BaseCarousel',
      'BaseSlide',
      'YouTubeCarousel',
      'InstagramCarousel',
      'TikTokCarousel',
    ]

    for (const name of components) {
      addComponent({
        name: `${prefix}${name}`,
        filePath: resolver.resolve(`./runtime/components/${name}.vue`),
      })
    }

    const composables = [
      'useCarousel',
      'useYouTubePlayer',
      'useYouTubeMedia',
      'useEmbedMetadata',
      'useFacadeActivation',
      'useFrameRegistry',
    ]

    addImports(
      composables.map(name => ({
        name,
        from: resolver.resolve(`./runtime/composables/${name}`),
      })),
    )
  },
})
