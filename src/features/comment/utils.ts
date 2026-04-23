import type { Comment, CreateCommentAnchorRequest, RootType } from '@/features/comment/types';

export function flattenPages(pages: Comment[][]): Comment[] {
  if (!pages) return [];
  return pages.flat();
}

export function groupCommentsByRoot(comments: Comment[]): Map<string, Comment[]> {
  const map = new Map<string, Comment[]>();
  for (const comment of comments) {
    const existing = map.get(comment.rootId) || [];
    existing.push(comment);
    map.set(comment.rootId, existing);
  }
  return map;
}

interface BuildSelectionAnchorOptions {
  blockId: string;
  rootId: string;
  rootType: RootType;
  text: string;
  container: HTMLElement;
  selection: Selection | null;
}

export function clearBrowserSelection() {
  window.getSelection()?.removeAllRanges();
}

export function buildSelectionAnchor(options: BuildSelectionAnchorOptions): CreateCommentAnchorRequest | null {
  const { blockId, rootId, rootType, text, container, selection } = options;

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  const startInContainer = container.contains(range.startContainer);
  const endInContainer = container.contains(range.endContainer);
  if (!startInContainer || !endInContainer) return null;

  const rawSelectedText = selection.toString();
  const trimmedSelectedText = rawSelectedText.trim();
  if (!trimmedSelectedText) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);

  const startOffset = preRange.toString().length;
  const endOffset = startOffset + rawSelectedText.length;
  if (startOffset < 0 || endOffset > text.length || startOffset >= endOffset) return null;

  return {
    rootType,
    rootId,
    selectedText: text.slice(startOffset, endOffset).trim(),
    startOffset,
    endOffset,
    prefixText: text.slice(Math.max(0, startOffset - 20), startOffset),
    suffixText: text.slice(endOffset, Math.min(text.length, endOffset + 20)),
    extra: { blockId },
  };
}
