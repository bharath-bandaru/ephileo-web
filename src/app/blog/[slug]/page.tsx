import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/blog/BackButton';
import Prose, { Inline } from '@/components/blog/Prose';
import TableOfContents from '@/components/blog/TableOfContents';
import { formatDate, getPost, posts, readingMinutes } from '@/lib/blog';
import { getProject } from '@/lib/projects';
import { SITE_NAME, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: { absolute: post.metaTitle },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.metaTitle,
      description: post.description,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.description,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const project = post.project ? getProject(post.project) : undefined;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const toc = [
    ...post.body.flatMap((b) => (b.type === 'h2' ? [{ id: b.id, text: b.text }] : [])),
    { id: 'faq', text: 'FAQ' },
  ];
  const minutes = readingMinutes(post);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.description,
        image: `${SITE_URL}${post.image}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        mainEntityOfPage: url,
        keywords: post.keywords.join(', '),
        articleSection: post.tags[0],
        wordCount: minutes * 230,
        about: project ? { '@id': `${url}#app` } : undefined,
      },
      project && {
        '@type': 'MobileApplication',
        '@id': `${url}#app`,
        name: project.name,
        description: project.description,
        applicationCategory: project.type === 'game' ? 'GameApplication' : 'FinanceApplication',
        operatingSystem: platforms(project).join(', '),
        url: `${SITE_URL}/projects/${project.id}`,
        image: `${SITE_URL}${project.logo}`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        sameAs: [project.links?.appStore, project.links?.playStore, project.links?.website].filter(Boolean),
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: post.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: stripInline(f.a) },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ].filter(Boolean),
  };

  return (
    <div id="post-root" className="page-fade-in min-h-screen bg-[#05080a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BackButton fadeTarget="post-root" />

      <main className="px-4 sm:px-6 pt-28 pb-24">
        <article className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-zinc-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-zinc-400 truncate max-w-[60vw]">{post.tags[0]}</li>
            </ol>
          </nav>

          {/* Title block */}
          <header className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[#34D399] text-xs font-medium mb-5">
              {post.tags[0]}
            </span>
            <h1 className="text-[2rem] leading-[1.15] sm:text-5xl font-bold text-white mb-5 tracking-tight">
              {post.title}
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed mb-6">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
            </div>
          </header>

          {/* Hero image */}
          <div className="relative mt-10 aspect-[16/8] w-full overflow-hidden rounded-3xl bg-zinc-900">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
            />
          </div>

          {/* Store links, right under the banner */}
          {project && (
            <div className="mt-5 mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-400">
                <span className="text-white font-medium">{project.name} is free</span> on {platformText(project)}.
              </p>
              <StoreButtons project={project} />
            </div>
          )}
          {!project && <div className="mb-12" />}

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="max-w-3xl min-w-0">
              {/* Key takeaways — the short, quotable answer for skimmers and AI assistants */}
              <section
                aria-labelledby="key-takeaways"
                className="mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
              >
                <h2 id="key-takeaways" className="mb-4 text-lg font-semibold text-white">
                  Key takeaways
                </h2>
                <ul className="space-y-2.5 text-zinc-300">
                  {post.takeaways.map((t) => (
                    <li key={t} className="flex gap-3">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#10B981]" />
                      <span><Inline text={t} /></span>
                    </li>
                  ))}
                </ul>
              </section>

              <Prose blocks={post.body} />

              {/* FAQ */}
              <section aria-labelledby="faq" className="mt-16">
                <h2 id="faq" className="scroll-mt-24 text-2xl md:text-3xl font-bold text-white mb-6">
                  Frequently asked questions
                </h2>
                <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800">
                  {post.faq.map((f) => (
                    <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-start justify-between gap-4 text-white font-medium">
                        <h3>{f.q}</h3>
                        <span className="mt-0.5 text-zinc-500 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                      </summary>
                      <p className="mt-3 text-zinc-400 leading-relaxed">
                        <Inline text={f.a} />
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {project && <AppCta project={project} />}
            </div>

            {/* Table of contents */}
            <aside className="hidden lg:block">
              <TableOfContents items={toc} />
            </aside>
          </div>
        </article>
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

function AppCta({ project }: { project: NonNullable<ReturnType<typeof getProject>> }) {
  return (
    <section className="mt-16 overflow-hidden rounded-3xl border border-[#10B981]/25 bg-gradient-to-br from-[#10B981]/15 via-[#05080a] to-[#05080a] p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-5">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-black p-2">
          <Image src={project.logo} alt={`${project.name} logo`} width={56} height={56} className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-xl font-bold text-white">Try {project.name} free</p>
          <p className="text-zinc-400 text-sm">{project.tagline} — on {platformText(project)}.</p>
        </div>
      </div>
      <StoreButtons project={project} />
      <Link
        href={`/projects/${project.id}`}
        className="mt-4 inline-block text-sm text-zinc-400 hover:text-white transition-colors"
      >
        See all {project.name} features →
      </Link>
    </section>
  );
}

function StoreButtons({ project }: { project: NonNullable<ReturnType<typeof getProject>> }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {project.links?.appStore && (
        <a
          href={project.links.appStore}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${project.name} on the App Store`}
          className="flex items-center justify-center gap-3 rounded-xl bg-white px-5 py-2.5 text-black hover:bg-zinc-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <span className="text-left leading-tight">
            <span className="block text-[10px] uppercase tracking-wide">Download on the</span>
            <span className="block text-base font-semibold">App Store</span>
          </span>
        </a>
      )}
      {project.links?.playStore && (
        <a
          href={project.links.playStore}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get ${project.name} on Google Play`}
          className="flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.64.71.64 1.19s-.09.82-.64 1.19l-2.11 1.21-2.5-2.5 2.5-2.5 2.11 1.21v.2zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
          </svg>
          <span className="text-left leading-tight">
            <span className="block text-[10px] uppercase tracking-wide">Get it on</span>
            <span className="block text-base font-semibold">Google Play</span>
          </span>
        </a>
      )}
      {project.links?.website && (
        <a
          href={project.links.website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Play ${project.name} in your browser`}
          className="flex items-center justify-center gap-3 rounded-xl px-5 py-2.5 transition-colors hover:brightness-125"
          style={{ backgroundColor: project.color + '30', color: project.accentColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-left leading-tight">
            <span className="block text-[10px] uppercase tracking-wide">Play now in your</span>
            <span className="block text-base font-semibold">Browser</span>
          </span>
        </a>
      )}
    </div>
  );
}

type ProjectT = NonNullable<ReturnType<typeof getProject>>;

function platforms(project: ProjectT) {
  return [
    project.links?.appStore && 'iOS',
    project.links?.playStore && 'Android',
    project.links?.website && 'Web',
  ].filter((p): p is string => Boolean(p));
}

function platformText(project: ProjectT) {
  const names = platforms(project).map((p) =>
    p === 'iOS' ? 'iPhone' : p === 'Web' ? 'the web' : p
  );
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
}

function stripInline(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[(.+?)\]\((.+?)\)/g, '$1');
}
