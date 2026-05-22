import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { Booking } from '@/types/database';

interface UserState {
  session: Session | null;
  bookings: Booking[];
  setSession: (session: Session | null) => void;
  setBookings: (bookings: Booking[]) => void;
  resetStore: () => void;
}

const initialState = {
  session: null,
  bookings: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (session: Session | null) => set({ session }),
      setBookings: (bookings: Booking[]) => set({ bookings }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist session and cached bookings for offline access
      partialize: (state) => ({ 
        session: state.session,
        bookings: state.bookings 
      }),
    }
  )
);
