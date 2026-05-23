import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FlightState, SearchQuery } from '@/types/store';
import { Flight, Seat, Passenger } from '@/types/database';

const initialState = {
  searchQuery: {
    origin: '',
    destination: '',
    date: '',
    returnDate: '',
    passengers: 1,
    tripType: 'one-way' as const,
  },
  selectedFlight: null,
  selectedReturnFlight: null,
  selectedSeat: null,
  selectedReturnSeat: null,
  seatSelectionMode: 'random' as const,
  foodOption: null,
  currentStep: 0,
  passengerData: null,
};

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (query: SearchQuery) => set({ searchQuery: query }),
      setSelectedFlight: (flight: Flight | null) => set({ selectedFlight: flight }),
      setSelectedReturnFlight: (flight: Flight | null) => set({ selectedReturnFlight: flight }),
      setSelectedSeat: (seat: Seat | null) => set({ selectedSeat: seat }),
      setSelectedReturnSeat: (seat: Seat | null) => set({ selectedReturnSeat: seat }),
      setSeatSelectionMode: (mode: 'random' | 'manual') => set({ seatSelectionMode: mode }),
      setFoodOption: (option: string | null) => set({ foodOption: option }),
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
