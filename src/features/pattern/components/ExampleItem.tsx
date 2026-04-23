import { motion } from 'framer-motion';
import { useCopy } from '@/shared/hooks/useCopy';
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
  const { copy, isCopied } = useCopy();
  const { comments, fetchComments } = useCommentStore();
  const copyId = `${patternId}-${example.id}`;
  const copied = isCopied(copyId);
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [activeFocus, setActiveFocus] = useState<{ blockId: string; segmentIndex: number } | null>(null);
  const patternComments = comments[`pattern-${patternId}`] || [];
  const enBlockId = `pattern-${patternId}-example-${example.id}-en`;
  const zhBlockId = `pattern-${patternId}-example-${example.id}-zh`;

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

  const handleCopy = () => {
    if (window.getSelection()?.toString().trim()) return;
    copy(example.en, copyId);
  };

  const handleAnchorClick = (blockId: string) => (segmentIndex: number) => {
    const nextSegments = blockId === zhBlockId ? zhAnchorSegments : enAnchorSegments;
    setActiveCommentIndex(getCommentOffsetForSegment(segmentIndex, nextSegments));
    setActiveFocus({ blockId, segmentIndex });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleCopy}
      className={`
        py-3 px-4 -mx-4 rounded-xl cursor-pointer
        transition-all duration-200
        ${copied ? 'bg-primary/10' : 'hover:bg-gray-50'}
        active:scale-[0.98]
      `}
    >
      <SelectableText
        blockId={enBlockId}
        rootId={patternId}
        rootType="pattern"
        text={example.en}
        className={`text-base font-semibold mb-1 transition-colors ${copied ? 'text-primary' : 'text-text-primary'}`}
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
        className="text-sm text-text-secondary"
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
        onCommentChange={setActiveCommentIndex}
        onClose={() => setActiveFocus(null)}
      />
    </motion.div>
  );
}
