import type { QuizMode } from '../types/question';

interface FilterPanelProps {
  categories: string[];
  years: number[];
  category: string;
  year: string;
  mode: QuizMode;
  wrongCount: number;
  onCategoryChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onModeChange: (mode: QuizMode) => void;
}

export function FilterPanel({
  categories,
  years,
  category,
  year,
  mode,
  wrongCount,
  onCategoryChange,
  onYearChange,
  onModeChange,
}: FilterPanelProps) {
  return (
    <section className="filter-panel" aria-label="フィルタ設定">
      <div className="filter-row">
        <label htmlFor="category-filter">カテゴリ</label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">すべて</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <label htmlFor="year-filter">年度</label>
        <select
          id="year-filter"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="all">すべて</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}年
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
