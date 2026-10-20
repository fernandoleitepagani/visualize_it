import { useParams } from 'react-router-dom';
import { AlgorithmBrowser } from '@/components/AlgorithmBrowser';
import { PageHeader } from '@/components/PageHeader';
import { getSubject, getSubjectEntries } from '@/content/subjects';
import { NotFound } from './NotFound';

export function SubjectPage() {
  const { subjectId } = useParams();
  const subject = getSubject(subjectId);

  if (!subject) return <NotFound />;

  const entries = getSubjectEntries(subject);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Início', to: '/' }, { label: subject.title }]}
        title={subject.title}
        subtitle={subject.description}
      />
      <AlgorithmBrowser entries={entries} groups={subject.groups} />
    </>
  );
}
