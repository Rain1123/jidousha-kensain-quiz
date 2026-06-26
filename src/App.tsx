import { useCallback, useEffect, useMemo, useState } from 'react';

import questionsData from '@data/questions.json';

import examData from '@data/exams/r4-2022-02.json';

import r5FirstExamData from '@data/exams/r5-2023-01.json';

import r5ExamData from '@data/exams/r5-2023-02.json';

import r6FirstExamData from '@data/exams/r6-2024-01.json';

import r6SecondExamData from '@data/exams/r6-2024-02.json';

import { ClozeView } from './components/ClozeView';

import { FilterPanel } from './components/FilterPanel';

import { Header } from './components/Header';

import { MatchingView } from './components/MatchingView';

import { QuizView } from './components/QuizView';

import { ResultView } from './components/ResultView';

import { TrueFalseView } from './components/TrueFalseView';

import { useProgress } from './hooks/useProgress';

import type { Question, QuizMode } from './types/question';

import {

  getBlankCount,

  getQuestionTypeKey,

  isChoiceQuestion,

  isClozeQuestion,

  isMatchingQuestion,

  isTrueFalseQuestion,

} from './types/question';

import { gradeClozeAnswers, gradeMatchingAnswers } from './utils/grading';

import { shuffleArray } from './utils/shuffle';

import './App.css';



const allQuestions = [
  ...(questionsData as Question[]),
  ...(examData as Question[]),
  ...(r5FirstExamData as Question[]),
  ...(r5ExamData as Question[]),
  ...(r6FirstExamData as Question[]),
  ...(r6SecondExamData as Question[]),
];



type AppPhase = 'quiz' | 'result';



function filterQuestions(

  questions: Question[],

  examSession: string,

  questionType: string,

  mode: QuizMode,

  wrongIds: Set<string>,

): Question[] {

  return questions.filter((q) => {

    if (mode === 'review' && !wrongIds.has(q.id)) return false;

    if (examSession !== 'all' && q.category !== examSession) return false;

    if (questionType !== 'all' && getQuestionTypeKey(q) !== questionType) return false;

    return true;

  });

}



function resetAnswerState(question: Question | undefined) {

  const blankCount = question ? getBlankCount(question) : 0;

  return {

    selectedAnswer: null as number | null,

    tfAnswer: null as boolean | null,

    blankInputs: blankCount > 0 ? Array(blankCount).fill('') : [],

  };

}



