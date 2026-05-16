import { client } from '../client.js';

interface AnchorOffsetResult {
  startOffset: number;
  endOffset: number;
  sourceText: string;
}

export async function computeAnchorOffset(
  dataPath: string,
  rootType: string,
  rootId: string,
  selectedText: string,
  prefixText?: string,
  suffixText?: string,
): Promise<AnchorOffsetResult> {
  const sourceText = await fetchSourceText(dataPath, rootType, rootId);

  if (!prefixText && !suffixText) {
    return autoAnchor(sourceText, selectedText);
  }

  return manualAnchor(sourceText, selectedText, prefixText, suffixText);
}

function autoAnchor(sourceText: string, selectedText: string): AnchorOffsetResult {
  const occurrences = findAllOccurrences(sourceText, selectedText);

  if (occurrences.length === 0) {
    throw new Error(
      `Cannot find selectedText "${selectedText}" in the source text.`
    );
  }

  if (occurrences.length > 1) {
    const contexts = occurrences.map((offset, i) =>
      `  [${i + 1}] offset=${offset} ..."${surround(sourceText, offset, selectedText.length, 20)}"...`
    ).join('\n');
    throw new Error(
      `selectedText "${selectedText}" appears ${occurrences.length} times. Please use --prefixText to disambiguate:\n${contexts}`
    );
  }

  const startOffset = occurrences[0];
  const endOffset = startOffset + selectedText.length;
  return { startOffset, endOffset, sourceText };
}

function manualAnchor(
  sourceText: string,
  selectedText: string,
  prefixText?: string,
  suffixText?: string,
): AnchorOffsetResult {
  const occurrences = findAllOccurrences(sourceText, selectedText);

  if (occurrences.length === 0) {
    throw new Error(
      `Cannot find selectedText "${selectedText}" in the source text.`
    );
  }

  if (!prefixText && !suffixText) {
    return {
      startOffset: occurrences[0],
      endOffset: occurrences[0] + selectedText.length,
      sourceText,
    };
  }

  const match = occurrences.find((offset) => {
    if (prefixText) {
      const actual = sourceText.slice(Math.max(0, offset - prefixText.length), offset);
      if (actual !== prefixText) return false;
    }
    if (suffixText) {
      const actual = sourceText.slice(offset + selectedText.length, offset + selectedText.length + suffixText.length);
      if (actual !== suffixText) return false;
    }
    return true;
  });

  if (match !== undefined) {
    return { startOffset: match, endOffset: match + selectedText.length, sourceText };
  }

  const detail = occurrences.map((offset, i) => {
    const parts: string[] = [];
    if (prefixText) {
      parts.push(`prefix="${sourceText.slice(Math.max(0, offset - prefixText.length), offset)}"`);
    }
    if (suffixText) {
      parts.push(`suffix="${sourceText.slice(offset + selectedText.length, offset + selectedText.length + suffixText.length)}"`);
    }
    return `  [${i + 1}] offset=${offset} ${parts.join(' ')}`;
  }).join('\n');

  const expected: string[] = [];
  if (prefixText) expected.push(`prefixText="${prefixText}"`);
  if (suffixText) expected.push(`suffixText="${suffixText}"`);

  throw new Error(
    `Anchor mismatch. Expected ${expected.join(', ')}.\n` +
    `All occurrences of "${selectedText}":\n${detail}`
  );
}

export function findAllOccurrences(sourceText: string, searchText: string): number[] {
  const positions: number[] = [];
  let pos = 0;
  while (pos < sourceText.length) {
    const found = sourceText.indexOf(searchText, pos);
    if (found === -1) break;
    positions.push(found);
    pos = found + 1;
  }
  return positions;
}

export function surround(text: string, offset: number, length: number, contextLen: number): string {
  const start = Math.max(0, offset - contextLen);
  const end = Math.min(text.length, offset + length + contextLen);
  let result = text.slice(start, end);
  if (start > 0) result = '...' + result;
  if (end < text.length) result = result + '...';
  return result;
}

async function fetchSourceText(dataPath: string, rootType: string, rootId: string): Promise<string> {
  const [, fieldPath] = dataPath.split(':');
  if (!fieldPath) throw new Error(`Invalid dataPath: ${dataPath}`);

  if (rootType === 'article') {
    const res = await client.get<{ data: Record<string, unknown> }>(`/articles/${rootId}`);
    if (!res.ok || !res.data) throw new Error(`Failed to fetch article: ${res.error}`);
    return getFieldByPath(res.data.data, fieldPath);
  }

  if (rootType === 'post') {
    const res = await client.get<{ data: Record<string, unknown> }>(`/posts/${rootId}`);
    if (!res.ok || !res.data) throw new Error(`Failed to fetch post: ${res.error}`);
    return getFieldByPath(res.data.data, fieldPath);
  }

  if (rootType === 'pattern') {
    const res = await client.get<Record<string, unknown>>(`/patterns?id=${rootId}`);
    if (!res.ok || !res.data) throw new Error(`Failed to fetch pattern: ${res.error}`);
    return getFieldByPath(res.data, fieldPath);
  }

  throw new Error(`Unsupported rootType: ${rootType}`);
}

function getFieldByPath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      throw new Error(`Cannot resolve path "${path}" in data.`);
    }
    const record = current as Record<string, unknown>;
    if (part in record) {
      current = record[part];
    } else if (Array.isArray(current)) {
      const index = parseInt(part, 10);
      if (Number.isNaN(index) || index >= current.length) {
        throw new Error(`Array index ${part} out of bounds in path "${path}".`);
      }
      current = current[index];
    } else {
      throw new Error(`Field "${part}" not found in path "${path}".`);
    }
  }
  if (typeof current !== 'string') {
    throw new Error(`Path "${path}" does not resolve to a string. Got: ${typeof current}`);
  }
  return current;
}
