import { parsePatternExamplePath, PatternExampleLang } from '@/shared/utils/blockId';
import type { Example } from '@/shared/types';
import { useEffect, useMemo, useState } from 'react';
import { AnchorFocusedComments } from '@/features/comment/components/selection/AnchorFocusedComments';
import { AnchorHighlightText } from '@/features/comment/components/selection/AnchorHighlightText';
import { SelectableText } from '@/features/comment/components/selection/SelectableText';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { mergeAnchorIntervals } from '@/features/comment/utils/anchorMerge';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface ExampleItemProps {
  example: Example;
  patternId: string;
  index: number;
}

function getCommentOffsetForSegment(segmentIndex: number, segments: Array<{ commentIds: string[] }>) {
  return segments.slice(0, segmentIndex).reduce((total, segment) => total + segment.commentIds.length, 0);
}

export function ExampleItem({ example, patternId, index }: ExampleItemProps) {
  const { comments, fetchComments } = useCommentStore();
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [activeFocus, setActiveFocus] = useState<{ blockId: string; segmentIndex: number } | null>(null);
  const patternComments = comments[`pattern-${patternId}`] || [];
  const enBlockId = parsePatternExamplePath(index, PatternExampleLang.En);
  const zhBlockId = parsePatternExamplePath(index, PatternExampleLang.Zh);

  useEffect(() => {
    fetchComments('pattern', patternId);
  }, [fetchComments, patternId]);

  const resolvedComments = useMemo(
    () => patternComments.map((comment) => {
      if (!comment.anchor) return comment;
      if (comment.anchor.extra.blockId === enBlockId) {
        return { ...comment, anchor: { ...comment.anchor, ...resolveAnchorPosition(comment.anchor, example.en) } };
      }
      if (comment.anchor.extra.blockId === zhBlockId) {
        return { ...comment, anchor: { ...comment.anchor, ...resolveAnchorPosition(comment.anchor, example.zh) } };
      }
      return comment;
    }),
    [enBlockId, example.en, example.zh, patternComments, zhBlockId],
  );

  const enAnchorSegments = useMemo(
    () => mergeAnchorIntervals(patternComments, enBlockId, example.en),
    [enBlockId, example.en, patternComments],
  );
  const zhAnchorSegments = useMemo(
    () => mergeAnchorIntervals(patternComments, zhBlockId, example.zh),
    [example.zh, patternComments, zhBlockId],
  );
  const activeSegments = activeFocus?.blockId === zhBlockId ? zhAnchorSegments : enAnchorSegments;

  const handleAnchorClick = (blockId: string) => (segmentIndex: number) => {
    const nextSegments = blockId === zhBlockId ? zhAnchorSegments : enAnchorSegments;
    setActiveCommentIndex(getCommentOffsetForSegment(segmentIndex, nextSegments));
    setActiveFocus({ blockId, segmentIndex });
  };

  return (
    <div
      className="example-item px-3 py-1.5 -mx-3 rounded-[10px]"
    >
      <SelectableText
        blockId={enBlockId}
        rootId={patternId}
        rootType="pattern"
        text={example.en}
        className="example-item-en text-[16px] text-[#3A3A3C] leading-snug"
        renderText={(textValue) => (
          <AnchorHighlightText
            blockId={enBlockId}
            comments={patternComments}
            text={textValue}
            onAnchorClick={handleAnchorClick(enBlockId)}
          />
        )}
      />
      <SelectableText
        blockId={zhBlockId}
        rootId={patternId}
        rootType="pattern"
        text={example.zh}
        className="example-item-zh text-[14px] text-[#6E6E73] leading-snug"
        renderText={(textValue) => (
          <AnchorHighlightText
            blockId={zhBlockId}
            comments={patternComments}
            text={textValue}
            onAnchorClick={handleAnchorClick(zhBlockId)}
          />
        )}
      />

      <AnchorFocusedComments
        resolvedComments={resolvedComments}
        segments={activeSegments}
        activeSegmentIndex={activeFocus?.segmentIndex ?? null}
        activeCommentIndex={activeCommentIndex}
        targetId={patternId}
        rootType="pattern"
        blockId={activeFocus?.blockId ?? enBlockId}
        onCommentChange={setActiveCommentIndex}
        onSegmentChange={(segmentIndex) => setActiveFocus(prev => prev ? { ...prev, segmentIndex } : null)}
        onClose={() => setActiveFocus(null)}
      />
    </div>
  );
}
