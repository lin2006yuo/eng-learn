'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { filterNormalComments } from '@/features/comment/utils';
import type { RootType } from '@/features/comment/types';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { patterns } from '@/data/patterns';

interface CommentsModalProps {
  targetId?: string;
  rootType?: RootType;
  title?: string;
  focusCommentId?: string;
}

const rootTitleMap: Record<RootType, string> = {
  pattern: '当前句型',
  article: '当前文章',
  post: '当前内容',
  note: '当前笔记',
};

const emptyDescriptionMap: Record<RootType, string> = {
  pattern: '成为第一个参与讨论的人吧',
  article: '分享你的阅读感受，参与这篇文章的讨论',
  post: '成为第一个参与讨论的人吧',
  note: '记录你对这条笔记的想法',
};

export function CommentsModal({
  targetId: propTargetId,
  rootType = 'pattern',
  title,
  focusCommentId,
}: CommentsModalProps = {}) {
  const router = useRouter();
  const { comments, loading, fetchComments } = useCommentStore();

  const targetId = propTargetId;
  const storeKey = targetId ? `${rootType}-${targetId}` : '';

  const allTargetComments = storeKey ? comments[storeKey] || [] : [];
  const targetComments = filterNormalComments(allTargetComments);
  const orderedComments = focusCommentId
    ? [...targetComments].sort((left, right) => {
        if (left.id === focusCommentId) return -1;
        if (right.id === focusCommentId) return 1;
        return 0;
      })
    : targetComments;

  const pattern = rootType === 'pattern' ? patterns.find((p) => p.id === targetId) : undefined;

  useEffect(() => {
    if (targetId) {
      fetchComments(rootType, targetId);
    }
  }, [targetId, fetchComments]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="pattern-comments-page fixed inset-0 z-[100] bg-[#FAFAFA] flex flex-col">
      <div className="pattern-comments-header flex items-center gap-3 px-4 py-3 bg-[#FAFAFA]/95 backdrop-blur-sm flex-shrink-0 sticky top-0 z-10">
        <button
          onClick={handleClose}
          className="pattern-comments-back-button p-2 -ml-2 rounded-full hover:bg-[#F5F5F7] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </button>
        <h1 className="pattern-comments-title text-[17px] font-semibold text-[#1D1D1F]">
          {title || '评论'} {targetComments.length > 0 && `(${targetComments.length})`}
        </h1>
      </div>

      <div className="pattern-comments-list flex-1 overflow-y-auto">
        {pattern && (
          <div className="pattern-comments-pattern-info px-5 py-4 border-b border-[#E5E5EA]">
            <div className="pattern-comments-pattern-label flex items-center gap-2 mb-1.5">
              <span className="pattern-comments-pattern-icon text-[13px] text-[#6E6E73]">{rootTitleMap[rootType]}</span>
            </div>
            <h3 className="pattern-comments-pattern-title text-[16px] font-semibold text-[#1D1D1F]">{pattern.title}</h3>
            <p className="pattern-comments-pattern-translation text-[14px] text-[#6E6E73] mt-0.5">{pattern.translation}</p>
          </div>
        )}

        {loading && (
          <div className="pattern-comments-loading flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
          </div>
        )}

        {!loading && orderedComments.length > 0 && (
          <div className="pattern-comments-comments-list px-4">
            {orderedComments.map((comment, index) => (
              <div
                key={comment.id}
                className={`pattern-comments-comment-item ${index < orderedComments.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
              >
                <CommentItem
                  comment={comment}
                  targetId={targetId!}
                  rootType={rootType}
                  isFocused={comment.id === focusCommentId}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && targetComments.length === 0 && (
          <div className="pattern-comments-empty text-center text-[#6E6E73] py-16">
            <div className="pattern-comments-empty-icon w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <MessageCircle size={28} className="text-[#C7C7CC]" />
            </div>
            <p className="pattern-comments-empty-title text-[16px] font-medium text-[#1D1D1F] mb-1">暂无评论</p>
            <p className="pattern-comments-empty-description text-[14px]">{emptyDescriptionMap[rootType]}</p>
          </div>
        )}
      </div>

      {targetId && <CommentInput rootId={targetId} rootType={rootType} />}
    </div>
  );
}
