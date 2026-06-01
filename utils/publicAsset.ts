/** Préfixe les fichiers `public/` avec `app.baseURL` (GitHub Pages → `/welcome/`). */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\//, '')
  const { app } = useRuntimeConfig()
  const base = app.baseURL || import.meta.env.BASE_URL || '/'
  return `${base}${normalized}`
}
