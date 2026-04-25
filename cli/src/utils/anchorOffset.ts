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
  prefixText: string,
  suffixText: string,
): Promise<AnchorOffsetResult> {
  const sourceText = await fetchSourceText(dataPath, rootType, rootId);

  const startOffset = sourceText.indexOf(selectedText);
  if (startOffset === -1) {
    throw new Error(
      `Cannot find selectedText "${selectedText}" in the source text.`
    );
  }

  const endOffset = startOffset + selectedText.length;

  if (prefixText) {
    const actualPrefix = sourceText.slice(Math.max(0, startOffset - prefixText.length), startOffset);
    if (actualPrefix !== prefixText) {
      throw new Error(
        `prefixText mismatch. Expected "${prefixText}", got "${actualPrefix}".`
      );
    }
  }

  if (suffixText) {
    const actualSuffix = sourceText.slice(endOffset, endOffset + suffixText.length);
    if (actualSuffix !== suffixText) {
      throw new Error(
        `suffixText mismatch. Expected "${suffixText}", got "${actualSuffix}".`
      );
    }
  }

  return { startOffset, endOffset, sourceText };
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
