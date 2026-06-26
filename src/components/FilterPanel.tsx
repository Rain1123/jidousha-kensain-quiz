import type { QuizMode } from '../types/question';
import { QUESTION_TYPE_OPTIONS } from '../types/question';

interface FilterPanelProps {
  examSessions: string[];
  examSession: string;
  questionType: string;
  mode: QuizMode;
  wrongCount: number;
  onExamSessionChange: (value: string) => void;
  onQuestionTypeChange: (value: string) => void;
  onModeChange: (mode: QuizMode) => void;
}

export function FilterPanel({
  examSessions,
  examSession,
  questionType,
  mode,
  wrongCount,
  onExamSessionChange,
  onQuestionTypeChange,
  onModeChange,
}: FilterPanelProps) {
  return (
    <section className="filter-panel" aria-label="フィルタ設定">
      <div className="filter-row">
        <label htmlFor="exam-session-filter">年度</label>
        <select
          id="exam-session-filter"
          value={examSession}
          onChange={(e) => onExamSessionChange(e.target.value)}
        >
          <option value="all">すべて</option>
          {examSessions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label htmlFor="question-type-filter">カテゴリ</label>
        <select
          id="question-type-filter"
          value={questionType}
          onChange={(e) => onQuestionTypeChange(e.target.value)}
        >
          <option value="all">すべて</option>
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mode-toggle" role="group" aria-label="学習モード">
        <button
          type="button"
          className={mode === 'practice' ? 'active' : ''}
          onClick={() => onModeChange('practice')}
        >
          通常演習
        </button>
        <button
          type="button"
          className={mode === 'review' ? 'active' : ''}
          onClick={() => onModeChange('review')}
          disabled={wrongCount === 0}
          title={wrongCount === 0 ? '間違えた問題がありません' : undefined}
        >
          復習モード ({wrongCount})
        </button>
      </div>
    </section>
  );
}
