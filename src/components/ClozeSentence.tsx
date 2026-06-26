import {
  countClozeBlanksInText,
  getClozeItemAnswers,
  getClozeItemAcceptableAnswers,
  isClozeItemCorrect,
  splitClozeParts,
} from '../utils/grading';
import type { ClozeItem } from '../types/question';
import { FormattedText } from './FormattedText';

interface ClozeSentenceProps {
  item: ClozeItem;
  inputs: string[];
  inputOffset: number;
  showResult: boolean;
  disabled: boolean;
  onInputChange: (globalIndex: number, value: string) => void;
}

export function ClozeSentence({
  item,
  inputs,
  inputOffset,
  showResult,
  disabled,
  onInputChange,
}: ClozeSentenceProps) {
  const parts = splitClozeParts(item.text);
  const answers = getClozeItemAnswers(item);
  const acceptableAnswersList = getClozeItemAcceptableAnswers(item);
  let blankIndex = 0;

  const hasTable = item.text.includes('\n') || item.text.includes('|') || item.text.startsWith('表：');

  if (hasTable && countClozeBlanksInText(item.text) === 0) {
    return <FormattedText text={item.text} className="cloze-sentence" />;
  }

  const content = parts.map((part, partIndex) => {
    if (part !== 'blank') {
      if (part.includes('\n') || part.includes('|')) {
        return <FormattedText key={partIndex} text={part} />;
      }
      return <span key={partIndex}>{part}</span>;
    }

    const globalIndex = inputOffset + blankIndex;
    const answer = answers[blankIndex] ?? '';
    const acceptableAnswers = acceptableAnswersList?.[blankIndex];
    const inputValue = inputs[globalIndex] ?? '';
    const itemCorrect = showResult
      ? isClozeItemCorrect(inputValue, answer, acceptableAnswers)
      : null;
    blankIndex += 1;

    return (
      <span key={partIndex} className="cloze-blank-slot">
        <input
          type="text"
          className={`cloze-input ${showResult ? (itemCorrect ? 'correct' : 'incorrect') : ''}`}
          value={inputValue}
          onChange={(e) => onInputChange(globalIndex, e.target.value)}
          disabled={disabled}
          aria-label={`設問${item.number}の解答${blankIndex}`}
          placeholder="　"
          autoComplete="off"
          inputMode="text"
        />
      </span>
    );
  });

  return <div className="cloze-sentence">{content}</div>;
}

export function isClozeItemAllCorrect(
  item: ClozeItem,
  inputs: string[],
  inputOffset: number,
): boolean {
  const answers = getClozeItemAnswers(item);
  const acceptableAnswersList = getClozeItemAcceptableAnswers(item);
  return answers.every((answer, blankIndex) =>
    isClozeItemCorrect(
      inputs[inputOffset + blankIndex] ?? '',
      answer,
      acceptableAnswersList?.[blankIndex],
    ),
  );
}

export function getClozeItemBlankCount(item: ClozeItem): number {
  return countClozeBlanksInText(item.text);
}
