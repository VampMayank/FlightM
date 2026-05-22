'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Booking, Flight, Seat } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Plane, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import SeatMap from '@/components/booking/SeatMap';

export default function ReschedulePage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const router = useRouter();
  const supabase = createClient();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      // 1. Fetch current booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          flight:flights(*),
          seat:seats(*)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // 2. Fetch alternative flights on same route
      const { data: flightsData, error: flightsError } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', bookingData.flight.origin)
        .eq('destination', bookingData.flight.destination)
        .neq('id', bookingData.flight_id)
        .gt('departs_at', new Date().toISOString());

      if (flightsError) throw flightsError;
      setAvailableFlights(flightsData || []);
    } catch (error) {
      console.error('Error fetching reschedule data:', error);
      alert('Failed to load reschedule data');
    } finally {
      setLoading(false);
    }
  }, [bookingId, supabase]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleReschedule = async () => {
    if (!selectedFlight || !selectedSeat || !booking) return;

    setRescheduling(true);
    try {
      // Calculate fee: New Price - Old Price (if > 0)
      const fee = Math.max(0, selectedFlight.base_price - booking.flight!.base_price);

      const { error } = await supabase.rpc('reschedule_booking', {
        p_booking_id: bookingId,
        p_new_flight_id: selectedFlight.id,
        p_new_seat_id: selectedSeat.id,
        p_fee_charged: fee
      });

      if (error) throw error;

      alert('Booking rescheduled successfully!');
      router.push('/my-bookings');
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!booking) return <div className="p-12 text-center">Booking not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
      <div className="space-y-4">
        <h1 className="text-3xl font-black text-gray-900">Reschedule Booking</h1>
        <p className="text-gray-500">
          PNR: <span className="font-bold text-gray-900">{booking.pnr_code}</span> • 
          Current: <span className="font-bold text-gray-900">{booking.flight!.origin} to {booking.flight!.destination}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Step 1: Select Flight */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">1</span>
              Select Alternative Flight
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {availableFlights.length === 0 ? (
                <p className="text-gray-500 bg-white p-8 rounded-2xl border border-dashed text-center">
                  No other flights available on this route at the moment.
                </p>
              ) : (
                availableFlights.map((flight) => (
                  <div 
                    key={flight.id}
                    onClick={() => {
                      setSelectedFlight(flight);
                      setSelectedSeat(null); // Reset seat selection
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedFlight?.id === flight.id 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-gray-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-lg font-black text-gray-900">{format(new Date(flight.departs_at), 'HH:mm')}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">{flight.origin}</p>
                        </div>
                        <div className="flex flex-col items-center px-4">
                          <Plane className="h-4 w-4 text-blue-600 rotate-90" />
                          <div className="w-16 h-px bg-gray-200 my-2" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900">{format(new Date(flight.arrives_at), 'HH:mm')}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">{flight.destination}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-400 uppercase">{format(new Date(flight.departs_at), 'MMM dd')}</p>
                        <p className="text-xl font-black text-blue-600">${flight.base_price}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Step 2: Select Seat (Only after flight is selected) */}
          {selectedFlight && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">2</span>
                Choose New Seat
              </h2>
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <SeatMap 
                  flightId={selectedFlight.id} 
                  selectedSeatId={selectedSeat?.id}
                  onSelectSeat={(seat) => setSelectedSeat(seat)}
                />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Summary & Confirmation */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-8">
            <h3 className="text-xl font-black text-gray-900">Reschedule Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Original Price</span>
                <span className="font-bold text-gray-900">${booking.flight!.base_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">New Flight Price</span>
                <span className="font-bold text-gray-900">${selectedFlight?.base_price || '-'}</span>
              </div>
              {selectedSeat && selectedSeat.extra_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Seat Upgrade</span>
                  <span className="font-bold text-gray-900">${selectedSeat.extra_fee}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Reschedule Fee</span>
                <span className="text-2xl font-black text-blue-600">
                  ${selectedFlight ? Math.max(0, selectedFlight.base_price - booking.flight!.base_price) : '0'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 italic">
                *Fees apply only if the new flight is more expensive.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full h-12" 
                disabled={!selectedFlight || !selectedSeat || rescheduling}
                onClick={handleReschedule}
                isLoading={rescheduling}
              >
                Confirm Reschedule
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

            {/* Validation Hints */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 w-2 rounded-full ${selectedFlight ? 'bg-green-500' : 'bg-gray-200'}`} />
                <span className={selectedFlight ? 'text-gray-900 font-medium' : 'text-gray-400'}>Select new flight</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 w-2 rounded-full ${selectedSeat ? 'bg-green-500' : 'bg-gray-200'}`} />
                <span className={selectedSeat ? 'text-gray-900 font-medium' : 'text-gray-400'}>Select new seat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
