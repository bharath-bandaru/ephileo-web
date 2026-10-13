import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject, projects } from '@/lib/projects';
import { posts } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import ProjectView from './ProjectView';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const url = `/projects/${project.id}`;
  return {
    title: { absolute: project.seo.title },
    description: project.seo.description,
    keywords: project.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: project.seo.title,
      description: project.seo.description,
      siteName: SITE_NAME,
      images: [{ url: project.banner, alt: project.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo.title,
      description: project.seo.description,
      images: [project.banner],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const url = `${SITE_URL}/projects/${project.id}`;
  const operatingSystems = [
    project.links?.appStore && 'iOS',
    project.links?.playStore && 'Android',
    project.links?.website && 'Web',
  ].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': project.links?.appStore || project.links?.playStore ? 'MobileApplication' : 'WebApplication',
        '@id': `${url}#app`,
        name: project.name,
        description: project.seo.description,
        url,
        image: `${SITE_URL}${project.logo}`,
        screenshot: `${SITE_URL}${project.banner}`,
        applicationCategory: project.type === 'game' ? 'GameApplication' : 'FinanceApplication',
        operatingSystem: operatingSystems.join(', '),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: project.features?.map((f) => f.title),
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        sameAs: [project.links?.appStore, project.links?.playStore, project.links?.website].filter(Boolean),
        subjectOf: posts
          .filter((p) => p.project === project.id)
          .map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}` })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: project.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectView />
    </>
  );
}
