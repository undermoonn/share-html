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
      ],
      meta: [
        {
          name: 'description',
          content:
            'Online HTML Editor. You can edit HTML, CSS and JavaScript code, and view the result in your browser immediately, and share to others.'
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
