'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle, AlertCircle, Loader2, Plane, User, Ticket, MapPin, ShieldCheck, Globe, Calendar, Utensils } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ConfirmationPage({ params: _paramsPromise }: { params: Promise<{ flightId: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { 
    selectedFlight, 
    selectedReturnFlight, 
    selectedSeat, 
    selectedReturnSeat,
    seatSelectionMode,
    foodOption,
    passengerData, 
    resetStore 
  } = useFlightStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedFlight || !selectedSeat || !passengerData) {
    router.push('/search');
    return null;
  }

  const seatCharge = seatSelectionMode === 'manual' ? 15 : 0;
  const foodCharge = foodOption === 'premium' ? 25 : foodOption === 'snack' ? 10 : 0;
  
  let totalPrice = Number(selectedFlight.base_price) + seatCharge + foodCharge;
  if (selectedReturnFlight) {
    totalPrice += Number(selectedReturnFlight.base_price) + seatCharge;
  }

  const generatePNR = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const pnr_code = generatePNR();

      const { data: bookingId, error: rpcError } = await supabase.rpc('reserve_seat', {
        p_flight_id: selectedFlight.id,
        p_seat_id: selectedSeat.id,
        p_total_price: totalPrice,
        p_pnr_code: pnr_code,
        p_return_flight_id: selectedReturnFlight?.id || null,
        p_return_seat_id: selectedReturnSeat?.id || null,
      });

      if (rpcError) throw rpcError;

      const { error: passengerError } = await supabase
        .from('passengers')
        .insert({
          booking_id: bookingId,
          full_name: passengerData.full_name,
          passport_no: passengerData.passport_no,
          nationality: passengerData.nationality,
          dob: passengerData.dob,
        });

      if (passengerError) throw passengerError;

      resetStore();
      router.push('/my-bookings?success=true');
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Booking failed:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 pt-6 px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          disabled={isProcessing}
          className="self-start rounded-xl font-bold text-slate-500"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Details
        </Button>
        <div className="h-20 w-20 bg-blue-50 rounded-[32px] flex items-center justify-center shadow-lg shadow-blue-900/5">
          <Ticket className="h-10 w-10 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Review & Confirm</h1>
          <p className="text-slate-500 font-medium text-lg max-w-lg">Double check your journey details before we finalize your reservation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Journey Card */}
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-blue-900/[0.03] border border-slate-100 space-y-10 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Outbound Flight</h3>
            </div>
            
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{selectedFlight.origin}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{format(new Date(selectedFlight.departs_at), 'HH:mm')}</p>
                </div>
                <div className="flex-1 px-8 relative">
                   <div className="w-full border-t-2 border-slate-100" />
                   <Plane className="h-4 w-4 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 rotate-90" />
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{selectedFlight.destination}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{format(new Date(selectedFlight.arrives_at), 'HH:mm')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-black text-slate-900">{selectedFlight.flight_no}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-black text-slate-900">Seat {selectedSeat.seat_number}</span>
                 </div>
              </div>
            </div>
          </div>

          {selectedReturnFlight && selectedReturnSeat && (
            <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-blue-900/[0.03] border border-slate-100 space-y-10 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Plane className="h-6 w-6 text-white -rotate-180" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Return Flight</h3>
              </div>
              
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{selectedReturnFlight.origin}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{format(new Date(selectedReturnFlight.departs_at), 'HH:mm')}</p>
                  </div>
                  <div className="flex-1 px-8 relative">
                     <div className="w-full border-t-2 border-slate-100" />
                     <Plane className="h-4 w-4 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1 -rotate-90" />
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{selectedReturnFlight.destination}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{format(new Date(selectedReturnFlight.arrives_at), 'HH:mm')}</p>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-black text-slate-900">{selectedReturnFlight.flight_no}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-black text-slate-900">Seat {selectedReturnSeat.seat_number}</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                   <Utensils className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dining Selected</p>
                   <p className="font-black text-slate-900 capitalize">{foodOption?.replace('-', ' ')}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-sm font-black text-blue-600">{foodCharge === 0 ? 'FREE' : `+$${foodCharge}`}</p>
             </div>
          </div>
        </div>

        {/* Passenger Card */}
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl shadow-slate-900/20 text-white space-y-10 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[120px] -mr-10 -mt-10" />
          
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Traveler Details</h3>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Full Name</p>
              <p className="text-3xl font-black tracking-tight">{passengerData.full_name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Passport</p>
                </div>
                <p className="text-xl font-bold">{passengerData.passport_no}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Globe className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nationality</p>
                </div>
                <p className="text-xl font-bold">{passengerData.nationality}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
               <div className="flex items-center gap-3 text-slate-400 mb-4">
                  <Calendar className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Date of Birth</p>
               </div>
               <p className="text-xl font-bold">{format(new Date(passengerData.dob), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Action Section */}
      <div className="bg-white p-10 sm:p-16 rounded-[60px] shadow-2xl shadow-blue-900/[0.05] border border-slate-100 flex flex-col items-center space-y-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent" />
        
        <div className="text-center space-y-4 relative z-10">
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Final Total Amount</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl font-bold text-slate-300 mt-4">$</span>
            <span className="text-8xl font-black text-slate-900 tracking-tighter">{totalPrice}</span>
            <span className="text-lg font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl self-start mt-6">USD</span>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Button 
            size="lg" 
            className="w-full h-20 rounded-[32px] text-2xl font-black shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            onClick={handleConfirmBooking}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Finalizing Journey...</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span>Complete Booking</span>
                <CheckCircle className="h-8 w-8 group-hover:scale-110 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
