import type { Progress } from '../types/question';
import { STORAGE_KEY } from '../types/question';

const defaultProgress = (): Progress => ({
  answered: [],
  wrongQuestionIds: [],
  lastFilters: { examSession: 'all', questionType: 'all' },
});

function migrateLastFilters(raw: unknown): Progress['lastFilters'] {
  const defaults = defaultProgress().lastFilters;
  if (!raw || typeof raw !== 'object') return defaults;

  const filters = raw as Record<string, string>;

  if ('examSession' in filters || 'questionType' in filters) {
    const questionType =
      filters.questionType === 'choice' ? defaults.questionType : (filters.questionType ?? defaults.questionType);
    return {
      examSession: filters.examSession ?? defaults.examSession,
      questionType,
    };
  }

  const legacyCategory = filters.category ?? defaults.examSession;
  const legacyYear = filters.year ?? defaults.questionType;

  if (legacyYear !== 'all' && /^\d{4}$/.test(legacyYear)) {
    return {
      examSession: legacyCategory.includes('年度') ? legacyCategory : defaults.examSession,
      questionType: defaults.questionType,
    };
  }

  return {
    examSession: legacyCategory,
    questionType: legacyYear,
  };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...defaultProgress(),
      ...parsed,
      lastFilters: migrateLastFilters(parsed.lastFilters),
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
