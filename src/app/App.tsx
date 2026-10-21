import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box } from '@mantine/core';
import { Layout } from '@/components/Layout';
import { ComparePage } from '@/pages/ComparePage';
import { HomePage } from '@/pages/HomePage';
import { LessonPage } from '@/pages/LessonPage';
import { NotFound } from '@/pages/NotFound';
import { PlaygroundPage } from '@/pages/PlaygroundPage';
import { SubjectPage } from '@/pages/SubjectPage';
import { TheoryPage } from '@/pages/TheoryPage';

/** Route changes start at the top and get a short, reduced-motion-aware entry. */
function RouteFrame() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <Box key={pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/materias/:subjectId" element={<SubjectPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/algoritmos/:slug" element={<LessonPage />} />
        <Route path="/teoria/:slug" element={<TheoryPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
}

export function App() {
  return (
    <Layout>
      <RouteFrame />
    </Layout>
  );
}
