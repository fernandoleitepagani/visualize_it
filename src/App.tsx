import { useState, useMemo } from 'react';
import { selectionSortLesson } from './lessons/selection-sort/algorithm';
import { insertionSortLesson } from './lessons/insertion-sort/algorithm';
import { usePlayback } from './engine/usePlayback';
import { LessonShell } from './components/LessonShell/LessonShell';
import { CodePanel } from './components/CodePanel/CodePanel';
import { ArrayView } from './components/ArrayView/ArrayView';
import { PlayerControls } from './components/PlayerControls/PlayerControls';

const LESSONS = [selectionSortLesson, insertionSortLesson];

function parseInput(input: string): number[] {
  const arr = input.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));
  return arr.length > 0 ? arr : [24, 12, 45, 9, 32, 5, 18];
}

export default function App() {
  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id);
  const [inputValue, setInputValue] = useState('24, 12, 45, 9, 32, 5, 18');
  const [array, setArray] = useState<number[]>(parseInput(inputValue));

  const activeLesson = useMemo(() =>
    LESSONS.find(l => l.id === activeLessonId) || LESSONS[0]
    , [activeLessonId]);

  // Recalcula os steps apenas se o array ou a lição mudarem
  const steps = useMemo(() =>
    activeLesson.generateSteps(array)
    , [array, activeLesson]);

  const playback = usePlayback(steps);

  const handleApply = () => setArray(parseInput(inputValue));

  const currentStep = playback.currentStep || steps[0];

  return (
    <div className="app-layout">
      <header className="topbar">
        <h2>
          Visualisit <span className="subtitle">/ </span>
          <select
            value={activeLessonId}
            onChange={(e) => setActiveLessonId(e.target.value)}
            style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: 'inherit', outline: 'none', cursor: 'pointer' }}
          >
            {LESSONS.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </h2>
        <div className="input-bar">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ex: 5, 2, 9, 1, 7"
          />
          <button onClick={handleApply}>Aplicar Array</button>
        </div>
      </header>

      <LessonShell
        leftPanel={<CodePanel code={activeLesson.pseudocode} activeLine={currentStep?.activeLine ?? -1} />}
        rightPanel={<ArrayView state={currentStep?.state} />}
        bottomBar={<PlayerControls {...playback} />}
      />
    </div>
  );
}
