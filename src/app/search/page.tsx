'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock, ArrowRight, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFlightStore } from '@/store/useFlightStore';
import { Flight } from '@/types/database';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function SearchResultsPage() {
  const router = useRouter();
  const { searchQuery, setSelectedFlight, setCurrentStep } = useFlightStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      try {
        let query = supabase
          .from('flights')
          .select('*')
          .ilike('origin', `%${searchQuery.origin}%`)
          .ilike('destination', `%${searchQuery.destination}%`);

        // If date is provided, filter by date (ignoring time)
        if (searchQuery.date) {
          const startDate = new Date(searchQuery.date);
          const endDate = new Date(searchQuery.date);
          endDate.setDate(endDate.getDate() + 1);
          
          query = query
            .gte('departs_at', startDate.toISOString())
            .lt('departs_at', endDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;
        setFlights(data || []);
      } catch (error: any) {
        console.error('Error fetching flights (detailed):', JSON.stringify(error, null, 2));
        console.error('Raw error object:', error);
        if (error.message) console.error('Error Message:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [searchQuery, supabase]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setCurrentStep(1); // Step 1: Seat Selection
    router.push(`/book/${flight.id}/seat`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-gray-500 animate-pulse">Searching for the best flights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery.origin} to {searchQuery.destination}
          </h1>
          <p className="text-sm text-gray-500">
            {searchQuery.date ? format(new Date(searchQuery.date), 'EEEE, MMMM do yyyy') : 'All dates'} • {searchQuery.passengers} Passenger{searchQuery.passengers > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>
          Change Search
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {flights.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No flights found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or dates.</p>
          </div>
        ) : (
          flights.map((flight) => (
            <div 
              key={flight.id} 
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{flight.flight_no}</p>
                  <p className="text-xs text-gray-500">{flight.aircraft_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 flex-1 justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">
                    {format(new Date(flight.departs_at), 'HH:mm')}
                  </p>
                  <p className="text-sm font-medium text-gray-500 uppercase">{flight.origin}</p>
                </div>
                
                <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direct</p>
                  <div className="w-full h-px bg-gray-200 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      <Plane className="h-3 w-3 text-gray-300 rotate-90" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>7h 30m</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">
                    {format(new Date(flight.arrives_at), 'HH:mm')}
                  </p>
                  <p className="text-sm font-medium text-gray-500 uppercase">{flight.destination}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <p className="text-2xl font-black text-blue-600">
                  ${flight.base_price}
                </p>
                <Button onClick={() => handleSelectFlight(flight)}>
                  Select Seats
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
