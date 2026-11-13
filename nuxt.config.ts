
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/sitemap'
  ],

 site: {
  url: 'https://kibu-notes-web.vercel.app'
},

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/search']
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2026-06-30',

  vite: {
    plugins: [fileViewerRenderers({ copyAssets: true })]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseKey: ''
    }
  }
})
