import type { MetadataRoute } from 'next';
import { posts } from '@/lib/blog';
import { projects } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const latestPost = posts.reduce(
    (max, p) => (p.updatedAt > max ? p.updatedAt : max),
    posts[0]?.updatedAt ?? new Date().toISOString()
  );

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: latestPost, changeFrequency: 'weekly', priority: 0.9 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...projects.flatMap((p) => [
      { url: `${SITE_URL}/projects/${p.id}`, changeFrequency: 'monthly' as const, priority: 0.9 },
      { url: `${SITE_URL}/projects/${p.id}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
      { url: `${SITE_URL}/projects/${p.id}/terms`, changeFrequency: 'yearly' as const, priority: 0.3 },
    ]),
  ];
}
