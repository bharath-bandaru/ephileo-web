import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import PostLink from '@/components/blog/PostLink';
import { formatDate, posts, readingMinutes } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/site';

const description =
  'Guides and stories from Ephileo — sharing a home with roommates, splitting expenses, and playing our games.';

export const metadata: Metadata = {
  title: 'Blog',
  description,
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: '/blog',
    title: `Blog | ${SITE_NAME}`,
    description,
    siteName: SITE_NAME,
  },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = posts;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    url: `${SITE_URL}/blog`,
    description,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
    })),
  };

  return (
    <div className="min-h-screen bg-[#05080a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="fixed inset-x-0 top-0 z-40 h-20 bg-[#05080a]/80 backdrop-blur-md" />
      <Header />

      <main className="relative px-4 sm:px-6 pt-32 pb-24">
        <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0fb0c8]/14 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <header className="mb-14 text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-[#0fb0c8]/10 border border-[#0fb0c8]/25 text-[#0fb0c8] text-sm font-medium mb-4">
              Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent">
              Notes from Ephileo
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{description}</p>
          </header>

          {featured && (
            <PostLink
              href={`/blog/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors md:grid-cols-2"
            >
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px]">
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <span className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#34D399]">
                  {featured.tags[0]}
                </span>
                <h2 className="mb-4 text-2xl sm:text-3xl font-bold leading-tight text-white">
                  {featured.title}
                </h2>
                <p className="mb-6 text-zinc-400 leading-relaxed">{featured.excerpt}</p>
                <p className="text-sm text-zinc-500">
                  <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                  {' · '}
                  {readingMinutes(featured)} min read
                </p>
                <span className="mt-6 text-sm font-medium text-white group-hover:text-[#34D399] transition-colors">
                  Read the post →
                </span>
              </div>
            </PostLink>
          )}

          {rest.length > 0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostLink
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                >
                  <div className="relative aspect-[16/10]">
                    <Image src={post.image} alt={post.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#34D399]">
                      {post.tags[0]}
                    </p>
                    <h2 className="mb-2 text-lg font-semibold text-white">{post.title}</h2>
                    <p className="mb-4 text-sm text-zinc-400">{post.excerpt}</p>
                    <p className="text-xs text-zinc-500">
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      {' · '}
                      {readingMinutes(post)} min read
                    </p>
                  </div>
                </PostLink>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-white">
            ephileo
          </Link>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Ephileo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
