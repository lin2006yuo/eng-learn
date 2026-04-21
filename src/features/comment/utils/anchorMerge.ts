import type { Comment } from '@/features/comment/types';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

export interface MergedInterval {
  startOffset: number;
  endOffset: number;
  commentIds: string[];
  text: string;
  hasRelocated: boolean;
}

export function mergeAnchorIntervals(
  comments: Comment[],
  blockId: string,
  text: string
): MergedInterval[] {
  type RawInterval = {
    startOffset: number;
    endOffset: number;
    commentId: string;
    hasRelocated: boolean;
  };

  const rawIntervals: RawInterval[] = [];

  comments.forEach((comment) => {
    const anchor = comment.anchor;
    if (!anchor || anchor.blockId !== blockId) return;

    const resolved = resolveAnchorPosition(anchor, text);
    if (resolved.anchorStatus === 'orphaned') return;

    rawIntervals.push({
      startOffset: resolved.startOffset,
      endOffset: resolved.endOffset,
      commentId: comment.id,
      hasRelocated: resolved.anchorStatus === 'relocated',
    });
  });

  if (rawIntervals.length === 0) return [];

  rawIntervals.sort((a, b) => a.startOffset - b.startOffset);

  const merged: MergedInterval[] = [];
  let current = {
    startOffset: rawIntervals[0].startOffset,
    endOffset: rawIntervals[0].endOffset,
    commentIds: [rawIntervals[0].commentId],
    hasRelocated: rawIntervals[0].hasRelocated,
  };

  for (let i = 1; i < rawIntervals.length; i++) {
    const next = rawIntervals[i];
    if (next.startOffset <= current.endOffset) {
      current.endOffset = Math.max(current.endOffset, next.endOffset);
      current.commentIds.push(next.commentId);
      current.hasRelocated = current.hasRelocated || next.hasRelocated;
    } else {
      merged.push({ ...current, text: text.slice(current.startOffset, current.endOffset) });
      current = {
        startOffset: next.startOffset,
        endOffset: next.endOffset,
        commentIds: [next.commentId],
        hasRelocated: next.hasRelocated,
      };
    }
  }

  merged.push({ ...current, text: text.slice(current.startOffset, current.endOffset) });

  return merged;
}
