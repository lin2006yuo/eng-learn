'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCommentStore } from '@/features/comment/store/commentStore';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { patterns } from '@/data/patterns';

interface CommentsModalProps {
  targetId?: string;
}

export function CommentsModal({ targetId: propTargetId }: CommentsModalProps = {}) {
  const router = useRouter();
  const { comments, loading, fetchComments } = useCommentStore();

  const targetId = propTargetId;
  const rootType = 'pattern' as const;
  const storeKey = targetId ? `${rootType}-${targetId}` : '';

  const targetComments = storeKey ? comments[storeKey] || [] : [];

  const pattern = patterns.find((p) => p.id === targetId);

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
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-gray-100 flex-shrink-0">
        <button
          onClick={handleClose}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">
          评论 {targetComments.length > 0 && `(${targetComments.length})`}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-24">
          {pattern && (
            <div className="bg-white rounded-subtle-card p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{pattern.emoji}</span>
                <span className="text-sm text-text-secondary">当前句型</span>
              </div>
              <h3 className="font-bold text-text-primary mb-1">{pattern.title}</h3>
              <p className="text-sm text-text-secondary">{pattern.translation}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!loading && targetComments.length > 0 && (
            <div className="bg-white rounded-subtle-card px-4 shadow-sm">
              {targetComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  targetId={targetId!}
                  rootType={rootType}
                />
              ))}
            </div>
          )}

          {!loading && targetComments.length === 0 && (
            <div className="text-center text-text-secondary py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-lg font-medium mb-2">暂无评论</p>
              <p className="text-sm">成为第一个评论我的人吧</p>
            </div>
          )}
        </div>
      </div>

      {targetId && <CommentInput rootId={targetId} rootType="pattern" />}
    </div>
  );
}
