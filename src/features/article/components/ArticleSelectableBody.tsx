'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnchorFocusedComments } from '@/features/comment/components/selection/AnchorFocusedComments';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { SelectableText } from '@/features/comment/components/selection/SelectableText';
import { AnchorHighlightText } from '@/features/comment/components/selection/AnchorHighlightText';
import { mergeAnchorIntervals } from '@/features/comment/utils/anchorMerge';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface ArticleSelectableBodyProps {
  articleId: string;
  content: string;
}

function getCommentOffsetForSegment(segmentIndex: number, segments: Array<{ commentIds: string[] }>) {
  return segments.slice(0, segmentIndex).reduce((total, segment) => total + segment.commentIds.length, 0);
}

export function ArticleSelectableBody(props: ArticleSelectableBodyProps) {
  const { articleId, content } = props;
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
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

  const anchorSegments = useMemo(
    () => mergeAnchorIntervals(articleComments, articleBlockId, content),
    [articleBlockId, articleComments, content],
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
            comments={articleComments}
            text={textValue}
            onAnchorClick={(segmentIndex) => {
              setActiveCommentIndex(getCommentOffsetForSegment(segmentIndex, anchorSegments));
              setActiveSegmentIndex(segmentIndex);
            }}
          />
        )}
      />

      <AnchorFocusedComments
        resolvedComments={resolvedComments}
        segments={anchorSegments}
        activeSegmentIndex={activeSegmentIndex}
        activeCommentIndex={activeCommentIndex}
        targetId={articleId}
        rootType="article"
        onCommentChange={setActiveCommentIndex}
        onClose={() => setActiveSegmentIndex(null)}
      />
    </div>
  );
}
