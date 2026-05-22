'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useFlightStore } from '@/store/useFlightStore';
import { Flight } from '@/types/database';
import { Button } from '@/components/ui/button';
import { format, differenceInMinutes } from 'date-fns';

export default function SearchResultsPage() {
  const router = useRouter();
  const { searchQuery, setSelectedFlight, setCurrentStep } = useFlightStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const formatDuration = (departs: string, arrives: string) => {
    const minutes = differenceInMinutes(new Date(arrives), new Date(departs));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    async function fetchFlights() {
      setLoading(true);
      try {
        let query = supabase
          .from('flights')
          .select('*')
          .ilike('origin', `%${searchQuery.origin}%`)
          .ilike('destination', `%${searchQuery.destination}%`);

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
      } catch (err: unknown) {
        console.error('Error fetching flights:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [searchQuery, supabase]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setCurrentStep(1); 
    router.push(`/book/${flight.id}/seat`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-b-4 border-blue-600 shadow-xl" />
          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-black text-slate-900 tracking-tight">Searching Flights</p>
          <p className="text-slate-500 font-medium animate-pulse">Finding the best routes for your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Search Summary Header */}
      <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-blue-900/5 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Search className="h-7 w-7 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {searchQuery.origin} <ArrowRight className="h-6 w-6 text-blue-500" /> {searchQuery.destination}
            </h1>
            <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <span>{searchQuery.date ? format(new Date(searchQuery.date), 'MMM dd, yyyy') : 'Any Date'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{searchQuery.passengers} Passenger{searchQuery.passengers > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-slate-200" onClick={() => router.push('/')}>
            Change Search
          </Button>
          <Button variant="secondary" className="h-12 w-12 rounded-2xl p-0 flex items-center justify-center border-slate-200">
            <SlidersHorizontal className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Flight Results */}
      <div className="space-y-6">
        {flights.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border-4 border-dashed border-slate-100 space-y-4">
            <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
              <Plane className="h-12 w-12 text-slate-200 -rotate-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">No flights available</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto text-lg">We couldn&apos;t find any flights matching your criteria. Try another date or city.</p>
            </div>
            <Button className="mt-6 rounded-2xl px-8 h-12 text-lg font-bold" onClick={() => router.push('/')}>
               New Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{flights.length} Flights Found</h2>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Best Prices First</p>
            </div>
            {flights.map((flight) => (
              <div 
                key={flight.id} 
                className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg shadow-blue-900/[0.02] hover:shadow-blue-900/10 hover:border-blue-200 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-500">
                    <Plane className="h-8 w-8 text-slate-400 group-hover:text-blue-600 group-hover:-rotate-12 transition-all duration-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 tracking-tight uppercase">{flight.flight_no}</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{flight.aircraft_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12 flex-1 justify-center w-full">
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {format(new Date(flight.departs_at), 'HH:mm')}
                    </p>
                    <p className="text-sm font-black text-slate-400 uppercase">{flight.origin}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                      <div className="h-1 w-1 rounded-full bg-blue-600" />
                      NON-STOP
                      <div className="h-1 w-1 rounded-full bg-blue-600" />
                    </div>
                    <div className="w-full h-[3px] bg-slate-100 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-600 to-indigo-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(flight.departs_at, flight.arrives_at)}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {format(new Date(flight.arrives_at), 'HH:mm')}
                    </p>
                    <p className="text-sm font-black text-slate-400 uppercase">{flight.destination}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400">$</span>
                    <span className="text-4xl font-black text-blue-600 tracking-tighter">{flight.base_price}</span>
                  </div>
                  <Button 
                    onClick={() => handleSelectFlight(flight)}
                    className="w-full h-12 rounded-2xl font-black text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                  >
                    Select Seat
                    <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
