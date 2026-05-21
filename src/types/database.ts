export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'in-air' | 'landed';
  base_price: number;
  created_at?: string;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: 'economy' | 'business' | 'first';
  is_available: boolean;
  extra_fee: number;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  booked_at: string;
  total_price: number;
  pnr_code: string;
  flight?: Flight;
  seat?: Seat;
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}
