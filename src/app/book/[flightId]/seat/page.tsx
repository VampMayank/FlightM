'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useFlightStore } from '@/store/useFlightStore';
import SeatMap from '@/components/booking/SeatMap';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plane } from 'lucide-react';
import { Seat } from '@/types/database';

import { use } from 'react';

export default function SeatSelectionPage({ params: paramsPromise }: { params: Promise<{ flightId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { selectedFlight, selectedSeat, setSelectedSeat, setCurrentStep } = useFlightStore();

  if (!selectedFlight) {
    router.push('/search');
    return null;
  }

  const handleSelectSeat = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleContinue = () => {
    if (selectedSeat) {
      setCurrentStep(2); // Step 2: Passenger Details
      router.push(`/book/${params.flightId}/passenger`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to results
        </Button>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <span className="text-blue-600">1. Select Seat</span>
          <ChevronRight className="h-4 w-4" />
          <span>2. Passenger Details</span>
          <ChevronRight className="h-4 w-4" />
          <span>3. Confirmation</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Plane className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {selectedFlight.origin} to {selectedFlight.destination}
            </h1>
            <p className="text-xs text-gray-500">
              Flight {selectedFlight.flight_no} • {selectedFlight.aircraft_type}
            </p>
          </div>
        </div>
        
        {selectedSeat && (
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase">Selected Seat</p>
            <p className="text-lg font-bold text-blue-600">
              {selectedSeat.seat_number} ({selectedSeat.class})
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 text-center">Select your seat</h2>
        <SeatMap 
          flightId={params.flightId} 
          selectedSeatId={selectedSeat?.id} 
          onSelectSeat={handleSelectSeat} 
        />
      </div>

      <div className="sticky bottom-8 left-0 right-0 flex justify-center">
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-8 px-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Price</p>
            <p className="text-2xl font-black text-gray-900">
              ${Number(selectedFlight.base_price) + (selectedSeat?.extra_fee ? Number(selectedSeat.extra_fee) : 0)}
            </p>
          </div>
          <Button 
            size="lg" 
            disabled={!selectedSeat} 
            onClick={handleContinue}
            className="rounded-xl px-8"
          >
            Continue to Passenger Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
