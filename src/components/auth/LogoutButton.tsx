'use client';

import { LogOut } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { useUserStore } from '@/store/useUserStore';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const resetFlightStore = useFlightStore((state) => state.resetStore);
  const resetUserStore = useUserStore((state) => state.resetStore);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      resetFlightStore();
      resetUserStore();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-gray-500 hover:text-red-600 transition-colors"
      title="Log Out"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}
