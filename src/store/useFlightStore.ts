import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FlightState, SearchQuery } from '@/types/store';
import { Flight, Seat, Passenger } from '@/types/database';

const initialState = {
  searchQuery: {
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
  },
  selectedFlight: null,
  selectedSeat: null,
  currentStep: 0,
  passengerData: null,
};

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (query: SearchQuery) => set({ searchQuery: query }),
      setSelectedFlight: (flight: Flight | null) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat: Seat | null) => set({ selectedSeat: seat }),
      setCurrentStep: (step: number) => set({ currentStep: step }),
      setPassengerData: (data: Omit<Passenger, 'id' | 'booking_id'> | null) => set({ passengerData: data }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'flight-storage',
      storage: createJSONStorage(() => localStorage),
      // Exclude sensitive fields from persistence
      partialize: (state) => ({
        ...state,
        passengerData: state.passengerData 
          ? { ...state.passengerData, passport_no: '' } 
          : null,
      }),
    }
  )
);
