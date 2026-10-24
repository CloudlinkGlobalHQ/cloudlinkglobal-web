import type { MetadataRoute } from 'next'

const baseUrl = 'https://cloudlinkglobal.com'

const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/product', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pilot', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/docs', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/docs/setup', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/docs/api-reference', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/docs/ci-integration', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/docs/cli', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/signup', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/login', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
