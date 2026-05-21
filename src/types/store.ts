import { Flight, Seat, Passenger } from './database';

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface FlightState {
  searchQuery: SearchQuery;
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  currentStep: number;
  passengerData: Omit<Passenger, 'id' | 'booking_id'> | null;
  
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setCurrentStep: (step: number) => void;
  setPassengerData: (data: Omit<Passenger, 'id' | 'booking_id'> | null) => void;
  resetStore: () => void;
}
