'use client';

import { useEffect, useMemo, useState } from 'react';
import { CommentInput } from '@/features/comment/components/CommentInput';
import { CommentItem } from '@/features/comment/components/CommentItem';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { SelectableText } from '@/features/comment/components/selection/SelectableText';
import type { CreateCommentAnchorRequest } from '@/features/comment/types';
import { AnchorHighlightText } from '@/features/comment/components/selection/AnchorHighlightText';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface ArticleSelectableBodyProps {
  articleId: string;
  content: string;
}

export function ArticleSelectableBody(props: ArticleSelectableBodyProps) {
  const { articleId, content } = props;
  const [anchor, setAnchor] = useState<CreateCommentAnchorRequest | null>(null);
  const [focusedCommentIds, setFocusedCommentIds] = useState<string[]>([]);
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

  const focusedComments = useMemo(
    () => resolvedComments.filter((comment) => focusedCommentIds.includes(comment.id)),
    [focusedCommentIds, resolvedComments],
  );

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
            blockId={`article-${articleId}-content`}
            comments={resolvedComments}
            text={textValue}
            onAnchorClick={setFocusedCommentIds}
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

      {focusedComments.length > 0 ? (
        <div className="article-selectable-body-comments rounded-subtle-card border border-primary/20 bg-white p-4">
          <p className="mb-3 text-sm font-medium text-text-primary">片段评论</p>
          <div className="space-y-2">
            {focusedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} targetId={articleId} rootType="article" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
