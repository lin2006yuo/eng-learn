'use client';

import type { Comment } from '@/features/comment/types';
import { mergeAnchorIntervals, type MergedInterval } from '@/features/comment/utils/anchorMerge';

interface AnchorHighlightTextProps {
  blockId: string;
  comments: Comment[];
  text: string;
  onAnchorClick: (intervalIndex: number, commentIds: string[]) => void;
}

function buildHighlightNodes(
  intervals: MergedInterval[],
  text: string,
  onAnchorClick: (intervalIndex: number, commentIds: string[]) => void
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  intervals.forEach((interval, index) => {
    if (cursor < interval.startOffset) {
      nodes.push(
        <span key={`plain-${cursor}`}>
          {text.slice(cursor, interval.startOffset)}
        </span>,
      );
    }

    nodes.push(
      <button
        key={`anchor-${interval.startOffset}-${interval.endOffset}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAnchorClick(index, interval.commentIds);
        }}
        className={`comment-anchor-highlight rounded-sm px-0.5 text-left text-inherit hover:bg-primary/30 ${
          interval.hasRelocated ? 'bg-secondary/20' : 'bg-primary/20'
        }`}
      >
        {interval.text}
      </button>,
    );

    cursor = interval.endOffset;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`plain-tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return nodes;
}

export function AnchorHighlightText(props: AnchorHighlightTextProps) {
  const { blockId, comments, text, onAnchorClick } = props;
  const intervals = mergeAnchorIntervals(comments, blockId, text);

  if (intervals.length === 0) return <>{text}</>;

  return <>{buildHighlightNodes(intervals, text, onAnchorClick)}</>;
}
