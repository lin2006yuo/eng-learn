import type { Comment } from '@/features/comment/types';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

export interface MergedInterval {
  startOffset: number;
  endOffset: number;
  commentIds: string[];
  text: string;
  includesRelocated: boolean;
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
    includesRelocated: boolean;
    order: number;
  };

  const rawIntervals: RawInterval[] = [];

  comments.forEach((comment, order) => {
    const anchor = comment.anchor;
    if (!anchor || anchor.blockId !== blockId) return;

    const resolved = resolveAnchorPosition(anchor, text);
    if (resolved.anchorStatus === 'orphaned') return;

    rawIntervals.push({
      startOffset: resolved.startOffset,
      endOffset: resolved.endOffset,
      commentId: comment.id,
      includesRelocated: resolved.anchorStatus === 'relocated',
      order,
    });
  });

  if (rawIntervals.length === 0) return [];

  rawIntervals.sort((a, b) => a.startOffset - b.startOffset);

  const merged: MergedInterval[] = [];
  let current = {
    startOffset: rawIntervals[0].startOffset,
    endOffset: rawIntervals[0].endOffset,
    items: [rawIntervals[0]],
    includesRelocated: rawIntervals[0].includesRelocated,
  };

  for (let i = 1; i < rawIntervals.length; i++) {
    const next = rawIntervals[i];
    if (next.startOffset <= current.endOffset) {
      current.endOffset = Math.max(current.endOffset, next.endOffset);
      current.items.push(next);
      current.includesRelocated = current.includesRelocated || next.includesRelocated;
    } else {
      merged.push({
        startOffset: current.startOffset,
        endOffset: current.endOffset,
        commentIds: current.items.sort((a, b) => a.order - b.order).map((item) => item.commentId),
        text: text.slice(current.startOffset, current.endOffset),
        includesRelocated: current.includesRelocated,
      });
      current = {
        startOffset: next.startOffset,
        endOffset: next.endOffset,
        items: [next],
        includesRelocated: next.includesRelocated,
      };
    }
  }

  merged.push({
    startOffset: current.startOffset,
    endOffset: current.endOffset,
    commentIds: current.items.sort((a, b) => a.order - b.order).map((item) => item.commentId),
    text: text.slice(current.startOffset, current.endOffset),
    includesRelocated: current.includesRelocated,
  });

  return merged;
}
