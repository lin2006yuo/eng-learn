import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useUnreadCount() {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['unreadCount', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/notifications/unread-count');
      if (!res.ok) return { total: 0 };
      const json = await res.json();
      return json.data ?? { total: 0 };
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  return {
    total: data?.total ?? 0,
    isLoading,
    refetch,
  };
}
