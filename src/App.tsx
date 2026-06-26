import { useCallback, useEffect, useMemo, useState } from 'react';
import questionsData from '@data/questions.json';
import { ClozeView } from './components/ClozeView';
import { FilterPanel } from './components/FilterPanel';
import { Header } from './components/Header';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { useProgress } from './hooks/useProgress';
import type { Question, QuizMode } from './types/question';
import { isClozeQuestion } from './types/question';
import { gradeClozeAnswers } from './utils/grading';
import './App.css';

const allQuestions = questionsData as Question[];

type AppPhase = 'quiz' | 'result';

function filterQuestions(
  questions: Question[],
  category: string,
  year: string,
  mode: QuizMode,
  wrongIds: Set<string>,
): Question[] {
  return questions.filter((q) => {
    if (mode === 'review' && !wrongIds.has(q.id)) return false;
    if (category !== 'all' && q.category !== category) return false;
    if (year !== 'all' && String(q.year) !== year) return false;
    return true;
  });
}

function resetAnswerState(question: Question | undefined) {
  return {
    selectedAnswer: null as number | null,
    clozeInputs: question && isClozeQuestion(question)
      ? Array(question.items.length).fill('')
      : [],
  };
}

export default function App() {
  const { progress, recordAnswer, setFilters, resetProgress } = useProgress();

  const [mode, setMode] = useState<QuizMode>('practice');
  const [category, setCategory] = useState(progress.lastFilters.category);
  const [year, setYear] = useState(progress.lastFilters.year);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [clozeInputs, setClozeInputs] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [phase, setPhase] = useState<AppPhase>('quiz');
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  const categories = useMemo(
    () => [...new Set(allQuestions.map((q) => q.category))].sort(),
    [],
  );

  const years = useMemo(
    () =>
      [...new Set(allQuestions.map((q) => q.year).filter((y): y is number => y != null))].sort(
        (a, b) => b - a,
      ),
    [],
  );

  const wrongIdSet = useMemo(() => new Set(progress.wrongQuestionIds), [progress.wrongQuestionIds]);

  const filteredQuestions = useMemo(
    () => filterQuestions(allQuestions, category, year, mode, wrongIdSet),
    [category, year, mode, wrongIdSet],
  );

  const currentQuestion = filteredQuestions[currentIndex];

  useEffect(() => {
    const next = resetAnswerState(currentQuestion);
    setSelectedAnswer(next.selectedAnswer);
    setClozeInputs(next.clozeInputs);
    setShowResult(false);
  }, [currentQuestion]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    const next = resetAnswerState(filteredQuestions[0]);
    setSelectedAnswer(next.selectedAnswer);
    setClozeInputs(next.clozeInputs);
    setShowResult(false);
    setPhase('quiz');
    setSessionCorrect(0);
    setSessionWrong(0);
  }, [filteredQuestions]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategory(value);
      setFilters(value, year);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setClozeInputs([]);
      setShowResult(false);
      setPhase('quiz');
      setSessionCorrect(0);
      setSessionWrong(0);
    },
    [setFilters, year],
  );

  const handleYearChange = useCallback(
    (value: string) => {
      setYear(value);
      setFilters(category, value);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setClozeInputs([]);
      setShowResult(false);
      setPhase('quiz');
      setSessionCorrect(0);
      setSessionWrong(0);
    },
    [category, setFilters],
  );

  const handleModeChange = useCallback((newMode: QuizMode) => {
    setMode(newMode);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setClozeInputs([]);
    setShowResult(false);
    setPhase('quiz');
    setSessionCorrect(0);
    setSessionWrong(0);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!currentQuestion) return;

    let isCorrect = false;

    if (isClozeQuestion(currentQuestion)) {
      isCorrect = gradeClozeAnswers(clozeInputs, currentQuestion.items);
      recordAnswer(currentQuestion.id, isCorrect ? 0 : 1, isCorrect);
    } else {
      if (selectedAnswer === null) return;
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      recordAnswer(currentQuestion.id, selectedAnswer, isCorrect);
    }

    if (isCorrect) setSessionCorrect((n) => n + 1);
    else setSessionWrong((n) => n + 1);
    setShowResult(true);
  }, [currentQuestion, selectedAnswer, clozeInputs, recordAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      setPhase('result');
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, filteredQuestions.length]);

  const handleRestart = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleReset = useCallback(() => {
    if (window.confirm('進捗をすべてリセットしますか？')) {
      resetProgress();
      handleRestart();
      setCategory('all');
      setYear('all');
      setMode('practice');
    }
  }, [resetProgress, handleRestart]);

  const handleClozeInputChange = useCallback((index: number, value: string) => {
    setClozeInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  return (
    <div className="app">
      <Header
        answeredCount={progress.answered.length}
        correctCount={progress.answered.filter((a) => a.isCorrect).length}
        sessionIndex={phase === 'result' ? filteredQuestions.length : currentIndex + 1}
        sessionTotal={filteredQuestions.length}
        onReset={handleReset}
      />

      <main className="app-main">
        <FilterPanel
          categories={categories}
          years={years}
          category={category}
          year={year}
          mode={mode}
          wrongCount={progress.wrongQuestionIds.length}
          onCategoryChange={handleCategoryChange}
          onYearChange={handleYearChange}
          onModeChange={handleModeChange}
        />

        {filteredQuestions.length === 0 ? (
          <section className="empty-state">
            <p>
              {mode === 'review'
                ? '復習する問題がありません。通常演習で問題に挑戦しましょう。'
                : '条件に一致する問題がありません。フィルタを変更してください。'}
            </p>
          </section>
        ) : phase === 'result' ? (
          <ResultView
            total={filteredQuestions.length}
            correct={sessionCorrect}
            wrong={sessionWrong}
            onRestart={handleRestart}
          />
        ) : currentQuestion && isClozeQuestion(currentQuestion) ? (
          <ClozeView
            question={currentQuestion}
            sessionIndex={currentIndex + 1}
            sessionTotal={filteredQuestions.length}
            inputs={clozeInputs}
            showResult={showResult}
            onInputChange={handleClozeInputChange}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        ) : currentQuestion ? (
          <QuizView
            question={currentQuestion}
            sessionIndex={currentIndex + 1}
            sessionTotal={filteredQuestions.length}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            onSelect={setSelectedAnswer}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        ) : null}
      </main>

      <footer className="app-footer">
        <p>※ 本アプリの問題は学習用のオリジナル類題です。実際の過去問とは異なります。</p>
      </footer>
    </div>
  );
}
