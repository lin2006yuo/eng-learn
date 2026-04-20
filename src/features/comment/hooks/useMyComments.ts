import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Comment, CommentListResponse } from '@/features/comment/types';

const PAGE_SIZE = 15;

interface UseMyCommentsOptions {
  enabled?: boolean;
}

interface UseMyCommentsReturn {
  comments: Comment[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

function fetchCommentsPage({
  pageParam,
  userId,
}: {
  pageParam: string | null;
  userId: string;
}): Promise<CommentListResponse> {
  const params = new URLSearchParams({
    userId,
    limit: String(PAGE_SIZE),
    sort: 'newest',
  });

  if (pageParam) {
    params.set('cursor', pageParam);
  }

  return fetch('/api/comments?' + params.toString()).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  });
}

export function useMyComments({
  enabled = true,
}: UseMyCommentsOptions): UseMyCommentsReturn {
  const { user } = useAuth();

  const queryKey = ['myComments', user?.id];

  const { data, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        fetchCommentsPage({
          pageParam: pageParam as string | null,
          userId: user!.id,
        }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: enabled && !!user?.id,
      staleTime: 1000 * 60 * 5,
    });

  const comments = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    comments,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    fetchNextPage: () => {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    refetch,
  };
}
