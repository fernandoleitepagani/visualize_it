import { Box } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { getEntryLocation } from '@/content/subjects';
import { theory } from '@/content/theory';
import { space } from '@/theme';
import { NotFound } from './NotFound';

export function TheoryPage() {
  const { slug } = useParams();
  const page = slug ? theory[slug] : undefined;
  const location = getEntryLocation(slug);

  if (!page) return <NotFound />;

  const Article = page.Component;

  return (
    <Box component="article" className="prose" pb={space.xxl}>
      <PageHeader
        breadcrumb={
          location
            ? [
                { label: 'Início', to: '/' },
                { label: location.subject.title, to: `/materias/${location.subject.id}` },
                { label: location.group.title },
                { label: page.title },
              ]
            : undefined
        }
        title={page.title}
        subtitle={page.subtitle}
      />
      <Article />
    </Box>
  );
}
