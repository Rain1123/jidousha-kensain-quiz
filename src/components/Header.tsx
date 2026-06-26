interface HeaderProps {
  answeredCount: number;
  correctCount: number;
  sessionIndex: number;
  sessionTotal: number;
  onReset: () => void;
}

export function Header({
  answeredCount,
  correctCount,
  sessionIndex,
  sessionTotal,
  onReset,
}: HeaderProps) {
  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <header className="app-header">
      <div className="header-top">
        <h1>自動車検査員試験 クイズ</h1>
        <button type="button" className="btn-reset" onClick={onReset}>
          進捗リセット
        </button>
      </div>
      <div className="stats-bar">
        <span>
          進捗: {sessionIndex}/{sessionTotal}
        </span>
        <span>解答済: {answeredCount}問</span>
        <span>正答率: {accuracy}%</span>
      </div>
    </header>
  );
}
