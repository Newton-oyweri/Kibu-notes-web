
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],
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
