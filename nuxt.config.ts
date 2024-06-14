// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@unocss/nuxt'],
  app: {
    head: {
      title: 'Share HTML',
      link: [
        {
          rel: 'shortcut icon',
          href: '/icon.png'
        }
      ]
    }
  },
  unocss: {
    preflight: true,
    icons: {
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block'
      }
    }
  }
})
