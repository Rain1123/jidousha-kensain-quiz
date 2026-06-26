import type { MatchingQuestion } from '../types/question';
import { isClozeItemCorrect, splitMatchingText } from '../utils/grading';
import { FormattedText } from './FormattedText';
import { QuestionMeta } from './QuestionMeta';

interface MatchingViewProps {
  question: MatchingQuestion;
  sessionIndex: number;
  sessionTotal: number;
  inputs: string[];
  showResult: boolean;
  onInputChange: (index: number, value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function MatchingView({
  question,
  sessionIndex,
  sessionTotal,
  inputs,
  showResult,
  onInputChange,
  onSubmit,
  onNext,
}: MatchingViewProps) {
  const isLast = sessionIndex >= sessionTotal;
  const blankCount = question.items.reduce((sum, item) => sum + item.blanks.length, 0);
  const allFilled = inputs.length === blankCount && inputs.every((v) => v.trim());
  let inputOffset = 0;

  const allCorrect =
    showResult &&
    question.items.every((item) =>
      item.blanks.every((blank) => {
        const value = inputs[inputOffset] ?? '';
        const correct = isClozeItemCorrect(value, blank.answer, blank.acceptableAnswers);
        inputOffset += 1;
        return correct;
      }),
    );

  return (
    <section className="quiz-view matching-view" aria-live="polite">
      <QuestionMeta question={question} />

      <FormattedText text={question.question} className="question-text question-instruction" />

      <div className="choice-pool" aria-label="選択肢一覧">
        <h3 className="choice-pool-title">〔選択肢〕</h3>
        <ul className="choice-pool-list">
          {question.choicePool.map((option) => (
            <li key={option.symbol}>
              <strong>{option.symbol}</strong>：{option.text}
            </li>
          ))}
        </ul>
      </div>

      <ol className="cloze-items">
        {question.items.map((item) => {
          const parts = splitMatchingText(item.text);
          let itemInputIndex = 0;

          return (
            <li key={item.number} className="cloze-item">
              <div className="cloze-item-header">
                <span className="cloze-number">{item.number}</span>
              </div>
              <div className="cloze-sentence matching-sentence">
                {parts.map((part, partIndex) => {
                  if (typeof part === 'string') {
                    if (part.includes('\n') || part.includes('|')) {
                      return <FormattedText key={partIndex} text={part} />;
                    }
                    return <span key={partIndex}>{part}</span>;
                  }

                  const globalIndex =
                    question.items
                      .slice(0, question.items.indexOf(item))
                      .reduce((sum, prev) => sum + prev.blanks.length, 0) + itemInputIndex;
                  const blank = item.blanks[itemInputIndex];
                  itemInputIndex += 1;
                  const value = inputs[globalIndex] ?? '';
                  const itemCorrect = showResult
                    ? isClozeItemCorrect(value, blank.answer, blank.acceptableAnswers)
                    : null;

                  return (
                    <span key={partIndex} className="matching-blank-wrap">
                      <span className="blank-label">（{part.label}）</span>
                      <select
                        className={`matching-select ${showResult ? (itemCorrect ? 'correct' : 'incorrect') : ''}`}
                        value={value}
                        onChange={(e) => onInputChange(globalIndex, e.target.value)}
                        disabled={showResult}
                        aria-label={`${item.number}の${part.label}`}
                      >
                        <option value="">選択</option>
                        {question.choicePool.map((option) => (
                          <option key={option.symbol} value={option.symbol}>
                            {option.symbol}
                          </option>
                        ))}
                      </select>
                      {showResult && !itemCorrect && (
                        <span className="cloze-answer-hint inline-hint">
                          正解: <strong>{blank.answer}</strong>
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="quiz-actions">
        {!showResult ? (
          <button type="button" className="btn-primary" onClick={onSubmit} disabled={!allFilled}>
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
