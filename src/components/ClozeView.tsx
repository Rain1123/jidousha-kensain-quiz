import type { ClozeQuestion } from '../types/question';
import { isClozeItemCorrect, splitClozeText } from '../utils/grading';

interface ClozeViewProps {
  question: ClozeQuestion;
  sessionIndex: number;
  sessionTotal: number;
  inputs: string[];
  showResult: boolean;
  onInputChange: (index: number, value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function ClozeView({
  question,
  sessionIndex,
  sessionTotal,
  inputs,
  showResult,
  onInputChange,
  onSubmit,
  onNext,
}: ClozeViewProps) {
  const isLast = sessionIndex >= sessionTotal;
  const allFilled = inputs.length === question.items.length && inputs.every((v) => v.trim());
  const allCorrect =
    showResult &&
    question.items.every((item, index) =>
      isClozeItemCorrect(inputs[index] ?? '', item.answer, item.acceptableAnswers),
    );

  return (
    <section className="quiz-view cloze-view" aria-live="polite">
      <div className="question-meta">
        <span className="badge">{question.category}</span>
        <span className="badge badge-cloze">穴埋め</span>
        {question.year && <span className="badge badge-year">{question.year}年</span>}
        <span className="question-id">{question.id}</span>
      </div>

      <p className="question-text question-instruction">{question.question}</p>

      <ol className="cloze-items">
        {question.items.map((item, index) => {
          const [before, after] = splitClozeText(item.text);
          const inputValue = inputs[index] ?? '';
          const itemCorrect = showResult
            ? isClozeItemCorrect(inputValue, item.answer, item.acceptableAnswers)
            : null;

          return (
            <li key={item.number} className="cloze-item">
              <div className="cloze-item-header">
                <span className="cloze-number">{item.number}</span>
                {showResult && (
                  <span
                    className={`cloze-item-result ${itemCorrect ? 'correct' : 'incorrect'}`}
                  >
                    {itemCorrect ? '正解' : '不正解'}
                  </span>
                )}
              </div>
              <p className="cloze-sentence">
                {before}
                <input
                  type="text"
                  className={`cloze-input ${showResult ? (itemCorrect ? 'correct' : 'incorrect') : ''}`}
                  value={inputValue}
                  onChange={(e) => onInputChange(index, e.target.value)}
                  disabled={showResult}
                  aria-label={`設問${item.number}の解答`}
                  placeholder="語句・数値"
                  autoComplete="off"
                  inputMode="text"
                />
                {after}
              </p>
              {showResult && !itemCorrect && (
                <p className="cloze-answer-hint">
                  正解: <strong>{item.answer}</strong>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="quiz-actions">
        {!showResult ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={!allFilled}
          >
            解答する
          </button>
        ) : (
          <>
            <div
              className={`result-banner ${allCorrect ? 'result-correct' : 'result-incorrect'}`}
              role="status"
            >
              {allCorrect ? 'すべて正解です！' : '一部または全部が不正解です'}
            </div>
            {question.explanation && (
              <div className="explanation">
                <h3>解説</h3>
                <p>{question.explanation}</p>
              </div>
            )}
            <button type="button" className="btn-primary" onClick={onNext}>
              {isLast ? '結果を見る' : '次の問題へ'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
