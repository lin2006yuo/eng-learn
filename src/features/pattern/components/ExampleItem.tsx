import { motion } from 'framer-motion';
import { useCopy } from '@/shared/hooks/useCopy';
import type { Example } from '@/shared/types';
import { useEffect, useMemo, useState } from 'react';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { AnchorFocusedComments } from '@/features/comment/components/selection/AnchorFocusedComments';
import { AnchorHighlightText } from '@/features/comment/components/selection/AnchorHighlightText';
import { SelectableText } from '@/features/comment/components/selection/SelectableText';
import type { CreateCommentAnchorRequest } from '@/features/comment/types';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface ExampleItemProps {
  example: Example;
  patternId: string;
  index: number;
}

interface FocusState {
  commentIds: string[];
  currentIndex: number;
}

export function ExampleItem({ example, patternId, index }: ExampleItemProps) {
  const { copy, isCopied } = useCopy();
  const { comments, fetchComments } = useCommentStore();
  const copyId = `${patternId}-${example.id}`;
  const copied = isCopied(copyId);
  const [anchor, setAnchor] = useState<CreateCommentAnchorRequest | null>(null);
  const [focus, setFocus] = useState<FocusState>({ commentIds: [], currentIndex: 0 });
  const patternComments = comments[`pattern-${patternId}`] || [];
  const enBlockId = `pattern-${patternId}-example-${example.id}-en`;
  const zhBlockId = `pattern-${patternId}-example-${example.id}-zh`;

  useEffect(() => {
    fetchComments('pattern', patternId);
  }, [fetchComments, patternId]);

  const resolvedComments = useMemo(
    () => patternComments.map((comment) => {
      if (!comment.anchor) return comment;
      if (comment.anchor.blockId === enBlockId) {
        return { ...comment, anchor: { ...comment.anchor, ...resolveAnchorPosition(comment.anchor, example.en) } };
      }
      if (comment.anchor.blockId === zhBlockId) {
        return { ...comment, anchor: { ...comment.anchor, ...resolveAnchorPosition(comment.anchor, example.zh) } };
      }
      return comment;
    }),
    [enBlockId, example.en, example.zh, patternComments, zhBlockId],
  );

  const handleCopy = () => {
    if (window.getSelection()?.toString().trim()) return;
    copy(example.en, copyId);
  };

  const handleAnchorClick = (_intervalIndex: number, commentIds: string[]) => {
    setFocus({ commentIds, currentIndex: 0 });
  };

  const handleCloseFocus = () => {
    setFocus({ commentIds: [], currentIndex: 0 });
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
            comments={resolvedComments}
            text={textValue}
            onAnchorClick={handleAnchorClick}
          />
        )}
        onSelect={setAnchor}
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
            comments={resolvedComments}
            text={textValue}
            onAnchorClick={handleAnchorClick}
          />
        )}
        onSelect={setAnchor}
      />

      {anchor ? (
        <div
          className="pattern-example-comment-input mt-3 rounded-subtle-card border border-primary/20 bg-white"
          onClick={(event) => event.stopPropagation()}
        >
          <CommentInput
            rootId={patternId}
            rootType="pattern"
            anchor={anchor}
            onReplySuccess={() => setAnchor(null)}
          />
        </div>
      ) : null}

      {focus.commentIds.length > 0 ? (
        <AnchorFocusedComments
          resolvedComments={resolvedComments}
          focusedCommentIds={focus.commentIds}
          focusedCommentIndex={focus.currentIndex}
          targetId={patternId}
          rootType="pattern"
          onIndexChange={(index) => setFocus((prev) => ({ ...prev, currentIndex: index }))}
          onClose={handleCloseFocus}
        />
      ) : null}
    </motion.div>
  );
}