export default function App() {

  const { progress, recordAnswer, setFilters, resetProgress } = useProgress();



  const [mode, setMode] = useState<QuizMode>('practice');

  const [examSession, setExamSession] = useState(progress.lastFilters.examSession);

  const [questionType, setQuestionType] = useState(progress.lastFilters.questionType);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);

  const [blankInputs, setBlankInputs] = useState<string[]>([]);

  const [showResult, setShowResult] = useState(false);

  const [phase, setPhase] = useState<AppPhase>('quiz');

  const [sessionCorrect, setSessionCorrect] = useState(0);

  const [sessionWrong, setSessionWrong] = useState(0);

  const [shuffleKey, setShuffleKey] = useState(0);



  const examSessions = useMemo(

    () => [...new Set(allQuestions.map((q) => q.category))].sort(),

    [],

  );



  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);



  useEffect(() => {

    const filtered = filterQuestions(

      allQuestions,

      examSession,

      questionType,

      mode,

      new Set(progress.wrongQuestionIds),

    );

    setSessionQuestions(shuffleArray(filtered));

  }, [shuffleKey, examSession, questionType, mode]);



  const currentQuestion = sessionQuestions[currentIndex];

  const currentQuestionId = currentQuestion?.id;



  useEffect(() => {

    const next = resetAnswerState(currentQuestion);

    setSelectedAnswer(next.selectedAnswer);

    setTfAnswer(next.tfAnswer);

    setBlankInputs(next.blankInputs);

    setShowResult(false);

  }, [currentQuestionId, currentIndex]);



  const resetSession = useCallback(() => {

    setShuffleKey((k) => k + 1);

    setCurrentIndex(0);

    setShowResult(false);

    setPhase('quiz');

    setSessionCorrect(0);

    setSessionWrong(0);

  }, []);



  const handleExamSessionChange = useCallback(

    (value: string) => {

      setExamSession(value);

      setFilters(value, questionType);

      setCurrentIndex(0);

      setSelectedAnswer(null);

      setTfAnswer(null);

      setBlankInputs([]);

      setShowResult(false);

      setPhase('quiz');

      setSessionCorrect(0);

      setSessionWrong(0);

    },

    [setFilters, questionType],

  );



  const handleQuestionTypeChange = useCallback(

    (value: string) => {

      setQuestionType(value);

      setFilters(examSession, value);

      setCurrentIndex(0);

      setSelectedAnswer(null);

      setTfAnswer(null);

      setBlankInputs([]);

      setShowResult(false);

      setPhase('quiz');

      setSessionCorrect(0);

      setSessionWrong(0);

    },

    [examSession, setFilters],

  );



  const handleModeChange = useCallback((newMode: QuizMode) => {

    setMode(newMode);

    setCurrentIndex(0);

    setSelectedAnswer(null);

    setTfAnswer(null);

    setBlankInputs([]);

    setShowResult(false);

    setPhase('quiz');

    setSessionCorrect(0);

    setSessionWrong(0);

  }, []);



  const handleSubmit = useCallback(() => {

    if (!currentQuestion) return;



    let isCorrect = false;



    if (isClozeQuestion(currentQuestion)) {

      isCorrect = gradeClozeAnswers(blankInputs, currentQuestion.items);

      recordAnswer(currentQuestion.id, isCorrect ? 0 : 1, isCorrect);

    } else if (isMatchingQuestion(currentQuestion)) {

      isCorrect = gradeMatchingAnswers(blankInputs, currentQuestion.items);

      recordAnswer(currentQuestion.id, isCorrect ? 0 : 1, isCorrect);

    } else if (isTrueFalseQuestion(currentQuestion)) {

      if (tfAnswer === null) return;

      isCorrect = tfAnswer === currentQuestion.correctAnswer;

      recordAnswer(currentQuestion.id, isCorrect ? 0 : 1, isCorrect);

    } else if (isChoiceQuestion(currentQuestion)) {

      if (selectedAnswer === null) return;

      isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      recordAnswer(currentQuestion.id, selectedAnswer, isCorrect);

    }



    if (isCorrect) setSessionCorrect((n) => n + 1);

    else setSessionWrong((n) => n + 1);

    setShowResult(true);

  }, [currentQuestion, selectedAnswer, tfAnswer, blankInputs, recordAnswer]);



  const handleNext = useCallback(() => {

    if (currentIndex + 1 >= sessionQuestions.length) {

      setPhase('result');

      return;

    }

    setCurrentIndex((i) => i + 1);

  }, [currentIndex, sessionQuestions.length]);



  const handleRestart = useCallback(() => {

    resetSession();

  }, [resetSession]);



  const handleReset = useCallback(() => {

    if (window.confirm('進捗をすべてリセットしますか？')) {

      resetProgress();

      handleRestart();

      setExamSession('all');

      setQuestionType('all');

      setMode('practice');

    }

  }, [resetProgress, handleRestart]);



  const handleBlankInputChange = useCallback((index: number, value: string) => {

    setBlankInputs((prev) => {

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

        sessionIndex={phase === 'result' ? sessionQuestions.length : currentIndex + 1}

        sessionTotal={sessionQuestions.length}

        onReset={handleReset}

      />



      <main className="app-main">

        <FilterPanel

          examSessions={examSessions}

          examSession={examSession}

          questionType={questionType}

          mode={mode}

          wrongCount={progress.wrongQuestionIds.length}

          onExamSessionChange={handleExamSessionChange}

          onQuestionTypeChange={handleQuestionTypeChange}

          onModeChange={handleModeChange}

        />



        {sessionQuestions.length === 0 ? (

          <section className="empty-state">

            <p>

              {mode === 'review'

                ? '復習する問題がありません。通常演習で問題に挑戦しましょう。'

                : '条件に一致する問題がありません。フィルタを変更してください。'}

            </p>

          </section>

        ) : phase === 'result' ? (

          <ResultView

            total={sessionQuestions.length}

            correct={sessionCorrect}

            wrong={sessionWrong}

            onRestart={handleRestart}

          />

        ) : currentQuestion && isClozeQuestion(currentQuestion) ? (

          <ClozeView

            question={currentQuestion}

            sessionIndex={currentIndex + 1}

            sessionTotal={sessionQuestions.length}

            inputs={blankInputs}

            showResult={showResult}

            onInputChange={handleBlankInputChange}

            onSubmit={handleSubmit}

            onNext={handleNext}

          />

        ) : currentQuestion && isMatchingQuestion(currentQuestion) ? (

          <MatchingView

            question={currentQuestion}

            sessionIndex={currentIndex + 1}

            sessionTotal={sessionQuestions.length}

            inputs={blankInputs}

            showResult={showResult}

            onInputChange={handleBlankInputChange}

            onSubmit={handleSubmit}

            onNext={handleNext}

          />

        ) : currentQuestion && isTrueFalseQuestion(currentQuestion) ? (

          <TrueFalseView

            question={currentQuestion}

            sessionIndex={currentIndex + 1}

            sessionTotal={sessionQuestions.length}

            selectedAnswer={tfAnswer}

            showResult={showResult}

            onSelect={setTfAnswer}

            onSubmit={handleSubmit}

            onNext={handleNext}

          />

        ) : currentQuestion && isChoiceQuestion(currentQuestion) ? (

          <QuizView

            question={currentQuestion}

            sessionIndex={currentIndex + 1}

            sessionTotal={sessionQuestions.length}

            selectedAnswer={selectedAnswer}

            showResult={showResult}

            onSelect={setSelectedAnswer}

            onSubmit={handleSubmit}

            onNext={handleNext}

          />

        ) : null}

      </main>



      <footer className="app-footer">

        <p>※ 学習用に登録した問題です。個人の学習目的でご利用ください。</p>

      </footer>

    </div>

  );

}


