interface ResultViewProps {
  total: number;
  correct: number;
  wrong: number;
  onRestart: () => void;
}

export function ResultView({ total, correct, wrong, onRestart }: ResultViewProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <section className="result-view">
      <h2>セッション結果</h2>
      <div className="result-summary">
        <div className="result-stat">
          <span className="result-value">{total}</span>
          <span className="result-label">出題数</span>
        </div>
        <div className="result-stat correct">
          <span className="result-value">{correct}</span>
          <span className="result-label">正解</span>
        </div>
        <div className="result-stat incorrect">
          <span className="result-value">{wrong}</span>
          <span className="result-label">不正解</span>
        </div>
        <div className="result-stat">
          <span className="result-value">{accuracy}%</span>
          <span className="result-label">正答率</span>
        </div>
      </div>
      {wrong > 0 && (
        <p className="review-hint">
          間違えた問題は「復習モード」で再度挑戦できます。
        </p>
      )}
      <button type="button" className="btn-primary" onClick={onRestart}>
        もう一度挑戦
      </button>
    </section>
  );
}
