'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Lock, ShieldCheck } from 'lucide-react';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, setSession } = useUserStore();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkSession() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    }
    checkSession();
  }, [setSession, supabase.auth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Verifying Access</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center shadow-inner">
          <Lock className="h-10 w-10 text-blue-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login Required</h2>
          <p className="text-slate-500 font-medium">Please sign in to your account to continue with your booking.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button 
            className="h-14 rounded-2xl text-lg font-black shadow-lg shadow-blue-200"
            onClick={() => router.push('/login')}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In Now
          </Button>
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl text-lg font-bold border-slate-200"
            onClick={() => router.push('/register')}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Create Account
          </Button>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Booking Protocol</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
