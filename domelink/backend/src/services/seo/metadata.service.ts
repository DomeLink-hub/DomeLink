type SeoEntity = {
  type: 'architect' | 'portfolio' | 'project' | 'blog' | 'home';
  name?: string;
  title?: string;
  description?: string;
  slug?: string;
};

export const buildSeoMetadata = (entity: SeoEntity) => {
  const baseTitle = 'DomeLink';
  const titleMap = {
    home: baseTitle,
    architect: `${entity.name || 'Architect'} | ${baseTitle}`,
    portfolio: `${entity.title || 'Portfolio'} | ${baseTitle}`,
    project: `${entity.title || 'Project'} | ${baseTitle}`,
    blog: `${entity.title || 'Insights'} | ${baseTitle}`,
  } as const;

  const description = entity.description || 'DomeLink is a premium architectural workspace for discovering, hiring, and collaborating with top architects.';

  return {
    title: titleMap[entity.type],
    description,
    keywords: ['architecture', 'design', 'architects', 'portfolio', 'interiors', 'home design', 'DomeLink'],
    ogImage: `/seo/og/${entity.type}${entity.slug ? `/${entity.slug}` : ''}.svg`,
  };
};

export const buildStructuredSchema = (entity: SeoEntity) => {
  if (entity.type === 'architect') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: entity.name,
      description: entity.description,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: entity.title || 'DomeLink',
    description: entity.description,
  };
};
