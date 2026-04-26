'use client';

import { cn } from '@/shared/utils/cn';
import type { Comment } from '@/features/comment/types';
import { mergeAnchorIntervals } from '@/features/comment/utils/anchorMerge';
import { useAnchorHighlight } from '@/features/comment/context/AnchorHighlightContext';

interface AnchorHighlightTextProps {
  blockId: string;
  comments: Comment[];
  text: string;
  onAnchorClick: (segmentIndex: number) => void;
}

export function AnchorHighlightText(props: AnchorHighlightTextProps) {
  const { blockId, comments, text, onAnchorClick } = props;
  const { activeBlockId, activeSegmentIndex } = useAnchorHighlight();
  const underlineSegments = mergeAnchorIntervals(comments, blockId, text);

  if (underlineSegments.length === 0) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  underlineSegments.forEach((segment, segmentIndex) => {
    if (segment.startOffset < cursor) return;

    if (cursor < segment.startOffset) {
      nodes.push(
        <span key={`plain-${cursor}`}>
          {text.slice(cursor, segment.startOffset)}
        </span>,
      );
    }

    const isActive = activeBlockId === blockId && activeSegmentIndex === segmentIndex;

    nodes.push(
      <button
        key={`anchor-${segment.startOffset}-${segment.endOffset}`}
        type="button"
        data-anchor-index={segmentIndex}
        onClick={(event) => {
          event.stopPropagation();
          onAnchorClick(segmentIndex);
        }}
        className={cn(
          'comment-anchor-underline rounded-sm px-0.5 text-left text-inherit underline decoration-2 underline-offset-4 transition-all duration-200',
          segment.includesRelocated
            ? 'decoration-[#007AFF]/70 hover:decoration-[#007AFF]'
            : 'decoration-[#007AFF] hover:decoration-[#007AFF]/80',
          isActive && 'bg-[#007AFF]/20',
        )}
      >
        {segment.text}
      </button>,
    );

    cursor = segment.endOffset;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`plain-tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return (
    <span data-anchor-block={blockId}>
      {nodes}
    </span>
  );
}
