'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle, AlertCircle, Loader2, Plane, User, Ticket } from 'lucide-react';

import { use } from 'react';

export default function ConfirmationPage({ params: paramsPromise }: { params: Promise<{ flightId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const supabase = createClient();
  const { selectedFlight, selectedSeat, passengerData, resetStore } = useFlightStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedFlight || !selectedSeat || !passengerData) {
    router.push('/search');
    return null;
  }

  const totalPrice = Number(selectedFlight.base_price) + Number(selectedSeat.extra_fee);

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

      // 1. Call reserve_seat RPC
      const { data: bookingId, error: rpcError } = await supabase.rpc('reserve_seat', {
        p_flight_id: selectedFlight.id,
        p_seat_id: selectedSeat.id,
        p_total_price: totalPrice,
        p_pnr_code: pnr_code,
      });

      if (rpcError) throw rpcError;

      // 2. Insert passenger details
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

      // Success! Clear store and redirect
      resetStore();
      router.push('/my-bookings?success=true');
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} disabled={isProcessing}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to passenger details
        </Button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900">Review & Confirm</h1>
          <p className="text-gray-500">Please review your booking details before proceeding to payment.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Flight & Seat Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Plane className="h-5 w-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Flight Information</h3>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black text-gray-900">{selectedFlight.origin}</span>
                <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-4 relative">
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90" />
                </div>
                <span className="text-2xl font-black text-gray-900">{selectedFlight.destination}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Flight No</p>
                  <p className="font-bold text-gray-900">{selectedFlight.flight_no}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Seat</p>
                  <p className="font-bold text-blue-600">{selectedSeat.seat_number} ({selectedSeat.class})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600">
              <User className="h-5 w-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Passenger Details</h3>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Full Name</p>
                <p className="font-bold text-gray-900 text-lg uppercase">{passengerData.full_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Passport</p>
                  <p className="font-medium text-gray-700">{passengerData.passport_no}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Nationality</p>
                  <p className="font-medium text-gray-700">{passengerData.nationality}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="border-t pt-8 flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-gray-400" />
            <span className="text-gray-500 font-medium">Final Price (includes all taxes & fees)</span>
          </div>
          
          <div className="text-5xl font-black text-gray-900">
            ${totalPrice}
          </div>

          <div className="w-full max-w-sm">
            <Button 
              size="lg" 
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-200"
              onClick={handleConfirmBooking}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm & Book Now
                  <CheckCircle className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
            By clicking confirm, you agree to our Terms of Service and Cancellation Policy. Your booking will be confirmed instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
