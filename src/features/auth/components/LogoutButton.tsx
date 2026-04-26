'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth-client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login');
            router.refresh();
          },
        },
      });
    } catch {
      console.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] active:opacity-50 transition-opacity"
    >
      <LogOut size={16} />
    </button>
  );
}
