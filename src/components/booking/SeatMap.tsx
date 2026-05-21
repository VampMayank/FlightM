'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Seat } from '@/types/database';
import { cn } from '@/components/ui/button';

interface SeatMapProps {
  flightId: string;
  selectedSeatId?: string;
  onSelectSeat: (seat: Seat) => void;
}

export default function SeatMap({ flightId, selectedSeatId, onSelectSeat }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSeats() {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('flight_id', flightId)
        .order('seat_number');

      if (!error && data) {
        setSeats(data);
      }
      setLoading(false);
    }

    fetchSeats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as Seat;
          setSeats((currentSeats) =>
            currentSeats.map((s) => (s.id === updatedSeat.id ? updatedSeat : s))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flightId, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const rowNum = seat.seat_number.replace(/[A-Z]/g, '');
    if (!acc[rowNum]) acc[rowNum] = [];
    acc[rowNum].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-[600px] flex flex-col items-center">
        {/* Cockpit / Front of Plane */}
        <div className="w-48 h-20 bg-gray-200 rounded-t-full mb-8 relative border-x-4 border-t-4 border-gray-300">
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Front
          </div>
        </div>

        {/* Seat Grid */}
        <div className="bg-white p-8 rounded-3xl border-4 border-gray-200 shadow-inner space-y-4">
          {Object.entries(rows).map(([rowNum, rowSeats]) => {
            const rowClass = rowSeats[0].class;
            
            return (
              <div key={rowNum} className="flex items-center gap-4">
                <div className="w-6 text-center text-xs font-bold text-gray-400">{rowNum}</div>
                
                <div className="flex gap-2">
                  {rowSeats.map((seat, idx) => {
                    const isSelected = selectedSeatId === seat.id;
                    const isOccupied = !seat.is_available;
                    
                    // Add aisle spacing for 3-3 or 2-2-2 configuration
                    const showAisle = rowSeats.length > 4 && (idx === 2 || (rowSeats.length === 6 && idx === 3));

                    return (
                      <div key={seat.id} className="flex items-center">
                        <button
                          disabled={isOccupied}
                          onClick={() => onSelectSeat(seat)}
                          className={cn(
                            'relative h-10 w-10 rounded-lg border-2 transition-all flex items-center justify-center text-xs font-bold',
                            rowClass === 'first' && 'h-12 w-12',
                            rowClass === 'business' && 'h-11 w-11',
                            !isOccupied && !isSelected && 'border-gray-200 bg-white hover:border-blue-500 hover:text-blue-500',
                            isSelected && 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110 z-10',
                            isOccupied && 'border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed group'
                          )}
                        >
                          {seat.seat_number.replace(/[0-9]/g, '')}
                          
                          {/* Tooltip for occupied seats */}
                          {isOccupied && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                              <div className="bg-gray-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                                {seat.class.toUpperCase()} - Occupied
                              </div>
                              <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1" />
                            </div>
                          )}
                        </button>
                        {showAisle && <div className="w-8" />}
                      </div>
                    );
                  })}
                </div>

                <div className="w-6 text-center text-xs font-bold text-gray-400">{rowNum}</div>
              </div>
            );
          })}
        </div>

        {/* Back of Plane */}
        <div className="w-64 h-16 bg-gray-100 rounded-b-xl mt-8 border-x-4 border-b-4 border-gray-200" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {[
          { label: 'Available', color: 'bg-white border-gray-200' },
          { label: 'Selected', color: 'bg-blue-600 border-blue-600' },
          { label: 'Occupied', color: 'bg-gray-100 border-gray-100' },
          { label: 'First Class', color: 'border-yellow-400' },
          { label: 'Business', color: 'border-blue-400' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn('h-4 w-4 rounded border-2', item.color)} />
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
