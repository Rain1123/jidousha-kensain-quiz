import type { Progress } from '../types/question';
import { STORAGE_KEY } from '../types/question';

const defaultProgress = (): Progress => ({
  answered: [],
  wrongQuestionIds: [],
  lastFilters: { category: 'all', year: 'all' },
});

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Progress;
    return {
      ...defaultProgress(),
      ...parsed,
      lastFilters: { ...defaultProgress().lastFilters, ...parsed.lastFilters },
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
