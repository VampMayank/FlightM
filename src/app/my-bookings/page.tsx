'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Booking } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Plane, Calendar, MapPin, XCircle, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/components/ui/button';
import Link from 'next/link';
import { useFlightStore } from '@/store/useFlightStore';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const supabase = createClient();
  const resetFlightStore = useFlightStore((state) => state.resetStore);

  const fetchBookings = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          flight:flights(*),
          seat:seats(*)
        `)
        .order('booked_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings(true);
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    try {
      const { error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId
      });

      if (error) throw error;
      
      // Reset flight store as per requirements
      resetFlightStore();
      
      // Refresh list
      await fetchBookings();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900">My Bookings</h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {bookings.length} Booking{bookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="text-gray-500">Your upcoming trips will appear here.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div 
              key={booking.id} 
              className={cn(
                "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
                booking.status === 'cancelled' && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                {/* Status & PNR */}
                <div className="flex flex-col justify-between items-start border-r border-gray-100 pr-8 min-w-[140px]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PNR CODE</p>
                    <p className="text-xl font-black text-gray-900">{booking.pnr_code}</p>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    booking.status === 'confirmed' && "bg-green-50 text-green-700",
                    booking.status === 'cancelled' && "bg-red-50 text-red-700",
                    booking.status === 'rescheduled' && "bg-blue-50 text-blue-700"
                  )}>
                    {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                    {booking.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                    {booking.status === 'rescheduled' && <RefreshCcw className="h-3 w-3" />}
                    {booking.status}
                  </div>
                </div>

                {/* Flight Details */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-gray-900">
                        {format(new Date(booking.flight!.departs_at), 'HH:mm')}
                      </p>
                      <p className="text-xs font-bold text-gray-400 uppercase">{booking.flight!.origin}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                        {booking.flight!.flight_no}
                      </p>
                      <div className="w-full h-px bg-gray-200 relative">
                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-600 rotate-90" />
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className="text-2xl font-black text-gray-900">
                        {format(new Date(booking.flight!.arrives_at), 'HH:mm')}
                      </p>
                      <p className="text-xs font-bold text-gray-400 uppercase">{booking.flight!.destination}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-600">
                        {format(new Date(booking.flight!.departs_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-600">
                        {booking.seat!.seat_number} ({booking.seat!.class})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-3 min-w-[120px]">
                  {booking.status !== 'cancelled' && (
                    <>
                      <Link href={`/reschedule/${booking.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          Reschedule
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCancel(booking.id)}
                        isLoading={cancellingId === booking.id}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'cancelled' && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase text-center italic">
                      Cancelled on {format(new Date(), 'MMM dd')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
