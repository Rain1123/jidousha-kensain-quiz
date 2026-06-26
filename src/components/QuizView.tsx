import type { ChoiceQuestion } from '../types/question';

interface QuizViewProps {
  question: ChoiceQuestion;
  sessionIndex: number;
  sessionTotal: number;
  selectedAnswer: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function QuizView({
  question,
  sessionIndex,
  sessionTotal,
  selectedAnswer,
  showResult,
  onSelect,
  onSubmit,
  onNext,
}: QuizViewProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isLast = sessionIndex >= sessionTotal;

  return (
    <section className="quiz-view" aria-live="polite">
      <div className="question-meta">
        <span className="badge">{question.category}</span>
        {question.year && <span className="badge badge-year">{question.year}年</span>}
        <span className="question-id">{question.id}</span>
      </div>

      <p className="question-text">{question.question}</p>

      <fieldset className="choices" disabled={showResult}>
        <legend className="sr-only">選択肢</legend>
        {question.choices.map((choice, index) => {
          let className = 'choice';
          if (selectedAnswer === index) className += ' selected';
          if (showResult) {
            if (index === question.correctAnswer) className += ' correct';
            else if (selectedAnswer === index) className += ' incorrect';
          }

          return (
            <label key={index} className={className}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={selectedAnswer === index}
                onChange={() => onSelect(index)}
              />
              <span className="choice-label">{String.fromCharCode(65 + index)}.</span>
              <span className="choice-text">{choice}</span>
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
              {isCorrect ? '正解です！' : '不正解です'}
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
