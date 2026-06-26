import type { ClozeQuestion } from '../types/question';
import { flattenClozeBlanks, getClozeItemAnswers } from '../utils/grading';
import { FormattedText } from './FormattedText';
import { QuestionMeta } from './QuestionMeta';
import {
  ClozeSentence,
  getClozeItemBlankCount,
  isClozeItemAllCorrect,
} from './ClozeSentence';

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
  const blankCount = flattenClozeBlanks(question.items).length;
  const allFilled = inputs.length === blankCount && inputs.every((v) => v.trim());

  let inputOffset = 0;
  const allCorrect =
    showResult &&
    question.items.every((item) => {
      const correct = isClozeItemAllCorrect(item, inputs, inputOffset);
      inputOffset += getClozeItemBlankCount(item);
      return correct;
    });

  let renderOffset = 0;

  return (
    <section className="quiz-view cloze-view" aria-live="polite">
      <QuestionMeta question={question} />

      <FormattedText text={question.question} className="question-text question-instruction" />

      <ol className="cloze-items">
        {question.items.map((item, index) => {
          const itemOffset = renderOffset;
          const itemBlankCount = getClozeItemBlankCount(item);
          renderOffset += itemBlankCount;

          const itemCorrect = showResult
            ? isClozeItemAllCorrect(item, inputs, itemOffset)
            : null;
          const answers = getClozeItemAnswers(item);

          return (
            <li key={`${item.number}-${index}`} className="cloze-item">
              <div className="cloze-item-header">
                <span className="cloze-number">{item.number}</span>
                {showResult && itemBlankCount > 0 && (
                  <span
                    className={`cloze-item-result ${itemCorrect ? 'correct' : 'incorrect'}`}
                  >
                    {itemCorrect ? '正解' : '不正解'}
                  </span>
                )}
              </div>
              <ClozeSentence
                item={item}
                inputs={inputs}
                inputOffset={itemOffset}
                showResult={showResult}
                disabled={showResult}
                onInputChange={onInputChange}
              />
              {showResult && !itemCorrect && itemBlankCount > 0 && (
                <p className="cloze-answer-hint">
                  正解:{' '}
                  <strong>
                    {answers.length === 1
                      ? answers[0]
                      : answers.map((answer, answerIndex) => `${answerIndex + 1}) ${answer}`).join('、')}
                  </strong>
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
