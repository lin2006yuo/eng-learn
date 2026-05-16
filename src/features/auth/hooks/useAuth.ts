'use client';

import { useSession } from '@/lib/auth-client';

export function useAuth() {
  const { data, isPending, error, refetch } = useSession();

  return {
    user: data?.user
      ? {
          id: data.user.id,
          username: (data.user as any).username || '',
          name: (data.user as any).name || '',
          nickname: (data.user as any).nickname || (data.user as any).name || '',
          image: (data.user as any).image as string | null,
          role: (data.user as any).role || 'user',
        }
      : null,
    loading: isPending,
    error: error?.message ?? null,
    refetch,
  };
}
