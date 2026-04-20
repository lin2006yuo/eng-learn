import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface CommentCountResult {
  myCommentsCount: number;
  repliesToMeCount: number;
}

export function useMyCommentCount(): CommentCountResult {
  const { user } = useAuth();

  const { data: myCount = 0 } = useQuery({
    queryKey: ['myCommentCount', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/comments/count?userId=${user!.id}`);
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.count ?? 0;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const { data: repliesCount = 0 } = useQuery({
    queryKey: ['repliesToMeCount', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/notifications/unread-count');
      if (!res.ok) return 0;
      const json = await res.json();
      return json.data?.total ?? 0;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  return {
    myCommentsCount: myCount,
    repliesToMeCount: repliesCount,
  };
}
