function pad(str: string | number, width: number): string {
  const s = String(str);
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

export function formatTable(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return JSON.stringify(data, null, 2);
  }

  const rows = data as Record<string, unknown>[];
  const keys = Object.keys(rows[0]);

  const colWidths = keys.map((key) => {
    const maxDataWidth = Math.max(...rows.map((r) => String(r[key] ?? '').length));
    return Math.max(key.length, maxDataWidth, 8);
  });

  const separator = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+';

  const header = '| ' + keys.map((k, i) => pad(k, colWidths[i])).join(' | ') + ' |';

  const body = rows
    .map(
      (row) =>
        '| ' + keys.map((k, i) => pad(String(row[k] ?? ''), colWidths[i])).join(' | ') + ' |'
    )
    .join('\n');

  return [separator, header, separator, body, separator].join('\n');
}
