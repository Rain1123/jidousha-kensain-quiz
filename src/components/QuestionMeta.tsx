import type { Question } from '../types/question';
import { getQuestionTypeLabel } from '../types/question';

interface QuestionMetaProps {
  question: Question;
}

export function QuestionMeta({ question }: QuestionMetaProps) {
  return (
    <div className="question-meta">
      <span className="badge badge-exam" title="年度">
        {question.category}
      </span>
      {'section' in question && question.section && (
        <span className="badge badge-section">{question.section}</span>
      )}
      <span className="badge badge-type" title="カテゴリ">
        {getQuestionTypeLabel(question)}
      </span>
      <span className="question-id">{question.id}</span>
    </div>
  );
}
