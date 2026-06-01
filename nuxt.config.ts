const baseURL = process.env.NUXT_APP_BASE_URL || '/'

function publicPath(path: string) {
  return `${baseURL}${path.replace(/^\//, '')}`
}

export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/three', pathPrefix: false },
  ],
  css: [
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/css/main.css',
  ],
  app: {
    baseURL,
    head: {
      title: 'Lamine Ishola — Appartement Portfolio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Portfolio interactif de Hasrafidine Abdel-Lamine Ishola — Développeur Fullstack Web & Mobile',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: publicPath('favicon-32.png') },
        { rel: 'apple-touch-icon', sizes: '180x180', href: publicPath('apple-touch-icon.png') },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: ['three'],
    },
    build: {
      chunkSizeWarningLimit: 600,
    },
  },
  routeRules: {
    '/avatar.jpg': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/favicon-32.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/apple-touch-icon.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/logos/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/logos/mobile/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },
})
