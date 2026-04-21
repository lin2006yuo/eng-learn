'use client';

import type { Comment, CommentAnchorStatus } from '@/features/comment/types';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface AnchorHighlightTextProps {
  blockId: string;
  comments: Comment[];
  text: string;
  onAnchorClick: (commentIds: string[]) => void;
}

interface HighlightSegment {
  anchorStatus: CommentAnchorStatus;
  commentIds: string[];
  endOffset: number;
  startOffset: number;
  text: string;
}

function buildSegments(blockId: string, comments: Comment[], text: string): HighlightSegment[] {
  const segmentMap = new Map<string, HighlightSegment>();

  comments.forEach((comment) => {
    const anchor = comment.anchor;
    if (!anchor || anchor.blockId !== blockId) return;

    const resolved = resolveAnchorPosition(anchor, text);
    if (resolved.anchorStatus === 'orphaned') return;

    const key = `${resolved.startOffset}-${resolved.endOffset}`;
    const existing = segmentMap.get(key);
    if (existing) {
      existing.commentIds.push(comment.id);
      return;
    }

    segmentMap.set(key, {
      anchorStatus: resolved.anchorStatus,
      commentIds: [comment.id],
      startOffset: resolved.startOffset,
      endOffset: resolved.endOffset,
      text: text.slice(resolved.startOffset, resolved.endOffset),
    });
  });

  return [...segmentMap.values()]
    .filter((segment) => segment.startOffset < segment.endOffset)
    .sort((left, right) => left.startOffset - right.startOffset);
}

export function AnchorHighlightText(props: AnchorHighlightTextProps) {
  const { blockId, comments, text, onAnchorClick } = props;
  const segments = buildSegments(blockId, comments, text);

  if (segments.length === 0) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  segments.forEach((segment) => {
    if (segment.startOffset < cursor) return;

    if (cursor < segment.startOffset) {
      nodes.push(
        <span key={`plain-${cursor}`}>
          {text.slice(cursor, segment.startOffset)}
        </span>,
      );
    }

    nodes.push(
      <button
        key={`anchor-${segment.startOffset}-${segment.endOffset}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAnchorClick(segment.commentIds);
        }}
        className={`comment-anchor-highlight rounded-sm px-0.5 text-left text-inherit hover:bg-primary/30 ${
          segment.anchorStatus === 'relocated' ? 'bg-secondary/20' : 'bg-primary/20'
        }`}
      >
        {segment.text}
      </button>,
    );

    cursor = segment.endOffset;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`plain-tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <>{nodes}</>;
}
