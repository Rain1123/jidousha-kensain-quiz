import type { TrueFalseQuestion } from '../types/question';
import { QuestionMeta } from './QuestionMeta';

interface TrueFalseViewProps {
  question: TrueFalseQuestion;
  sessionIndex: number;
  sessionTotal: number;
  selectedAnswer: boolean | null;
  showResult: boolean;
  onSelect: (value: boolean) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function TrueFalseView({
  question,
  sessionIndex,
  sessionTotal,
  selectedAnswer,
  showResult,
  onSelect,
  onSubmit,
  onNext,
}: TrueFalseViewProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isLast = sessionIndex >= sessionTotal;

  return (
    <section className="quiz-view" aria-live="polite">
      <QuestionMeta question={question} />

      <p className="question-text">{question.question}</p>

      <fieldset className="choices tf-choices" disabled={showResult}>
        <legend className="sr-only">○×判断</legend>
        {[
          { value: true, label: '○（適切）' },
          { value: false, label: '×（不適切）' },
        ].map(({ value, label }) => {
          let className = 'choice';
          if (selectedAnswer === value) className += ' selected';
          if (showResult) {
            if (value === question.correctAnswer) className += ' correct';
            else if (selectedAnswer === value) className += ' incorrect';
          }

          return (
            <label key={label} className={className}>
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={selectedAnswer === value}
                onChange={() => onSelect(value)}
              />
              <span className="choice-text tf-label">{label}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="quiz-actions">
        {!showResult ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={selectedAnswer === null}
          >
            解答する
          </button>
        ) : (
          <>
            <div
              className={`result-banner ${isCorrect ? 'result-correct' : 'result-incorrect'}`}
              role="status"
            >
              {isCorrect ? '正解です！' : `不正解です（正解: ${question.correctAnswer ? '○' : '×'}）`}
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
