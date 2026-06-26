type TextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'table'; caption?: string; headers?: string[]; rows: string[][] };

function isMarkdownTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|');
}

function isMarkdownSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function parseMarkdownRow(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

function isPipeTableRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  if (isMarkdownTableRow(trimmed)) return true;
  return trimmed.split('|').length >= 2;
}

function parsePipeRow(line: string): string[] {
  const trimmed = line.trim();
  if (isMarkdownTableRow(trimmed)) {
    return parseMarkdownRow(trimmed);
  }
  return trimmed.split('|').map((cell) => cell.trim());
}

function isTableStart(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('表：') || isPipeTableRow(trimmed);
}

function parseTextBlocks(text: string): TextBlock[] {
  const lines = text.split('\n');
  const blocks: TextBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('表：')) {
      const caption = line.trim();
      index += 1;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim() && isPipeTableRow(lines[index])) {
        rows.push(parsePipeRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: 'table', caption, rows });
      continue;
    }

    if (isMarkdownTableRow(line)) {
      const rows: string[][] = [];
      while (index < lines.length && isMarkdownTableRow(lines[index])) {
        if (!isMarkdownSeparator(lines[index])) {
          rows.push(parseMarkdownRow(lines[index]));
        }
        index += 1;
      }
      const headers = rows.length > 1 ? rows[0] : undefined;
      const bodyRows = rows.length > 1 ? rows.slice(1) : rows;
      blocks.push({ type: 'table', headers, rows: bodyRows });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isTableStart(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') });
  }

  return blocks;
}

function TableBlock({ block }: { block: Extract<TextBlock, { type: 'table' }> }) {
  const columnCount = Math.max(
    block.headers?.length ?? 0,
    ...block.rows.map((row) => row.length),
    0,
  );

  return (
    <div className="formatted-table-wrap">
      {block.caption && <p className="formatted-table-caption">{block.caption}</p>}
      <table className="formatted-table">
        {block.headers && (
          <thead>
            <tr>
              {block.headers.map((header, headerIndex) => (
                <th key={headerIndex}>{header}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columnCount }, (_, cellIndex) => (
                <td key={cellIndex}>{row[cellIndex] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FormattedTextProps {
  text: string;
  className?: string;
}

export function FormattedText({ text, className }: FormattedTextProps) {
  const blocks = parseTextBlocks(text);

  return (
    <div className={className ? `formatted-text ${className}` : 'formatted-text'}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'table') {
          return <TableBlock key={blockIndex} block={block} />;
        }
        return (
          <p key={blockIndex} className="formatted-paragraph">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
