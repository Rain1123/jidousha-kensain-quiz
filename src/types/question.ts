export interface ClozeItem {
  number: string;
  text: string;
  answer: string;
  acceptableAnswers?: string[];
}

export interface MatchingBlank {
  label: string;
  answer: string;
  acceptableAnswers?: string[];
}

export interface MatchingItem {
  number: string;
  text: string;
  blanks: MatchingBlank[];
}

export interface ChoicePoolOption {
  symbol: string;
  text: string;
}

export interface ChoiceQuestion {
  type?: 'choice';
  id: string;
  category: string;
  year?: number;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ClozeQuestion {
  type: 'cloze';
  id: string;
  category: string;
  year?: number;
  question: string;
  items: ClozeItem[];
  explanation?: string;
}

export interface TrueFalseQuestion {
  type: 'truefalse';
  id: string;
  category: string;
  year?: number;
  section?: string;
  question: string;
  correctAnswer: boolean;
  explanation?: string;
}

export interface MatchingQuestion {
  type: 'matching';
  id: string;
  category: string;
  year?: number;
  question: string;
  choicePool: ChoicePoolOption[];
  items: MatchingItem[];
  explanation?: string;
}

export type Question =
  | ChoiceQuestion
  | ClozeQuestion
  | TrueFalseQuestion
  | MatchingQuestion;

export type QuizMode = 'practice' | 'review';

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface Progress {
  answered: AnswerRecord[];
  wrongQuestionIds: string[];
  lastFilters: {
    category: string;
    year: string;
  };
}

export const STORAGE_KEY = 'jidousha-kensain-quiz-progress';

export function isClozeQuestion(question: Question): question is ClozeQuestion {
  return question.type === 'cloze';
}

export function isMatchingQuestion(question: Question): question is MatchingQuestion {
  return question.type === 'matching';
}

export function isTrueFalseQuestion(question: Question): question is TrueFalseQuestion {
  return question.type === 'truefalse';
}

export function isChoiceQuestion(question: Question): question is ChoiceQuestion {
  return !question.type || question.type === 'choice';
}

export function getBlankCount(question: Question): number {
  if (isClozeQuestion(question)) return question.items.length;
  if (isMatchingQuestion(question)) {
    return question.items.reduce((sum, item) => sum + item.blanks.length, 0);
  }
  return 0;
}
