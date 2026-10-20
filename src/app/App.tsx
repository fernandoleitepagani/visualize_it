import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { LessonPage } from '@/pages/LessonPage';
import { NotFound } from '@/pages/NotFound';
import { SubjectPage } from '@/pages/SubjectPage';
import { TheoryPage } from '@/pages/TheoryPage';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/materias/:subjectId" element={<SubjectPage />} />
        <Route path="/algoritmos/:slug" element={<LessonPage />} />
        <Route path="/teoria/:slug" element={<TheoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
