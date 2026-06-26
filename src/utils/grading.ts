import type { MatchingItem, MatchingBlank } from '../types/question';

const BLANK_MARKER = '__BLANK__';

export function splitClozeText(text: string): [string, string] {
  const index = text.indexOf(BLANK_MARKER);
  if (index === -1) return [text, ''];
  return [text.slice(0, index), text.slice(index + BLANK_MARKER.length)];
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

export function gradeClozeAnswers(
  inputs: string[],
  items: { answer: string; acceptableAnswers?: string[] }[],
): boolean {
  if (inputs.length !== items.length) return false;
  return items.every((item, index) =>
    isClozeItemCorrect(inputs[index] ?? '', item.answer, item.acceptableAnswers),
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
