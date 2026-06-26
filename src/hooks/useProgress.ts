import { useCallback, useEffect, useState } from 'react';
import type { AnswerRecord, Progress, QuizMode } from '../types/question';
import { loadProgress, saveProgress } from '../utils/storage';

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const recordAnswer = useCallback(
    (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
      const record: AnswerRecord = {
        questionId,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date().toISOString(),
      };

      setProgress((prev) => {
        const wrongSet = new Set(prev.wrongQuestionIds);
        if (!isCorrect) {
          wrongSet.add(questionId);
        } else {
          wrongSet.delete(questionId);
        }

        const answered = [
          ...prev.answered.filter((a) => a.questionId !== questionId),
          record,
        ];

        return {
          ...prev,
          answered,
          wrongQuestionIds: Array.from(wrongSet),
        };
      });
    },
    [],
  );

  const setFilters = useCallback((examSession: string, questionType: string) => {
    setProgress((prev) => ({
      ...prev,
      lastFilters: { examSession, questionType },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      answered: [],
      wrongQuestionIds: [],
      lastFilters: { examSession: 'all', questionType: 'all' },
    });
  }, []);

  const getStats = useCallback(
    (totalInSession: number, mode: QuizMode) => {
      const answeredCount = progress.answered.length;
      const correctCount = progress.answered.filter((a) => a.isCorrect).length;
      const wrongCount = progress.wrongQuestionIds.length;

      return {
        answeredCount,
        correctCount,
        wrongCount,
        sessionTotal: totalInSession,
        mode,
      };
    },
    [progress],
  );

  return {
    progress,
    recordAnswer,
    setFilters,
    resetProgress,
    getStats,
  };
}
