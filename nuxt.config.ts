// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  imports: {
    dirs: ['stores']
  },
  runtimeConfig: {
    backendBase: process.env.BACKEND_BASE_URL || 'http://localhost:4001',
    public: {
      backendBase: process.env.NUXT_PUBLIC_BACKEND_BASE_URL || process.env.BACKEND_BASE_URL || 'http://localhost:4001'
    }
  }
})
