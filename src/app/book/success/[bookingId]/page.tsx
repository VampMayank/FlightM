'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Booking, Passenger } from '@/types/database';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plane, Calendar, MapPin, User, Ticket, Download, ArrowRight, Home, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function BookingSuccessPage({ params: paramsPromise }: { params: Promise<{ bookingId: string }> }) {
  const params = use(paramsPromise);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            flight:flights!bookings_flight_id_fkey(*),
            seat:seats!bookings_seat_id_fkey(*),
            return_flight:flights!bookings_return_flight_id_fkey(*),
            return_seat:seats!bookings_return_seat_id_fkey(*)
          `)
          .eq('id', params.bookingId)
          .single();

        if (bookingError) throw bookingError;
        setBooking(bookingData);

        const { data: passengerData, error: passengerError } = await supabase
          .from('passengers')
          .select('*')
          .eq('booking_id', params.bookingId)
          .single();

        if (passengerError) throw passengerError;
        setPassenger(passengerData);
      } catch (error) {
        console.error('Error fetching booking success details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [params.bookingId, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Generating Your Ticket</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl">
          <p className="font-bold">Booking not found.</p>
        </div>
        <Link href="/my-bookings">
          <Button>Go to My Bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      {/* Success Banner */}
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="h-24 w-24 bg-green-100 rounded-[40px] flex items-center justify-center shadow-lg shadow-green-900/10">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Booking Confirmed!</h1>
          <p className="text-slate-500 font-medium text-xl">Pack your bags! Your journey has been successfully reserved.</p>
        </div>
      </div>

      {/* Invoice/Ticket Card */}
      <div className="bg-white rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
        
        {/* Invoice Header */}
        <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reservation PNR</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{booking.pnr_code}</p>
          </div>
          <div className="text-left md:text-right space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Paid</p>
            <p className="text-4xl font-black text-blue-600 tracking-tighter">${booking.total_price}</p>
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Flight Details Section */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Outbound Journey</h3>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-black text-slate-900">{booking.flight?.origin}</p>
                    <p className="text-xs font-bold text-slate-400">{booking.flight ? format(new Date(booking.flight.departs_at), 'MMM dd, yyyy') : ''}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300" />
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{booking.flight?.destination}</p>
                    <p className="text-xs font-bold text-slate-400">{booking.flight ? format(new Date(booking.flight.arrives_at), 'MMM dd, yyyy') : ''}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-black text-slate-900">{booking.flight?.flight_no}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-black text-slate-900">Seat {booking.seat?.seat_number} ({booking.seat?.class})</span>
                  </div>
                </div>
              </div>
            </div>

            {booking.return_flight && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5 text-indigo-600 -rotate-180" />
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Return Journey</h3>
                </div>
                
                <div className="bg-indigo-50/50 p-6 rounded-3xl space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-black text-slate-900">{booking.return_flight?.origin}</p>
                      <p className="text-xs font-bold text-slate-400">{format(new Date(booking.return_flight.departs_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300" />
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900">{booking.return_flight?.destination}</p>
                      <p className="text-xs font-bold text-slate-400">{format(new Date(booking.return_flight.arrives_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-indigo-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-black text-slate-900">{booking.return_flight.flight_no}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-black text-slate-900">Seat {booking.return_seat?.seat_number} ({booking.return_seat?.class})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Passenger & Billing Section */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Passenger Details</h3>
              </div>
              <div className="space-y-4 border-l-2 border-slate-100 pl-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-xl font-black text-slate-900">{passenger?.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport</p>
                    <p className="font-bold text-slate-900">{passenger?.passport_no}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nationality</p>
                    <p className="font-bold text-slate-900">{passenger?.nationality}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Status</h3>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">{booking.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 p-8 md:p-12 flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-slate-400 text-sm font-medium">A copy of this invoice has been sent to your email.</p>
          <div className="flex gap-4 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none bg-transparent border-slate-700 text-white hover:bg-slate-800 rounded-2xl">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Link href="/my-bookings" className="flex-1 md:flex-none">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/">
          <Button variant="ghost" className="text-slate-500 font-bold hover:text-blue-600">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
