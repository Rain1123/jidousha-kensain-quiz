import type { ClozeItem, MatchingBlank, MatchingItem } from '../types/question';

export const BLANK_MARKER = '__BLANK__';

export function splitClozeText(text: string): [string, string] {
  const index = text.indexOf(BLANK_MARKER);
  if (index === -1) return [text, ''];
  return [text.slice(0, index), text.slice(index + BLANK_MARKER.length)];
}

export function splitClozeParts(text: string): Array<string | 'blank'> {
  const parts: Array<string | 'blank'> = [];
  let remaining = text;

  while (remaining.length > 0) {
    const index = remaining.indexOf(BLANK_MARKER);
    if (index === -1) {
      parts.push(remaining);
      break;
    }
    if (index > 0) {
      parts.push(remaining.slice(0, index));
    }
    parts.push('blank');
    remaining = remaining.slice(index + BLANK_MARKER.length);
  }

  return parts;
}

export function countClozeBlanksInText(text: string): number {
  return splitClozeParts(text).filter((part) => part === 'blank').length;
}

export function getClozeItemAnswers(item: ClozeItem): string[] {
  const blankCount = countClozeBlanksInText(item.text);
  if (blankCount === 0) return [];
  if (item.answers && item.answers.length === blankCount) {
    return item.answers;
  }
  if (blankCount === 1) {
    return [item.answer];
  }
  return [item.answer, ...Array(blankCount - 1).fill('')];
}

export function getClozeItemAcceptableAnswers(
  item: ClozeItem,
): string[][] | undefined {
  const blankCount = countClozeBlanksInText(item.text);
  if (item.acceptableAnswersList?.length === blankCount) {
    return item.acceptableAnswersList;
  }
  if (blankCount === 1 && item.acceptableAnswers) {
    return [item.acceptableAnswers];
  }
  return undefined;
}

export function countClozeBlanks(items: ClozeItem[]): number {
  return items.reduce((sum, item) => sum + countClozeBlanksInText(item.text), 0);
}

export function flattenClozeBlanks(items: ClozeItem[]): Array<{
  answer: string;
  acceptableAnswers?: string[];
}> {
  return items.flatMap((item) => {
    const answers = getClozeItemAnswers(item);
    const acceptableAnswersList = getClozeItemAcceptableAnswers(item);
    return answers.map((answer, index) => ({
      answer,
      acceptableAnswers: acceptableAnswersList?.[index],
    }));
  });
}

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .replace(/\s/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0),
    );
}

export function isClozeItemCorrect(
  input: string,
  answer: string,
  acceptableAnswers?: string[],
): boolean {
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;

  const candidates = [answer, ...(acceptableAnswers ?? [])].map(normalizeAnswer);
  return candidates.some((candidate) => {
    if (normalized === candidate) return true;
    if (candidate.endsWith('日') && normalized === candidate.slice(0, -1)) return true;
    if (normalized.endsWith('日') && candidate === normalized.slice(0, -1)) return true;
    return false;
  });
}

export function gradeClozeAnswers(inputs: string[], items: ClozeItem[]): boolean {
  const blanks = flattenClozeBlanks(items);
  if (inputs.length !== blanks.length) return false;
  return blanks.every((blank, index) =>
    isClozeItemCorrect(inputs[index] ?? '', blank.answer, blank.acceptableAnswers),
  );
}

export function flattenMatchingBlanks(items: MatchingItem[]): MatchingBlank[] {
  return items.flatMap((item) => item.blanks);
}

export function splitMatchingText(text: string): Array<string | { label: string }> {
  const parts: Array<string | { label: string }> = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ label: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function gradeMatchingAnswers(
  inputs: string[],
  items: MatchingItem[],
): boolean {
  const blanks = flattenMatchingBlanks(items);
  if (inputs.length !== blanks.length) return false;
  return blanks.every((blank, index) =>
    isClozeItemCorrect(inputs[index] ?? '', blank.answer, blank.acceptableAnswers),
  );
}
