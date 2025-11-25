// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY, // Variável de ambiente segura
    geminiApiKey: process.env.GEMINI_API_KEY,
  },

  app: {
    head: {
      title: 'X Vibe Check',
      meta: [
        { name: 'description', content: 'AI Profile Roaster' }
      ]
    }
  }
})
