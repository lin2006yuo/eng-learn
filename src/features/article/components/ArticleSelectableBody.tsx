'use client';

import { useEffect, useMemo, useState } from 'react';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { AnchorFocusedComments } from '@/features/comment/components/selection/AnchorFocusedComments';
import { AnchorHighlightText } from '@/features/comment/components/selection/AnchorHighlightText';
import { SelectableText } from '@/features/comment/components/selection/SelectableText';
import type { CreateCommentAnchorRequest } from '@/features/comment/types';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface ArticleSelectableBodyProps {
  articleId: string;
  content: string;
}

interface FocusState {
  commentIds: string[];
  currentIndex: number;
}

export function ArticleSelectableBody(props: ArticleSelectableBodyProps) {
  const { articleId, content } = props;
  const [anchor, setAnchor] = useState<CreateCommentAnchorRequest | null>(null);
  const [focus, setFocus] = useState<FocusState>({ commentIds: [], currentIndex: 0 });
  const { comments, fetchComments } = useCommentStore();
  const articleComments = comments[`article-${articleId}`] || [];
  const articleBlockId = `article-${articleId}-content`;

  useEffect(() => {
    fetchComments('article', articleId);
  }, [articleId, fetchComments]);

  const resolvedComments = useMemo(
    () => articleComments.map((comment) => {
      if (!comment.anchor || comment.anchor.blockId !== articleBlockId) return comment;
      const resolved = resolveAnchorPosition(comment.anchor, content);
      return { ...comment, anchor: { ...comment.anchor, ...resolved } };
    }),
    [articleBlockId, articleComments, content],
  );

  const handleAnchorClick = (_intervalIndex: number, commentIds: string[]) => {
    setFocus({ commentIds, currentIndex: 0 });
  };

  const handleCloseFocus = () => {
    setFocus({ commentIds: [], currentIndex: 0 });
  };

  return (
    <div className="article-selectable-body space-y-4">
      <SelectableText
        blockId={articleBlockId}
        rootId={articleId}
        rootType="article"
        text={content}
        className="article-detail-content whitespace-pre-wrap text-base leading-8 text-text-primary"
        renderText={(textValue) => (
          <AnchorHighlightText
            blockId={articleBlockId}
            comments={resolvedComments}
            text={textValue}
            onAnchorClick={handleAnchorClick}
          />
        )}
        onSelect={setAnchor}
      />

      {anchor ? (
        <div className="article-selectable-body-input rounded-subtle-card border border-primary/20 bg-white">
          <CommentInput
            rootId={articleId}
            rootType="article"
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
          targetId={articleId}
          rootType="article"
          onIndexChange={(index) => setFocus((prev) => ({ ...prev, currentIndex: index }))}
          onClose={handleCloseFocus}
        />
      ) : null}
    </div>
  );
}
