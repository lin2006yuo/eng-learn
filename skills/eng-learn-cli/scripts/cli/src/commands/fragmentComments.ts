import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { findAllOccurrences, surround } from '../utils/anchorOffset.js';

interface YamlComment {
  selectedText: string;
  prefixText?: string;
  suffixText?: string;
  content: string;
}

interface CommentError {
  index: number;
  selectedText: string;
  error: string;
}

interface CreateCommentsResult {
  success: number;
  total: number;
  failed: CommentError[];
}

export async function createFragmentComments(
  rootType: string,
  rootId: string,
  content: string,
  comments: YamlComment[],
  format: 'json' | 'table',
): Promise<CreateCommentsResult> {
  const result: CreateCommentsResult = { success: 0, total: comments.length, failed: [] };

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    const idx = i + 1;
    const resolved = resolveCommentOffset(content, c.selectedText, c.prefixText, c.suffixText, idx);
    if ('error' in resolved) {
      result.failed.push(resolved);
      continue;
    }

    const anchor = {
      rootType,
      rootId,
      selectedText: c.selectedText,
      startOffset: resolved.startOffset,
      endOffset: resolved.endOffset,
      prefixText: content.slice(Math.max(0, resolved.startOffset - 20), resolved.startOffset),
      suffixText: content.slice(resolved.endOffset, Math.min(content.length, resolved.endOffset + 20)),
      extra: { blockId: `${rootType}:content` },
    };

    const body = {
      targetType: rootType,
      targetId: rootId,
      rootType,
      rootId,
      content: c.content.trim(),
      anchor,
    };

    const res = await client.post('/comments', body);
    if (!res.ok) {
      result.failed.push({ index: idx, selectedText: c.selectedText, error: `${res.error}` });
      continue;
    }

    result.success++;
    if (format === 'json') {
      console.log(formatJson({ ok: true, comment: (res.data as Record<string, unknown>).anchor }));
    }
  }

  return result;
}

type OffsetOk = { startOffset: number; endOffset: number };

function resolveCommentOffset(content: string, selectedText: string, prefixText: string | undefined, suffixText: string | undefined, index: number): OffsetOk | CommentError {
  if (!prefixText && !suffixText) return autoResolve(content, selectedText, index);
  return manualResolve(content, selectedText, prefixText, suffixText, index);
}

function autoResolve(content: string, selectedText: string, index: number): OffsetOk | CommentError {
  const occurrences = findAllOccurrences(content, selectedText);
  if (occurrences.length === 0) {
    return { index, selectedText, error: 'Text not found in content' };
  }
  if (occurrences.length > 1) {
    const ctx = occurrences.map((o, i) =>
      `  [${i + 1}] offset=${o} ..."${surround(content, o, selectedText.length, 20)}"...`
    ).join('\n');
    return { index, selectedText, error: `Appears ${occurrences.length} times. Add prefixText to pick one:\n${ctx}` };
  }
  return { startOffset: occurrences[0], endOffset: occurrences[0] + selectedText.length };
}

function manualResolve(content: string, selectedText: string, prefixText: string | undefined, suffixText: string | undefined, index: number): OffsetOk | CommentError {
  const occurrences = findAllOccurrences(content, selectedText);
  if (occurrences.length === 0) {
    return { index, selectedText, error: 'Text not found in content' };
  }

  const match = occurrences.find((offset) => {
    if (prefixText) {
      const actual = content.slice(Math.max(0, offset - prefixText.length), offset);
      if (actual !== prefixText) return false;
    }
    if (suffixText) {
      const actual = content.slice(offset + selectedText.length, offset + selectedText.length + suffixText.length);
      if (actual !== suffixText) return false;
    }
    return true;
  });

  if (match !== undefined) {
    return { startOffset: match, endOffset: match + selectedText.length };
  }

  const detail = occurrences.map((offset, i) => {
    const parts: string[] = [];
    if (prefixText) {
      parts.push(`prefix="${content.slice(Math.max(0, offset - prefixText.length), offset)}"`);
    }
    if (suffixText) {
      parts.push(`suffix="${content.slice(offset + selectedText.length, offset + selectedText.length + suffixText.length)}"`);
    }
    return `  [${i + 1}] offset=${offset} ${parts.join(' ')}`;
  }).join('\n');

  return { index, selectedText, error: `Anchor mismatch. None of the ${occurrences.length} occurrences matched.\n${detail}` };
}
