'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MyCommentItem } from '@/features/comment/components/MyCommentItem';
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
    <div className="mycomments-page-container min-h-full bg-[#FAFAFA]">
      <header className="mycomments-page-header sticky top-0 z-10 bg-[#FAFAFA]/95 backdrop-blur-sm">
        <div className="max-w-[430px] mx-auto px-4 h-12 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="mycomments-page-back p-2 -ml-2 text-[#007AFF] active:opacity-50 transition-opacity"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="mycomments-page-title text-[17px] font-semibold text-[#1D1D1F]">
            我的评论
          </h1>
        </div>
      </header>

      {authLoading ? (
        <div className="max-w-[430px] mx-auto">
          <LoadingSkeleton />
        </div>
      ) : (
        <div
          className="max-w-[430px] mx-auto overflow-auto"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          {isLoading && <LoadingSkeleton />}

          {!isLoading && comments.length === 0 && <EmptyState />}

          {!isLoading && comments.length > 0 && (
            <div className="mycomments-page-list">
              {comments.map((comment, index) => (
                <MyCommentItem
                  key={comment.id}
                  comment={comment}
                  isLast={index === comments.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mycomments-page-skeleton">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="mycomments-skeleton-item px-4 py-4 border-b border-[#E5E5EA] animate-pulse"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-3 bg-[#E5E5EA] rounded" />
            <div className="w-24 h-3 bg-[#E5E5EA] rounded" />
            <div className="w-10 h-3 bg-[#E5E5EA] rounded" />
          </div>
          <div className="w-full h-4 bg-[#E5E5EA] rounded mb-2" />
          <div className="w-2/3 h-4 bg-[#E5E5EA] rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mycomments-page-empty flex flex-col items-center justify-center py-20">
      <MessageSquare size={48} className="text-[#C7C7CC] mb-4" />
      <p className="text-[15px] text-[#6E6E73]">还没有评论</p>
      <p className="text-[13px] text-[#C7C7CC] mt-1">去句型广场发表第一条评论吧</p>
    </div>
  );
}
