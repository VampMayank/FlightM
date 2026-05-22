'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Seat } from '@/types/database';
import { cn } from '@/components/ui/button';
import { Armchair, Info } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Cabin Map</p>
      </div>
    );
  }

  const rows = seats.reduce((acc, seat) => {
    const rowNum = seat.seat_number.replace(/[A-Z]/g, '');
    if (!acc[rowNum]) acc[rowNum] = [];
    acc[rowNum].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="w-full space-y-12">
      <div className="overflow-x-auto pb-8 scrollbar-hide">
        <div className="min-w-[700px] flex flex-col items-center py-10">
          {/* Nose of the Plane */}
          <div className="w-64 h-32 bg-slate-100 rounded-t-[120px] mb-8 relative border-x-8 border-t-8 border-slate-200 flex items-end justify-center pb-4 shadow-inner">
            <div className="flex gap-4">
              <div className="w-12 h-6 bg-slate-300 rounded-sm opacity-50" />
              <div className="w-12 h-6 bg-slate-300 rounded-sm opacity-50" />
            </div>
          </div>

          {/* Fuselage / Main Cabin */}
          <div className="bg-slate-50 p-10 rounded-[40px] border-x-8 border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-slate-200/50 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-slate-200/50 to-transparent" />
            
            {Object.entries(rows).map(([rowNum, rowSeats]) => {
              const rowClass = rowSeats[0].class;
              
              return (
                <div key={rowNum} className="flex items-center gap-6 group">
                  <div className="w-8 text-center text-sm font-black text-slate-400 group-hover:text-blue-500 transition-colors">{rowNum}</div>
                  
                  <div className="flex gap-3">
                    {rowSeats.map((seat, idx) => {
                      const isSelected = selectedSeatId === seat.id;
                      const isOccupied = !seat.is_available;
                      const showAisle = rowSeats.length > 4 && (idx === 2 || (rowSeats.length === 6 && idx === 3));

                      return (
                        <div key={seat.id} className="flex items-center">
                          <button
                            disabled={isOccupied}
                            onClick={() => onSelectSeat(seat)}
                            className={cn(
                              'relative h-12 w-12 rounded-xl border-2 transition-all flex flex-col items-center justify-center shadow-sm group/btn',
                              rowClass === 'first' && 'h-16 w-16 bg-amber-50/30 border-amber-200',
                              rowClass === 'business' && 'h-14 w-14 bg-indigo-50/30 border-indigo-200',
                              rowClass === 'economy' && 'bg-white border-slate-200',
                              !isOccupied && !isSelected && 'hover:border-blue-500 hover:shadow-blue-100 hover:scale-105 active:scale-95',
                              isSelected && 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110 z-10 ring-4 ring-blue-100',
                              isOccupied && 'border-slate-100 bg-slate-100 text-slate-300 cursor-not-allowed grayscale'
                            )}
                          >
                            <Armchair className={cn(
                              "h-5 w-5",
                              isSelected ? "text-white" : isOccupied ? "text-slate-300" : "text-slate-400"
                            )} />
                            <span className={cn(
                              "text-[10px] font-black mt-1",
                              isSelected ? "text-blue-100" : isOccupied ? "text-slate-400" : "text-slate-500"
                            )}>
                              {seat.seat_number.replace(/[0-9]/g, '')}
                            </span>
                            
                            {isOccupied && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block z-50">
                                <div className="bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap shadow-2xl font-bold flex items-center gap-2">
                                  <Info className="h-3 w-3 text-blue-400" />
                                  Occupied • {seat.class.toUpperCase()}
                                </div>
                                <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                              </div>
                            )}
                          </button>
                          {showAisle && <div className="w-12 h-12 flex items-center justify-center opacity-20"><div className="w-px h-full bg-slate-300" /></div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-8 text-center text-sm font-black text-slate-400 group-hover:text-blue-500 transition-colors">{rowNum}</div>
                </div>
              );
            })}
          </div>

          {/* Tail of the Plane */}
          <div className="w-80 h-24 bg-slate-200 rounded-b-3xl mt-8 border-x-8 border-b-8 border-slate-300 shadow-inner relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-4 bg-gradient-to-b from-slate-300/30 to-transparent" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-8 py-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto px-6">
        {[
          { label: 'Available', color: 'bg-white border-slate-200' },
          { label: 'Selected', color: 'bg-blue-600 border-blue-600 ring-4 ring-blue-100' },
          { label: 'Occupied', color: 'bg-slate-100 border-slate-100' },
          { label: 'First Class', color: 'bg-amber-50 border-amber-300' },
          { label: 'Business', color: 'bg-indigo-50 border-indigo-300' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn('h-5 w-5 rounded-lg border-2 shadow-sm', item.color)} />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
