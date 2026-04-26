'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnchorFocusedComments } from '@/features/comment/components/selection/AnchorFocusedComments';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { SelectableText } from '@/features/comment/components/selection/SelectableText';
import { AnchorHighlightText } from '@/features/comment/components/selection/AnchorHighlightText';
import { mergeAnchorIntervals } from '@/features/comment/utils/anchorMerge';
import { resolveAnchorPosition } from '@/features/comment/utils/anchorRelocation';

interface PostSelectableBodyProps {
  rootId: string;
  dataPath: string;
  text: string;
}

function getCommentOffsetForSegment(segmentIndex: number, segments: Array<{ commentIds: string[] }>) {
  return segments.slice(0, segmentIndex).reduce((total, segment) => total + segment.commentIds.length, 0);
}

export function PostSelectableBody(props: PostSelectableBodyProps) {
  const { rootId, dataPath, text } = props;
  const [activeCommentIndex, setActiveCommentIndex] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const { comments, fetchComments } = useCommentStore();
  const postComments = comments[`post-${rootId}`] || [];

  useEffect(() => {
    fetchComments('post', rootId);
  }, [rootId, fetchComments]);

  const resolvedComments = useMemo(
    () => postComments.map((comment) => {
      if (!comment.anchor || comment.anchor.extra.blockId !== dataPath) return comment;
      const resolved = resolveAnchorPosition(comment.anchor, text);
      return { ...comment, anchor: { ...comment.anchor, ...resolved } };
    }),
    [dataPath, postComments, text],
  );

  const anchorSegments = useMemo(
    () => mergeAnchorIntervals(postComments, dataPath, text),
    [dataPath, postComments, text],
  );

  return (
    <div className="post-selectable-body space-y-4">
      <SelectableText
        blockId={dataPath}
        rootId={rootId}
        rootType="post"
        text={text}
        className="post-detail-content whitespace-pre-wrap text-[16px] leading-8 text-[#1D1D1F]"
        renderText={(textValue) => (
          <AnchorHighlightText
            blockId={dataPath}
            comments={postComments}
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
        targetId={rootId}
        rootType="post"
        blockId={dataPath}
        onCommentChange={setActiveCommentIndex}
        onSegmentChange={setActiveSegmentIndex}
        onClose={() => setActiveSegmentIndex(null)}
      />
    </div>
  );
}
