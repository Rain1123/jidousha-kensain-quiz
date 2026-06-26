export interface ClozeItem {
  number: string;
  text: string;
  answer: string;
  acceptableAnswers?: string[];
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

export type Question = ChoiceQuestion | ClozeQuestion;

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

export function isChoiceQuestion(question: Question): question is ChoiceQuestion {
  return question.type !== 'cloze';
}
