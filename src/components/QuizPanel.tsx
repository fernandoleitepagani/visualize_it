import { useMemo, useState } from 'react';
import { Badge, Button, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import type { Step } from '@/engine/types';
import type { QuizQuestion } from '@/engine/quiz';
import { buildQuizQuestion, sameArray } from '@/engine/quiz';

interface Props {
  steps: Step[];
  index: number;
  score: { correct: number; total: number };
  onAnswer: (correct: boolean) => void;
}

/** Multiple-choice quiz: guess the array produced by the next step. */
export function QuizPanel({ steps, index, score, onAnswer }: Props) {
  const question = useMemo(() => buildQuizQuestion(steps, index), [steps, index]);
  const [answer, setAnswer] = useState<{ question: QuizQuestion; choice: number[] } | null>(null);

  // The memo gives a new identity whenever the step changes, so no reset effect
  // (or setState-in-effect) is needed.
  const answered = answer !== null && answer.question === question;
  const choice = answered ? answer.choice : null;

  if (!question) {
    return (
      <Paper withBorder radius="md" px="md" py="sm" mt="sm">
        <Text fz="sm" c="dimmed">
          Não há próximo passo para perguntar.
        </Text>
      </Paper>
    );
  }

  const choose = (option: number[]) => {
    if (answered) return;
    setAnswer({ question, choice: option });
    onAnswer(sameArray(option, question.correct));
  };

  const isRight = choice !== null && sameArray(choice, question.correct);

  return (
    <Paper withBorder radius="md" px="md" py="md" mt="sm">
      <Group justify="space-between" mb="sm" gap="xs">
        <Text fz="sm" fw={600}>
          Qual é o vetor do próximo passo?
        </Text>
        <Badge variant="light" color="amber">
          {score.correct} / {score.total}
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
        {question.options.map((option, i) => {
          const correctOption = sameArray(option, question.correct);
          const chosen = choice !== null && sameArray(option, choice);
          const color = answered ? (correctOption ? 'green' : chosen ? 'red' : 'gray') : undefined;

          return (
            <Button
              key={i}
              variant={answered && correctOption ? 'filled' : 'default'}
              color={color}
              disabled={answered}
              onClick={() => choose(option)}
              styles={{
                label: {
                  fontFamily: 'var(--mantine-font-family-monospace)',
                  whiteSpace: 'normal',
                },
              }}
            >
              [{option.join(', ')}]
            </Button>
          );
        })}
      </SimpleGrid>

      {answered ? (
        <Text fz="sm" mt="sm" c={isRight ? 'green' : 'red'}>
          {isRight ? 'Correto!' : `Incorreto — resposta: [${question.correct.join(', ')}]`}
        </Text>
      ) : null}
    </Paper>
  );
}
