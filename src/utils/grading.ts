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
    // 「15」と「15日」のように数値＋単位のゆるい一致
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
