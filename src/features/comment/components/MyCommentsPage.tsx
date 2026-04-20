'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MyCommentCard } from '@/features/comment/components/MyCommentCard';
import { useMyComments } from '@/features/comment/hooks/useMyComments';

export function MyCommentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    comments,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
  } = useMyComments({ enabled: !!user });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      const threshold = 200;

      if (scrollHeight - scrollTop - clientHeight < threshold && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-[430px] mx-auto px-5 py-4 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            我的评论
          </h1>
        </div>
      </header>

      {authLoading ? (
        <div className="max-w-[430px] mx-auto px-5 space-y-3 pb-6">
          <LoadingSkeleton />
        </div>
      ) : (
        <div
          className="max-w-[430px] mx-auto px-5 space-y-3 pb-6 overflow-auto"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          {isLoading && <LoadingSkeleton />}

          {!isLoading && comments.length === 0 && <EmptyState />}

          {!isLoading && comments.map((comment) => (
            <MyCommentCard
              key={comment.id}
              comment={comment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-subtle-card p-4 shadow-card animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-20 h-3 bg-gray-200 rounded" />
            <div className="w-32 h-3 bg-gray-200 rounded" />
          </div>
          <div className="w-full h-4 bg-gray-200 rounded mb-2" />
          <div className="w-2/3 h-4 bg-gray-200 rounded mb-3" />
          <div className="flex gap-3">
            <div className="w-16 h-3 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <MessageSquare size={36} className="text-gray-300" />
      </div>
      <p className="text-text-secondary text-sm">还没有评论</p>
      <p className="text-text-tertiary text-xs mt-1">去句型广场发表第一条评论吧</p>
    </div>
  );
}
