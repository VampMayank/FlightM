import { Flight, Seat, Passenger } from './database';

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
}

export interface FlightState {
  searchQuery: SearchQuery;
  selectedFlight: Flight | null;
  selectedReturnFlight: Flight | null;
  selectedSeat: Seat | null;
  selectedReturnSeat: Seat | null;
  seatSelectionMode: 'random' | 'manual';
  foodOption: string | null;
  currentStep: number;
  passengerData: Omit<Passenger, 'id' | 'booking_id'> | null;
  
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedReturnFlight: (flight: Flight | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setSelectedReturnSeat: (seat: Seat | null) => void;
  setSeatSelectionMode: (mode: 'random' | 'manual') => void;
  setFoodOption: (option: string | null) => void;
  setCurrentStep: (step: number) => void;
  setPassengerData: (data: Omit<Passenger, 'id' | 'booking_id'> | null) => void;
  resetStore: () => void;
}
