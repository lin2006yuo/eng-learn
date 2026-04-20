import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface Notification {
  id: string;
  targetType: string;
  targetId: string;
  rootId?: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  targetContent?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();

  const result = useInfiniteQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${encodeURIComponent(pageParam as string)}` : '';
      const res = await fetch(`/api/notifications?limit=20${cursor}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled: !!user,
  });

  const allNotifications: Notification[] = result.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...result,
    notifications: allNotifications,
  };
}
